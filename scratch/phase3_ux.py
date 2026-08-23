import re

with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Imports
text = text.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport ReactMarkdown from 'react-markdown';"
)
text = text.replace(
    "  Loader2,\n} from 'lucide-react';",
    "  Loader2,\n  BrainCircuit,\n  Type,\n} from 'lucide-react';"
)

# 2. Update the "Synthesize" Button Text
old_auto_format_btn = r"""                <button
                  onClick=\{handleAutoOrganize\}
                  disabled=\{isFormatting\}
                  className=\{`px-3 py-1\.5 rounded-lg border text-xs font-mono flex items-center gap-1\.5 transition-all 
\$\{
                    isFormatting
                      \? 'bg-primary/5 border-primary/20 text-primary/50 cursor-wait'
                      : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/20'
                  \}`\}
                  title="Automatically organize and format markdown content"
                >
                  <Sparkles className=\{`w-3\.5 h-3\.5 \$\{isFormatting \? 'animate-pulse' : ''\}`\} />
                  \{isFormatting \? 'Formatting\.\.\.' : 'Auto-Format'\}
                </button>"""

new_auto_format_btn = """                <button
                  onClick={handleAutoOrganize}
                  disabled={isFormatting}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] ${
                    isFormatting
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500/50 cursor-wait'
                      : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  }`}
                  title="Synthesize and Paginate the raw stream via Oracle AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isFormatting ? 'animate-pulse' : ''}`} />
                  {isFormatting ? 'Synthesizing Matrix...' : 'Synthesize Stream'}
                </button>"""

text = re.sub(old_auto_format_btn, new_auto_format_btn, text)


# 3. Replace the Editor Body with Split Screen
old_editor = r"""            \{/\* Editor Body \*/\}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-\[11px\] font-mono text-muted-foreground">
                <span>Markdown Content & Chapters</span>
                <span className="text-primary">
                  Tip: Separate chapters with <code className="text-foreground bg-white/10 px-1 rounded">---</code> to 
create new book pages
                </span>
              </div>
              <textarea
                rows=\{16\}
                value=\{content\}
                onChange=\{\(e\) => setContent\(e\.target\.value\)\}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-white 
focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>"""

new_editor = """            {/* Phase 3: Synaptic Dump Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              
              {/* Left Pane: Raw Dump */}
              <div className="space-y-2 flex flex-col h-full">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase mb-1">
                  <span className="flex items-center gap-1.5"><Type className="w-3 h-3 text-emerald-400" /> RAW SYNAPTIC STREAM</span>
                  <span className="text-emerald-500/50">Unstructured Input</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dump raw thoughts, unstructured notes, or transcriptions here. Click 'Synthesize Stream' above to compile it into the matrix on the right..."
                  className="w-full flex-1 min-h-[500px] bg-[#020605] border border-emerald-500/30 rounded-xl p-5 font-mono text-xs text-emerald-400/90 focus:outline-none focus:border-emerald-500/60 leading-relaxed custom-scrollbar shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] resize-y"
                />
              </div>

              {/* Right Pane: Compiled Node (Live Preview) */}
              <div className="space-y-2 flex flex-col h-full">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase mb-1">
                  <span className="flex items-center gap-1.5"><BrainCircuit className="w-3 h-3 text-primary" /> COMPILED NEURAL NODE</span>
                  <span className="text-primary/50">Live Matrix</span>
                </div>
                <div className="w-full flex-1 min-h-[500px] bg-[#070d14] border border-primary/30 rounded-xl p-5 overflow-y-auto custom-scrollbar relative">
                  {isFormatting && (
                    <div className="absolute inset-0 bg-[#070d14]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border-2 border-primary/50 rounded-xl">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-b-2 border-indigo-400 animate-spin-slow"></div>
                        <BrainCircuit className="absolute inset-4 w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <span className="text-xs font-mono font-bold text-primary animate-pulse uppercase tracking-widest">Restructuring Matrix...</span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none font-mono text-xs">
                    <ReactMarkdown
                      components={{
                        hr: ({node, ...props}) => <div className="w-full border-t border-primary/40 border-dashed my-6 relative"><span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#070d14] px-2 text-[9px] text-primary tracking-widest uppercase">Page Break</span></div>,
                        h1: ({node, ...props}) => <h1 className="text-base font-heading font-bold text-foreground mt-4 mb-2 border-b border-border/40 pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-sm font-heading font-bold text-primary mt-3 mb-2 flex items-center gap-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xs font-heading font-bold text-foreground mt-3 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="text-muted-foreground mb-3 leading-relaxed whitespace-pre-wrap" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-muted-foreground marker:text-primary" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-muted-foreground marker:text-primary" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-foreground font-bold" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline 
                            ? <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[0.9em]" {...props} />
                            : <code className="block p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] overflow-x-auto text-emerald-400/90 shadow-inner my-2" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />
                      }}
                    >
                      {content || '*Awaiting synaptic input...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

            </div>"""

text = re.sub(old_editor, new_editor, text)


with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
