# MIMIRYX Pre-Release & Verification Checklist

Follow this checklist before tagging and deploying any release:

## 1. Type Safety & Tests
- [ ] **Type Check:** `npx tsc --noEmit` exits with `0` errors.
- [ ] **Unit Tests:** `npm run test` (Vitest) passes 100% of test suites.
- [ ] **E2E Smoke Tests:** `npm run test:e2e` (Playwright) completes without failures.
- [ ] **Combined Verification:** `npm run verify` passes completely.

## 2. Bundle Performance & Code Splitting
- [ ] **Production Build:** `npm run build` completes in `< 15s`.
- [ ] **Main Chunk Budget:** Main `index.js` chunk is `< 200 KB` unminified (`< 50 KB` gzipped).
- [ ] **No Chunk Warnings:** Vite outputs zero `> 500 KB` chunk size warnings.
- [ ] **Visualizer Inspection:** Review `bundle-report.html` for unexpected vendor bloat.

## 3. Security & API Protection
- [ ] **Zero Secrets Committed:** Verify no `.env`, `GEMINI_API_KEY`, or `PROXY_CLIENT_KEY` values exist in git history.
- [ ] **XSS Protection:** Confirm `rehype-sanitize` is active across all `<ReactMarkdown>` instances.
- [ ] **Proxy Active:** Ensure `server/proxy.js` has token limits, auth keys, and rate-limiting enabled.

## 4. UI/UX & Responsive Layouts
- [ ] **No Black Screens:** Verify `<ErrorBoundary>` and `<Suspense>` wrap all lazy routes.
- [ ] **Widescreen Ergonomics:** Confirm 3-column layout keeps reading text bounded to `max-w-3xl` (~65-75ch).
- [ ] **Empty States:** Ensure sparse chat modules and board columns render intentional `<EmptyState />` placeholders.
