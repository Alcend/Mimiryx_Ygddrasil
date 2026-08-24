# API Integrations

## 1. EXTERNAL API RULE
Treat external APIs as unstable dependencies. Never rely on memory for model names, API versions, endpoints, SDK syntax, quotas, pricing, supported methods, deprecated models, response formats, or authentication mechanisms.
Before modifying an external integration:
`inspect current implementation + inspect current configuration + verify current provider capability + check authoritative documentation/discovery API`

## 2. API MODEL VALIDATION (GEMINI)
For AI APIs, never guess model names. Never "fix" a model error by blindly adding suffixes like `-latest`, `-001`, `-002`.
For a model-related error:
`inspect configured model -> query available models when supported -> check supported methods -> verify capability required by feature -> only then modify configuration`

## 3. API COST PROTECTION
External APIs have free-tier limits, token limits, and concurrency limits. Protect them.
Before debugging: prefer local inspection -> inspect logs -> inspect request construction -> use mocks/fixtures when possible -> perform one minimal live request.
Never waste API quota through repeated speculative requests. Never blindly retry without understanding the failure.

## 4. CACHE EXPENSIVE OPERATIONS
If an operation is deterministic or reusable, consider caching it (e.g., AI research, embeddings, metadata extraction). Do not regenerate identical data unnecessarily.

## 5. AI PROVIDER ABSTRACTION
AI provider integrations must be isolated behind an application abstraction. Do not scatter provider-specific code throughout UI components.
Preferred architecture: `UI -> Application Service -> AI Provider Interface -> Provider Implementation`.

## 6. AI OUTPUT IS UNTRUSTED INPUT
AI-generated content must be validated. Never assume AI output is correct, complete, safe, or schema-compliant. Validate schema, required fields, lengths, and constraints. Do not persist invalid AI responses as trusted state.

## 7. RETRY POLICY
Use retries only for transient failures (e.g., 429, temporary network error, timeout). Do not blindly retry invalid requests, invalid models, invalid schemas, permission failures, or malformed input. Use bounded exponential backoff with jitter. Never retry forever.
