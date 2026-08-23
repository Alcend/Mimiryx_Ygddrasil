import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I need to replace the entire <div className="book-flow custom-scrollbar relative"> block.
# Wait, I'll just find it.

old_block = r"""          \{/\* Book Flow Container \*/\}
          <div className="book-flow custom-scrollbar relative">
            <div className=\{`prose prose-invert max-w-none font-mono \$\{fontSizeClass\}`\}>
              <ReactMarkdown
                
                components=\{\{
                  hr: \(\{node, \.\.\.props\}\) => <hr className="page-break-line my-8 border-border/40" \{\.\.\.props\} />,
                  h1: \(\{node, \.\.\.props\}\) => <h1 className="text-xl font-heading font-bold text-foreground mt-6 mb-4 border-b border-border/40 pb-2" \{\.\.\.props\} />,
                  h2: \(\{node, \.\.\.props\}\) => <h2 className="text-lg font-heading font-bold text-primary mt-5 mb-3 flex items-center gap-2" \{\.\.\.props\} />,
                  h3: \(\{node, \.\.\.props\}\) => <h3 className="text-base font-heading font-bold text-foreground mt-4 mb-2" \{\.\.\.props\} />,
                  p: \(\{node, \.\.\.props\}\) => <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap" \{\.\.\.props\} />,
                  ul: \(\{node, \.\.\.props\}\) => <ul className="list-disc list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" \{\.\.\.props\} />,
                  ol: \(\{node, \.\.\.props\}\) => <ol className="list-decimal list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" \{\.\.\.props\} />,
                  li: \(\{node, \.\.\.props\}\) => <li className="pl-1" \{\.\.\.props\} />,
                  strong: \(\{node, \.\.\.props\}\) => <strong className="text-foreground font-bold" \{\.\.\.props\} />,
                  code: \(\{node, inline, \.\.\.props\}: any\) => 
                    inline 
                      \? <code className="bg-primary/10 text-primary px-1\.5 py-0\.5 rounded text-\[0\.9em\]" \{\.\.\.props\} />
                      : <code className="block p-3 bg-black/60 rounded-xl border border-white/10 text-\[11px\] overflow-x-auto text-emerald-400/90 shadow-inner my-4" \{\.\.\.props\} />,
                  blockquote: \(\{node, \.\.\.props\}\) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" \{\.\.\.props\} />
                \}\}
              >
                \{note\.content\}
              </ReactMarkdown>
            </div>
          </div>"""

new_block = """          {/* Explicit Book Pages Container */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-4 custom-scrollbar" style={{ height: 'calc(100vh - 320px)' }}>
            {note.content.split('---').map((pageContent, idx) => (
              <div key={idx} className={`w-full min-w-full shrink-0 snap-center prose prose-invert max-w-none font-mono ${fontSizeClass} overflow-y-auto pr-4`}>
                
                {/* Page Number Indicator */}
                <div className="text-[9px] font-mono text-muted-foreground/50 text-right mb-2">
                  PAGE {idx + 1} OF {note.content.split('---').length}
                </div>

                <ReactMarkdown
                  components={{
                    hr: ({node, ...props}) => <hr className="page-break-line my-8 border-border/40" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-xl font-heading font-bold text-foreground mt-2 mb-4 border-b border-border/40 pb-2" {...props} />,
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
                  {pageContent}
                </ReactMarkdown>
              </div>
            ))}
          </div>"""

text = re.sub(old_block, new_block, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
