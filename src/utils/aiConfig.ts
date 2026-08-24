export const GEMINI_API_VERSION = 'v1beta';

export const GEMINI_MODELS = {
  // Use exact strings based on the API error message provided by the user
  research: 'gemini-3.6-flash',
  synthesis: 'gemini-3.6-flash',
  structure: 'gemini-3.6-flash',
  embedding: 'embedding-001',
};

export const GEMINI_FALLBACK_MODELS = {
  research: 'gemini-3.6-flash-lite',
  structure: 'gemini-3.6-flash-lite',
};

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigurationError';
  }
}

export function normalizeModelName(name: string): string {
  return name.replace(/^models\//, '');
}

export async function listAvailableModels(apiKey: string): Promise<any[]> {
  const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models?key=${apiKey}`;
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch models list.');
  }

  const data = await response.json();
  return data.models || [];
}

export async function validateGeminiModel(modelId: string, apiKey: string, requiredMethod: string = 'generateContent') {
  const models = await listAvailableModels(apiKey);

  const model = models.find(
    (m: any) => normalizeModelName(m.name) === normalizeModelName(modelId)
  );

  if (!model) {
    throw new GeminiConfigurationError(
      `Configured Gemini model "${modelId}" is not available for this API key/project.`
    );
  }

  if (!model.supportedGenerationMethods?.includes(requiredMethod)) {
    throw new GeminiConfigurationError(
      `Gemini model "${modelId}" does not support ${requiredMethod}.`
    );
  }

  return model;
}

export async function checkGeminiConfiguration(apiKey: string) {
  const results = {
    reachable: false,
    apiVersion: GEMINI_API_VERSION,
    configuredResearchModel: GEMINI_MODELS.research,
    researchModelExists: false,
    generateContentSupported: false,
    streamingSupported: false,
    embeddingModel: GEMINI_MODELS.embedding,
    embeddingModelExists: false,
    embeddingSupported: false,
    errors: [] as string[]
  };

  try {
    const models = await listAvailableModels(apiKey);
    results.reachable = true;

    const researchModel = models.find((m: any) => normalizeModelName(m.name) === normalizeModelName(GEMINI_MODELS.research));
    if (researchModel) {
      results.researchModelExists = true;
      results.generateContentSupported = researchModel.supportedGenerationMethods?.includes('generateContent') || false;
      results.streamingSupported = researchModel.supportedGenerationMethods?.includes('streamGenerateContent') || false;
    } else {
      results.errors.push(`Research model ${GEMINI_MODELS.research} not found.`);
    }

    // Auto-discover any embedding model instead of guessing
    const embeddingModel = models.find((m: any) => m.supportedGenerationMethods?.includes('embedContent'));
    
    if (embeddingModel) {
      results.embeddingModelExists = true;
      results.embeddingSupported = true;
      results.embeddingModel = normalizeModelName(embeddingModel.name);
      
      // We must also update the global GEMINI_MODELS object so the rest of the app uses it!
      GEMINI_MODELS.embedding = results.embeddingModel;
    } else {
      results.errors.push(`No embedding models found on this API key. Required for Vector Search.`);
    }

  } catch (err: any) {
    results.errors.push(err.message);
  }

  return {
    ...results,
    rawModelsList: results.reachable ? (await listAvailableModels(apiKey)).map((m: any) => m.name.replace('models/', '')) : [],
    isValid: results.researchModelExists && results.embeddingModelExists && results.errors.length === 0,
    availableModels: results.reachable ? ['Research: ' + results.configuredResearchModel, 'Embedding: ' + results.embeddingModel] : []
  };
}
