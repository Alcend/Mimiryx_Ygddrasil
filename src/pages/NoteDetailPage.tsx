import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NoteStatus, NoteDifficulty } from '../types';
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Copy,
  Plus,
  BookOpen,
  X,
  Layers,
  FileText,
  Tag,
  Eye,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { BookReader } from '../components/BookReader';

export const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notes, topics, updateNote, deleteNote } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const note = notes.find((n) => n.id === id);

  const [isEditing, setIsEditing] = useState(location.state?.edit === true);
  const [title, setTitle] = useState(note?.title || '');
  const [summary, setSummary] = useState(note?.summary || '');
  const [content, setContent] = useState(note?.content || '');
  const [status, setStatus] = useState<NoteStatus>(note?.status || 'learning');
  const [difficulty, setDifficulty] = useState<NoteDifficulty>(note?.difficulty || 'beginner');
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!note) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-heading font-bold text-foreground">Record Not Found</h3>
        <button
          onClick={() => navigate('/notes')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono"
        >
          Back to Records
        </button>
      </div>
    );
  }

  const topic = topics.find((t) => t.id === note.topicId);

  const handleSave = () => {
    sounds.playSuccess();
    updateNote(note.id, {
      title,
      summary,
      content,
      status,
      difficulty,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleInsertPageBreak = () => {
    sounds.playClick();
    setContent((prev) => prev + '\n\n---\n\n## Next Chapter / Subtopic\n\n');
  };

  const [isFormatting, setIsFormatting] = useState(false);

  const handleAutoOrganize = async () => {
    if (isFormatting) return;
    sounds.playClick();
    setIsFormatting(true);

    // Simulate AI parsing/organizing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let formatted = content;
    
    // 1. Clean up excessive newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // 2. Fix headers missing a space (e.g., ##Header -> ## Header)
    formatted = formatted.replace(/^(#+)([^#\s])/gm, '$1 $2');
    
    // 3. Fix list items missing a space (e.g., -item -> - item)
    formatted = formatted.replace(/^(\s*[-*+])([^\s*-])/gm, '$1 $2');
    
    // 4. Ensure space after blockquote
    formatted = formatted.replace(/^(\s*>)([^\s>])/gm, '$1 $2');
    
    // 5. Auto-space around code blocks
    formatted = formatted.replace(/([^\n])\n(```[a-z]*)\n/g, '$1\n\n$2\n');
    formatted = formatted.replace(/\n(```)\n([^\n])/g, '\n$1\n\n$2');

    // 6. Trim trailing spaces on each line
    formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n').trim();

    setContent(formatted);
    setIsFormatting(false);
    sounds.playSuccess();
  };

  const handleDelete = () => {
    deleteNote(note.id);
    navigate('/notes');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Back Button & Top Action Strip */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            navigate('/notes');
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Records
        </button>

        <div className="flex items-center p-1 bg-black/40 border border-border/50 rounded-xl gap-1">
          <button
            onClick={() => {
              if (isEditing) return;
              sounds.playClick();
              setIsEditing(true);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              isEditing 
                ? 'bg-primary text-primary-foreground shadow-neon-glow'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          
          <button
            onClick={() => {
              if (!isEditing) return;
              sounds.playClick();
              // Auto-save on toggle to Read mode
              handleSave(); 
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              !isEditing 
                ? 'bg-[hsl(270,70%,50%)] text-white shadow-[0_0_10px_hsl(270,70%,50%,0.5)]' // Mimicking the purple in the image
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Read
          </button>
        </div>
      </div>

      {/* Mode View: Multi-Page Book Reader vs Multi-Page Editor */}
      {!isEditing ? (
        <BookReader note={note} topic={topic} onEdit={() => setIsEditing(true)} />
      ) : (
        /* Edit Mode */
        <div className="p-6 md:p-8 rounded-2xl cyber-card border border-primary/30 space-y-5 bg-[#070e17]">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-bold text-foreground">
                Editing Knowledge Record // Multi-Page Mode
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoOrganize}
                disabled={isFormatting}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  isFormatting
                    ? 'bg-primary/5 border-primary/20 text-primary/50 cursor-wait'
                    : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/20'
                }`}
                title="Automatically organize and format markdown content"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isFormatting ? 'animate-pulse' : ''}`} />
                {isFormatting ? 'Formatting...' : 'Auto-Format'}
              </button>

              <button
                onClick={handleInsertPageBreak}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-xs font-mono flex items-center gap-1.5 hover:bg-primary/20 transition-all"
                title="Insert a page break (---) to divide this note into book pages"
              >
                <Plus className="w-3.5 h-3.5" /> Insert Page Break
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground uppercase">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base font-heading font-bold bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground uppercase">Summary</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground uppercase">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NoteStatus)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-primary focus:outline-none focus:border-primary"
              >
                <option value="learning">LEARNING</option>
                <option value="reviewing">REVIEWING</option>
                <option value="mastered">MASTERED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground uppercase">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as NoteDifficulty)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground uppercase">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ebpf, linux, kernel"
                className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Editor Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Markdown Content & Chapters</span>
              <span className="text-primary">
                Tip: Separate chapters with <code className="text-foreground bg-white/10 px-1 rounded">---</code> to create new book pages
              </span>
            </div>
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-4 font-mono text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-rose-500/40 rounded-2xl p-6 w-full max-w-sm cyber-card space-y-4 shadow-2xl">
            <h4 className="text-base font-heading font-bold text-rose-400">Delete Record?</h4>
            <p className="text-xs font-mono text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">"{note.title}"</strong>? This will also remove the corresponding twig from the Yggdrasil tree.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold hover:bg-rose-600 shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
