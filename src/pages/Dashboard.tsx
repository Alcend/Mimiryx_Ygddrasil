import React, { useState, useEffect } from 'react';
import { YggdrasilWorldTreeCanvas } from '../components/WorldTree/YggdrasilWorldTreeCanvas';
import { useApp } from '../context/AppContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  BookOpen,
  Boxes,
  FlaskConical,
  Trophy,
  Flame,
  Sparkles,
  ChevronRight,
  Activity,
  Zap,
  Award,
  Server,
  Cpu,
  Radio,
  BarChart3,
  Terminal,
  Layers,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { sounds } from '../utils/audio';

import { DigitalButterflies, TriviaFact } from '../components/DigitalButterflies';

import { AnalyticsGuideBanner } from '../components/AnalyticsGuideBanner';

const TRIVIA_LIST = [
  { difficulty: 'Beginner', q: 'What is the primary function of eBPF in modern Linux systems?', a: 'Safe kernel programmability without modifying kernel source or loading modules.', takeaway: 'eBPF sandboxes run in-kernel bytecode with near-zero latency overhead.' },
  { difficulty: 'Intermediate', q: 'How does Raft handle network partitions during consensus election?', a: 'A partitioned leader without majority quorum cannot commit logs; the majority partition elects a new leader.', takeaway: 'Raft prioritizes consistency over availability (CP in CAP theorem).' },
  { difficulty: 'Advanced', q: 'What is the function of TLS 1.3 0-RTT Pre-Shared Key resumption?', a: 'Allows clients to send application data in the very first flight to eliminate round-trip latency.', takeaway: 'Early data (0-RTT) is susceptible to replay attacks if not guarded by anti-replay caches.' },
  { difficulty: 'Expert', q: 'How does Linux Memory Cgroup v2 handle memory overcommit pressure?', a: 'Through proactive page cache reclamation and PSI (Pressure Stall Information) metrics before OOM killer triggers.', takeaway: 'Cgroups v2 provides unified hierarchy control for memory, CPU, and I/O.' }
];

export const BUTTERFLY_TRIVIA: TriviaFact[] = [
  { id: 't1', category: 'Linux Kernel', color: '#00ff88', q: 'What is the primary function of eBPF?', a: 'Safe kernel programmability without modifying kernel source.', takeaway: 'Runs in-kernel bytecode with near-zero latency overhead.' },
  { id: 't2', category: 'Networking', color: '#00f0ff', q: 'What does BGP stand for?', a: 'Border Gateway Protocol.', takeaway: 'It is the core routing protocol of the Internet.' },
  { id: 't3', category: 'Security', color: '#ff00aa', q: 'What is a zero-day exploit?', a: 'A cyber attack that occurs on the same day a weakness is discovered.', takeaway: 'Vendors have zero days to fix it before it is exploited.' },
  { id: 't4', category: 'Databases', color: '#ffbb00', q: 'What is the CAP theorem?', a: 'A distributed system can only provide two of: Consistency, Availability, and Partition tolerance.', takeaway: 'Network partitions are inevitable, forcing a choice between C and A.' },
  { id: 't5', category: 'Cloud Native', color: '#a855f7', q: 'What is a Kubernetes Pod?', a: 'The smallest deployable computing unit in Kubernetes.', takeaway: 'A Pod encapsulates one or more containers sharing storage and network.' },
  { id: 't6', category: 'Cryptography', color: '#00ff88', q: 'What is asymmetric encryption?', a: 'Uses a public key for encryption and a private key for decryption.', takeaway: 'Allows secure communication without sharing a secret key beforehand.' },
];

export const Dashboard: React.FC = () => {
  const { topics, notes, labs, metrics, masteryPercentage, totalNotesCount, completedLabsCount } = useApp();
  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();

  const [triviaIdx, setTriviaIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics'>('all');

  // Live streaming log simulation from Monitor
  const [liveLogs, setLiveLogs] = useState<string[]>([
    'SYNAPSE-ROOT-01: Heartbeat acknowledged (RTT 0.42ms)',
    'EBPF-TELEMETRY: Socket buffer filters active across 4 nodes',
    'VECTOR-INDEX-CLUSTER: Index health 100% (density 0.94)',
    'ROUTING-GATEWAY: Envoy proxy mesh operational',
  ]);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const msgs = [
        'K8S-RECONCILER: 0 drift in operator',
        'SYNAPSE-ROOT-01: Cache sync complete',
        'AUTH-ZERO-TRUST: mTLS certs renewed',
        'NEURAL-GATEWAY: Ingested 128 telemetry records',
        'TREE-SYNAPSE: Node energy pulse distributed',
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLiveLogs(prev => [`${new Date().toLocaleTimeString()}: ${randomMsg}`, ...prev.slice(0, 8)]);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const masteredNotes = notes.filter(n => n.status === 'mastered').length;
  const learningNotes = notes.filter(n => n.status === 'learning').length;
  const reviewingNotes = notes.filter(n => n.status === 'reviewing').length;

  const currentTrivia = TRIVIA_LIST[triviaIdx % TRIVIA_LIST.length];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10 relative">
      <AnalyticsGuideBanner />

      {/* Top Banner Stats Row */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 relative z-10 transition-all duration-700 ease-in-out hover:opacity-100 ${
        isIdle ? 'opacity-10' : 'opacity-100'
      }`}>
        {/* Card 1: Notes Vault (Clickable) */}
        <button 
          onClick={() => { sounds.playClick(); navigate('/notes'); }}
          className="bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/5 hover:border-primary/40 transition-colors group cursor-pointer"
          title="Go to Notes Vault"
        >
          <div className="p-2 rounded-lg bg-[hsl(var(--neon-blue)/0.12)] border border-[hsl(var(--neon-blue)/0.3)] text-[hsl(var(--neon-blue))] group-hover:scale-110 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total Notes</p>
            <p className="text-lg font-bold text-foreground font-mono">{totalNotesCount}</p>
          </div>
        </button>

        {/* Card 2: Neural Labs (Clickable) */}
        <button 
          onClick={() => { sounds.playClick(); navigate('/labs'); }}
          className="bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/5 hover:border-[hsl(var(--neon-green))]/40 transition-colors group cursor-pointer"
          title="Go to Neural Labs"
        >
          <div className="p-2 rounded-lg bg-[hsl(var(--neon-green)/0.12)] border border-[hsl(var(--neon-green)/0.3)] text-[hsl(var(--neon-green))] group-hover:scale-110 transition-transform">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Labs Done</p>
            <p className="text-lg font-bold text-foreground font-mono">{completedLabsCount}</p>
          </div>
        </button>

        {/* Card 3: Neural Topics (Clickable) */}
        <button 
          onClick={() => { sounds.playClick(); navigate('/topics'); }}
          className="bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/5 hover:border-[hsl(var(--neon-purple))]/40 transition-colors group cursor-pointer"
          title="Go to Neural Topics"
        >
          <div className="p-2 rounded-lg bg-[hsl(var(--neon-purple)/0.12)] border border-[hsl(var(--neon-purple)/0.3)] text-[hsl(var(--neon-purple))] group-hover:scale-110 transition-transform">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Active Topics</p>
            <p className="text-lg font-bold text-foreground font-mono">{topics.length}</p>
          </div>
        </button>

        {/* Card 4: Mastery Status */}
        <div className="bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(var(--neon-amber)/0.12)] border border-[hsl(var(--neon-amber)/0.3)] text-[hsl(var(--neon-amber))]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Mastery</p>
            <p className="text-lg font-bold text-foreground font-mono">{masteryPercentage}%</p>
          </div>
        </div>

        {/* Card 5: Sync Status */}
        <div className="hidden lg:flex bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-mono font-bold text-emerald-400">ONLINE</p>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">RTT 0.42ms · 4 Nodes</p>
          </div>
        </div>

        {/* Card 6: Live Clock Card */}
        <div className="hidden lg:flex bg-card/70 backdrop-blur-md border border-white/10 rounded-xl p-3 items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-mono font-bold text-primary">
                {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">LOCAL SYSTEM TIME</p>
          </div>
        </div>
      </div>

      {/* Main Unified Arena: Tree (Left) + Analytics & Monitor Rail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Digital Yggdrasil Tree Organism + Daily Knowledge Recall */}
        <div className="space-y-4 lg:col-span-8">
          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full">
            <YggdrasilWorldTreeCanvas />
          </div>

          {/* Daily Recall Trivia */}
          <div className={`bg-card/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 cyber-card space-y-2.5 transition-all duration-700 hover:opacity-100 ${
            isIdle ? 'opacity-10' : 'opacity-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[hsl(var(--neon-green))]">
                  Daily Recall · Day {new Date().getDate()}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary">
                  {currentTrivia.difficulty}
                </span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTriviaIdx(i => i + 1);
                    setShowAnswer(false);
                  }}
                  className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline ml-2"
                >
                  Next →
                </button>
              </div>
            </div>

            <p className="text-xs font-medium text-foreground">
              {currentTrivia.q}
            </p>

            {showAnswer ? (
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 space-y-1 animate-in fade-in duration-200">
                <p className="text-xs font-mono font-bold text-primary">
                  ✓ {currentTrivia.a}
                </p>
                <p className="text-[11px] text-muted-foreground border-l-2 border-primary/50 pl-2">
                  {currentTrivia.takeaway}
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playSuccess();
                  setShowAnswer(true);
                }}
                className="px-2.5 py-1 rounded-lg border border-border hover:border-primary/40 bg-white/5 text-[11px] font-mono font-semibold text-foreground flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3 h-3 text-primary" /> Reveal Answer
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Combined Telemetry & Analytics Rail */}
        <div className={`lg:col-span-4 space-y-4 transition-all duration-700 hover:opacity-100 ${
          isIdle ? 'opacity-10' : 'opacity-100'
        }`}>
          {/* Header Controls for Rail */}
          <div className="bg-card/70 backdrop-blur border border-white/10 rounded-2xl p-4 cyber-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-foreground">
                  Neural Command Rail
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('all'); }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    activeSideTab === 'all'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('telemetry'); }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    activeSideTab === 'telemetry'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Telemetry
                </button>
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('analytics'); }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    activeSideTab === 'analytics'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            {/* Telemetry Metrics Section (from Monitor) */}
            {(activeSideTab === 'all' || activeSideTab === 'telemetry') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between" title="Live system metrics monitoring the health of your knowledge graph">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-primary" /> Real-Time Telemetry
                  </span>
                  <button
                    onClick={() => navigate('/monitor')}
                    className="text-[10px] font-mono text-primary hover:underline flex items-center gap-0.5"
                  >
                    Open Monitor <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {metrics.slice(0, 4).map((m) => (
                    <div key={m.id} title={`Current ${m.name}: ${m.value}${m.unit}. Represents system ${m.name.toLowerCase()} overhead.`} className="p-2.5 rounded-xl bg-background/50 border border-white/5 flex flex-col justify-between hover:bg-white/[0.02] transition-colors cursor-help">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-muted-foreground truncate">{m.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="my-1.5">
                        <span className="text-base font-bold font-mono text-foreground">{m.value}</span>
                        <span className="text-[9px] text-primary font-normal ml-0.5">{m.unit}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-[hsl(var(--neon-green))]"
                          style={{ width: `${Math.min(100, m.value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Terminal Stream */}
                <div className="rounded-xl bg-black/80 border border-border/50 p-2.5 space-y-1.5 cursor-help" title="Live event stream of AI clustering and system background tasks">
                  <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground border-b border-border/30 pb-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Terminal className="w-3 h-3" /> SYNAPSE STREAM
                    </span>
                    <span className="text-emerald-400/80">LIVE</span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400/90 h-24 overflow-y-auto space-y-1 pr-1">
                    {liveLogs.map((log, idx) => (
                      <div key={idx} className="truncate">
                        <span className="text-primary font-bold mr-1">{'>'}</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Knowledge Flow State & Mastery (from Analytics) */}
            {(activeSideTab === 'all' || activeSideTab === 'analytics') && (
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
                  {/* Modern CSS Conic Gradient Donut Chart */}
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
                    {/* Inner Cutout (The Donut Hole) */}
                    <div className="absolute inset-2 bg-[#060b14] rounded-full flex flex-col items-center justify-center border border-white/5">
                      <span className="text-xl font-bold font-mono text-foreground">{masteryPercentage}%</span>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Mastery</span>
                    </div>
                  </div>

                  {/* Legend */}
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

                {/* Progress by Topic list */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground" title="Granular mastery progress for each active topic">
                    <span>TOPIC PROGRESS</span>
                    <button onClick={() => navigate('/topics')} className="text-primary hover:underline">
                      Manage ({topics.length})
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
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

                {/* Streak Badge */}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
