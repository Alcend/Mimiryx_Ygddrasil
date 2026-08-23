import os

filepath = 'src/components/BookReader.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace chunkNoteIntoPages entirely, and replace the component rendering.
# This requires replacing the whole file for safety since it's a huge logic change.

new_content = """import React, { useState, useEffect } from 'react';
import { Note, Topic, NoteStatus } from '../types';
import { useApp } from '../context/AppContext';
import {
  Bookmark,
  Sparkles,
  Copy,
  Check,
  List,
  CheckCircle2,
  CornerDownRight,
  BookMarked,
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

export const BookReader: React.FC<BookReaderProps> = ({ note, topic, onEdit }) => {
  const { notes, updateNote } = useApp();
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [copied, setCopied] = useState(false);

  // Notes in the same topic for suggestions
  const topicNotes = topic ? notes.filter((n) => n.topicId === topic.id) : [note];

  const suggestedNotes = topicNotes.filter(n => n.id !== note.id).slice(0, 3);
  if (suggestedNotes.length < 3) {
    const otherNotes = notes.filter(n => 
      n.id !== note.id && 
      n.topicId !== note.topicId && 
      n.tags.some(tag => note.tags.includes(tag))
    );
    suggestedNotes.push(...otherNotes.slice(0, 3 - suggestedNotes.length));
  }
  if (suggestedNotes.length < 3) {
    const fillNotes = notes.filter(n => 
      n.id !== note.id && 
      !suggestedNotes.find(sn => sn.id === n.id)
    );
    suggestedNotes.push(...fillNotes.slice(0, 3 - suggestedNotes.length));
  }

  const handleCopyPage = () => {
    navigator.clipboard.writeText(note.content);
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

  // Calculate words dynamically
  const wordCount = note.content.split(/\\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top Reading Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-card/80 backdrop-blur border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground">FONT</span>
            <div className="flex rounded-lg border border-border/50 bg-black/40 overflow-hidden">
              <button onClick={() => setFontSize('sm')} className={`px-2 py-1 ${fontSize === 'sm' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-3 h-3" /></button>
              <button onClick={() => setFontSize('md')} className={`px-2 py-1 ${fontSize === 'md' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-4 h-4" /></button>
              <button onClick={() => setFontSize('lg')} className={`px-2 py-1 ${fontSize === 'lg' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Type className="w-5 h-5" /></button>
            </div>
          </div>
          
          <button onClick={() => setShowToc(!showToc)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${showToc ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            <List className="w-3.5 h-3.5" />
            Meta
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopyPage} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors" title="Copy active page text">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleToggleMastery} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors border ${note.status === 'mastered' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-border text-muted-foreground hover:text-primary'}`}>
            {note.status === 'mastered' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            {note.status === 'mastered' ? 'Mastered' : 'Mark Mastered'}
          </button>
        </div>
      </div>

      {showToc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 rounded-xl bg-card border border-primary/20 space-y-3">
            <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><BookMarked className="w-3 h-3 text-primary" /> Suggested Linkages</h3>
            <div className="space-y-2">
              {suggestedNotes.map(sn => (
                <Link key={sn.id} to={`/notes/${sn.id}`} className="block p-2 rounded-lg bg-black/40 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                  <p className="text-xs font-heading font-semibold text-foreground group-hover:text-primary flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-muted-foreground" /> {sn.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 ml-4.5">{sn.summary}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <h3 className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[hsl(var(--neon-green))]" /> Note Metrics</h3>
            <div className="space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex justify-between border-b border-border/40 pb-1"><span>Difficulty</span><span className="text-foreground">{note.difficulty.toUpperCase()}</span></div>
              <div className="flex justify-between border-b border-border/40 pb-1"><span>Word Count</span><span className="text-foreground">{wordCount}</span></div>
              <div className="flex justify-between border-b border-border/40 pb-1"><span>Created</span><span className="text-foreground">{new Date(note.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between border-b border-border/40 pb-1"><span>Last Read</span><span className="text-foreground">{note.lastReviewed ? new Date(note.lastReviewed).toLocaleDateString() : 'Never'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic CSS Multi-Column Reading View */}
      <div className="relative group">
        <div className="bg-[#0b101a] border border-border/50 rounded-2xl p-6 md:p-8 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden">
          
          <div className="mb-6 pb-4 border-b border-border/40 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${note.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>{note.status}</span>
                {topic && <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-muted-foreground uppercase">{topic.name}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-foreground">{note.title}</h1>
            </div>
          </div>

          {/* Book Flow Container */}
          <div className="book-flow custom-scrollbar relative">
            <div className={`prose prose-invert max-w-none font-mono ${fontSizeClass}`}>
              {note.content.split('\\n\\n').map((para, pIdx) => {
                if (para.trim() === '---') {
                  return <hr key={pIdx} className="page-break-line" />;
                }
                if (para.startsWith('# ')) {
                  return <h1 key={pIdx} className="text-xl font-heading font-bold text-foreground mt-3 mb-2 border-b border-border/40 pb-2">{para.replace('# ', '')}</h1>;
                }
                if (para.startsWith('## ')) {
                  return <h2 key={pIdx} className="text-base font-heading font-bold text-primary mt-3 mb-1.5 flex items-center gap-2"><CornerDownRight className="w-4 h-4" /> {para.replace('## ', '')}</h2>;
                }
                if (para.startsWith('```')) {
                  return <pre key={pIdx} className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] overflow-x-auto text-emerald-400/90 shadow-inner"><code>{para.replace(/```\\w*\\n?|```/g, '')}</code></pre>;
                }
                if (para.startsWith('- ')) {
                  return (
                    <ul key={pIdx} className="list-none space-y-1 my-2">
                      {para.split('\\n').map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" /><span dangerouslySetInnerHTML={{ __html: item.replace('- ', '').replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-foreground">$1</strong>') }} /></li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={pIdx} className="text-muted-foreground mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: para.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-primary/10 text-primary px-1 py-0.5 rounded text-[0.9em]">$1</code>') }} />
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
