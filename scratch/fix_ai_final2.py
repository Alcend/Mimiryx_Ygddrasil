import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

new_func = """export const getNoteFormatPrompt = (title: string, currentContent: string) => {
  return `
You are an expert AI knowledge organizer. The user imported a raw wall of text that lacks proper formatting.
Title: "${title}"

Your task is to take the following raw content and reformat it into a beautiful, highly-readable Markdown document suitable for a "Book Reader" UI.
CRITICAL REQUIREMENTS:
1. Break the content up into logical chapters or pages. 
2. You MUST insert the exact string "[PAGE_BREAK]" on its own line (surrounded by blank lines) to indicate a page break between major sections. Do NOT use standard horizontal rules (---) for page breaks.
3. Use Markdown headers (##, ###), bullet points, and bold text (**bold**) where appropriate to make it readable.
4. For Mathematical equations or LaTeX proofs, you MUST use $$...$$ for block equations and $...$ for inline math.
5. If a massive block of logs or code is too long and must span across a [PAGE_BREAK], you MUST close the code block fence (\\`\\`\\`) before the page break, and reopen it (\\`\\`\\`[language]) on the next page.
6. If there are image links, URLs, or image references in the raw text, preserve them using standard Markdown image syntax ![Alt Text](URL) and place them appropriately to fit the context.
7. Do NOT remove any details or text from the original content, just format and paginate it.
8. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text.

Raw Content:
"${currentContent}"
  `.trim();
};"""

text = re.sub(r'export const getNoteFormatPrompt =.*?};\n?', new_func + '\n', text, flags=re.DOTALL)

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
