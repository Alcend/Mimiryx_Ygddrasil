import re

with open('src/pages/NotesPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I need to change the CARD BACK part in NotesPage.tsx

old_card_back = r"""                      \{/\* Back Header \*/\}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
                        <div className="flex items-center gap-1\.5 text-\[10px\] font-mono text-primary font-bold">
                          <BookMarked className="w-3\.5 h-3\.5" />
                          <span>PAGE \{currentBackPageNum\} OF \{pageCount\}</span>
                        </div>
                      </div>

                      \{/\* Current Page Chapter Title \*/\}
                      <h4 className="text-xs font-heading font-bold text-foreground truncate shrink-0">
                        \{note\.title\} \(Part \{currentBackPageNum\}\)
                      </h4>

                      \{/\* Summarized Chapter Content \*/\}
                      <div 
                        className="flex-1 text-\[11px\] font-mono text-muted-foreground mt-2 overflow-y-auto pr-1 leading-relaxed whitespace-pre-wrap"
                        onClick=\{\(e\) => e\.stopPropagation\(\)\}
                      >
                        \{cleanContent\}
                      </div>
                    </div>

                    \{/\* Back Footer & Page Stepper \*/\}
                    <div 
                      className="pt-2\.5 border-t border-border/50 flex items-center justify-between mt-auto"
                      onClick=\{\(e\) => e\.stopPropagation\(\)\}
                    >
                      \{/\* Page Stepper Buttons \*/\}
                      <div className="flex items-center gap-1">
                        <button
                          onClick=\{\(e\) => handleFlipPageChange\(note\.id, currentBackPageNum - 1, pageCount, e\)\}
                          disabled=\{currentBackPageNum <= 1\}
                          className="p-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/15 text-foreground"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-3\.5 h-3\.5" />
                        </button>
                        <span className="text-\[10px\] font-mono text-muted-foreground px-1">
                          \{currentBackPageNum\}/\{pageCount\}
                        </span>
                        <button
                          onClick=\{\(e\) => handleFlipPageChange\(note\.id, currentBackPageNum \+ 1, pageCount, e\)\}
                          disabled=\{currentBackPageNum >= pageCount\}
                          className="p-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/15 text-foreground"
                          title="Next Page"
                        >
                          <ChevronRight className="w-3\.5 h-3\.5" />
                        </button>
                      </div>

                      \{/\* Read Full Action \*/\}"""

new_card_back = """                      {/* Back Header */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>EXECUTIVE SUMMARY</span>
                        </div>
                      </div>

                      {/* Current Page Chapter Title */}
                      <h4 className="text-xs font-heading font-bold text-foreground truncate shrink-0">
                        {note.title}
                      </h4>

                      {/* Summarized Chapter Content */}
                      <div 
                        className="flex-1 text-[11px] font-mono text-muted-foreground mt-3 overflow-y-auto pr-1 leading-relaxed whitespace-pre-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {note.summary || 'No summary available.'}
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div 
                      className="pt-2.5 border-t border-border/50 flex items-center justify-end mt-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Read Full Action */}"""

text = re.sub(old_card_back, new_card_back, text)
with open('src/pages/NotesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
