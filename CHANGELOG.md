# Changelog

All notable changes to the **MIMIRYX / Yggdrasil** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-25

### 🚀 Performance & Code-Splitting
- **Route-Level Lazy Loading:** Converted all 16 application routes in `src/App.tsx` to dynamic `React.lazy()` imports.
- **Rollup Vendor Chunking:** Configured `manualChunks` in `vite.config.ts` to isolate heavy math and markdown parsing libraries (`katex`, `rehype-katex`, `rehype-sanitize`, `react-markdown`) into `vendor-markdown.js`.
- **Bundle Optimization:** Reduced the main application entry chunk (`index.js`) by **82%** (from `848 kB` down to `155 kB` / `45.4 kB` gzipped), eliminating all Vite chunk size warnings.
- **Runtime Error Boundaries:** Wrapped the router and lazy-loaded views with `ErrorBoundary.tsx` and cyber-styled `<Suspense>` loaders to prevent black-screen unmounts.

### 🛡️ Security & Backend Proxy (`server/proxy.js`)
- **Zero Client Keys:** Created a secure serverless backend proxy to keep `GEMINI_API_KEY` off client browser bundles.
- **Client Auth Header:** Enforced `X-MIMIRYX-KEY` header matching `PROXY_CLIENT_KEY` to block unauthorized proxy access.
- **Persistent Token Budget:** Implemented file-backed monthly token accounting (`.token_budget.json`) with automated month-rollover reset (`YYYY-MM`).
- **Sliding-Window Rate Limiting:** Added IP-based rate limiting capping traffic at 60 requests per minute with HTTP 429 backoff.
- **Defensive Metadata Extraction:** Resilient token extraction across standard and legacy Gemini response shapes with zero prompt text logging.
- **Markdown XSS Sanitization:** Integrated `rehype-sanitize` across all reader and note views.

### 🧩 TypeScript & Type Safety
- **Ambient Environment Typings:** Added `src/env.d.ts` extending `ImportMetaEnv` with typed `VITE_*` definitions.
- **Server Module Declarations:** Added `src/types/server-proxy.d.ts` and `server/proxy.d.ts` companion declarations for clean Node/TypeScript interop.
- **Topic Helper Decoupling:** Isolated `resolveNoteTopic` into `src/utils/topicHelpers.ts`, preventing circular import leaks.
- **Clean Compilation:** Strict-mode `tsc --noEmit` verified with **0 errors**.

### 🧪 Testing & CI/CD
- **Vitest Unit Suite:** Added 14 unit tests covering topic slug/category heuristics, proxy token accounting, and rate limiting.
- **Playwright E2E Suite:** Added automated browser smoke tests verifying navigation, topic routing, and settings diagnostics.
- **GitHub Actions CI:** Created `.github/workflows/ci.yml` enforcing automated type checks, unit tests, and builds on PRs.

### 📖 Documentation & UX
- **Widescreen 3-Column Architecture:** Redesigned `BookReader.tsx` into a 3-column utility grid with 65–75ch readable text bounds.
- **Active Recall Mode:** Integrated dynamic keyword glitch-masking for active memory retrieval.
- **Release Checklist:** Created `docs/RELEASE_CHECKLIST.md` for pre-deployment verification.
- **Capstone Report:** Generated `MIMIRYX_Capstone_Documentation.docx` technical specification.
