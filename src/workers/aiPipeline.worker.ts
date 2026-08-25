import { 
  AIJob, 
  getAllJobs, 
  updateJob, 
  findCachedJob,
  getKeyUsage,
  updateKeyUsage
} from '../db/aiJobsStore';
import { requestCache } from '../utils/requestCache';
import { 
  streamResearch, 
  streamSynthesis, 
  getEmbedding 
} from '../utils/ai';

// Simple polyfill/mock since we are in a Web Worker environment
// We'll pass the API keys via postMessage to initialize the worker
let availableKeys: string[] = [];

// Listen for messages from the main thread
self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type === 'INIT') {
    const keysStr = payload.geminiKey || '';
    availableKeys = keysStr.split(/[,\s]+/).map((k: string) => k.trim()).filter(Boolean);
    
    // Start the polling loop if not already started
    startPolling();
  } else if (type === 'WAKE') {
    // Manually trigger a poll (e.g. after adding a job)
    pollQueue();
  }
};

let polling = false;
let circuitBreakerUntil = 0;

const startPolling = () => {
  if (polling) return;
  polling = true;
  // Poll every 2 seconds
  setInterval(pollQueue, 2000);
  pollQueue();
};

const hashKey = (key: string) => key.substring(0, 8) + '...';

const getActiveKey = async (): Promise<string | null> => {
  if (availableKeys.length === 0) return null;
  
  // Find a key that is ACTIVE and not on COOLDOWN
  for (const key of availableKeys) {
    const hashed = hashKey(key);
    const usage = await getKeyUsage(hashed);
    
    if (usage.status === 'ACTIVE') {
      return key;
    }
    
    if (usage.status === 'COOLDOWN' && usage.cooldownUntil && Date.now() > usage.cooldownUntil) {
      // Cooldown expired, reactivate
      await updateKeyUsage(hashed, { status: 'ACTIVE', cooldownUntil: undefined });
      return key;
    }
  }
  
  return null; // All keys exhausted or on cooldown
};

const markKeyCooldown = async (key: string, durationMs: number = 60000) => {
  const hashed = hashKey(key);
  await updateKeyUsage(hashed, { 
    status: 'COOLDOWN', 
    cooldownUntil: Date.now() + durationMs 
  });
  console.warn(`[AI Worker] Key ${hashed} put on cooldown for ${durationMs}ms`);
};

let activeJobsCount = 0;
const MAX_CONCURRENT_JOBS = 2;

const pollQueue = async () => {
  if (Date.now() < circuitBreakerUntil) {
    return; // Circuit breaker is active
  }

  if (activeJobsCount >= MAX_CONCURRENT_JOBS) {
    return;
  }

  const jobs = await getAllJobs();
  
  // Find queued or retryable jobs
  const pendingJobs = jobs.filter(j => 
    j.status === 'QUEUED' || 
    (j.status === 'FAILED_TRANSIENT' && j.nextRetryAt && Date.now() > j.nextRetryAt)
  );
  
  if (pendingJobs.length === 0) return;
  
  // Take one job
  const job = pendingJobs[0];
  processJob(job);
};

const processJob = async (job: AIJob) => {
  activeJobsCount++;
  try {
    await runPipeline(job);
  } catch (err: any) {
    console.error(`[AI Worker] Job ${job.id} failed unconditionally:`, err);
  } finally {
    activeJobsCount--;
    // Broadcast update so UI refreshes
    self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    // Trigger next poll
    pollQueue();
  }
};

const runPipeline = async (job: AIJob) => {
  await updateJob(job.id, { status: 'PRE_FLIGHT' });
  self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
  
  // 1. Cache Check
  const cached = await findCachedJob(job.topicHash);
  if (cached && cached.id !== job.id) {
    console.log(`[AI Worker] Cache hit for ${job.topic}`);
    await updateJob(job.id, {
      status: 'AWAITING_REVIEW',
      researchText: cached.researchText,
      synthesisText: cached.synthesisText,
      grounding: cached.grounding,
      vector: cached.vector,
      completedAt: Date.now(),
      isCacheHit: true
    });
    return;
  }
  
  // 2. Fetch Active Key
  const apiKey = await getActiveKey();
  if (!apiKey) {
    console.warn(`[AI Worker] No active keys available for job ${job.id}. Retrying later.`);
    await updateJob(job.id, { 
      status: 'FAILED_TRANSIENT', 
      lastError: 'No active keys available (Quota Exhausted)',
      nextRetryAt: Date.now() + 30000 // Retry in 30s
    });
    return;
  }

  try {
    // 3. Research Phase
    await updateJob(job.id, { status: 'RESEARCHING' });
    self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    
    const researchCacheKey = requestCache.generateKey(job.topic, 'research');
    let fullResearch = requestCache.get(researchCacheKey);
    let grounding: any = { searchQueries: [], webUrls: [] };
    
    if (fullResearch) {
      console.log(`[AI Worker] Memory cache hit for Research: ${job.topic}`);
      await updateJob(job.id, { researchText: fullResearch });
      self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    } else {
      let currentResearch = '';
      
      // We'll use a chunk watchdog here to prevent infinite hangs
      let lastChunkTime = Date.now();
      let isDone = false;
      const ac = new AbortController();
      
      const watchdog = setInterval(() => {
        if (!isDone && Date.now() - lastChunkTime > 25000) {
          console.error(`[AI Worker] Watchdog timeout on job ${job.id} (Research)`);
          ac.abort(new Error('STREAM_TIMEOUT'));
        }
      }, 5000);

      const researchRes = await streamResearch(
        job.topic,
        apiKey,
        async (chunk) => {
          lastChunkTime = Date.now();
          currentResearch += chunk;
          if (Math.random() < 0.1) {
            await updateJob(job.id, { researchText: currentResearch });
            self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
          }
        },
        ac.signal
      );
      
      fullResearch = researchRes.text;
      grounding = researchRes.grounding;
      
      isDone = true;
      clearInterval(watchdog);
      
      requestCache.set(researchCacheKey, fullResearch);
      await updateJob(job.id, { researchText: fullResearch, grounding });
    }

    // 4. Structuring Phase
    await updateJob(job.id, { status: 'STRUCTURING' });
    self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    
    const synthesisCacheKey = requestCache.generateKey(job.topic, 'synthesis');
    let fullSynthesis = requestCache.get(synthesisCacheKey);
    
    if (fullSynthesis) {
      console.log(`[AI Worker] Memory cache hit for Synthesis: ${job.topic}`);
      await updateJob(job.id, { synthesisText: fullSynthesis });
      self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    } else {
      let currentSynthesis = '';
      
      let lastChunkTime = Date.now();
      let isDone = false;
      const ac = new AbortController();
      
      const watchdog = setInterval(() => {
        if (!isDone && Date.now() - lastChunkTime > 25000) {
          console.error(`[AI Worker] Watchdog timeout on job ${job.id} (Synthesis)`);
          ac.abort(new Error('STREAM_TIMEOUT'));
        }
      }, 5000);

      fullSynthesis = await streamSynthesis(
        fullResearch,
        apiKey,
        async (chunk) => {
          lastChunkTime = Date.now();
          currentSynthesis += chunk;
          if (Math.random() < 0.1) {
            await updateJob(job.id, { synthesisText: currentSynthesis });
            self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
          }
        },
        ac.signal
      );
      
      isDone = true;
      clearInterval(watchdog);
      
      requestCache.set(synthesisCacheKey, fullSynthesis);
    }
    
    // Self-healing validation: if the model didn't produce YAML frontmatter, inject one
    let validatedSynthesis = fullSynthesis;
    const hasFrontmatter = /^---\s*\n[\s\S]*?\n---/m.test(fullSynthesis) || 
                           fullSynthesis.toLowerCase().includes('title:');
    if (!hasFrontmatter) {
      console.warn(`[AI Worker] Job ${job.id}: No YAML frontmatter detected. Injecting fallback.`);
      const fallbackFrontmatter = `---\ntitle: "${job.topic}"\ntags: ["auto-generated"]\nsummary: "Research on ${job.topic}"\n---\n\n`;
      validatedSynthesis = fallbackFrontmatter + fullSynthesis;
    }
    
    await updateJob(job.id, { synthesisText: validatedSynthesis });

    // 5. Embedding Phase
    await updateJob(job.id, { status: 'EMBEDDING' });
    self.postMessage({ type: 'JOB_UPDATED', jobId: job.id });
    
    // Extract title/summary for embedding (resilient to various YAML formats)
    let title = job.topic;
    let summary = '';
    const yamlMatch = validatedSynthesis.match(/---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (yamlMatch) {
      const titleMatch = yamlMatch[1].match(/title:\s*"?([^"\r\n]+)"?/i);
      if (titleMatch) title = titleMatch[1].trim();
      const summaryMatch = yamlMatch[1].match(/summary:\s*"?([^"\r\n]+)"?/i);
      if (summaryMatch) summary = summaryMatch[1].trim();
    }
    
    const textToEmbed = `${title}. ${summary}`.trim();
    const vector = await getEmbedding(textToEmbed, apiKey);
    
    // 6. Complete
    await updateJob(job.id, { 
      status: 'AWAITING_REVIEW', 
      vector,
      completedAt: Date.now(),
      isCacheHit: true
    });
    
  } catch (error: any) {
    console.error(`[AI Worker] Error on job ${job.id}:`, error);
    
    const isRateLimit = error.message.includes('429') || error.message.includes('Quota');
    const isTruncated = error.message.includes('STREAM_TRUNCATED');
    const isTimeout = error.message.includes('STREAM_TIMEOUT') || error.name === 'AbortError';
    
    if (isRateLimit) {
      // Mark key cooldown and retry job transiently
      await markKeyCooldown(apiKey, 60000); // 1 min cooldown
      await updateJob(job.id, {
        status: 'FAILED_TRANSIENT',
        lastError: 'Rate Limited (429). Retrying with next key.',
        nextRetryAt: Date.now() + 5000 // Retry in 5s
      });
    } else if (isTruncated || isTimeout) {
      await updateJob(job.id, {
        status: 'DEAD_LETTER',
        lastError: isTruncated ? 'Job truncated: ' + error.message : 'Stream timed out',
        retryCount: job.maxRetries
      });
    } else {
      // Other error (e.g. SCHEMA_MISMATCH, 503, etc)
      const newRetryCount = job.retryCount + 1;
      if (newRetryCount >= job.maxRetries) {
        await updateJob(job.id, {
          status: 'DEAD_LETTER',
          lastError: error.message,
          retryCount: newRetryCount
        });
      } else {
        await updateJob(job.id, {
          status: 'FAILED_TRANSIENT',
          lastError: error.message,
          retryCount: newRetryCount,
          nextRetryAt: Date.now() + 10000 * newRetryCount // Exponential backoff
        });
      }
    }
  }
};
