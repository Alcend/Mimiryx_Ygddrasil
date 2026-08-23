import re

# 1. Update AI Prompt in ai.ts
with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '2. You MUST insert the exact string "---" on its own line to indicate a page break between major sections.',
    '2. You MUST insert the exact string "[PAGE_BREAK]" on its own line (surrounded by blank lines) to indicate a page break between major sections. Do NOT use standard horizontal rules (---) for page breaks.'
)

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update NoteDetailPage.tsx
with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    nd_text = f.read()

if 'import remarkGfm from' not in nd_text:
    nd_text = nd_text.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';")

nd_text = nd_text.replace(
    "Tip: Separate chapters with <code className=\"text-foreground bg-white/10 px-1 rounded\">---</code> to create new book pages",
    "Tip: Separate chapters with <code className=\"text-foreground bg-white/10 px-1 rounded\">[PAGE_BREAK]</code> to create new book pages"
)
nd_text = nd_text.replace(
    "setContent((prev) => prev + '\\n\\n---\\n\\n## Next Chapter / Subtopic\\n\\n');",
    "setContent((prev) => prev + '\\n\\n[PAGE_BREAK]\\n\\n## Next Chapter / Subtopic\\n\\n');"
)
nd_text = nd_text.replace(
    "<ReactMarkdown\n                    components={{",
    "<ReactMarkdown\n                    remarkPlugins={[remarkGfm]}\n                    components={{"
)

# Table components for NoteDetailPage
table_comps = """img: ({node, ...props}) => (
                        <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2">
                          <img className="max-w-full h-auto object-contain max-h-[300px] rounded-lg" {...props} />
                        </div>
                      ),
                      table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-xl border border-white/10"><table className="w-full text-left border-collapse text-xs" {...props} /></div>,
                      thead: ({node, ...props}) => <thead className="border-b border-white/20 bg-white/5" {...props} />,
                      tr: ({node, ...props}) => <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />,
                      th: ({node, ...props}) => <th className="p-3 font-heading font-bold text-primary" {...props} />,
                      td: ({node, ...props}) => <td className="p-3 text-muted-foreground" {...props} />"""

nd_text = re.sub(r'img: \(\{node, \.\.\.props\}\) => \([\s\S]*?<\/[a-zA-Z]+>\n\s*\)', table_comps, nd_text)

with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(nd_text)

# 3. Update BookReader.tsx
with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    br_text = f.read()

if 'import remarkGfm from' not in br_text:
    br_text = br_text.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';")

# Replace note.content.split('---') with splitting function
br_text = re.sub(
    r"const pagesCount = note\.content\.split\('---'\)\.length;",
    "const pages = note.content.split(/\\n\\n---\\n\\n|\\[PAGE_BREAK\\]/);\n  const pagesCount = pages.length;",
    br_text
)
br_text = br_text.replace("note.content.split('---').map", "pages.map")

br_text = br_text.replace(
    "<ReactMarkdown\n                  components={{",
    "<ReactMarkdown\n                  remarkPlugins={[remarkGfm]}\n                  components={{"
)

# Table components for BookReader
br_table_comps = """img: ({node, ...props}) => (
                      <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2">
                        <img className="max-w-full h-auto object-contain max-h-[400px] rounded-lg" {...props} />
                      </div>
                    ),
                    table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-xl border border-white/10"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="border-b border-white/20 bg-white/5" {...props} />,
                    tr: ({node, ...props}) => <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />,
                    th: ({node, ...props}) => <th className="p-3 font-heading font-bold text-primary" {...props} />,
                    td: ({node, ...props}) => <td className="p-3 text-muted-foreground" {...props} />"""

br_text = re.sub(r'img: \(\{node, \.\.\.props\}\) => \([\s\S]*?<\/[a-zA-Z]+>\n\s*\)', br_table_comps, br_text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(br_text)

print("SUCCESS")
