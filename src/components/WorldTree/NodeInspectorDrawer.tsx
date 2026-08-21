import React from 'react';
import { TreeNode } from './types';
import { X, ArrowRight, BookOpen, Terminal, Sparkles, Tag, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../../utils/audio';

interface NodeInspectorDrawerProps {
  node: TreeNode | null;
  onClose: () => void;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({ node, onClose }) => {
  const navigate = useNavigate();
  if (!node) return null;

  return (
    <div className="absolute right-4 top-20 bottom-20 w-80 md:w-96 bg-card/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-2xl p-6 flex flex-col justify-between z-30 animate-in slide-in-from-right duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
              {node.type.replace('_', ' ').toUpperCase()}
            </span>
            <h3 className="text-lg font-heading font-bold text-foreground mt-2">
              {node.title}
            </h3>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Domain: {node.category}
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status / Mastery Pill */}
        <div className="p-3 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">Mastery Status</span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[11px] ${
            node.status === 'mastered'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
              : node.status === 'reviewing'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
              : 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
          }`}>
            {node.status} ({node.mastery}%)
          </span>
        </div>

        {/* Description / Summary */}
        {node.description && (
          <div className="space-y-1">
            <h4 className="text-xs font-mono text-muted-foreground uppercase">Knowledge Synopsis</h4>
            <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-black/30 p-3 rounded-xl border border-border/50">
              {node.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {node.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-primary border border-primary/20">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border/60 flex items-center gap-2">
        {node.noteId ? (
          <button
            onClick={() => {
              sounds.playClick();
              navigate(`/notes/${node.noteId}`);
            }}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-glow"
          >
            <BookOpen className="w-3.5 h-3.5" /> Open Record
          </button>
        ) : (
          <button
            onClick={() => {
              sounds.playClick();
              navigate('/notes');
            }}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-glow"
          >
            <BookOpen className="w-3.5 h-3.5" /> Explore Domain
          </button>
        )}
      </div>
    </div>
  );
};
