import React from 'react';
import { BarChart3, ArrowUpRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Topic, Note } from '../../types';
import { sounds } from '../../utils/audio';

interface Props {
  learningNotes: number;
  reviewingNotes: number;
  masteredNotes: number;
  totalNotesCount: number;
  masteryPercentage: number;
  topics: Topic[];
  notes: Note[];
}

export const KnowledgeDistribution: React.FC<Props> = ({
  learningNotes,
  reviewingNotes,
  masteredNotes,
  totalNotesCount,
  masteryPercentage,
  topics,
  notes
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between" title="Visual breakdown of your note mastery levels">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3 text-[hsl(var(--neon-blue))]" /> Knowledge Distribution
        </span>
        <button
          onClick={() => navigate('/analytics')}
          className="text-[10px] font-mono text-primary hover:underline flex items-center gap-0.5"
        >
          Full Analytics <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div 
          className="relative w-24 h-24 shrink-0 rounded-full flex items-center justify-center cursor-help"
          title={`Learning: ${learningNotes} | Reviewing: ${reviewingNotes} | Mastered: ${masteredNotes}`}
          style={{
            background: `conic-gradient(
              hsl(var(--neon-blue)) 0% ${(learningNotes / (totalNotesCount || 1)) * 100}%,
              hsl(var(--accent)) ${(learningNotes / (totalNotesCount || 1)) * 100}% ${((learningNotes + reviewingNotes) / (totalNotesCount || 1)) * 100}%,
              hsl(var(--neon-green)) ${((learningNotes + reviewingNotes) / (totalNotesCount || 1)) * 100}% 100%
            )`
          }}
        >
          <div className="absolute inset-2 bg-[#060b14] rounded-full flex flex-col items-center justify-center border border-white/5">
            <span className="text-xl font-bold font-mono text-foreground">{masteryPercentage}%</span>
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Mastery</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono cursor-help" title="Notes currently being drafted or actively researched">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--neon-blue))]" />
              <span className="text-muted-foreground hover:text-[hsl(var(--neon-blue))] transition-colors">Learning</span>
            </div>
            <span className="font-bold text-foreground">{learningNotes}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono cursor-help" title="Notes pending memorization or spaced repetition review">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
              <span className="text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors">Reviewing</span>
            </div>
            <span className="font-bold text-foreground">{reviewingNotes}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono cursor-help" title="Notes fully committed to long-term memory">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--neon-green))]" />
              <span className="text-muted-foreground hover:text-[hsl(var(--neon-green))] transition-colors">Mastered</span>
            </div>
            <span className="font-bold text-foreground">{masteredNotes}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/30">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground" title="Granular mastery progress for each active topic">
          <span>TOPIC PROGRESS</span>
          <button onClick={() => navigate('/topics')} className="text-primary hover:underline">
            Manage ({topics.length})
          </button>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
          {topics.map(topic => {
            const tNotes = notes.filter(n => n.topicId === topic.id);
            const mNotes = tNotes.filter(n => n.status === 'mastered').length;
            const pct = tNotes.length ? Math.round((mNotes / tNotes.length) * 100) : 0;
            return (
              <div
                key={topic.id}
                title={`Click to manage ${topic.name}. ${mNotes} of ${tNotes.length} notes mastered.`}
                onClick={() => { sounds.playClick(); navigate(`/topics/${topic.id}`); }}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-border/30 cursor-pointer space-y-1 transition-colors"
              >
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-foreground font-medium truncate">{topic.name}</span>
                  <span className="text-primary font-bold">{pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-[hsl(var(--neon-green))]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div 
        className="flex items-center justify-between p-2.5 rounded-xl border border-[hsl(var(--neon-green)/0.3)] bg-[hsl(var(--neon-green)/0.06)] cursor-help"
        title="Daily consistency streak. You have added or reviewed notes for 14 consecutive days!"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[hsl(var(--neon-green))] animate-pulse" />
          <div>
            <p className="text-xs font-heading font-bold text-foreground">14-Day Streak</p>
            <p className="text-[9px] font-mono text-muted-foreground">Digital tree thriving</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[hsl(var(--neon-green))]">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
