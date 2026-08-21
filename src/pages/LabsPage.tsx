import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Terminal, Clock, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export const LabsPage: React.FC = () => {
  const { labs, topics } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" /> Hands-On Terminal Labs
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Execute real-world cloud commands, service mesh traffic shaping, and vector probe experiments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab) => {
          const topic = topics.find((t) => t.id === lab.topicId);
          const completedSteps = lab.steps.filter((s) => s.completed).length;
          const percent = Math.round((completedSteps / lab.steps.length) * 100);

          return (
            <div
              key={lab.id}
              className="p-6 rounded-2xl cyber-card border border-border hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    lab.status === 'completed'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      : lab.status === 'in_progress'
                      ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                      : 'border-white/20 text-muted-foreground bg-white/5'
                  }`}>
                    {lab.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {lab.estimatedMinutes} min
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-foreground">
                  {lab.title}
                </h3>
                {topic && (
                  <div className="text-xs font-mono text-primary mt-1">
                    Cluster: {topic.name}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {lab.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Progress ({completedSteps}/{lab.steps.length} steps)</span>
                    <span className="text-primary font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">
                  Difficulty: {lab.difficulty}
                </span>
                <Link
                  to={`/labs/${lab.id}`}
                  onClick={() => sounds.playClick()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-neon-glow"
                >
                  <Play className="w-3.5 h-3.5" /> Launch Lab
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
