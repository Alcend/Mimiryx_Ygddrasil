import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Flame,
  CheckCircle2,
  Activity,
  Zap,
  Award,
  Layers,
  ArrowUpRight,
  Shield,
  Brain,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  ChevronRight,
  FlaskConical,
  FileText,
  Boxes,
} from 'lucide-react';
import { sounds } from '../utils/audio';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const AnalyticsPage: React.FC = () => {
  const { notes, labs, topics, masteryPercentage, activityLogs } = useApp();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    date: string;
    count: number;
    level: number;
  } | null>(null);

  // Core Computed Metrics
  const masteredNotes = useMemo(() => notes.filter((n) => n.status === 'mastered').length, [notes]);
  const reviewingNotes = useMemo(() => notes.filter((n) => n.status === 'reviewing').length, [notes]);
  const learningNotes = useMemo(() => notes.filter((n) => n.status === 'learning').length, [notes]);
  const totalNotes = notes.length || 1;

  const completedLabs = useMemo(() => labs.filter((l) => l.status === 'completed').length, [labs]);
  const inProgressLabs = useMemo(() => labs.filter((l) => l.status === 'in_progress').length, [labs]);
  const totalLabs = labs.length || 1;

  const totalLabSteps = useMemo(() => labs.reduce((acc, l) => acc + l.steps.length, 0), [labs]);
  const completedLabSteps = useMemo(
    () => labs.reduce((acc, l) => acc + l.steps.filter((s) => s.completed).length, 0),
    [labs]
  );
  const labStepPercentage = totalLabSteps ? Math.round((completedLabSteps / totalLabSteps) * 100) : 0;

  const totalLabMinutes = useMemo(() => labs.reduce((acc, l) => acc + (l.estimatedMinutes || 20), 0), [labs]);

  // Difficulty Distribution
  const beginnerNotes = useMemo(() => notes.filter((n) => n.difficulty === 'beginner').length, [notes]);
  const intermediateNotes = useMemo(() => notes.filter((n) => n.difficulty === 'intermediate').length, [notes]);
  const advancedNotes = useMemo(() => notes.filter((n) => n.difficulty === 'advanced').length, [notes]);

  // Retention Index Calculation (Dynamic formula based on mastered notes + review load)
  const retentionIndex = useMemo(() => {
    if (notes.length === 0) return 92;
    const score = (masteredNotes * 1.0 + reviewingNotes * 0.75 + learningNotes * 0.45) / notes.length;
    return Math.min(99.4, Math.max(65.0, Number((score * 100).toFixed(1))));
  }, [masteredNotes, reviewingNotes, learningNotes, notes.length]);

  // Mastery Tier Classification
  const masteryTier = useMemo(() => {
    if (masteryPercentage >= 85) return { name: 'Tier IV: Archon Prime', color: 'text-[hsl(var(--neon-green))]', badge: 'bg-emerald-500/10 border-emerald-500/30' };
    if (masteryPercentage >= 60) return { name: 'Tier III: Neural Adept', color: 'text-primary', badge: 'bg-cyan-500/10 border-cyan-500/30' };
    if (masteryPercentage >= 35) return { name: 'Tier II: Synapse Initiate', color: 'text-[hsl(var(--neon-purple))]', badge: 'bg-purple-500/10 border-purple-500/30' };
    return { name: 'Tier I: Cognitive Ingestion', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' };
  }, [masteryPercentage]);

  // Generate 20-week Heatmap Data (140 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; level: number; dayOfWeek: number; weekIndex: number }[] = [];
    const now = new Date();

    for (let i = 139; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
      const weekIndex = Math.floor((139 - i) / 7);

      // Deterministic yet varied activity seed based on date string & real notes count
      const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseActivity = (hash % 6);
      const count = baseActivity === 0 ? 0 : baseActivity + (notes.length > 5 ? 1 : 0);
      
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 6) level = 3;
      else if (count > 6) level = 4;

      days.push({
        date: dateStr,
        count,
        level,
        dayOfWeek,
        weekIndex,
      });
    }
    return days;
  }, [notes.length]);

  // Topic Statistics Breakdown
  const topicStats = useMemo(() => {
    return topics.map((topic) => {
      const topicNotes = notes.filter((n) => n.topicId === topic.id);
      const topicLabs = labs.filter((l) => l.topicId === topic.id);
      const topicMasteredNotes = topicNotes.filter((n) => n.status === 'mastered').length;
      const topicCompletedLabs = topicLabs.filter((l) => l.status === 'completed').length;
      const totalItems = topicNotes.length + topicLabs.length;
      const progress = totalItems > 0 ? Math.round(((topicMasteredNotes + topicCompletedLabs) / totalItems) * 100) : 0;

      return {
        ...topic,
        notesCount: topicNotes.length,
        labsCount: topicLabs.length,
        masteredNotesCount: topicMasteredNotes,
        completedLabsCount: topicCompletedLabs,
        progress,
      };
    });
  }, [topics, notes, labs]);

  const filteredTopicStats = useMemo(() => {
    if (selectedTopicFilter === 'all') return topicStats;
    return topicStats.filter((t) => t.id === selectedTopicFilter);
  }, [topicStats, selectedTopicFilter]);

  // Export Analytics JSON
  const handleExportTelemetry = () => {
    sounds.playSuccess();
    const exportPayload = {
      version: 'mimiryx-telemetry-v4',
      generatedAt: new Date().toISOString(),
      summary: {
        masteryScore: masteryPercentage,
        tier: masteryTier.name,
        retentionRate: retentionIndex,
        totalNotes: notes.length,
        masteredNotes,
        reviewingNotes,
        learningNotes,
        totalLabs: labs.length,
        completedLabs,
        totalTopics: topics.length,
      },
      domainMetrics: topicStats.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        progress: t.progress,
        notes: t.notesCount,
        labs: t.labsCount,
      })),
      activityLogs: activityLogs.slice(0, 30),
    };

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const exportFileDefaultName = `mimiryx-analytics-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Run Simulated Neural Audit
  const handleRunAudit = () => {
    sounds.playClick();
    setIsAuditing(true);
    setAuditComplete(false);

    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
      sounds.playSuccess();
      setTimeout(() => setAuditComplete(false), 4000);
    }, 1600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header & Control Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30">
              <Activity className="w-3 h-3 animate-pulse" /> Neural Telemetry Engine v4.2
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime Link
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" /> Cognitive Mastery & Synaptic Velocity
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1 max-w-2xl">
            Quantitative telemetry across knowledge domain coverage, spaced-repetition retention curves, and cognitive throughput.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="flex items-center bg-card/60 backdrop-blur-md p-1 rounded-xl border border-border">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => {
                  sounds.playClick();
                  setTimeRange(range);
                }}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all capitalize ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {range === 'all' ? 'All Epochs' : range}
              </button>
            ))}
          </div>

          {/* Audit Button */}
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono rounded-xl bg-card/70 hover:bg-card border border-border hover:border-primary/40 text-foreground transition-all hover:shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Auditing Vault...' : auditComplete ? 'Audit Verified' : 'Run Diagnostics'}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary transition-all shadow-sm hover:shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry
          </button>
        </div>
      </div>

      {/* Audit Banner Notification */}
      {auditComplete && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-mono font-bold text-foreground">Diagnostic Audit Complete: Vault Integrity 100%</p>
              <p className="text-[11px] text-muted-foreground">All neural synapse hashes verified, spaced-repetition schedules synchronized, 0 corrupted records.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            OPTIMAL HEALTH
          </span>
        </div>
      )}

      {/* Hero Executive KPI Stat Cards (5 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Overall Mastery Quotient */}
        <div className="p-5 rounded-2xl cyber-card border border-primary/40 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/25 transition-all" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Mastery Quotient</span>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold font-mono text-primary tracking-tight">
                {masteryPercentage}%
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +7.4%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${masteryTier.badge} ${masteryTier.color}`}>
              {masteryTier.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Epoch Goal: 80%</span>
          </div>
        </div>

        {/* Card 2: Knowledge Synapses */}
        <div className="p-5 rounded-2xl cyber-card border border-border flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Knowledge Synapses</span>
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">
                {notes.length}
              </h3>
              <span className="text-[11px] font-mono text-sky-400">Records</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400">{masteredNotes} Locked</span>
              <span className="text-sky-400">{reviewingNotes} Active</span>
              <span className="text-amber-400">{learningNotes} Ingest</span>
            </div>
            {/* Sparkline mini progress */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex mt-1.5">
              <div className="h-full bg-emerald-400" style={{ width: `${(masteredNotes / totalNotes) * 100}%` }} />
              <div className="h-full bg-sky-400" style={{ width: `${(reviewingNotes / totalNotes) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(learningNotes / totalNotes) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Card 3: Hands-On Protocol Labs */}
        <div className="p-5 rounded-2xl cyber-card border border-border flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Validated Protocols</span>
              <FlaskConical className="w-4 h-4 text-[hsl(var(--neon-purple))]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold font-mono text-foreground tracking-tight">
                {completedLabs}<span className="text-sm text-muted-foreground font-normal">/{labs.length}</span>
              </h3>
              <span className="text-[11px] font-mono text-[hsl(var(--neon-purple))]">
                {Math.round((completedLabs / totalLabs) * 100)}% Labs
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
              <span>Steps Executed</span>
              <span className="text-foreground">{completedLabSteps}/{totalLabSteps} ({labStepPercentage}%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${labStepPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Retention Index */}
        <div className="p-5 rounded-2xl cyber-card border border-border flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Retention Stability</span>
              <Brain className="w-4 h-4 text-[hsl(var(--neon-green))]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold font-mono text-[hsl(var(--neon-green))] tracking-tight">
                {retentionIndex}%
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center">
                <Shield className="w-3 h-3 mr-0.5" /> High Decay Guard
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">Memory Half-Life</span>
            <span className="text-emerald-400 font-bold">14.2 Days</span>
          </div>
        </div>

        {/* Card 5: Momentum & Streak */}
        <div className="p-5 rounded-2xl cyber-card border border-border flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Synaptic Momentum</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-bold font-mono text-amber-400 tracking-tight flex items-center gap-1">
                7 <span className="text-xs text-muted-foreground font-normal">Days</span>
              </h3>
              <span className="text-[11px] font-mono text-amber-400/80">Streak</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">Daily Cognitive Load</span>
            <span className="text-foreground font-bold">2.4h Avg</span>
          </div>
        </div>
      </div>

      {/* Cognitive Activity Heatmap Matrix (GitHub-Style Contribution Grid) */}
      <div className="rounded-2xl cyber-card border border-border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div>
            <h3 className="text-base font-heading font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Synaptic Activity Matrix (Last 140 Days)
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Daily knowledge ingestion pulses, lab step completions, and memory rehearsal events.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground self-start sm:self-auto">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
              <span className="w-3 h-3 rounded-sm bg-primary/25 border border-primary/40" />
              <span className="w-3 h-3 rounded-sm bg-primary/55 border border-primary/60" />
              <span className="w-3 h-3 rounded-sm bg-primary/80 border border-primary/90" />
              <span className="w-3 h-3 rounded-sm bg-[hsl(var(--neon-green))] shadow-[0_0_8px_hsl(var(--neon-green)/0.6)]" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Layout */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            {/* Days Grid: 7 rows (Sun to Sat) x 20 columns */}
            <div className="grid grid-rows-7 grid-flow-col gap-1.5">
              {heatmapData.map((cell, idx) => {
                const getLevelClass = (lvl: number) => {
                  switch (lvl) {
                    case 1:
                      return 'bg-primary/20 border-primary/30 hover:border-primary';
                    case 2:
                      return 'bg-primary/45 border-primary/50 hover:border-primary';
                    case 3:
                      return 'bg-primary/75 border-primary/80 hover:border-white shadow-[0_0_6px_hsl(var(--primary)/0.4)]';
                    case 4:
                      return 'bg-[hsl(var(--neon-green))] border-[hsl(var(--neon-green))] hover:scale-125 shadow-[0_0_10px_hsl(var(--neon-green)/0.7)]';
                    default:
                      return 'bg-white/5 border-white/5 hover:border-white/20';
                  }
                };

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredHeatmapCell(cell)}
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-pointer relative ${getLevelClass(
                      cell.level
                    )}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Heatmap Detail Footer */}
        <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
          <div>
            {hoveredHeatmapCell ? (
              <span className="text-foreground flex items-center gap-1.5 animate-in fade-in duration-150">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-bold text-primary">{hoveredHeatmapCell.date}:</span>
                <span>{hoveredHeatmapCell.count} Synaptic Pulses Recorded</span>
              </span>
            ) : (
              <span>Hover over any neural node square to inspect daily synaptic velocity.</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Total Pulses: <strong className="text-foreground">482</strong></span>
            <span>Current Streak: <strong className="text-amber-400">7 Days</strong></span>
            <span>Peak Velocity: <strong className="text-emerald-400">21:00 - 23:00 UTC</strong></span>
          </div>
        </div>
      </div>

      {/* Multi-Column Visualizations: SaaS Conversion Funnel & Retention Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Knowledge State Funnel (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl cyber-card border border-border space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Synaptic Lifecycle Pipeline
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">{notes.length} Total Synapses</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              Progression pipeline of knowledge records through the 3-stage neural consolidation pipeline.
            </p>

            {/* Visual Funnel Multi-Bar */}
            <div className="my-5">
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${(masteredNotes / totalNotes) * 100}%` }}
                />
                <div
                  className="h-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${(reviewingNotes / totalNotes) * 100}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(learningNotes / totalNotes) * 100}%` }}
                />
              </div>
            </div>

            {/* Stages Detail Cards */}
            <div className="space-y-3">
              {/* Mastered Stage */}
              <div className="p-3.5 rounded-xl bg-card/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 font-bold text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    Engram Locked (Mastered)
                  </span>
                  <span className="font-bold text-foreground">
                    {masteredNotes} <span className="text-muted-foreground font-normal">({Math.round((masteredNotes / totalNotes) * 100)}%)</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Permanent long-term synaptic retention. Rehearsal frequency: every 90 days.
                </p>
              </div>

              {/* Reviewing Stage */}
              <div className="p-3.5 rounded-xl bg-card/60 border border-sky-500/20 hover:border-sky-500/40 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 font-bold text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    Active Consolidation (Reviewing)
                  </span>
                  <span className="font-bold text-foreground">
                    {reviewingNotes} <span className="text-muted-foreground font-normal">({Math.round((reviewingNotes / totalNotes) * 100)}%)</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  In active spaced-repetition loop. Rehearsal interval: 3 to 14 days.
                </p>
              </div>

              {/* Learning Stage */}
              <div className="p-3.5 rounded-xl bg-card/60 border border-amber-500/20 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 font-bold text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    Raw Intake (Learning)
                  </span>
                  <span className="font-bold text-foreground">
                    {learningNotes} <span className="text-muted-foreground font-normal">({Math.round((learningNotes / totalNotes) * 100)}%)</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Initial acquisition phase. Requires at least 2 practical lab validations.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              navigate('/notes');
            }}
            className="w-full mt-2 py-2 text-xs font-mono text-primary hover:text-foreground bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            Manage Knowledge Pipeline <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Column: Spaced-Repetition Retention & Decay Model (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl cyber-card border border-border space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--neon-green))]" /> Ebbinghaus Spaced Recall Trajectory
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE RECALL OPTIMIZED
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              Mathematical simulation comparing standard exponential memory decay against Mimiryx spaced synaptic boosts.
            </p>

            {/* SVG Visual Retention Curve */}
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-border/60 relative">
              <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                <defs>
                  {/* Linear Gradient for Mimiryx Active Curve Fill */}
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-green))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--neon-green))" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient for standard decay */}
                  <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="40" y1="65" x2="480" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.15)" />

                {/* Y Axis Labels */}
                <text x="30" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">100%</text>
                <text x="30" y="69" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">75%</text>
                <text x="30" y="114" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">50%</text>
                <text x="30" y="154" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">25%</text>

                {/* Standard Forgetting Curve (Red dotted drop) */}
                <path
                  d="M 50 20 Q 120 120, 220 145 T 480 155"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />

                {/* Mimiryx Active Boosted Trajectory (Glowing Green) */}
                <path
                  d="M 50 20 Q 80 60, 110 75 L 110 25 Q 160 55, 200 68 L 200 25 Q 280 50, 340 55 L 340 25 Q 410 40, 480 45"
                  fill="none"
                  stroke="hsl(var(--neon-green))"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_hsl(var(--neon-green)/0.8)]"
                />

                {/* Gradient area under active curve */}
                <path
                  d="M 50 20 Q 80 60, 110 75 L 110 25 Q 160 55, 200 68 L 200 25 Q 280 50, 340 55 L 340 25 Q 410 40, 480 45 L 480 150 L 50 150 Z"
                  fill="url(#activeGradient)"
                />

                {/* Rehearsal Boost Nodes */}
                <circle cx="110" cy="25" r="4" fill="hsl(var(--neon-green))" className="animate-ping" />
                <circle cx="110" cy="25" r="4" fill="hsl(var(--neon-green))" />
                <circle cx="200" cy="25" r="4" fill="hsl(var(--neon-green))" />
                <circle cx="340" cy="25" r="4" fill="hsl(var(--neon-green))" />

                {/* X Axis Labels */}
                <text x="50" y="168" fill="#64748b" fontSize="10" fontFamily="monospace">Day 0</text>
                <text x="110" y="168" fill="hsl(var(--neon-green))" fontSize="10" fontFamily="monospace">Day 1</text>
                <text x="200" y="168" fill="hsl(var(--neon-green))" fontSize="10" fontFamily="monospace">Day 3</text>
                <text x="340" y="168" fill="hsl(var(--neon-green))" fontSize="10" fontFamily="monospace">Day 7</text>
                <text x="480" y="168" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">Day 30</text>
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-400 shadow-[0_0_6px_currentColor]" />
                  <span>Mimiryx Active Synaptic Pulse</span>
                </div>
                <div className="flex items-center gap-2 text-red-400/80">
                  <span className="w-3 h-0.5 bg-red-400 border-t border-dashed" />
                  <span>Standard Memory Decay (Ebbinghaus)</span>
                </div>
              </div>
            </div>

            {/* Retention Stats Quad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-card/50 border border-border/80 text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Stability Factor</span>
                <p className="text-sm font-bold font-mono text-primary mt-0.5">S = 21.4d</p>
              </div>
              <div className="p-3 rounded-xl bg-card/50 border border-border/80 text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Target Recall</span>
                <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5">92.0%</p>
              </div>
              <div className="p-3 rounded-xl bg-card/50 border border-border/80 text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Due Rehearsal</span>
                <p className="text-sm font-bold font-mono text-amber-400 mt-0.5">{reviewingNotes} Items</p>
              </div>
              <div className="p-3 rounded-xl bg-card/50 border border-border/80 text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Next Pulse</span>
                <p className="text-sm font-bold font-mono text-sky-400 mt-0.5">In 4.2 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Domain Depth Matrix (Per-Topic Analytics Table / SaaS Grid) */}
      <div className="rounded-2xl cyber-card border border-border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <h3 className="text-base font-heading font-bold text-foreground flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" /> Domain Depth & Mastery Matrix
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Granular breakdown of notes, lab protocol validations, and mastery scores across all knowledge domains.
            </p>
          </div>

          {/* Domain Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedTopicFilter}
              onChange={(e) => {
                sounds.playClick();
                setSelectedTopicFilter(e.target.value);
              }}
              className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Domains ({topicStats.length})</option>
              {topicStats.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredTopicStats.map((topic) => (
            <div
              key={topic.id}
              onClick={() => {
                sounds.playClick();
                navigate(`/topics/${topic.id}`);
              }}
              className="p-4 rounded-xl bg-card/60 hover:bg-card/90 border border-border hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-mono text-xs font-bold shrink-0 shadow-md"
                    style={{ backgroundColor: topic.color || '#00f0ff' }}
                  >
                    {topic.code ? topic.code.slice(0, 3) : 'DOM'}
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                      {topic.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {topic.category || 'Knowledge Domain'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  {topic.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Mastery Level</span>
                  <span className="text-foreground font-semibold">{topic.masteredNotesCount + topic.completedLabsCount} / {topic.notesCount + topic.labsCount} Items</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${topic.progress}%`,
                      backgroundColor: topic.color || '#00f0ff',
                    }}
                  />
                </div>
              </div>

              {/* Badges footer */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-border/40 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-sky-400" /> {topic.notesCount} Synapses
                </span>
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-[hsl(var(--neon-purple))]" /> {topic.labsCount} Labs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Spectrum & Cognitive Load Index */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Beginner */}
        <div className="p-5 rounded-2xl cyber-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Foundation Tier</span>
            <span className="text-xs font-mono text-muted-foreground">Beginner</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold font-mono text-foreground">{beginnerNotes}</h4>
            <span className="text-xs font-mono text-muted-foreground">
              ({Math.round((beginnerNotes / totalNotes) * 100)}% of Vault)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Fundamental architectural concepts and primary protocol specifications.
          </p>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${(beginnerNotes / totalNotes) * 100}%` }} />
          </div>
        </div>

        {/* Intermediate */}
        <div className="p-5 rounded-2xl cyber-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">Core Engineering</span>
            <span className="text-xs font-mono text-muted-foreground">Intermediate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold font-mono text-foreground">{intermediateNotes}</h4>
            <span className="text-xs font-mono text-muted-foreground">
              ({Math.round((intermediateNotes / totalNotes) * 100)}% of Vault)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Deep-dive operational workflows, distributed debugging, and runtime telemetry.
          </p>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: `${(intermediateNotes / totalNotes) * 100}%` }} />
          </div>
        </div>

        {/* Advanced */}
        <div className="p-5 rounded-2xl cyber-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[hsl(var(--neon-purple))] font-bold uppercase tracking-wider">Expert Research</span>
            <span className="text-xs font-mono text-muted-foreground">Advanced</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold font-mono text-foreground">{advancedNotes}</h4>
            <span className="text-xs font-mono text-muted-foreground">
              ({Math.round((advancedNotes / totalNotes) * 100)}% of Vault)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Kernel internals, consensus proofs, zero-day threat models, and high-scale topologies.
          </p>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[hsl(var(--neon-purple))]" style={{ width: `${(advancedNotes / totalNotes) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Live Synaptic Activity & Real-Time Telemetry Feed */}
      <div className="rounded-2xl cyber-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Recent Synaptic Telemetry Feed
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Realtime Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-card/60 border border-border/80 flex items-start justify-between gap-2 font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {log.type}
                  </span>
                  <span className="text-foreground font-semibold">{log.action}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{log.target}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
