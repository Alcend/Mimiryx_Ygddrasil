import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Sparkles, TrendingUp, Flame, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { notes, labs, topics, masteryPercentage } = useApp();

  const masteredNotes = notes.filter((n) => n.status === 'mastered').length;
  const reviewingNotes = notes.filter((n) => n.status === 'reviewing').length;
  const learningNotes = notes.filter((n) => n.status === 'learning').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Mastery Analytics & Synaptic Velocity
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Detailed metrics tracking your progression across all Norse neural infrastructure domains.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl cyber-card border border-primary/30">
          <span className="text-xs font-mono text-muted-foreground">Overall Mastery Score</span>
          <h3 className="text-3xl font-bold font-mono text-primary mt-1">{masteryPercentage}%</h3>
        </div>
        <div className="p-5 rounded-2xl cyber-card border border-border">
          <span className="text-xs font-mono text-muted-foreground">Active Streak</span>
          <h3 className="text-3xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1.5">
            <Flame className="w-6 h-6" /> 7 Days
          </h3>
        </div>
        <div className="p-5 rounded-2xl cyber-card border border-border">
          <span className="text-xs font-mono text-muted-foreground">Mastered Synapses</span>
          <h3 className="text-3xl font-bold font-mono text-emerald-400 mt-1">{masteredNotes}</h3>
        </div>
      </div>

      {/* Breakdown Card */}
      <div className="p-6 rounded-2xl cyber-card border border-border space-y-4">
        <h3 className="text-sm font-heading font-bold text-foreground">
          Knowledge Records State Distribution
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400">Mastered ({masteredNotes})</span>
              <span>{Math.round((masteredNotes / (notes.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${(masteredNotes / (notes.length || 1)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-sky-400">Reviewing ({reviewingNotes})</span>
              <span>{Math.round((reviewingNotes / (notes.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-sky-400" style={{ width: `${(reviewingNotes / (notes.length || 1)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-amber-400">Learning ({learningNotes})</span>
              <span>{Math.round((learningNotes / (notes.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${(learningNotes / (notes.length || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
