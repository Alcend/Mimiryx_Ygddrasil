import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update scrollToPage
old_scroll = r"""  const scrollToPage = \(pageIndex: number\) => \{
    if \(!scrollContainerRef\.current\) return;
    const container = scrollContainerRef\.current;
    const targetX = pageIndex \* container\.clientWidth;
    container\.scrollTo\(\{ left: targetX, behavior: 'smooth' \}\);
    if \(pageIndex > currentPage\) sounds\.playPageFlip\?\.\(\);
    else sounds\.playClick\?\.\(\);
  \};

  const handleScroll = \(\) => \{
    if \(!scrollContainerRef\.current\) return;
    const container = scrollContainerRef\.current;
    const page = Math\.round\(container\.scrollLeft / container\.clientWidth\);
    if \(page !== currentPage\) setCurrentPage\(page\);
  \};"""

new_scroll = """  const scrollToPage = (pageIndex: number) => {
    if (pageIndex > currentPage) sounds.playPageFlip?.();
    else sounds.playClick?.();
    setCurrentPage(pageIndex);
  };"""

text = re.sub(old_scroll, new_scroll, text)

# 2. Update the container
old_container = r"""          \{/\* Explicit Book Pages Container \*/\}
          <div 
            ref=\{scrollContainerRef\}
            onScroll=\{handleScroll\}
            className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-4" 
            style=\{\{ 
              height: isFocusMode \? 'calc\(100vh - 200px\)' : 'calc\(100vh - 320px\)', 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            \}\}
          >
            \{/\* CSS override to hide webkit scrollbar but keep horizontal scroll \*/\}
            <style>\{`
              \.snap-x::-webkit-scrollbar \{ display: none; \}
            `\}</style>
            
            \{note\.content\.split\('---'\)\.map\(\(pageContent, idx\) => \(
              <div key=\{idx\} className=\{`w-full min-w-full shrink-0 snap-center prose prose-invert max-w-none font-mono \$\{fontSizeClass\} overflow-y-auto pr-4`\}>"""

new_container = """          {/* Explicit Book Pages Container */}
          <div 
            className="relative w-full pb-4" 
            style={{ 
              height: isFocusMode ? 'calc(100vh - 200px)' : 'calc(100vh - 320px)',
              perspective: '2500px'
            }}
          >
            {note.content.split('---').map((pageContent, idx) => {
              const isCurrent = idx === currentPage;
              const isPast = idx < currentPage;
              
              return (
              <div 
                key={idx} 
                className={`absolute inset-0 w-full h-full overflow-y-auto pr-4 prose prose-invert max-w-none font-mono ${fontSizeClass} custom-scrollbar transition-all duration-[700ms] ease-out`}
                style={{
                  transformOrigin: isPast ? '0% 50%' : '100% 50%',
                  transform: isCurrent ? 'rotateY(0deg) translateZ(0px)' : 
                             isPast ? 'rotateY(-60deg) translateZ(-200px)' : 
                             'rotateY(60deg) translateZ(-200px)',
                  opacity: isCurrent ? 1 : 0,
                  pointerEvents: isCurrent ? 'auto' : 'none',
                  zIndex: isCurrent ? 10 : 1
                }}
              >"""

text = re.sub(old_container, new_container, text)

# We also need to add the closing brace for the map function since I added a `return`
old_closing = r"""                </ReactMarkdown>
              </div>
            \)\)\}
          </div>"""

new_closing = """                </ReactMarkdown>
              </div>
            );
            })}
          </div>"""

text = re.sub(old_closing, new_closing, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
