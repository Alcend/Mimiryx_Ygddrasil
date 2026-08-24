# Architectural Decisions

This file tracks substantial architectural decisions to prevent future rediscovery of the same facts.

## 1. Local Offline-First Database
- **Decision**: Used IndexedDB (via localforage) for all large datasets (Notes, Tree Data, AI Jobs) instead of localStorage.
- **Rationale**: Prevents the 5MB storage limit and UI blocking for heavy data operations.

## 2. Bring Your Own Key (BYOK) Architecture
- **Decision**: Enforced BYOK for the Gemini API via localStorage settings. Never hardcode keys in the application source.
- **Rationale**: Ensures the application remains a stateless client, pushing API usage and quota limits directly to the user's secure client environment.

## 3. Web Worker Job Queue
- **Decision**: Implemented long-running AI pipelines (Topic Creator) inside a background Web Worker (`aiPipeline.worker.ts`).
- **Rationale**: Keeps the main UI thread responsive during heavy text streaming and chunk parsing. Allows jobs to process durably in the background while the user navigates the app.

## 4. Client-Side Vector Math
- **Decision**: Calculate Cosine Similarity on the client side using dot products over the cached 768-dimensional embeddings.
- **Rationale**: Eliminates the need to send existing tree structures back to the LLM for placement decisions, vastly reducing token cost and latency.
