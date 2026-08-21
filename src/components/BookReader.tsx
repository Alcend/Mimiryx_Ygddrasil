import React, { useState, useEffect, useRef } from 'react';
import { Note, Topic, NoteStatus, NoteDifficulty } from '../types';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  Sparkles,
  Layers,
  Copy,
  Check,
  Edit3,
  List,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  CornerDownRight,
  BookMarked,
  Sliders,
  Type,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../utils/audio';

interface BookReaderProps {
  note: Note;
  topic?: Topic;
  onEdit: () => void;
}

export interface NotePageItem {
  pageNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

/**
 * Intelligent Multi-Page Chunker:
 * Splits long notes/subtopics into digestible, comfortable book pages
 * based on explicit pagebreaks, headers, or length limits.
 */
export function chunkNoteIntoPages(content: string, noteTitle: string): NotePageItem[] {
  if (!content || !content.trim()) {
    return [{ pageNumber: 1, title: noteTitle, content: 'No content documented yet.', wordCount: 4 }];
  }

  // 1. Check for explicit pagebreaks (--- or <!-- pagebreak -->)
  const rawParts = content.split(/\n(?:\s*---\s*|\s*<!--\s*pagebreak\s*-->\s*)\n/);
  
  if (rawParts.length > 1) {
    return rawParts.map((part, idx) => {
      const trimmed = part.trim();
      const firstHeader = trimmed.match(/^#+\s+(.+)$/m);
      const pageTitle = firstHeader ? firstHeader[1] : `Page ${idx + 1}`;
      const words = trimmed.split(/\s+/).filter(Boolean).length;
      return {
        pageNumber: idx + 1,
        title: pageTitle,
        content: trimmed,
        wordCount: words,
      };
    });
  }

  // 2. Check if content has multiple major headers (## Section)
  const headerParts = content.split(/\n(?=##\s+)/);
  if (headerParts.length > 1 && content.length > 900) {
    return headerParts.map((part, idx) => {
      const trimmed = part.trim();
      const firstHeader = trimmed.match(/^#+\s+(.+)$/m);
      const pageTitle = firstHeader ? firstHeader[1] : (idx === 0 ? noteTitle : `Section ${idx + 1}`);
      const words = trimmed.split(/\s+/).filter(Boolean).length;
      return {
        pageNumber: idx + 1,
        title: pageTitle,
        content: trimmed,
        wordCount: words,
      };
    });
  }

  // 3. Fallback: If content is very long (> 1200 characters), auto-paginate by paragraphs
  if (content.length > 1200) {
    const paragraphs = content.split(/\n\n+/);
    const pages: NotePageItem[] = [];
    let currentChunk = '';
    let pageNum = 1;

    paragraphs.forEach((p) => {
      if ((currentChunk + '\n\n' + p).length > 950 && currentChunk.length > 300) {
        const words = currentChunk.split(/\s+/).filter(Boolean).length;
        const firstHeader = currentChunk.match(/^#+\s+(.+)$/m);
        pages.push({
          pageNumber: pageNum,
          title: firstHeader ? firstHeader[1] : (pageNum === 1 ? noteTitle : `Part ${pageNum}`),
          content: currentChunk.trim(),
          wordCount: words,
        });
        pageNum++;
        currentChunk = p;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + p;
      }
    });

    if (currentChunk.trim()) {
      const words = currentChunk.split(/\s+/).filter(Boolean).length;
      const firstHeader = currentChunk.match(/^#+\s+(.+)$/m);
      pages.push({
        pageNumber: pageNum,
        title: firstHeader ? firstHeader[1] : (pageNum === 1 ? noteTitle : `Part ${pageNum}`),
        content: currentChunk.trim(),
        wordCount: words,
      });
    }

    return pages;
  }

  // Single page if note is short & concise
  return [
    {
      pageNumber: 1,
      title: noteTitle,
      content: content.trim(),
      wordCount: content.split(/\s+/).filter(Boolean).length,
    },
  ];
}

export const BookReader: React.FC<BookReaderProps> = ({ note, topic, onEdit }) => {
  const { notes, updateNote } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [copied, setCopied] = useState(false);

  // Notes in the same topic for chapter flipping
  const topicNotes = topic ? notes.filter((n) => n.topicId === topic.id) : [note];
  const currentNoteIndex = topicNotes.findIndex((n) => n.id === note.id);

  const suggestedNotes = topicNotes.filter(n => n.id !== note.id).slice(0, 3);
  if (suggestedNotes.length < 3) {
    const otherNotes = notes.filter(n => 
      n.id !== note.id && 
      n.topicId !== note.topicId && 
      n.tags.some(tag => note.tags.includes(tag))
    );
    suggestedNotes.push(...otherNotes.slice(0, 3 - suggestedNotes.length));
  }
  // Still need more? Fill with any random other notes
  if (suggestedNotes.length < 3) {
    const fillNotes = notes.filter(n => 
      n.id !== note.id && 
      !suggestedNotes.find(sn => sn.id === n.id)
    );
    suggestedNotes.push(...fillNotes.slice(0, 3 - suggestedNotes.length));
  }

  const pages = chunkNoteIntoPages(note.content, note.title);
  const activePage = pages[currentPage - 1] || pages[0];

  // Reset to page 1 if note changes
  useEffect(() => {
    setCurrentPage(1);
  }, [note.id]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  const goToNextPage = () => {
    if (currentPage < pages.length) {
      sounds.playPageFlip();
      setIsFlipping('next');
      setTimeout(() => {
        setCurrentPage((p) => p + 1);
        setIsFlipping(null);
      }, 220);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      sounds.playPageFlip();
      setIsFlipping('prev');
      setTimeout(() => {
        setCurrentPage((p) => p - 1);
        setIsFlipping(null);
      }, 220);
    }
  };

  const handleCopyPage = () => {
    navigator.clipboard.writeText(activePage.content);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMastery = () => {
    sounds.playSuccess();
    const nextStatus: NoteStatus = note.status === 'mastered' ? 'learning' : 'mastered';
    updateNote(note.id, { status: nextStatus });
  };

  const fontSizeClass =
    fontSize === 'sm' ? 'text-xs leading-relaxed' : fontSize === 'lg' ? 'text-base leading-loose' : 'text-sm leading-relaxed';

  return (
    <div className="space-y-4">
      {/* Top Reading Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-card/80 backdrop-blur border border-border">
        {/* Topic & Chapter Badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{
              backgroundColor: `${topic?.color || '#00e0ff'}15`,
              color: topic?.color || '#00e0ff',
              border: `1px solid ${topic?.color || '#00e0ff'}40`,
            }}
          >
            <BookMarked className="w-3.5 h-3.5" />
            {topic?.name || 'General Knowledge'}
          </span>

          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="text-foreground font-semibold truncate max-w-[200px] hidden sm:inline">
            {note.title}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setFontSize((s) => (s === 'sm' ? 'md' : s === 'md' ? 'lg' : 'sm'));
            }}
            className="p-1.5 px-2 rounded-lg bg-white/5 border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
            title="Toggle Text Size"
          >
            <Type className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase">{fontSize}</span>
          </button>

          {/* Table of Contents / Index Drawer Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowToc((v) => !v);
            }}
            className={`p-1.5 px-2.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              showToc
                ? 'bg-primary/20 border-primary text-primary shadow-neon-glow'
                : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Pages ({pages.length})</span>
          </button>

          {/* Copy Page */}
          <button
            onClick={handleCopyPage}
            className="p-1.5 px-2.5 rounded-lg bg-white/5 border border-border hover:border-primary/40 text-xs font-mono text-foreground flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Status Pill Toggle */}
          <button
            onClick={handleToggleMastery}
            className={`p-1.5 px-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              note.status === 'mastered'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                : 'bg-primary/10 border-primary/30 text-primary'
            }`}
            title="Click to toggle Mastery"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="uppercase">{note.status}</span>
          </button>

        </div>
      </div>

      {/* Main Book Folio Viewport */}
      <div className="relative flex gap-4">
        {/* Interactive Book Page Container */}
        <div
          className={`flex-1 relative rounded-2xl cyber-card border border-primary/30 bg-[#070e17] shadow-2xl p-6 sm:p-10 min-h-[500px] flex flex-col justify-between overflow-hidden transition-all duration-200 ${
            isFlipping === 'next'
              ? 'opacity-85 translate-x-1 rotate-y-3 scale-[0.99]'
              : isFlipping === 'prev'
              ? 'opacity-85 -translate-x-1 -rotate-y-3 scale-[0.99]'
              : 'opacity-100 translate-x-0 rotate-y-0 scale-100'
          }`}
          style={{
            perspective: '1200px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,224,255,0.03)',
          }}
        >
          {/* Book Spine Center Lighting Effect */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />

          {/* Top Page Header */}
          <div className="border-b border-border/50 pb-3 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">PAGE {activePage.pageNumber}</span>
              <span>/</span>
              <span>{pages.length}</span>
              <span className="text-border hidden sm:inline">|</span>
              <span className="text-foreground/80 font-medium truncate max-w-[280px] hidden sm:inline">
                {activePage.title}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span>{activePage.wordCount} words</span>
              <span className="text-border">·</span>
              <span>{note.difficulty.toUpperCase()}</span>
            </div>
          </div>

          {/* Page Content Body (Formatted Markdown / Text) */}
          <div className="my-6 flex-1 overflow-y-auto pr-2 space-y-4">
            <div className={`prose prose-invert max-w-none font-mono ${fontSizeClass}`}>
              {activePage.content.split('\n\n').map((para, pIdx) => {
                if (para.startsWith('# ')) {
                  return (
                    <h1 key={pIdx} className="text-xl font-heading font-bold text-foreground mt-3 mb-2 border-b border-border/40 pb-2">
                      {para.replace('# ', '')}
                    </h1>
                  );
                }
                if (para.startsWith('## ')) {
                  return (
                    <h2 key={pIdx} className="text-base font-heading font-bold text-primary mt-3 mb-1.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      {para.replace('## ', '')}
                    </h2>
                  );
                }
                if (para.startsWith('### ')) {
                  return (
                    <h3 key={pIdx} className="text-sm font-heading font-semibold text-[hsl(var(--neon-green))] mt-2 mb-1">
                      {para.replace('### ', '')}
                    </h3>
                  );
                }
                if (para.startsWith('```')) {
                  const code = para.replace(/```[a-z]*\n?|```$/g, '');
                  return (
                    <div key={pIdx} className="p-3.5 rounded-xl bg-black/80 border border-primary/20 font-mono text-xs text-primary/95 overflow-x-auto shadow-inner">
                      <pre>{code}</pre>
                    </div>
                  );
                }
                if (para.startsWith('> ')) {
                  return (
                    <blockquote key={pIdx} className="p-3 rounded-xl bg-primary/5 border-l-2 border-primary text-xs italic text-muted-foreground my-2">
                      {para.replace(/^>\s*/gm, '')}
                    </blockquote>
                  );
                }
                if (para.startsWith('- ') || para.startsWith('* ')) {
                  const items = para.split('\n').filter(Boolean);
                  return (
                    <ul key={pIdx} className="space-y-1 my-2 pl-4 list-disc text-foreground/90">
                      {items.map((it, iIdx) => (
                        <li key={iIdx}>{it.replace(/^[-*]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={pIdx} className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {para}
                  </p>
                );
              })}
              
              {/* Intelligent Suggestions at the end of the note */}
              {currentPage === pages.length && suggestedNotes.length > 0 && (
                <div className="mt-16 pt-8 border-t border-primary/20">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-primary uppercase tracking-wider">
                      Related Knowledge
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedNotes.map((sn) => (
                      <Link
                        key={sn.id}
                        to={`/notes/${sn.id}`}
                        onClick={() => sounds.playClick()}
                        className="group flex flex-col p-4 rounded-xl border border-border bg-black/40 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
                          <h4 className="font-heading font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {sn.title}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-rotate-45 transition-all flex-shrink-0" />
                        </div>
                        <p className="text-xs font-mono text-muted-foreground line-clamp-3 mb-4 relative z-10">
                          {sn.summary || sn.content.substring(0, 100) + '...'}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-1.5 relative z-10">
                          {sn.tags.slice(0, 2).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-muted-foreground">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Page Footer & Flip Controls */}
          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            {/* Previous Page Button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                currentPage <= 1
                  ? 'opacity-30 border-transparent text-muted-foreground cursor-not-allowed'
                  : 'bg-white/5 border-border hover:border-primary/50 text-foreground hover:bg-primary/10 shadow-sm'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            {/* Page Slider / Progress Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="hidden sm:inline">Page</span>
              <div className="flex gap-1">
                {pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      sounds.playPageFlip();
                      setCurrentPage(p.pageNumber);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      p.pageNumber === currentPage
                        ? 'bg-primary scale-125 shadow-[0_0_8px_hsl(var(--primary))]'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                    title={`Jump to Page ${p.pageNumber}: ${p.title}`}
                  />
                ))}
              </div>
              <span className="font-bold text-foreground ml-1">{currentPage} of {pages.length}</span>
            </div>

            {/* Next Page Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= pages.length}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                currentPage >= pages.length
                  ? 'opacity-30 border-transparent text-muted-foreground cursor-not-allowed'
                  : 'bg-primary/10 border-primary/40 hover:bg-primary/20 text-primary font-bold shadow-neon-glow'
              }`}
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Table of Contents & Topic Chapters Sidebar */}
        {showToc && (
          <div className="w-72 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 cyber-card space-y-4 animate-in slide-in-from-right-4 duration-200 flex flex-col justify-between shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-heading font-bold text-foreground flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-primary" /> Table of Contents
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{pages.length} Pages</span>
              </div>

              {/* Page Index List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      sounds.playPageFlip();
                      setCurrentPage(p.pageNumber);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
                      p.pageNumber === currentPage
                        ? 'bg-primary/20 border border-primary/40 text-primary font-bold shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{p.pageNumber}. {p.title}</span>
                    <span className="text-[10px] opacity-60 shrink-0">{p.wordCount}w</span>
                  </button>
                ))}
              </div>

              {/* Topic Chapters / Sibling Notes */}
              {topic && topicNotes.length > 1 && (
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>TOPIC CHAPTERS</span>
                    <span>{topicNotes.length} Notes</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {topicNotes.map((tn) => (
                      <div
                        key={tn.id}
                        className={`p-1.5 rounded-lg text-xs font-mono truncate flex items-center gap-2 ${
                          tn.id === note.id ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <CornerDownRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">{tn.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Hint */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-border/40 text-[10px] font-mono text-muted-foreground text-center">
              Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground font-bold">←</kbd> and{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground font-bold">→</kbd> arrow keys to flip pages
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
