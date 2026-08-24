# Known Issues Memory

When an important bug is discovered and fixed, record it here to prevent repeated mistakes.

## 1. Obsolete Gemini Model Assumption
- **Problem**: Obsolete Gemini model configured (`gemini-1.5-pro`).
- **Root cause**: Model ID was assumed and a naked string was used without version validation, leading to API 404/400 errors. We erroneously assumed appending `-latest` to a retired model would fix it.
- **Fix**: Replaced the retired model with `gemini-2.5-flash` which explicitly supports `generateContent`.
- **Prevention**: All Gemini models must be validated through current provider capability discovery (`models.list`). Never assume an identifier is valid.

## 2. Audio Context Memory Leaks
- **Problem**: Severe memory leaks during audio playback in UI elements.
- **Root cause**: AudioContext was not properly closed or cleaned up in React `useEffect` unmount phases.
- **Fix**: Implemented strict cleanup functions in `useEffect`.
- **Prevention**: Every useEffect that attaches an event listener, timer, or canvas render loop must return a cleanup function. Always close the AudioContext using the `close()` method when audio components unmount.

## 3. Native Dropdown Styling Glitch
- **Problem**: Native HTML `<select>` elements displayed white-on-white text bugs in Dark Mode.
- **Root cause**: Browsers use OS default light backgrounds for unstyled `<option>` tags while inheriting the app's white text color.
- **Fix**: Explicitly style `<option>` tags with dark backgrounds.
- **Prevention**: When using native HTML `<select>` elements, always explicitly style the `<option>` tags.
