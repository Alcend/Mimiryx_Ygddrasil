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
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { resolveNoteTopic } from './NotesPage';

export const TopicsPage: React.FC = () => {
  const { topics, notes, labs } = useApp();
  const navigate = useNavigate();
  const [flippedTopics, setFlippedTopics] = useState<Record<string, boolean>>({});

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Boxes className="w-6 h-6 text-primary" /> Neural Topic Clusters & Grimoire Branches
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Modular knowledge domains bridging foundational infrastructure with machine intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
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
                        {topic.code} // {topic.category}
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
    </div>
  );
};
