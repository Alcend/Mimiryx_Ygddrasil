import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  FileText,
  Terminal,
  ArrowRight,
  RotateCw,
  X,
  BookOpen,
  Plus,
  Search,
  Edit3,
  FolderTree,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { resolveNoteTopic } from './NotesPage';
import { Topic } from '../types';

export const TopicsPage: React.FC = () => {
  const { topics, addTopic, updateTopic, notes, labs } = useApp();
  const navigate = useNavigate();
  const [flippedTopics, setFlippedTopics] = useState<Record<string, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicRealm, setNewTopicRealm] = useState('Core Concept');
  
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDesc, setEditTopicDesc] = useState('');
  const [editTopicRealm, setEditTopicRealm] = useState('');

  const handleToggleFlip = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPageFlip();
    setFlippedTopics((prev) => {
      if (prev[topicId]) {
        return {};
      }
      return { [topicId]: true };
    });
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    addTopic({
      name: newTopicName,
      description: newTopicDesc,
      category: newTopicRealm || 'Core Concept',
      color: 'hsl(var(--primary))',
      code: newTopicName.substring(0, 3).toUpperCase(),
      icon: 'box'
    });
    
    setNewTopicName('');
    setNewTopicDesc('');
    setNewTopicRealm('Core Concept');
    setShowCreateModal(false);
    sounds.playSuccess();
  };

  const handleUpdateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    
    updateTopic(editingTopic.id, {
      name: editTopicName,
      description: editTopicDesc,
      category: editTopicRealm || 'Core Concept',
      code: editTopicName.substring(0, 3).toUpperCase(),
    });
    
    setEditingTopic(null);
    sounds.playSuccess();
  };

  const openEditModal = (t: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setEditingTopic(t);
    setEditTopicName(t.name);
    setEditTopicDesc(t.description);
    setEditTopicRealm(t.category);
  };

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    (t.description || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="w-6 h-6 text-primary" /> Neural Topic Clusters & Grimoire Branches
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Modular knowledge domains bridging foundational infrastructure with machine intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-primary/50 w-full md:w-64"
            />
          </div>
          <button
            onClick={() => { sounds.playClick(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl shadow-neon-glow hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Topic
          </button>
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-mono text-foreground font-bold">No topics found</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">Try adjusting your search query.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const topicNotes = notes.filter((n) => resolveNoteTopic(n, topics)?.id === topic.id);
            const topicLabs = labs.filter((l) => l.topicId === topic.id);
          const masteredCount = topicNotes.filter((n) => n.status === 'mastered').length;
          const progress = topicNotes.length ? Math.round((masteredCount / topicNotes.length) * 100) : 0;
          const isFlipped = !!flippedTopics[topic.id];

          return (
            <div
              key={topic.id}
              className="relative min-h-[260px] transition-all duration-300 transform-gpu group hover:-translate-y-1.5"
              style={{ perspective: '1200px' }}
            >
              {/* 3D Flip Inner Container */}
              <div
                className="relative w-full h-full rounded-2xl transition-transform duration-500 shadow-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ── FRONT SIDE ── */}
                <div
                  className="w-full h-full p-6 rounded-2xl cyber-card border border-border hover:border-primary/60 transition-all flex flex-col justify-between bg-[#070e17] group-hover:shadow-[0_12px_35px_rgba(0,224,255,0.12)]"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase"
                        style={{
                          backgroundColor: `${topic.color}15`,
                          color: topic.color,
                          borderColor: `${topic.color}40`,
                        }}
                      >
                        {topic.code} // {topic.category.toUpperCase()} REALM
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">{progress}% Mastered</span>
                    </div>

                    <Link
                      to={`/topics/${topic.id}`}
                      onClick={() => sounds.playClick()}
                      className="block font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1"
                    >
                      {topic.name}
                    </Link>

                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-mono line-clamp-3">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary" /> {topicNotes.length} Notes
                      </span>
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" /> {topicLabs.length} Labs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleFlip(topic.id, e)}
                        className="p-1 px-2 rounded-lg bg-primary/10 hover:bg-primary/25 border border-primary/30 text-primary text-[11px] font-mono flex items-center gap-1 transition-all"
                        title="Flip card to preview chapters"
                      >
                        <RotateCw className="w-3 h-3" /> Flip
                      </button>

                      <Link
                        to={`/topics/${topic.id}`}
                        onClick={() => sounds.playClick()}
                        className="p-1 text-primary hover:text-white"
                        title="Open Topic"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ── BACK SIDE (Topic Chapters List) ── */}
                <div
                  className="absolute inset-0 w-full h-full p-5 rounded-2xl cyber-card border border-primary/50 bg-[#091522] flex flex-col justify-between shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>TOPIC CHAPTERS ({topicNotes.length})</span>
                      </div>

                      <button
                        onClick={(e) => handleToggleFlip(topic.id, e)}
                        className="text-[10px] font-mono text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-white/10 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Flip Front
                      </button>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {topicNotes.length === 0 ? (
                        <p className="text-[11px] font-mono text-muted-foreground italic p-2">
                          No notes in this topic cluster yet.
                        </p>
                      ) : (
                        topicNotes.map((n) => (
                          <Link
                            key={n.id}
                            to={`/notes/${n.id}`}
                            onClick={() => sounds.playClick()}
                            className="p-1.5 rounded-lg text-xs font-mono text-foreground hover:text-primary hover:bg-white/5 flex items-center justify-between transition-colors truncate"
                          >
                            <span className="truncate pr-2">• {n.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0 uppercase">
                              {n.difficulty}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">{progress}% Completed</span>
                    <Link
                      to={`/topics/${topic.id}`}
                      onClick={() => sounds.playClick()}
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      Open Topic Grimoire <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-primary/30 rounded-2xl w-full max-w-md cyber-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-heading font-bold text-foreground">Ignite New Topic Branch</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Topic Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g., Quantum Computing"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of this knowledge domain..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTopicName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ignite Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-md cyber-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" /> Edit Topic & Realm
              </h3>
              <button onClick={() => setEditingTopic(null)} className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTopic} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Topic Name</label>
                <input type="text" autoFocus required value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary font-bold uppercase flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5"/> Realm (Category)</label>
                <input type="text" required value={editTopicRealm} onChange={(e) => setEditTopicRealm(e.target.value)} className="w-full bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-primary/50 font-mono shadow-inner" />
                <p className="text-[9px] text-muted-foreground mt-1">Changing this will instantly move this topic and all its notes to the specified Realm tree.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
                <textarea rows={3} value={editTopicDesc} onChange={(e) => setEditTopicDesc(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                <button type="button" onClick={() => setEditingTopic(null)} className="px-4 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={!editTopicName.trim() || !editTopicRealm.trim()} className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
