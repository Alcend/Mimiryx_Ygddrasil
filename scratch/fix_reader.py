import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Import ReactMarkdown
if 'import ReactMarkdown' not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport ReactMarkdown from 'react-markdown';")

# 2. Replace the hand-rolled paragraph mapping with ReactMarkdown
old_render_block = r"""              \{note\.content\.split\('\\n\\n'\)\.map\(\(para, pIdx\) => \{
                if \(para\.trim\(\) === '---'\) \{
                  return <hr key=\{pIdx\} className="page-break-line" />;
                \}
                if \(para\.startsWith\('# '\)\) \{
                  return <h1 key=\{pIdx\} className="text-xl font-heading font-bold text-foreground mt-3 mb-2 border-b border-border/40 pb-2">\{para\.replace\('# ', ''\)\}</h1>;
                \}
                if \(para\.startsWith\('## '\)\) \{
                  return <h2 key=\{pIdx\} className="text-base font-heading font-bold text-primary mt-3 mb-1\.5 flex items-center gap-2"><CornerDownRight className="w-4 h-4" /> \{para\.replace\('## ', ''\)\}</h2>;
                \}
                if \(para\.startsWith\('```'\)\) \{
                  return <pre key=\{pIdx\} className="p-3 bg-black/60 rounded-xl border border-white/10 text-\[11px\] overflow-x-auto text-emerald-400/90 shadow-inner"><code>\{para\.replace\(/```\\w\*\\n\?|```/g, ''\)\}</code></pre>;
                \}
                if \(para\.startsWith\('- '\)\) \{
                  return \(
                    <ul key=\{pIdx\} className="list-none space-y-1 my-2">
                      \{para\.split\('\\n'\)\.map\(\(item, idx\) => \(
                        <li key=\{idx\} className="flex items-start gap-2 text-muted-foreground"><div className="w-1\.5 h-1\.5 rounded-full bg-primary/50 mt-1\.5 shrink-0" /><span dangerouslySetInnerHTML=\{\{ __html: item\.replace\('- ', ''\)\.replace\(/\\\*\\\*\(.*?\)\\\*\\\*/g, '<strong class="text-foreground">\$1</strong>'\) \}\} /></li>
                      \)\)\}
                    </ul>
                  \);
                \}
                return \(
                  <p key=\{pIdx\} className="text-muted-foreground mb-4 leading-relaxed" dangerouslySetInnerHTML=\{\{ __html: para\.replace\(/\\\*\\\*\(.*?\)\\\*\\\*/g, '<strong class="text-foreground">\$1</strong>'\)\.replace\(/`\(.*?\)`/g, '<code class="bg-primary/10 text-primary px-1 py-0\.5 rounded text-\[0\.9em\]">\$1</code>'\) \}\} />
                \);
              \}\)\}"""

new_render_block = """              <ReactMarkdown
                className="prose prose-invert max-w-none font-mono"
                components={{
                  hr: ({node, ...props}) => <hr className="page-break-line my-8 border-border/40" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-xl font-heading font-bold text-foreground mt-6 mb-4 border-b border-border/40 pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-heading font-bold text-primary mt-5 mb-3 flex items-center gap-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-heading font-bold text-foreground mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-foreground font-bold" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline 
                      ? <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[0.9em]" {...props} />
                      : <code className="block p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] overflow-x-auto text-emerald-400/90 shadow-inner my-4" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />
                }}
              >
                {note.content}
              </ReactMarkdown>"""

text = re.sub(old_render_block, new_render_block, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
