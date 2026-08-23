import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Imports
text = text.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)
text = text.replace(
    "  ArrowRight,\n} from 'lucide-react';",
    "  ArrowRight,\n  ChevronLeft,\n  ChevronRight,\n} from 'lucide-react';"
)

# 2. Inject State and Hooks
hooks_injection = """  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pagesCount = note.content.split('---').length;

  const scrollToPage = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const targetX = pageIndex * container.clientWidth;
    container.scrollTo({ left: targetX, behavior: 'smooth' });
    if (pageIndex > currentPage) sounds.playPageFlip?.();
    else sounds.playClick?.();
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const page = Math.round(container.scrollLeft / container.clientWidth);
    if (page !== currentPage) setCurrentPage(page);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentPage < pagesCount - 1) scrollToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentPage > 0) scrollToPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pagesCount]);"""

text = text.replace("  const [copied, setCopied] = useState(false);", hooks_injection)

# 3. Replace the entire "Dynamic CSS Multi-Column Reading View" to the end
old_view = r"""      \{/\* Dynamic CSS Multi-Column Reading View \*/\}
      <div className="relative group">
        <div className="bg-\[#0b101a\] border border-border/50 rounded-2xl p-6 md:p-8 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden">
          
          <div className="mb-6 pb-4 border-b border-border/40 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className=\{`px-2 py-0\.5 rounded text-\[9px\] font-mono uppercase \$\{note\.status === 'mastered' \? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'\}`\}>\{note\.status\}</span>
                \{topic && <span className="px-2 py-0\.5 rounded bg-white/5 text-\[9px\] font-mono text-muted-foreground uppercase">\{topic\.name\}</span>\}
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-foreground">\{note\.title\}</h1>
            </div>
          </div>

                    \{/\* Explicit Book Pages Container \*/\}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-4 custom-scrollbar" style=\{\{ height: 'calc\(100vh - 320px\)' \}\}>
            \{note\.content\.split\('---'\)\.map\(\(pageContent, idx\) => \(
              <div key=\{idx\} className=\{`w-full min-w-full shrink-0 snap-center prose prose-invert max-w-none font-mono \$\{fontSizeClass\} overflow-y-auto pr-4`\}>
                
                \{/\* Page Number Indicator \*/\}
                <div className="text-\[9px\] font-mono text-muted-foreground/50 text-right mb-2">
                  PAGE \{idx \+ 1\} OF \{note\.content\.split\('---'\)\.length\}
                </div>

                <ReactMarkdown
                  components=\{\{
                    hr: \(\{node, \.\.\.props\}\) => <hr className="page-break-line my-8 border-border/40" \{\.\.\.props\} />,
                    h1: \(\{node, \.\.\.props\}\) => <h1 className="text-xl font-heading font-bold text-foreground mt-2 mb-4 border-b border-border/40 pb-2" \{\.\.\.props\} />,
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
                  \{pageContent\}
                </ReactMarkdown>
              </div>
            \)\)\}
          </div>

        </div>
      </div>
    </div>
  \);
\};"""

new_view = """      {/* Phase 1: Fluid Navigation & The 3D Grimoire */}
      <div className="relative group">
        
        {/* Holographic Navigation Chevrons & Click Zones */}
        <div 
          onClick={() => currentPage > 0 && scrollToPage(currentPage - 1)}
          className={`absolute left-[-20px] top-0 bottom-0 w-[15%] z-20 flex items-center justify-start pl-2 cursor-pointer transition-opacity duration-300 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100 group-hover:opacity-60'}`}
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)' }}
        >
          <ChevronLeft className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(0,224,255,0.8)] -translate-x-2 hover:scale-110 transition-transform" />
        </div>

        <div 
          onClick={() => currentPage < pagesCount - 1 && scrollToPage(currentPage + 1)}
          className={`absolute right-[-20px] top-0 bottom-0 w-[15%] z-20 flex items-center justify-end pr-2 cursor-pointer transition-opacity duration-300 ${currentPage === pagesCount - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100 group-hover:opacity-60'}`}
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)' }}
        >
          <ChevronRight className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(0,224,255,0.8)] translate-x-2 hover:scale-110 transition-transform" />
        </div>

        <div className="bg-[#0b101a] border border-border/50 rounded-2xl p-6 md:p-8 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden">
          
          {/* Neon Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(0,224,255,0.8)] transition-all duration-300"
              style={{ width: `${((currentPage + 1) / pagesCount) * 100}%` }}
            />
          </div>

          <div className="mb-6 pb-4 border-b border-border/40 flex justify-between items-end mt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${note.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>{note.status}</span>
                {topic && <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-muted-foreground uppercase">{topic.name}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-foreground">{note.title}</h1>
            </div>
          </div>

          {/* Explicit Book Pages Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-4" 
            style={{ 
              height: 'calc(100vh - 320px)', 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {/* CSS override to hide webkit scrollbar but keep horizontal scroll */}
            <style>{`
              .snap-x::-webkit-scrollbar { display: none; }
            `}</style>
            
            {note.content.split('---').map((pageContent, idx) => (
              <div key={idx} className={`w-full min-w-full shrink-0 snap-center prose prose-invert max-w-none font-mono ${fontSizeClass} overflow-y-auto pr-4`}>
                
                {/* Page Number Indicator */}
                <div className="text-[9px] font-mono text-primary/70 text-right mb-2">
                  PAGE {idx + 1} OF {pagesCount}
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
          </div>

        </div>
      </div>
    </div>
  );
};"""

text = re.sub(old_view, new_view, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
