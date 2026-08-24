import React, { useState, useEffect } from 'react';
import { X, Activity, Database, Zap, Clock, ShieldAlert, BarChart3, HardDrive } from 'lucide-react';
import { sounds } from '../utils/audio';
import { getAllJobs, getAllKeyUsages, AIJob, AIKeyUsage } from '../db/aiJobsStore';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [usages, setUsages] = useState<AIKeyUsage[]>([]);
  
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    cacheHits: 0,
    cacheHitRate: 0,
    totalTokens: 0,
    totalRequests: 0,
    avgTime: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = async () => {
    const allJobs = await getAllJobs();
    const allUsages = await getAllKeyUsages();
    
    setJobs(allJobs);
    setUsages(allUsages);
    
    let completed = 0;
    let failed = 0;
    let hits = 0;
    let totalTime = 0;
    let timedJobs = 0;
    
    for (const job of allJobs) {
      if (job.status === 'COMPLETED' || job.status === 'AWAITING_REVIEW') completed++;
      if (job.status === 'DEAD_LETTER') failed++;
      if (job.isCacheHit) hits++;
      
      if ((job.status === 'COMPLETED' || job.status === 'AWAITING_REVIEW') && job.completedAt && !job.isCacheHit) {
        totalTime += (job.completedAt - job.createdAt);
        timedJobs++;
      }
    }
    
    let tokens = 0;
    let reqs = 0;
    for (const u of allUsages) {
      tokens += u.tokensToday || 0; // Using a mock or real tokens if tracked
      reqs += u.requestsToday || 0;
    }

    setMetrics({
      totalJobs: allJobs.length,
      completedJobs: completed,
      failedJobs: failed,
      cacheHits: hits,
      cacheHitRate: allJobs.length > 0 ? (hits / allJobs.length) * 100 : 0,
      totalTokens: tokens,
      totalRequests: reqs,
      avgTime: timedJobs > 0 ? (totalTime / timedJobs) / 1000 : 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-primary/30 rounded-2xl w-full max-w-2xl cyber-card shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="flex items-center justify-between p-4 border-b border-border/70 bg-black/40">
          <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Pipeline Telemetry
          </h3>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{metrics.totalJobs}</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">{metrics.completedJobs} Completed</p>
            </div>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono uppercase">Cache Rate</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{metrics.cacheHitRate.toFixed(1)}%</p>
              <p className="text-[10px] text-amber-400/70 font-mono mt-1">{metrics.cacheHits} Hits</p>
            </div>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono uppercase">API Requests</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{metrics.totalRequests}</p>
              <p className="text-[10px] text-purple-400/70 font-mono mt-1">Across all keys</p>
            </div>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono uppercase">Avg Speed</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{metrics.avgTime.toFixed(1)}s</p>
              <p className="text-[10px] text-blue-400/70 font-mono mt-1">Per unique topic</p>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-mono text-primary mb-3 uppercase flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Local Key Pool Health
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {usages.length === 0 && <p className="text-xs text-muted-foreground font-mono">No keys tracked yet.</p>}
                {usages.map((u, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 p-2 rounded-lg text-xs font-mono">
                    <span className="text-white">{u.keyHash}</span>
                    {u.status === 'ACTIVE' ? (
                      <span className="text-emerald-400">ACTIVE ({u.requestsToday} req)</span>
                    ) : u.status === 'COOLDOWN' ? (
                      <span className="text-amber-400">COOLDOWN</span>
                    ) : (
                      <span className="text-red-400">DEPLETED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-red-400 mb-3 uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Recent Pipeline Failures
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {metrics.failedJobs === 0 && <p className="text-xs text-muted-foreground font-mono">Zero failures detected.</p>}
                {jobs.filter(j => j.status === 'DEAD_LETTER').slice(0, 5).map(j => (
                  <div key={j.id} className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-xs font-mono">
                    <p className="text-white font-bold truncate">{j.topic}</p>
                    <p className="text-red-400/80 truncate text-[10px] mt-1">{j.lastError || 'Unknown Error'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
