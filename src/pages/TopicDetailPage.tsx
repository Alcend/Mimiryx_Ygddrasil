import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  FileText,
  Terminal,
  ArrowRight,
  BookOpen,
  X,
  Eye,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { BookReader } from '../components/BookReader';
import { Note } from '../types';
import { resolveNoteTopic } from './NotesPage';

export const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { topics, notes, labs } = useApp();
  const navigate = useNavigate();
  const [readingNote, setReadingNote] = useState<Note | null>(null);

  const topic = topics.find((t) => t.id === id);
  if (!topic) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-heading font-bold text-foreground">Topic Not Found</h3>
        <button
          onClick={() => navigate('/topics')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono"
        >
          Back to Topics
        </button>
      </div>
    );
  }

  const topicNotes = notes.filter((n) => resolveNoteTopic(n, topics)?.id === topic.id);
  const topicLabs = labs.filter((l) => l.topicId === topic.id);
  const masteredNotes = topicNotes.filter((n) => n.status === 'mastered').length;
  const progressPct = topicNotes.length ? Math.round((masteredNotes / topicNotes.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => {
          sounds.playClick();
          navigate('/topics');
        }}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Topics
      </button>

      {/* Hero Banner */}
      <div
        className="p-6 md:p-8 rounded-2xl cyber-card border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          borderColor: `${topic.color}66`,
          boxShadow: `0 8px 30px rgba(0,0,0,0.6), inset 0 0 20px ${topic.color}15`,
        }}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold border"
              style={{
                backgroundColor: `${topic.color}20`,
                color: topic.color,
                borderColor: `${topic.color}50`,
              }}
            >
              {topic.code} // {topic.category.toUpperCase()} REALM
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {topicNotes.length} Knowledge Chapters · {progressPct}% Mastered
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {topic.name}
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-mono">
            {topic.description}
          </p>
        </div>

        {/* Start Master Grimoire Button */}
        {topicNotes.length > 0 && (
          <button
            onClick={() => {
              sounds.playPageFlip();
              setReadingNote(topicNotes[0]);
            }}
            className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4" /> Read Topic Grimoire
          </button>
        )}
      </div>

      {/* Active Embedded Book Reader Mode */}
      {readingNote && (
        <div className="p-6 rounded-2xl cyber-card border border-primary/40 space-y-4 bg-[#070e17] animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-heading font-bold text-foreground">
                Topic Book Reader // Chapter: {readingNote.title}
              </h3>
            </div>
            <button
              onClick={() => setReadingNote(null)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <BookReader
            note={readingNote}
            topic={topic}
            onEdit={() => navigate(`/notes/${readingNote.id}`)}
          />
        </div>
      )}

      {/* Topic Chapters / Associated Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Topic Knowledge Chapters ({topicNotes.length})
          </h3>
          <span className="text-xs font-mono text-muted-foreground">Click to read in Grimoire</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicNotes.map((note) => {
            const pageCount = Math.max(1, Math.ceil(note.content.split('---').length));

            return (
              <div
                key={note.id}
                className="p-5 rounded-2xl cyber-card border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between group bg-[#070e17]/80 hover:bg-[#070e17]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        note.status === 'mastered'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-primary/40 text-primary bg-primary/10'
                      }`}
                    >
                      {note.status.toUpperCase()}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5 text-primary" />
                      {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {note.title}
                  </h4>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-mono">
                    {note.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => {
                      sounds.playPageFlip();
                      setReadingNote(note);
                    }}
                    className="text-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read Chapter →
                  </button>

                  <Link
                    to={`/notes/${note.id}`}
                    onClick={() => sounds.playClick()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Editor
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Labs */}
      {topicLabs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h3 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[hsl(var(--neon-green))]" /> Hands-on Interactive Labs ({topicLabs.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicLabs.map((lab) => (
              <Link
                key={lab.id}
                to={`/labs/${lab.id}`}
                onClick={() => sounds.playClick()}
                className="p-4 rounded-xl cyber-card border border-border hover:border-[hsl(var(--neon-green)/0.5)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-mono text-[hsl(var(--neon-green))] uppercase">
                    {lab.difficulty} // {lab.status}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-[hsl(var(--neon-green))] transition-colors mt-1">
                    {lab.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lab.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono text-[hsl(var(--neon-green))]">
                  <span>Launch Lab Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
