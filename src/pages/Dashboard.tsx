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
  Activity,
  Zap,
  Server,
  Radio,
  BarChart3,
  Terminal,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { SystemLogs } from '../components/dashboard/SystemLogs';
import { KnowledgeDistribution } from '../components/dashboard/KnowledgeDistribution';

import { TriviaFact } from '../components/DigitalButterflies';

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

  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');
  const [activeRealm, setActiveRealm] = useState<string>('ALL');

  const availableRealms = React.useMemo(() => {
    const categories = Array.from(new Set(topics.map(t => t.category))).filter(Boolean);
    return ['ALL', ...categories];
  }, [topics]);


  const [triviaIdx, setTriviaIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto relative gap-3">
      <AnalyticsGuideBanner />

      {/* Main Unified Arena: Tree (Left) + Analytics & Monitor Rail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Digital Yggdrasil Tree Organism + Daily Knowledge Recall */}
        <div className={`flex flex-col min-h-0 gap-3 lg:col-span-8 transition-all duration-700 ease-in-out ${isIdle ? 'opacity-10' : 'opacity-100'}`}>



          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-border/40 cyber-card shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="absolute bottom-4 left-4 z-20">
              <select
                value={activeRealm}
                onChange={(e) => { sounds.playClick(); setActiveRealm(e.target.value); }}
                className="bg-black/80 backdrop-blur-md border border-white/10 text-primary hover:bg-black hover:border-primary/50 transition-all text-[10px] font-mono font-bold px-3 py-2 rounded-lg outline-none cursor-pointer uppercase tracking-wider shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                {availableRealms.map(realm => (
                  <option key={realm} value={realm} className="bg-[#0b101a] text-foreground font-mono">
                    {realm === 'ALL' ? 'ALL REALMS' : realm}
                  </option>
                ))}
              </select>
            </div>
            <YggdrasilWorldTreeCanvas activeRealm={activeRealm} />
          </div>
        </div>

        {/* Right Column: Combined Telemetry & Analytics Rail */}
        <div className={`lg:col-span-4 flex flex-col min-h-0 gap-3 overflow-y-auto transition-all duration-700 hover:opacity-100 ${
          isIdle ? 'opacity-10' : 'opacity-100'
        }`}>
          {/* Header Controls for Rail */}
          <div className="bg-card/70 backdrop-blur border border-white/10 rounded-2xl p-4 cyber-card flex flex-col min-h-0 gap-3 h-full">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-foreground">
                  Neural Command Rail
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('all'); }}
                  className={`px-2 py-1 rounded transition-all ${
                    activeSideTab === 'all'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('analytics'); }}
                  className={`px-2 py-1 rounded transition-all ${
                    activeSideTab === 'analytics'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => { sounds.playClick(); setActiveSideTab('telemetry'); }}
                  className={`px-2 py-1 rounded transition-all ${
                    activeSideTab === 'telemetry'
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Telemetry
                </button>
              </div>
            </div>

            {/* Compact Core Stats */}
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border/20 shrink-0">
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => { sounds.playClick(); navigate('/notes'); }}>
                <div className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-[hsl(var(--neon-blue))]" /><span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Notes</span></div>
                <span className="text-xs font-bold font-mono text-foreground">{totalNotesCount}</span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5 cursor-pointer hover:border-[hsl(var(--neon-green))]/40 transition-colors" onClick={() => { sounds.playClick(); navigate('/labs'); }}>
                <div className="flex items-center gap-2"><FlaskConical className="w-3 h-3 text-[hsl(var(--neon-green))]" /><span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Labs</span></div>
                <span className="text-xs font-bold font-mono text-foreground">{completedLabsCount}</span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5 cursor-pointer hover:border-[hsl(var(--neon-purple))]/40 transition-colors" onClick={() => { sounds.playClick(); navigate('/topics'); }}>
                <div className="flex items-center gap-2"><Boxes className="w-3 h-3 text-[hsl(var(--neon-purple))]" /><span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Topics</span></div>
                <span className="text-xs font-bold font-mono text-foreground">{topics.length}</span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2"><Trophy className="w-3 h-3 text-[hsl(var(--neon-amber))]" /><span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Mastery</span></div>
                <span className="text-xs font-bold font-mono text-foreground">{masteryPercentage}%</span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2"><Radio className="w-3 h-3 text-emerald-400 animate-pulse" /><span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Status</span></div>
                <span className="text-[9px] font-bold font-mono text-emerald-400">ONLINE</span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary" /><span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Local</span></div>
                <span className="text-[9px] font-bold font-mono text-foreground">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

                        {/* Knowledge Flow State & Mastery (from Analytics) */}
            {(activeSideTab === 'all' || activeSideTab === 'analytics') && (
              <KnowledgeDistribution
                learningNotes={learningNotes}
                reviewingNotes={reviewingNotes}
                masteredNotes={masteredNotes}
                totalNotesCount={totalNotesCount}
                masteryPercentage={masteryPercentage}
                topics={topics}
                notes={notes}
              />
            )}

            {/* Telemetry Metrics Section (from Monitor) */}
            {(activeSideTab === 'all' || activeSideTab === 'telemetry') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between" title="Live system metrics monitoring the health of your knowledge graph">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Server className="w-3 h-3 text-primary" /> Real-Time Telemetry
                  </span>
                  <button
                    onClick={() => navigate('/monitor')}
                    className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    Open Monitor <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {metrics.slice(0, 4).map((m) => (
                    <div key={m.id} title={`Current ${m.name}: ${m.value}${m.unit}. Represents system ${m.name.toLowerCase()} overhead.`} className="p-3 rounded-xl bg-background/50 border border-white/5 flex flex-col justify-between hover:bg-white/[0.02] transition-colors cursor-help">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-muted-foreground truncate">{m.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="my-2">
                        <span className="text-base font-bold font-mono text-foreground">{m.value}</span>
                        <span className="text-[9px] text-primary font-normal ml-1">{m.unit}</span>
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
                <div className="rounded-xl bg-black/80 border border-border/50 p-3 space-y-2 cursor-help" title="Live event stream of AI clustering and system background tasks">
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



          </div>
        </div>
      </div>
    </div>
  );
};
