import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NoteStatus, NoteDifficulty } from '../types';
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit3,
  Sparkles,
  Plus,
  FileText,
  Eye,
  Brain,
  Loader2,
  BrainCircuit,
  Type,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { BookReader } from '../components/BookReader';
import { getNoteExpandPrompt, getNoteFormatPrompt, generateGeminiResponse } from '../utils/ai';

export const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notes, topics, updateNote, deleteNote, geminiKey, setIsSettingsOpen } = useApp();
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
    setContent((prev) => prev + '\n\n[PAGE_BREAK]\n\n## Next Chapter / Subtopic\n\n');
  };

  const [isFormatting, setIsFormatting] = useState(false);

  const handleAutoOrganize = async () => {
    if (isFormatting) return;
    sounds.playClick();
    
    if (!geminiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsFormatting(true);
    try {
      const prompt = getNoteFormatPrompt(title, content);
      let formattedText = await generateGeminiResponse(prompt, geminiKey);
      
      // Cleanup any accidental global markdown block wrapping from AI
      formattedText = formattedText.replace(/^```markdown\n/i, '').replace(/\n```$/i, '').trim();
      
      setContent(formattedText);
      sounds.playSuccess();
    } catch (error: any) {
      sounds.playError();
      console.error('Auto-Format Error:', error);
      setContent(content + '\n\n--- AI FORMATTING ERROR ---\n' + error.message);
    } finally {
      setIsFormatting(false);
    }
  };

  const [isExpanding, setIsExpanding] = useState(false);

  const handleAIExpand = async () => {
    if (isExpanding) return;
    sounds.playClick();
    
    if (!geminiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsExpanding(true);
    try {
      const prompt = getNoteExpandPrompt(title, content);
      const expandedText = await generateGeminiResponse(prompt, geminiKey);
      
      setContent(prev => prev + '\n\n' + expandedText);
      sounds.playSuccess();
    } catch (error: any) {
      sounds.playError();
      alert(`AI Expand Failed: ${error.message}`);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleDelete = () => {
    deleteNote(note.id);
    navigate('/notes');
  };

  return (
    <div className="space-y-2 max-w-[1536px] mx-auto pb-4 px-2 lg:px-8">
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
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-heading font-bold text-foreground">Editing Knowledge Record</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAIExpand}
                disabled={isExpanding}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,224,255,0.15)] ${
                  isExpanding
                    ? 'bg-primary/5 border-primary/20 text-primary/50 cursor-wait'
                    : 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,224,255,0.3)]'
                }`}
                title="Use Neural AI to expand on your current content"
              >
                {isExpanding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 animate-pulse" />}
                {isExpanding ? 'Synthesizing...' : 'AI Expand'}
              </button>

                              <button
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
                className="w-full text-base font-heading font-bold bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
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

          {/* Phase 3: Synaptic Dump Editor */}
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
              <div className="w-full flex-1 min-h-[500px] max-h-[700px] bg-[#070d14] border border-primary/30 rounded-xl p-5 overflow-y-auto custom-scrollbar relative">
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
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      hr: ({node, ...props}) => <div className="w-full border-t border-primary/40 border-dashed my-6 relative"><span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#070d14] px-2 text-[9px] text-primary tracking-widest uppercase">Page Break</span></div>,
                      h1: ({node, ...props}) => <h1 className="text-base font-heading font-bold text-foreground mt-4 mb-2 border-b border-border/40 pb-1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-sm font-heading font-bold text-primary mt-3 mb-2 flex items-center gap-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xs font-heading font-bold text-foreground mt-3 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="text-muted-foreground mb-3 leading-relaxed whitespace-pre-wrap break-words" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-muted-foreground marker:text-primary" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-muted-foreground marker:text-primary" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-foreground font-bold" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline 
                          ? <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[0.9em] break-all" {...props} />
                          : <code className="block p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] overflow-x-auto whitespace-pre break-words text-emerald-400/90 shadow-inner my-2" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                      input: ({node, type, ...props}: any) => type === 'checkbox' ? <input type="checkbox" className="accent-primary mr-2" {...props} /> : <input {...props} />,
                      img: ({node, ...props}) => (
                        <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40 flex justify-center p-2">
                          <img className="max-w-full h-auto object-contain max-h-[300px] rounded-lg" {...props} />
                        </div>
                      ),
                      table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-xl border border-white/10"><table className="w-full text-left border-collapse text-xs" {...props} /></div>,
                      thead: ({node, ...props}) => <thead className="border-b border-white/20 bg-white/5" {...props} />,
                      tr: ({node, ...props}) => <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />,
                      th: ({node, ...props}) => <th className="p-3 font-heading font-bold text-primary" {...props} />,
                      td: ({node, ...props}) => <td className="p-3 text-muted-foreground" {...props} />
                    }}
                  >
                    {content || '*Awaiting synaptic input...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

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
