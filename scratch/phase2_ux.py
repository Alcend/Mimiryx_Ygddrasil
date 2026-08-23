import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Imports
text = text.replace(
    "  ChevronRight,\n} from 'lucide-react';",
    "  ChevronRight,\n  BrainCircuit,\n} from 'lucide-react';"
)

# 2. Add State
text = text.replace(
    "  const [currentPage, setCurrentPage] = useState(0);",
    "  const [currentPage, setCurrentPage] = useState(0);\n  const [activeRecallMode, setActiveRecallMode] = useState(false);"
)

# 3. Add Toggle Button next to Copy Page
old_buttons = """        <div className="flex items-center gap-2">
          <button onClick={handleCopyPage} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors" title="Copy active page text">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>"""

new_buttons = """        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setActiveRecallMode(!activeRecallMode); sounds.playClick?.(); }} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors border ${
              activeRecallMode 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <BrainCircuit className={`w-3.5 h-3.5 ${activeRecallMode ? 'animate-pulse' : ''}`} />
            {activeRecallMode ? 'Interrogation Active' : 'Active Recall'}
          </button>

          <button onClick={handleCopyPage} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors" title="Copy active page text">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>"""

text = text.replace(old_buttons, new_buttons)

# 4. Modify strong and code blocks
old_components = r"""                    strong: \(\{node, \.\.\.props\}\) => <strong className="text-foreground font-bold" \{\.\.\.props\} />,
                    code: \(\{node, inline, \.\.\.props\}: any\) => 
                      inline 
                        \? <code className="bg-primary/10 text-primary px-1\.5 py-0\.5 rounded text-\[0\.9em\]" \{\.\.\.props\} />
                        : <code className="block p-3 bg-black/60 rounded-xl border border-white/10 text-\[11px\] overflow-x-auto text-emerald-400/90 shadow-inner my-4" \{\.\.\.props\} />,"""

new_components = """                    strong: ({node, ...props}) => (
                      <strong 
                        className={`font-bold transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30 rounded px-1' : 'text-foreground'}`} 
                        {...props} 
                      />
                    ),
                    code: ({node, inline, ...props}: any) => 
                      inline 
                        ? <code className={`px-1.5 py-0.5 rounded text-[0.9em] transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30' : 'bg-primary/10 text-primary'}`} {...props} />
                        : <code className={`block p-3 rounded-xl border text-[11px] overflow-x-auto shadow-inner my-4 transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-emerald-400/90 hover:select-auto hover:bg-black/50 cursor-crosshair border-rose-500/30' : 'bg-black/60 border-white/10 text-emerald-400/90'}`} {...props} />,"""

text = re.sub(old_components, new_components, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
