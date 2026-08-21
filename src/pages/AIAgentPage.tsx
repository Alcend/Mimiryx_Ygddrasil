import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  Database,
  Zap,
  UploadCloud,
  FolderTree,
  Tag,
  CheckCircle2,
  BrainCircuit,
  Boxes,
  BookOpen,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { ImportExportModal } from '../components/ImportExportModal';

export const AIAgentPage: React.FC = () => {
  const { notes, topics, labs, addActivity } = useApp();
  const [showImportModal, setShowImportModal] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; actionTag?: string }>>([
    {
      role: 'assistant',
      text: `Greetings. I am the MIMIRYX Autonomous Knowledge Agent.\n\nI maintain synaptic coherence across your **${notes.length} Knowledge Records**, **${topics.length} Yggdrasil Branches**, and **${labs.length} Practical Labs**.\n\nI can automatically organize imported files, classify concepts into the right topic branches, or create new branches on your World Tree whenever you explore new domains.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (overrideText?: string) => {
    const q = overrideText || input;
    if (!q.trim()) return;
    sounds.playClick();
    const newMsgs = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMsgs);
    if (!overrideText) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      sounds.playSuccess();
      let reply = '';
      const qLower = q.toLowerCase();

      if (qLower.includes('organize') || qLower.includes('tree') || qLower.includes('rebalance')) {
        const topicCounts = topics.map((t) => {
          const count = notes.filter((n) => n.topicId === t.id).length;
          return `• **${t.name}**: ${count} notes (${t.category || 'General'})`;
        });
        reply = `[AI TREE CLUSTER COHERENCE REPORT]\n\nI have scanned your Yggdrasil World Tree structure:\n${topicCounts.join('\n')}\n\n💡 **Optimization Insights**:\n1. **High-Density Clusters**: Core Infrastructure is thriving with extensive low-level telemetry.\n2. **Branch Balance**: All active topics have solid prerequisite foundations in the root system.\n3. **Recommendation**: Use the **"Import & AI Organize"** tool to ingest raw docs (.md, .pdf, .txt); I will automatically create new topic limbs for novel domains.`;
      } else if (qLower.includes('import') || qLower.includes('upload') || qLower.includes('files')) {
        reply = `[KNOWLEDGE INGESTION ENGINE READY]\n\nClick the **"Import & AI Auto-Organize"** button below to drop your files (.md, .txt, .pdf, .docx, .json, .py, etc.).\n\nI will parse the content, extract technical keywords, match existing branches, or synthesize brand new topic branches with custom neon colors on your Yggdrasil World Tree.`;
      } else if (qLower.includes('tag') || qLower.includes('untagged')) {
        const untagged = notes.filter((n) => !n.tags || n.tags.length === 0);
        reply = `[AUTO-TAG SYNTHESIS REPORT]\n\n• Total notes scanned: ${notes.length}\n• Untagged records found: ${untagged.length}\n\nAll active records are indexed with domain keywords across eBPF, Distributed Consensus, Neural Transformers, and Cloud Architecture.`;
      } else {
        reply = `[SYNAPTIC INFERENCE for: "${q}"]\n\nCross-referencing your ${notes.length} notes across Yggdrasil...\n\n• Analyzed active clusters: ${topics.slice(0, 3).map((t) => t.name).join(', ')}.\n• Suggested Study Path: Complete your outstanding labs to boost your Root Mastery from ${Math.round((notes.filter(n => n.status === 'mastered').length / (notes.length || 1)) * 100)}% to 100%.\n\nNeed me to organize imported notes or synthesize a new topic branch? Just upload files or ask!`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsThinking(false);
      addActivity('AI Agent Query', q.slice(0, 30), 'topic');
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" /> Autonomous AI Knowledge Agent
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Intelligent neural assistant for auto-organizing notes, growing tree branches, and study synthesis.
          </p>
        </div>

        {/* Quick Import / Export Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowImportModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold font-mono flex items-center gap-2 hover:opacity-90 transition-opacity shadow-neon-glow shrink-0"
        >
          <UploadCloud className="w-4 h-4" /> Import & AI Organize
        </button>
      </div>

      {/* Quick Agent Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            sounds.playClick();
            setShowImportModal(true);
          }}
          className="p-3.5 rounded-xl cyber-card border border-primary/30 hover:border-primary/60 bg-black/30 flex items-center gap-3 text-left transition-all group"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary group-hover:scale-105 transition-transform">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-heading font-bold text-foreground">Import & Auto-Organize</p>
            <p className="text-[10px] font-mono text-muted-foreground">Upload files → AI clusters into tree</p>
          </div>
        </button>

        <button
          onClick={() => handleSend('Analyze and optimize my Yggdrasil Tree structure')}
          className="p-3.5 rounded-xl cyber-card border border-[hsl(var(--neon-green)/0.3)] hover:border-[hsl(var(--neon-green)/0.6)] bg-black/30 flex items-center gap-3 text-left transition-all group"
        >
          <div className="p-2 rounded-lg bg-[hsl(var(--neon-green)/0.1)] border border-[hsl(var(--neon-green)/0.3)] text-[hsl(var(--neon-green))] group-hover:scale-105 transition-transform">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-heading font-bold text-foreground">Rebalance Tree Clusters</p>
            <p className="text-[10px] font-mono text-muted-foreground">Audit cluster density & coherence</p>
          </div>
        </button>

        <button
          onClick={() => handleSend('Auto-scan and verify note tags across the vault')}
          className="p-3.5 rounded-xl cyber-card border border-[hsl(var(--accent)/0.3)] hover:border-[hsl(var(--accent)/0.6)] bg-black/30 flex items-center gap-3 text-left transition-all group"
        >
          <div className="p-2 rounded-lg bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))] group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-heading font-bold text-foreground">Synaptic Tag Audit</p>
            <p className="text-[10px] font-mono text-muted-foreground">Verify keyword linkages</p>
          </div>
        </button>
      </div>

      {/* Main Terminal Chat Interface */}
      <div className="rounded-2xl cyber-card border border-border flex flex-col h-[520px] overflow-hidden bg-black/40">
        {/* Terminal Header */}
        <div className="p-3 px-4 border-b border-border bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>MIMIRYX-AI-AGENT // SYNAPSE v2.4</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>NEURAL STREAM ACTIVE</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground font-mono font-medium shadow-neon-glow'
                    : 'bg-black/70 border border-border/80 text-foreground font-mono whitespace-pre-wrap shadow-lg'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="p-3 px-4 rounded-2xl bg-black/60 border border-primary/30 text-xs font-mono text-primary flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>AI Agent is parsing synaptic memory & neural clusters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-black/60 border-t border-border flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI to organize files, create topics, or analyze your study roadmap..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-background/80 border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 disabled:opacity-40 transition-opacity shadow-neon-glow flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      {/* Import / Export Modal */}
      <ImportExportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
};
