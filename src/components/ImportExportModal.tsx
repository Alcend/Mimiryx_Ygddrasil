import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Bot,
  Terminal,
  Layers,
  Tag,
  ArrowRight,
  FolderPlus,
  RefreshCw,
  FileCode,
  Check,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import {
  organizeImportedFiles,
  exportVaultJSON,
  exportNotesMarkdown,
  AIOrganizeResult,
  ParsedDocument,
} from '../utils/aiOrganizer';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const { topics, notes, labs, boardCards, importVaultData, clearAllNotes } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Import states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<AIOrganizeResult | null>(null);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    sounds.playClick();
    setIsProcessing(true);
    setOrganizeResult(null);
    setImportedSuccessCount(null);

    try {
      const fileArr = Array.from(files);
      const result = await organizeImportedFiles(fileArr, topics);
      setOrganizeResult(result);
      sounds.playSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyAI = () => {
    if (!organizeResult) return;
    sounds.playSuccess();

    // 1. Prepare new topics
    const newTopicsPayload = organizeResult.newTopicsToCreate.map((newTop) => ({
      name: newTop.name,
      code: newTop.code,
      category: newTop.category,
      description: newTop.description,
      icon: 'Boxes' as const,
      color: newTop.color,
    }));

    // 2. Prepare notes payload
    const newNotesPayload = organizeResult.documents.map((doc) => ({
      title: doc.title,
      summary: doc.summary || doc.title,
      content: doc.content,
      topicId: doc.matchedTopicId || '',
      topicName: doc.suggestedTopicName,
      difficulty: doc.difficulty,
      status: 'learning' as const,
      tags: doc.tags,
    }));

    importVaultData(newTopicsPayload, newNotesPayload);
    setImportedSuccessCount(newNotesPayload.length);
    setOrganizeResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-primary/40 rounded-2xl w-full max-w-3xl cyber-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary shadow-neon-glow">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                Knowledge Vault Exchange & AI Organizer
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Import files with AI auto-clustering or export your knowledge network.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-black/20 px-5 pt-3">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('import');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Import & AI Auto-Organize
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('export');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export Knowledge Vault
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              {/* Success Banner */}
              {importedSuccessCount !== null && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-mono font-bold text-emerald-400">
                        Successfully integrated {importedSuccessCount} notes into Yggdrasil World Tree!
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Your tree has dynamically sprouted corresponding branches and twigs.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setImportedSuccessCount(null)}
                    className="text-xs font-mono text-emerald-400 hover:underline"
                  >
                    Import More
                  </button>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10 shadow-neon-glow'
                    : 'border-border/80 hover:border-primary/50 bg-black/30 hover:bg-black/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-heading font-bold text-foreground">
                  Drop files here or click to browse
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-1 max-w-md">
                  Supports <strong className="text-primary">.md, .txt, .json, .pdf, .docx, .csv, .py, .ts, .yaml</strong> or any document format.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-primary/80 bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Agent will analyze, auto-classify & grow new topics if needed</span>
                </div>
              </div>

              {/* Processing Spinner */}
              {isProcessing && (
                <div className="p-6 rounded-2xl bg-black/60 border border-primary/30 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs font-mono text-primary">
                    AI Agent is scanning file semantics & mapping to Yggdrasil clusters...
                  </p>
                </div>
              )}

              {/* AI Classification Results & Preview */}
              {organizeResult && !isProcessing && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* AI Terminal Log Stream */}
                  <div className="p-3.5 rounded-xl bg-black/80 border border-border space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 border-b border-border/40 pb-1">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" /> AI AGENT REASONING ENGINE
                      </span>
                      <span>{organizeResult.documents.length} FILES CLASSIFIED</span>
                    </div>
                    <div className="font-mono text-[10px] text-emerald-400/90 max-h-28 overflow-y-auto space-y-1 pr-1">
                      {organizeResult.logs.map((log, i) => (
                        <div key={i} className="truncate">
                          <span className="text-primary mr-1">{'>'}</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discovered New Topics Summary */}
                  {organizeResult.newTopicsToCreate.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-heading font-bold text-primary">
                          <FolderPlus className="w-4 h-4" /> Discovered Domains ({organizeResult.newTopicsToCreate.length} New Topics will be Created)
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Review and override the AI's topic assignments below before committing.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {organizeResult.newTopicsToCreate.map((nt, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono border flex items-center gap-1.5"
                            style={{
                              borderColor: `${nt.color}66`,
                              backgroundColor: `${nt.color}15`,
                              color: nt.color,
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nt.color }} />
                            {nt.name} <span className="text-[10px] opacity-70">({nt.category})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents List Preview */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                      Parsed Knowledge Records ({organizeResult.documents.length})
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {organizeResult.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-background/50 border border-border flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-semibold text-foreground truncate">{doc.title}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-border text-muted-foreground">
                                {doc.difficulty}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-muted-foreground truncate">{doc.summary}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <select
                              value={doc.isNewTopic ? `new:${doc.suggestedTopicName}` : `ext:${doc.matchedTopicId}`}
                              onChange={(e) => {
                                const val = e.target.value;
                                sounds.playClick();
                                setOrganizeResult(prev => {
                                  if (!prev) return prev;
                                  const nextDocs = [...prev.documents];
                                  if (val.startsWith('ext:')) {
                                    const tid = val.replace('ext:', '');
                                    const top = topics.find(t => t.id === tid);
                                    nextDocs[idx] = {
                                      ...doc,
                                      isNewTopic: false,
                                      matchedTopicId: tid,
                                      suggestedTopicName: top?.name || '',
                                      suggestedCategory: top?.category || ''
                                    };
                                  } else {
                                    const tname = val.replace('new:', '');
                                    nextDocs[idx] = {
                                      ...doc,
                                      isNewTopic: true,
                                      matchedTopicId: undefined,
                                      suggestedTopicName: tname,
                                      suggestedCategory: 'General Knowledge'
                                    };
                                  }
                                  return { ...prev, documents: nextDocs };
                                });
                              }}
                              className={`text-[10px] font-mono px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:border-white transition-colors ${
                                doc.isNewTopic
                                  ? 'bg-[hsl(var(--neon-green)/0.1)] border-[hsl(var(--neon-green)/0.4)] text-[hsl(var(--neon-green))]'
                                  : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                              }`}
                            >
                              <optgroup label="AI Discovered Domains">
                                {organizeResult.newTopicsToCreate.map((nt, tIdx) => (
                                  <option key={`new-${tIdx}`} value={`new:${nt.name}`}>
                                    ✨ NEW: {nt.name}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Your Existing Knowledge Domains">
                                {topics.map(t => (
                                  <option key={`ext-${t.id}`} value={`ext:${t.id}`}>
                                    {t.name}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation Action */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setOrganizeResult(null)}
                      className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-foreground hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyAI}
                      className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Import & Grow Yggdrasil Tree
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Export Tab */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Vault JSON Export */}
                <div className="p-5 rounded-2xl bg-black/40 border border-border/80 cyber-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary w-fit">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-heading font-bold text-foreground">
                      Full MIMIRYX Vault (.JSON)
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground">
                      Complete backup including all {notes.length} notes, {topics.length} topics, labs, and board state. Perfect for migrating or restoring your entire system.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      exportVaultJSON({ topics, notes, labs, boardCards });
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download JSON Vault
                  </button>
                </div>

                {/* Markdown Bundle Export */}
                <div className="p-5 rounded-2xl bg-black/40 border border-border/80 cyber-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--neon-green)/0.12)] border border-[hsl(var(--neon-green)/0.3)] text-[hsl(var(--neon-green))] w-fit">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-heading font-bold text-foreground">
                      Markdown Bundle (.MD)
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground">
                      Export all {notes.length} notes compiled into readable, tagged GitHub-flavored Markdown document format for Obsidian, Notion, or personal archival.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      exportNotesMarkdown(notes, topics);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-white/5 border border-border hover:border-primary/50 text-foreground text-xs font-mono font-bold hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-primary" /> Download Markdown Bundle
                  </button>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="mt-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                <h4 className="text-xs font-heading font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-muted-foreground max-w-sm">
                    Wipe all {notes.length} knowledge records from the Yggdrasil tree permanently. This cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm("WARNING: This will permanently delete ALL notes from your vault. Are you absolutely sure?")) {
                        clearAllNotes();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-mono transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Nuke Vault
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
