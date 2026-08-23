import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the broken function
text = re.sub(r'export const getNoteFormatPrompt =.*', '', text, flags=re.DOTALL)

clean_func = """
export const getNoteFormatPrompt = (title: string, currentContent: string) => {
  return `
You are an expert AI knowledge organizer. The user imported a raw wall of text that lacks proper formatting.
Title: "${title}"

Your task is to take the following raw content and reformat it into a beautiful, highly-readable Markdown document suitable for a "Book Reader" UI.
CRITICAL REQUIREMENTS:
1. Break the content up into logical chapters or pages. 
2. You MUST insert the exact string "---" on its own line to indicate a page break between major sections.
3. Use Markdown headers (##, ###), bullet points, and bold text (**bold**) where appropriate to make it readable.
4. Do NOT remove any details or text from the original content, just format and paginate it.
5. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text.

Raw Content:
"${currentContent}"
  `.trim();
};
"""

text = text.strip() + '\n' + clean_func

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
