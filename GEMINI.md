# Safe Code Replacement Constraints

When moving or refactoring large blocks of code using Python scripts or string replacements:

1. **Never perform blind sequential replace operations**. 
   Do NOT use `text = text.replace(A, '')` followed by `text = text.replace(B, A + B)`. If `B` fails to match, `A` is permanently lost.

2. **Always validate targets before mutating**:
   ```python
   # DO THIS:
   if A in text and B in text:
       text = text.replace(A, '')
       text = text.replace(B, A + '\n' + B)
   else:
       print("ERROR: Match failed, aborting edit.")
   ```

3. **Mandatory Post-Edit Verification**:
   Always verify the resulting file immediately after executing string or regex transformations.

## 4. Strict Model Verification (Gemini)
Never assume a Gemini model identifier is valid. Before using a model, verify that it is currently available through the Gemini API and supports the operation required by the feature. Do not append -latest, -001, or other version suffixes unless that exact identifier is actually supported.

## 5. Dynamic Model Auto-Discovery
Never hardcode fallback embedding models (e.g. `text-embedding-004` or `embedding-001`). Always auto-discover the correct model dynamically by querying the `models.list` API and finding the first model where `supportedGenerationMethods.includes('embedContent')`. Google Cloud tiers frequently restrict or rename these models.

## 6. The `systemInstruction` Fallback Rule
When strict schema or formatting adherence is required (like forcing YAML frontmatter), **do not rely exclusively on the top-level `systemInstruction` field** in the REST payload. Many preview, lite, or legacy Gemini tiers completely ignore it, leading to `SCHEMA_MISMATCH` errors. You must combine the system prompt directly into the `contents` array as a unified user message block (e.g., prepending the instructions to the raw data) to guarantee the model reads it.

## 7. The Double-Escaped Regex Trap
When parsing multiline user input (like API keys) using Javascript regex literals, never double-escape newlines (`\n`) unless using the `new RegExp()` constructor. A double backslash in a literal `/\n/` matches a literal backslash + 'n', which will corrupt user strings containing real newlines. Always use `/[,\s]+/` to safely split on commas and whitespace.

## 8. The React Lazy Loading Invariant
Whenever introducing `React.lazy()` dynamic imports:
1. A `<Suspense fallback={...}>` boundary is **mandatory** directly above the lazy components or wrapping the routing `<Outlet />`. Never commit code-splitting without a visible fallback component, or React will throw an uncaught error and unmount the entire app into a black screen.
2. All lazy-loaded routes must be guarded by a React `<ErrorBoundary>` so that unexpected chunk loading failures or network blips render a recoverable UI card rather than crashing the single-page application.
