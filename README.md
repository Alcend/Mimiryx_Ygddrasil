# MIMIRYX: Neural IT Knowledge Network & Operations Suite

![CI Pipeline](https://github.com/Alcend/Mimiryx_Ygddrasil/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Tests](https://img.shields.io/badge/Vitest%20%26%20Playwright-Passing-success)

Mimiryx (codenamed Yggdrasil) is a futuristic personal knowledge management workbench and IT operations training engine. It features a unique volumetric digital organism (The Yggdrasil World Tree) that grows and reacts to your learning progress in real-time, coupled with an interactive 3D Grimoire, simulated CLI sandboxes, and autonomous AI research pipelines.

---

## 🚀 Key Features

* **3-Column 3D Grimoire (BookReader):** Ergonomic widescreen reading architecture with holographic `rotateY` page-flip animations, bounded 65–75ch readability, and table-of-contents sidebar.
* **Deep Dive (Sensory Deprivation Mode):** Fullscreen distraction-free environment paired with Web Audio API ambient binaural sci-fi drone pads (110Hz + 164.8Hz).
* **Active Recall (Interrogation Mode):** Interactively censors key technical keywords and code blocks with glitch-masks to force active memory retrieval.
* **Autonomous AI Topic Creator:** Multi-tier Gemini 3.6 Flash background research pipeline with search grounding, graceful tool fallbacks, and 5-minute request memoization.
* **Simulated Lab Debugger & IT Tutor:** Live terminal sandboxes mimicking Linux bash, networking diagnostics (`ping`, `dig`), and server troubleshooting workflows.
* **Study Kanban Board:** Fluid, content-driven study boards with dynamic empty dropzones.
* **Hardened Server Proxy:** Secure serverless backend proxy (`server/proxy.js`) with monthly token budget enforcement, rate limiting, and zero client key exposure.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 18, TypeScript 5 (Strict Mode), Tailwind CSS (4px design tokens)
* **Performance:** Route & component-level `React.lazy` code-splitting, custom `<ErrorBoundary>` & `<Suspense>` fallbacks
* **Storage:** LocalForage (IndexedDB async engine) for zero-latency offline persistence
* **Rendering Engine:** HTML5 Canvas (World Tree), `react-markdown` + `rehype-katex` + `rehype-sanitize` (XSS-safe LaTeX math)
* **Background Processing:** Dedicated Web Worker (`aiPipeline.worker.ts`)
* **AI Orchestration:** Google Gemini 3.6 Flash / 3.6 Flash Lite
* **Testing:** Vitest (Unit) + Playwright (E2E) + GitHub Actions CI

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Alcend/Mimiryx_Ygddrasil.git
cd Mimiryx_Ygddrasil
npm ci
```

### 2. Environment Setup
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch Development Server
```bash
npm run dev
```

---

## 🧪 Testing & Verification

```bash
# Run unit tests (Vitest)
npm test

# Run E2E smoke tests (Playwright)
npm run test:e2e

# Run complete verification (Type check + Unit tests + Production build)
npm run verify
```

---

## 📚 Documentation
* 📄 **[Release Checklist](file:///docs/RELEASE_CHECKLIST.md)** — Pre-deployment verification guidelines
* 📄 **[Architecture Guide](file:///docs/ARCHITECTURE.md)** — Core subsystem design and state flow
* 📄 **[UI Guidelines](file:///docs/UI_GUIDELINES.md)** — 4px spacing scale and 3-column widescreen standards
* 📄 **Capstone Report:** [`MIMIRYX_Capstone_Documentation.docx`](file:///MIMIRYX_Capstone_Documentation.docx)

*The tree grows as you learn. Feed the engine.*
