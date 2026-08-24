import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BoardCard } from '../types';
import { KanbanSquare, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/audio';

const COLUMNS: { id: BoardCard['column']; title: string; color: string }[] = [
  { id: 'backlog', title: 'Study Backlog', color: 'border-slate-500/40 text-slate-400' },
  { id: 'in_progress', title: 'In Active Study', color: 'border-amber-500/40 text-amber-400' },
  { id: 'review', title: 'Review & Verify', color: 'border-sky-500/40 text-sky-400' },
  { id: 'mastered', title: 'Mastered Synapses', color: 'border-emerald-500/40 text-emerald-400' },
];

export const BoardPage: React.FC = () => {
  const { boardCards, addBoardCard, moveBoardCard, deleteBoardCard } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<BoardCard['priority']>('medium');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addBoardCard({
      title: newTitle,
      description: newDesc,
      column: 'backlog',
      priority: newPriority,
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const getNextColumn = (col: BoardCard['column']): BoardCard['column'] | null => {
    if (col === 'backlog') return 'in_progress';
    if (col === 'in_progress') return 'review';
    if (col === 'review') return 'mastered';
    return null;
  };

  const getPrevColumn = (col: BoardCard['column']): BoardCard['column'] | null => {
    if (col === 'mastered') return 'review';
    if (col === 'review') return 'in_progress';
    if (col === 'in_progress') return 'backlog';
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-primary" /> Study Knowledge Board
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Organize study sprints, lab objectives, and architecture mastery workflows.
          </p>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold font-mono flex items-center gap-2 hover:opacity-90 shadow-neon-glow"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const cards = boardCards.filter((c) => c.column === col.id);
          return (
            <div key={col.id} className="p-4 rounded-xl cyber-card border border-border/80 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </h3>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted-foreground">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-3 pr-1">
                {cards.map((card) => {
                  const nextCol = getNextColumn(card.column);
                  const prevCol = getPrevColumn(card.column);
                  return (
                    <div
                      key={card.id}
                      className="p-4 rounded-lg bg-background/80 border border-border/70 hover:border-primary/40 transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                          card.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-white/5 text-muted-foreground'
                        }`}>
                          {card.priority.toUpperCase()}
                        </span>
                        <button
                          onClick={() => deleteBoardCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <h4 className="text-xs font-heading font-bold text-foreground">
                        {card.title}
                      </h4>
                      {card.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>
                      )}

                      {/* Direction Shift Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        {prevCol ? (
                          <button
                            onClick={() => moveBoardCard(card.id, prevCol)}
                            className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <ArrowLeft className="w-3 h-3" /> Prev
                          </button>
                        ) : <div />}
                        {nextCol && (
                          <button
                            onClick={() => moveBoardCard(card.id, nextCol)}
                            className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 font-bold"
                          >
                            Next <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-md cyber-card space-y-4">
            <h3 className="text-lg font-heading font-bold text-foreground">New Study Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Docker Network Bridge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details and goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as BoardCard['priority'])}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold shadow-neon-glow"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
