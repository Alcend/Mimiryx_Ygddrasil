import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prompt_injection = """3. Use Markdown headers (##, ###), bullet points, and bold text (**bold**) where appropriate to make it readable.
4. For Mathematical equations or LaTeX proofs, you MUST use `$$...$$` for block equations and `$...$` for inline math.
5. If a massive block of logs or code is too long and must span across a `[PAGE_BREAK]`, you MUST close the code block fence (` ``` `) before the page break, and reopen it (` ```[language] `) on the next page.
6. If there are image links, URLs, or image references in the raw text, preserve them using standard Markdown image syntax ![Alt Text](URL) and place them appropriately to fit the context.
7. Do NOT remove any details or text from the original content, just format and paginate it.
8. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text."""

# Let's cleanly replace the prompt from "3." onwards
text = re.sub(r'3\. Use Markdown headers \(##, ###\).*?introductory text\.', prompt_injection, text, flags=re.DOTALL)

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
