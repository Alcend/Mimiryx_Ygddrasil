import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import 'katex/dist/katex.min.css';
import { Note, Topic } from '../types';
import { 
  Type, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  List,
  Target,
  Bookmark,
  CheckCircle2,
  BrainCircuit,
  Sparkles,
  BookMarked,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface BookReaderProps {
  note: Note;
  topic?: Topic;
  onEdit: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ note, topic, onEdit }) => {
  const { notes, updateNote } = useApp();
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeRecallMode, setActiveRecallMode] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const pages = note.content.split('[PAGE_BREAK]').map(p => p.trim()).filter(Boolean);
  const pagesCount = pages.length;

  // Keyboard navigation for pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusMode) {
        if (e.key === 'ArrowRight' && currentPage < pagesCount - 1) {
          setCurrentPage(prev => prev + 1);
          sounds.playClick?.();
        } else if (e.key === 'ArrowLeft' && currentPage > 0) {
          setCurrentPage(prev => prev - 1);
          sounds.playClick?.();
        } else if (e.key === 'Escape') {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, currentPage, pagesCount]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
        sounds.stopFocusDrone?.();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFocusMode = async () => {
    try {
      if (!document.fullscreenElement && fullscreenContainerRef.current) {
        await fullscreenContainerRef.current.requestFullscreen();
        setIsFocusMode(true);
        sounds.playFocusDrone?.();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFocusMode(false);
        sounds.stopFocusDrone?.();
      }
    } catch (err) {
      console.error("Fullscreen error", err);
    }
  };

  const topicNotes = topic ? notes.filter((n: Note) => n.topicId === topic.id) : [note];
  const suggestedNotes = topicNotes.filter((n: Note) => n.id !== note.id).slice(0, 3);
  if (suggestedNotes.length < 3) {
    const otherNotes = notes.filter((n: Note) => 
      n.id !== note.id && 
      n.topicId !== note.topicId && 
      n.tags.some((tag: string) => note.tags.includes(tag))
    );
    suggestedNotes.push(...otherNotes.slice(0, 3 - suggestedNotes.length));
  }

  const handleCopyPage = () => {
    navigator.clipboard.writeText(pages[currentPage] || note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMastery = () => {
    sounds.playSuccess?.();
    updateNote(note.id, { status: note.status === 'mastered' ? 'learning' : 'mastered' });
  };

  const scrollToPage = (idx: number) => {
    sounds.playClick?.();
    setCurrentPage(idx);
  };

  const fontSizeClass = fontSize === 'sm' ? 'text-xs leading-relaxed' : fontSize === 'lg' ? 'text-base leading-loose' : 'text-sm leading-relaxed';
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;

  return (
    <div ref={fullscreenContainerRef} className={isFocusMode ? "bg-[#020605] text-emerald-400/90 w-screen h-screen overflow-hidden flex flex-col p-4 md:p-6 relative" : "relative h-full flex flex-col"}>
      {isFocusMode && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, #000 100%)', zIndex: 0 }} />
      )}
      
      {/* 3-Column Utility Layout (Desktop) */}
      <div className={`flex flex-col xl:flex-row gap-6 w-full ${isFocusMode ? 'flex-1' : ''}`}>
        
        {/* LEFT SIDEBAR: Navigation / Sibling Notes */}
        {!isFocusMode && (
          <aside className="hidden xl:flex flex-col w-64 shrink-0 space-y-4 pt-2 sticky top-4 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
            <div className="p-4 rounded-xl bg-card border border-primary/20 space-y-3">
              <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <BookMarked className="w-3 h-3 text-primary" /> Suggested Linkages
              </h3>
              <div className="space-y-2">
                {suggestedNotes.length > 0 ? suggestedNotes.map((sn: Note) => (
                  <Link key={sn.id} to={`/notes/${sn.id}`} className="block p-2 rounded-lg bg-black/40 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                    <p className="text-xs font-heading font-semibold text-foreground group-hover:text-primary flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-muted-foreground" /> {sn.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 ml-4.5">{sn.summary}</p>
                  </Link>
                )) : (
                  <p className="text-xs text-muted-foreground italic">No related nodes found.</p>
                )}
              </div>
            </div>
            
            {/* Table of Contents / Pages */}
            {pagesCount > 1 && (
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                  <List className="w-3 h-3 text-primary" /> Book Chapters
                </h3>
                <div className="space-y-1.5">
                  {pages.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => scrollToPage(idx)}
                      className={`w-full text-left text-xs font-mono py-1.5 px-2 rounded-md transition-colors ${currentPage === idx ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'}`}
                    >
                      Page {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* CENTER COLUMN: Main Content */}
        <main className={`flex-1 flex flex-col min-w-0 ${isFocusMode ? 'h-full' : ''}`}>
          
          {/* Top Inline Toolbar (Compact) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 mb-4 rounded-xl bg-card/80 backdrop-blur border border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">FONT</span>
                <div className="flex rounded-lg border border-border/50 bg-black/40 overflow-hidden">
                  <button onClick={() => setFontSize('sm')} className={`px-2 py-1 ${fontSize === 'sm' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-3 h-3" /></button>
                  <button onClick={() => setFontSize('md')} className={`px-2 py-1 ${fontSize === 'md' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-4 h-4" /></button>
                  <button onClick={() => setFontSize('lg')} className={`px-2 py-1 ${fontSize === 'lg' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleFocusMode} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono transition-colors border ${isFocusMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'}`} title="Toggle Sensory Deprivation Mode">
                {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFocusMode ? 'Exit Deep Dive' : 'Deep Dive'}
              </button>
              <button onClick={() => { setActiveRecallMode(!activeRecallMode); sounds.playClick?.(); }} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono transition-colors border ${activeRecallMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'}`}>
                <Target className={`w-3.5 h-3.5 ${activeRecallMode ? 'animate-pulse' : ''}`} />
                {activeRecallMode ? 'Interrogation Active' : 'Active Recall'}
              </button>
            </div>
          </div>

          <div className={`bg-[#0b101a] border border-border/50 rounded-2xl p-5 md:p-6 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden ${isFocusMode ? "flex-1 flex flex-col min-h-0" : ""}`}>
            
            {/* Title Block (Centered max-w-3xl) */}
            <div className="mb-3 pb-3 border-b border-border/40 flex flex-col items-start mt-1 shrink-0 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-2 w-full">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${note.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>{note.status}</span>
                {topic && <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-muted-foreground uppercase">{topic.name}</span>}
              </div>
              <h1 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-foreground">{note.title}</h1>
            </div>

            {/* Neon Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <div className="h-full bg-primary shadow-[0_0_10px_rgba(0,224,255,0.8)] transition-all duration-300" style={{ width: `${((currentPage + 1) / pagesCount) * 100}%` }} />
            </div>

            {/* 3D Pages Container */}
            <div className={`relative w-full ${isFocusMode ? "flex-1 min-h-0" : "pb-4"}`} style={{ height: isFocusMode ? '100%' : 'calc(100vh - 150px)', perspective: '2500px' }}>
              {pages.map((pageContent, idx) => {
                const isCurrent = idx === currentPage;
                const isPast = idx < currentPage;
                
                return (
                <div 
                  key={idx} 
                  className={`absolute inset-0 w-full h-full overflow-y-auto pr-4 prose prose-invert mx-auto max-w-3xl font-mono ${fontSizeClass} custom-scrollbar transition-all duration-[700ms] ease-out px-4`}
                  style={{
                    transformOrigin: isPast ? '0% 50%' : '100% 50%',
                    transform: isCurrent ? 'rotateY(0deg) translateZ(0px)' : isPast ? 'rotateY(-60deg) translateZ(-200px)' : 'rotateY(60deg) translateZ(-200px)',
                    opacity: isCurrent ? 1 : 0,
                    pointerEvents: isCurrent ? 'auto' : 'none',
                    zIndex: isCurrent ? 10 : 1
                  }}
                >
                  <div className="text-[9px] font-mono text-primary/70 text-right mb-1">
                    PAGE {idx + 1} OF {pagesCount}
                  </div>

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeSanitize, rehypeKatex]}
                    components={{
                      hr: ({node, ...props}) => <hr className="page-break-line my-8 border-border/40" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-heading font-bold text-foreground mt-2 mb-4 border-b border-border/40 pb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-heading font-bold text-primary mt-5 mb-3 flex items-center gap-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-heading font-bold text-foreground mt-4 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap break-words" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-1 my-4 text-muted-foreground marker:text-primary" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className={`font-bold transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30 rounded px-1' : 'text-foreground'}`} {...props} />,
                      code: ({node, inline, ...props}: any) => inline ? <code className={`px-1.5 py-0.5 rounded text-[0.9em] break-all transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30' : 'bg-primary/10 text-primary'}`} {...props} /> : <code className={`block p-3 rounded-xl border text-[11px] overflow-x-auto whitespace-pre break-words shadow-inner my-4 transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-emerald-400/90 hover:select-auto hover:bg-black/50 cursor-crosshair border-rose-500/30' : 'bg-black/60 border-white/10 text-emerald-400/90'}`} {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                      input: ({node, type, ...props}: any) => type === 'checkbox' ? <input type="checkbox" className="accent-primary mr-2" {...props} /> : <input {...props} />,
                      img: ({node, ...props}) => <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2"><img className="max-w-full h-auto object-contain max-h-[400px] rounded-lg" {...props} /></div>,
                      table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-xl border border-white/10"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
                      thead: ({node, ...props}) => <thead className="border-b border-white/20 bg-white/5" {...props} />,
                      tr: ({node, ...props}) => <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />,
                      th: ({node, ...props}) => <th className="p-3 font-heading font-bold text-primary" {...props} />,
                      td: ({node, ...props}) => <td className="p-3 text-muted-foreground" {...props} />
                    }}
                  >
                    {pageContent}
                  </ReactMarkdown>
                </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Meta & Actions */}
        {!isFocusMode && (
          <aside className="hidden xl:flex flex-col w-56 shrink-0 space-y-4 pt-2 sticky top-4 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pl-2">
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[hsl(var(--neon-green))]" /> Note Metrics</h3>
              <div className="space-y-2 text-xs font-mono text-muted-foreground">
                <div className="flex justify-between border-b border-border/40 pb-1"><span>Difficulty</span><span className="text-foreground">{note.difficulty.toUpperCase()}</span></div>
                <div className="flex justify-between border-b border-border/40 pb-1"><span>Word Count</span><span className="text-foreground">{wordCount}</span></div>
                <div className="flex justify-between pb-1"><span>Pages</span><span className="text-foreground">{pagesCount}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
               <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><Target className="w-3 h-3 text-[hsl(var(--neon-blue))]" /> Actions</h3>
               <div className="space-y-2">
                 <button onClick={handleCopyPage} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-foreground transition-colors">
                   {copied ? 'Copied!' : 'Copy Page'}
                   {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                 </button>
                 <button onClick={handleToggleMastery} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors border ${note.status === 'mastered' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-border text-muted-foreground hover:text-primary'}`}>
                   {note.status === 'mastered' ? 'Mastered' : 'Mark Mastered'}
                   {note.status === 'mastered' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                 </button>
               </div>
            </div>
          </aside>
        )}

      </div>

      {/* Nav Chevrons (Hover) */}
      <div onClick={() => currentPage > 0 && scrollToPage(currentPage - 1)} className={`absolute left-0 top-0 bottom-0 w-[15%] z-20 flex items-center pl-2 cursor-pointer transition-opacity duration-300 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100 group-hover:opacity-60'}`} style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)' }}>
        <ChevronLeft className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(0,224,255,0.8)] -translate-x-2 hover:scale-110 transition-transform" />
      </div>
      <div onClick={() => currentPage < pagesCount - 1 && scrollToPage(currentPage + 1)} className={`absolute right-0 top-0 bottom-0 w-[15%] z-20 flex items-center justify-end pr-2 cursor-pointer transition-opacity duration-300 ${currentPage === pagesCount - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100 group-hover:opacity-60'}`} style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)' }}>
        <ChevronRight className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(0,224,255,0.8)] translate-x-2 hover:scale-110 transition-transform" />
      </div>

    </div>
  );
};
