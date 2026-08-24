import localforage from 'localforage';
import { GroundingMetadata } from '../utils/ai';

export type AIJobStatus = 
  | 'QUEUED'
  | 'PRE_FLIGHT'
  | 'RESEARCHING'
  | 'STRUCTURING'
  | 'EMBEDDING'
  | 'AWAITING_REVIEW'
  | 'COMPLETED'
  | 'FAILED_TRANSIENT'
  | 'DEAD_LETTER';

export interface AIJob {
  id: string;
  topic: string;
  topicHash: string;
  status: AIJobStatus;
  
  // Progress/UI State
  researchText?: string;
  synthesisText?: string;
  
  // Results
  grounding?: GroundingMetadata;
  vector?: number[];
  
  // Lifecycle
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  
  // Retry & Error
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  nextRetryAt?: number;
  isCacheHit?: boolean;
}

export interface AIKeyUsage {
  keyHash: string;
  status: 'ACTIVE' | 'COOLDOWN' | 'DEPLETED';
  cooldownUntil?: number;
  requestsToday: number;
  tokensToday: number;
}

const jobsStore = localforage.createInstance({
  name: 'mimiryx_ai',
  storeName: 'ai_jobs'
});

const usageStore = localforage.createInstance({
  name: 'mimiryx_ai',
  storeName: 'ai_usage'
});

// Job Operations
export const createJob = async (topic: string): Promise<AIJob> => {
  const normalized = topic.trim().toLowerCase();
  // Simple hash for demo purposes, could be more robust
  const hash = Array.from(normalized).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0).toString();
  
  const job: AIJob = {
    id: crypto.randomUUID(),
    topic,
    topicHash: hash,
    status: 'QUEUED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    retryCount: 0,
    maxRetries: 3
  };
  
  await jobsStore.setItem(job.id, job);
  return job;
};

export const getJob = async (id: string): Promise<AIJob | null> => {
  return await jobsStore.getItem(id);
};

export const updateJob = async (id: string, updates: Partial<AIJob>): Promise<AIJob | null> => {
  const job = await getJob(id);
  if (!job) return null;
  
  const updatedJob = { ...job, ...updates, updatedAt: Date.now() };
  await jobsStore.setItem(id, updatedJob);
  return updatedJob;
};

export const getAllJobs = async (): Promise<AIJob[]> => {
  const jobs: AIJob[] = [];
  await jobsStore.iterate((value: AIJob) => {
    jobs.push(value);
  });
  return jobs.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const findCachedJob = async (topicHash: string): Promise<AIJob | null> => {
  let found: AIJob | null = null;
  await jobsStore.iterate((value: AIJob) => {
    if (value.topicHash === topicHash && value.status === 'COMPLETED') {
      found = value;
    }
  });
  return found;
};

export const clearCompletedJobs = async () => {
  const keysToDelete: string[] = [];
  await jobsStore.iterate((value: AIJob, key: string) => {
    if (value.status === 'COMPLETED' || value.status === 'DEAD_LETTER') {
      keysToDelete.push(key);
    }
  });
  for (const key of keysToDelete) {
    await jobsStore.removeItem(key);
  }
};

// Key Usage Operations
export const getKeyUsage = async (keyHash: string): Promise<AIKeyUsage> => {
  const usage = await usageStore.getItem<AIKeyUsage>(keyHash);
  if (usage) return usage;
  
  const newUsage: AIKeyUsage = {
    keyHash,
    status: 'ACTIVE',
    requestsToday: 0,
    tokensToday: 0
  };
  await usageStore.setItem(keyHash, newUsage);
  return newUsage;
};

export const updateKeyUsage = async (keyHash: string, updates: Partial<AIKeyUsage>): Promise<AIKeyUsage> => {
  const usage = await getKeyUsage(keyHash);
  const updated = { ...usage, ...updates };
  await usageStore.setItem(keyHash, updated);
  return updated;
};

export const hashKey = (key: string) => key.substring(0, 8) + '...';

export const getAllKeyUsages = async (): Promise<AIKeyUsage[]> => {
  const usages: AIKeyUsage[] = [];
  await usageStore.iterate((value: AIKeyUsage) => {
    usages.push(value);
  });
  return usages;
};

export const resetAllKeyUsages = async (): Promise<void> => {
  await usageStore.clear();
  console.log('[DB] All key usage states have been reset.');
};
