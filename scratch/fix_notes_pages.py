import os

filepath = 'src/pages/NotesPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace variables
old_vars = """            const currentBackPageNum = flippedCards[note.id] || 1;
            const currentBackPage = pages[currentBackPageNum - 1] || pages[0];

            const cleanContent = currentBackPage.content.replace(/^#+\\s+[^\\n]+\\n*/, '').trim();"""

new_vars = """            const currentBackPageNum = flippedCards[note.id] || 1;
            const contentChunks = note.content.split('---');
            const rawContent = contentChunks[currentBackPageNum - 1] || note.content;
            const cleanContent = rawContent.replace(/^#+\\s+[^\\n]+\\n*/, '').trim();"""

content = content.replace(old_vars, new_vars)

# Replace rendering logic
old_ui = """                        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>PAGE {currentBackPage.pageNumber} OF {pages.length}</span>
                          </div>
                        </div>

                        {/* Current Page Chapter Title */}
                        <h4 className="text-xs font-heading font-bold text-foreground truncate shrink-0">
                          {currentBackPage.title}
                        </h4>"""

new_ui = """                        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>PAGE {currentBackPageNum} OF {pageCount}</span>
                          </div>
                        </div>

                        {/* Current Page Chapter Title */}
                        <h4 className="text-xs font-heading font-bold text-foreground truncate shrink-0">
                          {note.title} (Part {currentBackPageNum})
                        </h4>"""

content = content.replace(old_ui, new_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
