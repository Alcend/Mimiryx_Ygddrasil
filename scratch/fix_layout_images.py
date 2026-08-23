import re

# 1. Update AI Prompt
with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

old_prompt = r"""CRITICAL REQUIREMENTS:
1. Break the content up into logical chapters or pages. 
2. You MUST insert the exact string "---" on its own line to indicate a page break between major sections.
3. Use Markdown headers \(##, ###\), bullet points, and bold text \(\*\*bold\*\*\) where appropriate to make it readable.
4. Do NOT remove any details or text from the original content, just format and paginate it.
5. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text."""

new_prompt = """CRITICAL REQUIREMENTS:
1. Break the content up into logical chapters or pages. 
2. You MUST insert the exact string "---" on its own line to indicate a page break between major sections.
3. Use Markdown headers (##, ###), bullet points, and bold text (**bold**) where appropriate to make it readable.
4. If there are image links, URLs, or image references in the raw text, preserve them using standard Markdown image syntax `![Alt Text](URL)` and place them appropriately to fit the context.
5. Do NOT remove any details or text from the original content, just format and paginate it.
6. Respond ONLY with the raw markdown. Do not wrap in a global code block or add introductory text."""

text = re.sub(old_prompt, new_prompt, text)
with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update BookReader.tsx (Layout tightenting + Image mapping)
with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    br_text = f.read()

# Fix layout spacing
br_text = br_text.replace(
    'className="bg-[#0b101a] border border-border/50 rounded-2xl p-6 md:p-8 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden"',
    'className="bg-[#0b101a] border border-border/50 rounded-2xl p-5 md:p-6 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden"'
)
br_text = br_text.replace(
    'className="mb-6 pb-4 border-b border-border/40 flex justify-between items-end mt-2"',
    'className="mb-3 pb-3 border-b border-border/40 flex justify-between items-end mt-1"'
)
br_text = br_text.replace(
    "height: isFocusMode ? 'calc(100vh - 200px)' : 'calc(100vh - 320px)',",
    "height: isFocusMode ? 'calc(100vh - 150px)' : 'calc(100vh - 270px)',"
)

# Add image component mapping
old_comp = r"blockquote: \(\{node, \.\.\.props\}\) => <blockquote className=\"border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r\" \{\.\.\.props\} />"
new_comp = """blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                    img: ({node, ...props}) => (
                      <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2">
                        <img className="max-w-full h-auto object-contain max-h-[400px] rounded-lg" {...props} />
                      </div>
                    )"""

br_text = re.sub(old_comp, new_comp, br_text)
with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(br_text)

# 3. Update NoteDetailPage.tsx (Image mapping in live preview)
with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    nd_text = f.read()

old_nd_comp = r"blockquote: \(\{node, \.\.\.props\}\) => <blockquote className=\"border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r\" \{\.\.\.props\} />"
new_nd_comp = """blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                        img: ({node, ...props}) => (
                          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2">
                            <img className="max-w-full h-auto object-contain max-h-[300px] rounded-lg" {...props} />
                          </div>
                        )"""
nd_text = re.sub(old_nd_comp, new_nd_comp, nd_text)

with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(nd_text)

print("SUCCESS")
