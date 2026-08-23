import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Note, NoteDifficulty, Topic } from '../types';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Edit3,
  BookOpen,
  Upload,
  BookMarked,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { ImportExportModal } from '../components/ImportExportModal';


/**
 * Universal Topic Resolver:
 * Accurately associates ANY note to its canonical Topic object,
 * whether linked by ID, name, code, category, or tag semantics.
 */
export function resolveNoteTopic(note: Partial<Note>, topics: Topic[]): Topic | undefined {
  if (!note) return undefined;
  const tid = (note.topicId || '').trim().toLowerCase();

  // 1. Direct match by ID, Name, Code, or Category
  const direct = topics.find(
    (t) =>
      t.id.toLowerCase() === tid ||
      t.name.trim().toLowerCase() === tid ||
      (t.code && t.code.trim().toLowerCase() === tid) ||
      (t.category && t.category.trim().toLowerCase() === tid)
  );
  if (direct) return direct;

  // 2. Fuzzy slug match (e.g. 'topic-bifrost' vs 'bifrost')
  const slugMatch = topics.find((t) => {
    const tSlug = t.id.replace(/^topic-/, '').toLowerCase();
    const tidSlug = tid.replace(/^topic-/, '').toLowerCase();
    return tSlug && tidSlug && (tSlug === tidSlug || tidSlug.includes(tSlug) || tSlug.includes(tidSlug));
  });
  if (slugMatch) return slugMatch;

  // 3. Fallback match via tags
  if (Array.isArray(note.tags) && note.tags.length > 0) {
    for (const tag of note.tags) {
      const tLower = (tag || '').toLowerCase();
      const tagMatch = topics.find(
        (t) =>
          t.name.toLowerCase().includes(tLower) ||
          (t.category && t.category.toLowerCase().includes(tLower))
      );
      if (tagMatch) return tagMatch;
    }
  }

  return topics[0];
}

export const NotesPage: React.FC = () => {
  const { notes, topics, addNote, deleteNote, updateNote } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Flipped card IDs set (cards currently showing their back-side summary)
  const [flippedCards, setFlippedCards] = useState<Record<string, number>>({}); // noteId -> currentPageOnBack
  const [previewBookNote, setPreviewBookNote] = useState<Note | null>(null);

  // New note form state
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTopicId, setNewTopicId] = useState(topics[0]?.id || '');
  const [newDifficulty, setNewDifficulty] = useState<NoteDifficulty>('beginner');
  const [newTags, setNewTags] = useState('');

  // Real-time note counts per topic for filter badge indicators
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    topics.forEach((t) => { counts[t.id] = 0; });

    notes.forEach((n) => {
      const resolved = resolveNoteTopic(n, topics);
      if (resolved) {
        counts[resolved.id] = (counts[resolved.id] || 0) + 1;
      }
    });
    return counts;
  }, [notes, topics]);

  // 100% Robust, Fault-Tolerant Multi-Parameter Filter
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const q = localSearch.trim().toLowerCase();
      const title = (n.title || '').toLowerCase();
      const summary = (n.summary || '').toLowerCase();
      const content = (n.content || '').toLowerCase();
      const tags = Array.isArray(n.tags) ? n.tags : [];
      const resolvedTopic = resolveNoteTopic(n, topics);

      // Search Query Matching
      const matchesSearch =
        !q ||
        title.includes(q) ||
        summary.includes(q) ||
        content.includes(q) ||
        (resolvedTopic && (
          resolvedTopic.name.toLowerCase().includes(q) ||
          (resolvedTopic.category && resolvedTopic.category.toLowerCase().includes(q)) ||
          resolvedTopic.code.toLowerCase().includes(q)
        )) ||
        tags.some((t) => (t || '').toLowerCase().includes(q));

      // Topic Filter Matching
      const matchesTopic =
        selectedTopic === 'all' ||
        (resolvedTopic && resolvedTopic.id === selectedTopic) ||
        (resolvedTopic && resolvedTopic.name.toLowerCase() === selectedTopic.toLowerCase()) ||
        n.topicId === selectedTopic;

      // Status Filter Matching
      const noteStatus = (n.status || 'learning').toLowerCase();
      const matchesStatus = selectedStatus === 'all' || noteStatus === selectedStatus.toLowerCase();

      // Difficulty Filter Matching
      const noteDiff = (n.difficulty || 'beginner').toLowerCase();
      const matchesDifficulty = selectedDifficulty === 'all' || noteDiff === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesTopic && matchesStatus && matchesDifficulty;
    });
  }, [notes, topics, localSearch, selectedTopic, selectedStatus, selectedDifficulty]);

  const handleToggleFlip = (noteId: string) => {
    sounds.playPageFlip();
    setFlippedCards((prev) => {
      if (prev[noteId] !== undefined) {
        // If it's already flipped, just close it
        return {};
      } else {
        // Flip this one and close any others
        return { [noteId]: 1 };
      }
    });
  };

  const handleFlipPageChange = (noteId: string, pageNum: number, totalPages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPageFlip();
    const clamped = Math.max(1, Math.min(totalPages, pageNum));
    setFlippedCards((prev) => ({ ...prev, [noteId]: clamped }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addNote({
      title: newTitle,
      summary: newSummary || newTitle,
      content: newContent || '# ' + newTitle + '\n\nStart documenting knowledge here...',
      topicId: newTopicId || topics[0]?.id,
      difficulty: newDifficulty,
      status: 'learning',
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewTags('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Knowledge Records & Grimoire
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Showing <strong className="text-primary font-bold">{filteredNotes.length}</strong> of {notes.length} records across {topics.length} neural clusters
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              setShowImportModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/40 text-primary text-xs font-semibold font-mono flex items-center gap-2 hover:bg-primary/20 transition-all shadow-neon-glow"
          >
            <Upload className="w-4 h-4" /> Import / Export
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold font-mono flex items-center gap-2 hover:opacity-90 transition-opacity shadow-neon-glow shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Record
          </button>
        </div>
      </div>

      {/* Interactive Filter Controls Bar */}
      <div className="p-4 rounded-2xl cyber-card border border-border/80 flex flex-wrap gap-3 items-center bg-black/50 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records by title, summary, tags, topic name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background/80 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Topic Filter with Note Counts */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedTopic}
            onChange={(e) => {
              sounds.playClick();
              setSelectedTopic(e.target.value);
            }}
            className="px-3 py-2 bg-background/80 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option className="bg-[#0b101a] text-white" value="all">All Topics ({notes.length} records)</option>
            {topics.map((t) => (
              <option className="bg-[#0b101a] text-white" key={t.id} value={t.id}>
                {t.name} ({topicCounts[t.id] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedStatus}
            onChange={(e) => {
              sounds.playClick();
              setSelectedStatus(e.target.value);
            }}
            className="px-3 py-2 bg-background/80 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option className="bg-[#0b101a] text-white" value="all">All Statuses</option>
            <option className="bg-[#0b101a] text-white" value="learning">Learning</option>
            <option className="bg-[#0b101a] text-white" value="reviewing">Reviewing</option>
            <option className="bg-[#0b101a] text-white" value="mastered">Mastered</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              sounds.playClick();
              setSelectedDifficulty(e.target.value);
            }}
            className="px-3 py-2 bg-background/80 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option className="bg-[#0b101a] text-white" value="all">All Difficulties</option>
            <option className="bg-[#0b101a] text-white" value="beginner">Beginner</option>
            <option className="bg-[#0b101a] text-white" value="intermediate">Intermediate</option>
            <option className="bg-[#0b101a] text-white" value="advanced">Advanced</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {(selectedTopic !== 'all' || selectedStatus !== 'all' || selectedDifficulty !== 'all' || localSearch) && (
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedTopic('all');
              setSelectedStatus('all');
              setSelectedDifficulty('all');
              setLocalSearch('');
            }}
            className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-mono hover:bg-primary/20 transition-colors font-bold flex items-center gap-1"
          >
            Reset Filters ✕
          </button>
        )}
      </div>

      {/* Notes Grid with 3D Card Hover & Interactive Page Flipping */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl cyber-card border border-border space-y-3 bg-black/40">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-heading font-bold text-foreground">No Knowledge Records Match Filters</h3>
          <p className="text-xs font-mono text-muted-foreground max-w-sm mx-auto">
            Try resetting your topic filter or search query, or click "Create Record" to document new knowledge.
          </p>
          <button
            onClick={() => {
              setSelectedTopic('all');
              setSelectedStatus('all');
              setSelectedDifficulty('all');
              setLocalSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow mt-2"
          >
            Show All Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const topic = resolveNoteTopic(note, topics);
            const pageCount = Math.max(1, Math.ceil(note.content.split('---').length));
            const isFlipped = flippedCards[note.id] !== undefined;
            const currentBackPageNum = flippedCards[note.id] || 1;
            const contentChunks = note.content.split('---');
            const rawContent = contentChunks[currentBackPageNum - 1] || note.content;
            const cleanContent = rawContent.replace(/^#+\s+[^\n]+\n*/, '').trim();

            return (
              <div
                key={note.id}
                className="relative min-h-[250px] transition-all duration-300 transform-gpu group hover:-translate-y-1.5"
                style={{ perspective: '1200px' }}
              >
                {/* 3D Flip Card Inner Container */}
                <div
                  onClick={() => handleToggleFlip(note.id)}
                  className="relative w-full h-full rounded-2xl transition-transform duration-500 shadow-xl cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* ── CARD FRONT ── */}
                  <div
                    className="w-full h-full p-5 rounded-2xl cyber-card border border-border/80 hover:border-primary/60 transition-all flex flex-col justify-between bg-[#070e17] group-hover:shadow-[0_12px_35px_rgba(0,224,255,0.12)]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      pointerEvents: isFlipped ? 'none' : 'auto',
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                              note.status === 'mastered'
                                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                : note.status === 'reviewing'
                                ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {note.status.toUpperCase()}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1">
                            <BookOpen className="w-2.5 h-2.5 text-primary" />
                            {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{note.difficulty}</span>
                      </div>

                      {/* Title & Quick Edit Topic */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="block font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {note.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${note.title}"?\nThis action cannot be undone.`)) {
                              deleteNote(note.id);
                            }
                          }}
                          className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors shrink-0"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Topic Pill (Quick Re-assign) */}
                      {topic && (
                        <div className="mt-1 relative flex items-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={topic.id}
                            onChange={(e) => {
                              sounds.playClick();
                              updateNote(note.id, { topicId: e.target.value });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Re-assign to another topic"
                          >
                            {topics.map(t => (
                              <option className="bg-[#0b101a] text-white" key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <div
                            className="text-[11px] font-mono text-primary/90 flex items-center gap-1.5 hover:underline text-left transition-colors cursor-pointer"
                            title={`Current Topic: ${topic.name}. Click to change.`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: topic.color }} />
                            <span className="truncate">{topic.name}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-50" />
                          </div>
                        </div>
                      )}

                      {/* Summary Excerpt */}
                      <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed font-mono">
                        {note.summary || 'Click to preview multi-page chapters.'}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap max-w-[55%]">
                        {note.tags &&
                          note.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Edit Button - Visible on Hover */}
                        <Link
                          to={`/notes/${note.id}`}
                          state={{ edit: true }}
                          onClick={(e) => {
                             e.stopPropagation();
                             sounds.playClick();
                          }}
                          className="text-xs font-mono text-muted-foreground hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          title="Edit Note"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </Link>

                        {/* Read Button - Default */}
                        <Link
                          to={`/notes/${note.id}`}
                          onClick={(e) => {
                             e.stopPropagation();
                             sounds.playClick();
                          }}
                          className="text-xs font-mono text-primary hover:text-white px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/30 border border-primary/30 transition-all flex items-center gap-1 shadow-sm"
                          title="Open Full Multi-Page Book"
                        >
                          <BookOpen className="w-3 h-3" /> Read
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* ── CARD BACK (Flipped Grimoire Chapter Summary View) ── */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-2xl cyber-card border border-primary/50 bg-[#091522] flex flex-col justify-between shadow-2xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      pointerEvents: !isFlipped ? 'none' : 'auto',
                    }}
                  >
                    <div className="flex flex-col flex-1 min-h-0">
                      {/* Back Header */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>PAGE {currentBackPageNum} OF {pageCount}</span>
                        </div>
                      </div>

                      {/* Current Page Chapter Title */}
                      <h4 className="text-xs font-heading font-bold text-foreground truncate shrink-0">
                        {note.title} (Part {currentBackPageNum})
                      </h4>

                      {/* Summarized Chapter Content */}
                      <div 
                        className="flex-1 text-[11px] font-mono text-muted-foreground mt-2 overflow-y-auto pr-1 leading-relaxed whitespace-pre-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cleanContent}
                      </div>
                    </div>

                    {/* Back Footer & Page Stepper */}
                    <div 
                      className="pt-2.5 border-t border-border/50 flex items-center justify-between mt-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Page Stepper Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum - 1, pageCount, e)}
                          disabled={currentBackPageNum <= 1}
                          className="p-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/15 text-foreground"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-muted-foreground px-1">
                          {currentBackPageNum}/{pageCount}
                        </span>
                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum + 1, pageCount, e)}
                          disabled={currentBackPageNum >= pageCount}
                          className="p-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/15 text-foreground"
                          title="Next Page"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Read Full Book Link */}
                      <Link
                        to={`/notes/${note.id}`}
                        onClick={() => sounds.playClick()}
                        className="text-xs font-mono text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        Read Full Book <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-lg cyber-card space-y-4">
            <h3 className="text-lg font-heading font-bold text-foreground">New Knowledge Record</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. eBPF Kernel Probes & XDP"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground">Summary</label>
                <input
                  type="text"
                  placeholder="Brief synopsis of this knowledge record..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted-foreground">Topic</label>
                  <select
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  >
                    {topics.map((t) => (
                      <option className="bg-[#0b101a] text-white" key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as NoteDifficulty)}
                    className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  >
                    <option className="bg-[#0b101a] text-white" value="beginner">Beginner</option>
                    <option className="bg-[#0b101a] text-white" value="intermediate">Intermediate</option>
                    <option className="bg-[#0b101a] text-white" value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="linux, kernel, ebpf"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground">Content (Markdown)</label>
                <textarea
                  rows={5}
                  placeholder="# Note Title&#10;&#10;Document knowledge here... Use --- to separate book pages."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-foreground hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import / Export Modal */}
      <ImportExportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
};
