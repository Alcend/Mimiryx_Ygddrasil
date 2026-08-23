import re

with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
if 'import remarkMath from' not in text:
    text = text.replace("import remarkGfm from 'remark-gfm';", "import remarkGfm from 'remark-gfm';\nimport remarkMath from 'remark-math';\nimport rehypeKatex from 'rehype-katex';")

# 2. Add Plugins
text = text.replace("remarkPlugins={[remarkGfm]}", "remarkPlugins={[remarkGfm, remarkMath]}\n                    rehypePlugins={[rehypeKatex]}")

# 3. Component updates
text = text.replace(
    'p: ({node, ...props}) => <p className="text-muted-foreground mb-3 leading-relaxed whitespace-pre-wrap" {...props} />',
    'p: ({node, ...props}) => <p className="text-muted-foreground mb-3 leading-relaxed whitespace-pre-wrap break-words" {...props} />'
)

new_mappings = """blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                      input: ({node, type, ...props}: any) => type === 'checkbox' ? <input type="checkbox" className="accent-primary mr-2" {...props} /> : <input {...props} />,"""
text = re.sub(r'blockquote: \(\{node, \.\.\.props\}\) => <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" \{\.\.\.props\} />,', new_mappings, text)

# update code blocks
text = text.replace(
    ": <code className=\"block p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] overflow-x-auto text-emerald-400/90 shadow-inner my-2\" {...props} />",
    ": <code className=\"block p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] overflow-x-auto whitespace-pre break-words text-emerald-400/90 shadow-inner my-2\" {...props} />"
)
text = text.replace(
    "? <code className=\"bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[0.9em]\" {...props} />",
    "? <code className=\"bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[0.9em] break-all\" {...props} />"
)


with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
