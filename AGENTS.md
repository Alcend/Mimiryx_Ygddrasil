# MIMIRYX Engineering Standards

## 1. Architecture & Storage
* Keep React components modular (under 150 lines).
* DO NOT use localStorage for saving Notes or Tree data. Use IndexedDB (via localforage or idb) for all large datasets to prevent the 5MB storage limit and UI blocking.

## 2. Performance & Memory Management
* Strict Cleanup: Every useEffect that attaches an event listener, timer, or canvas render loop must return a cleanup function.
* Audio Control: Always close the AudioContext using the close() method when audio components unmount to prevent severe memory leaks.

## 3. Security & API
* Enforce BYOK (Bring Your Own Key) for the Gemini API via localStorage settings. Never hardcode keys.
* Implement UI debouncing for AI requests. Disable submission buttons while loading and gracefully display HTTP 429 (Rate Limit) errors.

## 4. UI & Native Styling (Dark Mode)
* Native Dropdowns: When using native HTML <select> and <option> elements, always explicitly style the <option> tags (e.g. className="bg-[#0b101a] text-white"). If left unstyled, browsers will use the OS default light background while inheriting the app's white text, causing a critical white-on-white text bug.

## 5. AI Classifiers & Data Pipelines
* Strict String Matching: When building heuristic AI classifiers, never use naive string.includes() for topic mapping. It causes aggressive false positives (e.g. "infrastructure" triggering "infra"). Always use strict regex word boundaries (\bword\b) and require high confidence thresholds.
* Native Fast-Paths: Always implement a "Fast-Path" for importing native application data formats (e.g. mimiryx_vault.json). Do not pass structured native data exports through AI classification loops meant for raw unstructured text, as it will destroy native hierarchies.

## 6. UI Previews & Card Components
* Flipped Cards / Previews: When displaying a preview of a Note (e.g. flipping a 3D card on a dashboard), ALWAYS use the `note.summary` property. DO NOT attempt to paginate, parse, or display the full `note.content` on a dashboard card. Full content must be strictly reserved for dedicated reader pages (e.g. NoteDetailPage).
