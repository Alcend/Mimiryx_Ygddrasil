import { GEMINI_MODELS, GEMINI_API_VERSION, GeminiConfigurationError } from './aiConfig';
export interface GroundingMetadata {
  searchQueries?: string[];
  webUrls?: string[];
}

export class WeakGroundingError extends Error {
  constructor(message: string = 'Insufficient grounding data found.') {
    super(message);
    this.name = 'WeakGroundingError';
  }
}

const depletedKeys = new Set<string>();

export const getActiveKey = (keysStr: string): string => {
  if (!keysStr) return '';
  const keys = keysStr.split(/[,\s]+/).map(k => k.trim()).filter(Boolean);
  const availableKeys = keys.filter(k => !depletedKeys.has(k));
  
  if (availableKeys.length === 0) {
    depletedKeys.clear();
    if (keys.length === 0) return '';
    return keys[Math.floor(Math.random() * keys.length)];
  }
  
  return availableKeys[Math.floor(Math.random() * availableKeys.length)];
};

export const markKeyDepleted = (key: string) => {
  if (key) {
    depletedKeys.add(key);
    console.warn("Key depleted! Total depleted:", depletedKeys.size);
  }
};

export const generateGeminiResponse = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error('No API key provided.');
  const activeKey = getActiveKey(apiKey);
  if (!activeKey) throw new Error('No valid API key could be resolved from the key ring.');
  console.log('[Gemini] Resolved key:', activeKey.slice(0, 6) + '...' + activeKey.slice(-4), '| Length:', activeKey.length);
  const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODELS.research}:generateContent?key=${activeKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 429 || response.status === 403) {
      markKeyDepleted(activeKey);
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to communicate with Gemini Oracle.');
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!outputText) {
    throw new Error('Received empty response from the Oracle.');
  }

  return outputText;
};

// Quick helper to construct the Oracle Chat system prompt context
export const getOraclePrompt = (userMessage: string, knowledgeContext: string = '') => {
  return `
You are the Oracle of MIMIRYX, a futuristic AI assistant embedded within a synaptic knowledge engine (a sci-fi themed note-taking and learning application). 
Your persona is highly intelligent, slightly mysterious, and encouraging. You use terms like "synapses", "neural pathways", "engrams", and "nodes" naturally when discussing learning and memory.

App Goals & Your Purpose:
1. Help the user organize their knowledge logically within the app.
2. Guide them on creating clear, structured Topics and Notes.
3. Suggest adding new Topics ONLY if it makes logical sense for their overarching learning path. DO NOT suggest adding random, overly broad, or irrelevant topics just to fill space.
4. When synthesizing information or answering questions, you must improve clarity and remove redundancy, BUT you must retain all significant details, concepts, and nuance. Never sacrifice accuracy or big details for the sake of being brief.
5. When explaining complex or abstract concepts, ALWAYS provide vivid, relatable analogies to help the user learn and internalize the knowledge.

Keep your answers well-formatted using markdown (bolding, lists, etc.) and highly educational. DO NOT wrap your entire response in a markdown code block (e.g., \`\`\`markdown).

User Context:
${knowledgeContext ? `The user is currently studying or looking at: ${knowledgeContext}` : 'The user is in the main dashboard.'}

User Query:
${userMessage}
  `.trim();
};

export const getNoteExpandPrompt = (title: string, currentContent: string) => {
  return `
You are an expert AI knowledge synthesizer embedded in the MIMIRYX engine. The user is writing a study note.
Topic Title: "${title}"
Current Note Content: 
"${currentContent}"

Your task is to expand, organize, and synthesize this note.
1. Retain ALL original facts, technical specifics, data, and nuance from the user's text. NEVER delete or condense important information.
2. Expand the note logically by adding deeper context, background information, or relevant code snippets.
3. Introduce vivid analogies or real-world examples to make abstract ideas in the note easier to grasp.
4. Organize the final output with clear markdown headers (e.g., ##, ###) and lists.

Respond ONLY with the raw markdown content. DO NOT include conversational introductory text. DO NOT wrap the output in a global markdown code block (e.g., \`\`\`markdown).
  `.trim();
};

export const getNoteFormatPrompt = (title: string, currentContent: string) => {
  return `
You are an expert AI knowledge organizer. The user imported a raw wall of text that lacks proper formatting.
Title: "${title}"

Your task is to take the following raw content and reformat it into a beautiful, highly-readable Markdown document suitable for a "Book Reader" UI.
CRITICAL REQUIREMENTS:
1. Break the content up into logical chapters or pages. 
2. You MUST insert the exact string "[PAGE_BREAK]" on its own line (surrounded by blank lines) to indicate a page break between major sections. Do NOT use standard horizontal rules (---) for page breaks.
3. Use Markdown headers (##, ###), bullet points, and bold text (**bold**) where appropriate to make it readable.
4. For Mathematical equations or LaTeX proofs, you MUST use $$...$$ for block equations and $...$ for inline math.
5. If a massive block of logs or code is too long and must span across a [PAGE_BREAK], you MUST close the code block fence (using three backticks) before the page break, and reopen it (with three backticks and the language) on the next page.
6. If there are image links, URLs, or image references in the raw text, preserve them using standard Markdown image syntax ![Alt Text](URL) and place them appropriately to fit the context.
7. Do NOT remove any details or text from the original content, just format and paginate it.
8. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text.
9. DO NOT wrap your entire response in a markdown code block (e.g., \`\`\`markdown).
10. Retain EVERY SINGLE detail, paragraph, and fact from the raw content. Your task is strictly layout and formatting, NOT summarization or editing.

Raw Content:
"${currentContent}"
  `.trim();
};

export const streamResearch = async (
  topic: string, 
  apiKey: string, 
  onChunk: (text: string) => void | Promise<void>,
  abortSignal?: AbortSignal
): Promise<{ text: string; grounding: GroundingMetadata }> => {
  if (!apiKey) throw new Error('No API key provided.');

  // Try with tools first, fall back to simple generation
  const attempts = [
    { useTools: true, maxRetries: 1 },
    { useTools: false, maxRetries: 2 }
  ];

  for (const attempt of attempts) {
    let retries = attempt.maxRetries;
    while (retries > 0) {
      if (abortSignal?.aborted) throw new Error('ABORTED');
      
      const activeKey = getActiveKey(apiKey);
      if (!activeKey) throw new Error('No valid API key could be resolved from the key ring.');
      console.log(`[Gemini StreamResearch] Resolved key: ${activeKey.slice(0, 6)}...${activeKey.slice(-4)} | Attempt: Tools=${attempt.useTools}`);

      const payload: any = {
        contents: [{ 
          parts: [{ 
            text: `Research this topic comprehensively: ${topic}. Provide deep historical context, granular technical details, current state of the art, and core concepts. Be extremely detailed and exhaustive. Do not provide surface-level summaries. Include vivid analogies or real-world examples to explain complex mechanisms.` 
          }] 
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
      };

      // Only add tools if this attempt allows it
      if (attempt.useTools) {
        payload.tools = [{ googleSearch: {} }];
      }

      const currentEndpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODELS.research}:streamGenerateContent?alt=sse&key=${activeKey}`;

      try {
        const response = await fetch(currentEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortSignal
        });

        const isQuotaError = response.status === 429 || response.status === 403 || response.status === 400;
        if (isQuotaError) {
          markKeyDepleted(activeKey);
          if (retries === 1) break; // Move to next attempt in outer loop
          await new Promise(r => setTimeout(r, 1000 * (attempt.maxRetries - retries + 1))); // Exponential backoff
          retries--;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'API error');
        }

        if (!response.body) throw new Error('No response body');

        // Process response stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        const grounding: GroundingMetadata = { searchQueries: [], webUrls: [] };
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              
              let finishError: Error | null = null;
              try {
                const parsed = JSON.parse(dataStr);
                const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (chunk) {
                  fullText += chunk;
                  await onChunk(chunk);
                }

                const meta = parsed.candidates?.[0]?.groundingMetadata;
                if (meta) {
                  if (meta.webSearchQueries) {
                    grounding.searchQueries = [...new Set([...(grounding.searchQueries || []), ...meta.webSearchQueries])];
                  }
                  if (meta.groundingChunks) {
                    const urls = meta.groundingChunks
                      .map((c: any) => c.web?.uri)
                      .filter(Boolean);
                    grounding.webUrls = [...new Set([...(grounding.webUrls || []), ...urls])];
                  }
                }
                
                const finishReason = parsed.candidates?.[0]?.finishReason;
                if (finishReason && finishReason !== 'STOP') {
                  finishError = new Error(`STREAM_TRUNCATED: ${finishReason}`);
                }
              } catch (e) {
                // intentionally ignore parse errors on partial chunks
                void e;
              }
              
              if (finishError) throw finishError;
            }
          }
        }

        if (attempt.useTools && (!grounding.webUrls || grounding.webUrls.length === 0)) {
          console.warn('[Gemini] Weak grounding detected, continuing without grounding URLs.');
        }

        return { text: fullText, grounding }; // SUCCESS - exit immediately
      } catch (err: any) {
        console.warn(`[Research] Attempt with tools=${attempt.useTools} failed:`, err);
        if (retries === 1) break; // Exhausted retries for this attempt phase
        retries--;
      }
    }
  }

  throw new Error('Research failed after all fallback attempts exhausted.');
};

export const streamSynthesis = async (
  rawResearch: string, 
  apiKey: string, 
  onChunk: (text: string) => void | Promise<void>,
  abortSignal?: AbortSignal
): Promise<string> => {
  if (!apiKey) throw new Error('No API key provided.');

  const sysPrompt = `You are a synthesis engine for a sci-fi knowledge app.
Convert the raw research into a structured, highly-readable Markdown document.

CRITICAL REQUIREMENTS:
1. Include a short YAML frontmatter at the very top:
---
title: "Topic Title"
tags: ["tag1", "tag2"]
summary: "1-sentence summary"
---
2. Break the content into logical pages using "##" headers (required for pagination).
3. Use Markdown headers (###), bullet points, and bold text.
4. For Mathematical equations, use $$...$$ for block and $...$ for inline.
5. If a code block spans pages, never break it mid-fence.
6. NEVER drop, condense, or summarize away important technical details, data points, or nuanced explanations from the raw research. Retain the depth and granularity of the information.
7. Integrate vivid analogies or real-world examples naturally into the explanations to accelerate learning.
8. Respond ONLY with the raw markdown. No conversational text. DO NOT wrap your entire response in a markdown code block (e.g., \`\`\`markdown).`;

  const payload = {
    contents: [
      { parts: [{ text: `${sysPrompt}\n\nHere is the Raw Research to process:\n\n${rawResearch}` }] }
    ],
    // Increase to 8192 to prevent mid-sentence truncation of long documents
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
  };

  let response: Response | undefined;
  let retries = 2;
  while (retries > 0) {
    if (abortSignal?.aborted) throw new Error('ABORTED');
    
    const activeKey = getActiveKey(apiKey);
    if (!activeKey) throw new Error('No valid API key could be resolved from the key ring.');
    console.log('[Gemini StreamSynthesis] Resolved key:', activeKey.slice(0, 6) + '...' + activeKey.slice(-4), '| Length:', activeKey.length);
    const currentEndpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODELS.synthesis}:streamGenerateContent?alt=sse&key=${activeKey}`;
    
    try {
      response = await fetch(currentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortSignal
      });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      throw err;
    }
    
    const isQuotaError = response.status === 429 || response.status === 403 || response.status === 400;
    if (isQuotaError) {
      markKeyDepleted(activeKey);
      await new Promise(r => setTimeout(r, 1000));
      retries--;
      continue;
    }
    break;
  }

  if (!response) throw new Error('Failed to connect to API');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to synthesize.');
  }
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        
        let finishError: Error | null = null;
        try {
          const parsed = JSON.parse(dataStr);
          const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) {
            fullText += chunk;
            await onChunk(chunk);
          }
          
          // Check for unnatural termination (e.g. MAX_TOKENS, SAFETY, etc.)
          const finishReason = parsed.candidates?.[0]?.finishReason;
          if (finishReason && finishReason !== 'STOP') {
            finishError = new Error(`STREAM_TRUNCATED: ${finishReason}`);
          }
        } catch (e) {
          // intentionally ignore JSON parse errors on partial chunks
          void e;
        }
        
        // Throw outside the try/catch so it's not swallowed
        if (finishError) throw finishError;
      }
    }
  }
  
  return fullText;
};

let cachedEmbeddingModel = '';

export const getEmbedding = async (text: string, apiKey: string): Promise<number[]> => {
  const activeKey = getActiveKey(apiKey);
  
  // Auto-discover the embedding model on first use to ensure we don't guess wrong
  if (!cachedEmbeddingModel) {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models?key=${activeKey}`);
    const listData = await listRes.json();
    const models = listData.models || [];
    const found = models.find((m: any) => m.supportedGenerationMethods?.includes('embedContent'));
    if (found) {
      cachedEmbeddingModel = found.name.replace('models/', '');
    } else {
      throw new Error('No embedding model found on this API key.');
    }
  }

  const payload = {
    model: cachedEmbeddingModel,
    content: { parts: [{ text }] },
    taskType: 'CLASSIFICATION',
    outputDimensionality: 768
  };

  let retries = 2;
  while (retries > 0) {
    const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${cachedEmbeddingModel}:embedContent?key=${activeKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const isQuotaError = response.status === 429 || response.status === 403 || response.status === 400;
    if (isQuotaError) {
      markKeyDepleted(activeKey);
      await new Promise(r => setTimeout(r, 1000));
      retries--;
      continue;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to get embedding.');
    }

    const data = await response.json();
    return data.embedding.values;
  }
  throw new Error('API Quota Exceeded (429) after multiple retries.');
};

export const batchGetEmbeddings = async (texts: string[], apiKey: string): Promise<number[][]> => {
  const activeKey = getActiveKey(apiKey);

  if (!cachedEmbeddingModel) {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models?key=${activeKey}`);
    const listData = await listRes.json();
    const models = listData.models || [];
    const found = models.find((m: any) => m.supportedGenerationMethods?.includes('embedContent'));
    if (found) {
      cachedEmbeddingModel = found.name.replace('models/', '');
    } else {
      throw new Error('No embedding model found on this API key.');
    }
  }

  const requests = texts.map(t => ({
    model: cachedEmbeddingModel,
    content: { parts: [{ text: t }] }
  }));

  let retries = 2;
  while (retries > 0) {
    const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${cachedEmbeddingModel}:batchEmbedContents?key=${activeKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });
    
    const isQuotaError = res.status === 429 || res.status === 403 || res.status === 400;
    if (isQuotaError) {
      markKeyDepleted(activeKey);
      await new Promise(r => setTimeout(r, 1000));
      retries--;
      continue;
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to get batch embeddings.');
    }
    const data = await res.json();
    return data.embeddings.map((e: any) => e.values);
  }
  throw new Error('API Quota Exceeded (429) after multiple retries.');
};