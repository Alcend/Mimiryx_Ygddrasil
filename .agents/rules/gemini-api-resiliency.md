---
name: gemini-api-resiliency
description: Strict guardrails for implementing robust Gemini API connections, handling free-tier quotas, and model stability.
---

# Gemini API Resiliency Requirements

Whenever you are tasked with writing, modifying, or debugging code that interacts with the Gemini API (`generativelanguage.googleapis.com`), you MUST adhere to the following architectural guardrails:

## 1. Model Alias Stability
- **NEVER** invent or hallucinate future model names (e.g., `gemini-3.6-flash`, `gemini-2.5-flash`).
- **ALWAYS** use the `` suffix to guarantee endpoint resolution on `v1beta` (e.g., `gemini-1.5-pro` or `gemini-1.5-flash`). 
- Do not assume `models/gemini-1.5-flash` resolves globally; use the `` fallback alias if "model not found" errors are reported.

## 2. Stateful Key Rotation
- If an application accepts multiple API keys, implement a module-level `Set` (e.g., `depletedKeys = new Set<string>()`) to track failed keys.
- Do not randomly select keys from the raw list. Always filter the list against `depletedKeys` first.

## 3. Comprehensive Quota Trapping
- Wrap all API `fetch` calls in a `while (retries > 0)` loop (recommend 5-10 retries).
- Catch HTTP statuses `429`, `403`, and `400` as potential quota exhaustion events. 
- When intercepted, explicitly add the offending key to the `depletedKeys` tracker before continuing the loop.

## 4. Search Grounding Fallback
- Google frequently assigns a `0` request limit for the `googleSearch` grounding tool on fresh, unbilled free-tier keys. 
- If a payload includes `tools: [{ googleSearch: {} }]`, your retry loop MUST contain logic to dynamically `delete payload.tools` after ~50% of retries have failed, allowing the request to gracefully downgrade to a standard text generation rather than completely crashing the app.
