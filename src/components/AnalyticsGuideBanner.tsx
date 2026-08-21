import React, { useState, useEffect } from 'react';
import { Info, X, Activity, Layers, Zap } from 'lucide-react';
import { sounds } from '../utils/audio';

export const AnalyticsGuideBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('mimiryx:hide_analytics_guide');
    if (!hidden) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    sounds.playClick();
    setIsVisible(false);
    localStorage.setItem('mimiryx:hide_analytics_guide', 'true');
  };

  return (
    <div className="relative mb-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/30 cyber-card shadow-2xl p-4 lg:p-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-primary/20 text-primary rounded-lg">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground mb-1 font-heading tracking-wide">
              Welcome to the Neural Dashboard
            </h2>
            <p className="text-xs text-muted-foreground mb-4 max-w-3xl">
              This dashboard monitors the health and density of your knowledge graph. Here is a quick guide to understanding your telemetry metrics:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--neon-green))]">
                  <Activity className="w-3.5 h-3.5" /> Deep Work
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Measures your unbroken, continuous time spent writing notes and completing labs without context switching.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--neon-purple))]">
                  <Layers className="w-3.5 h-3.5" /> Neural Links
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The total density of connections between topics. Higher density means your knowledge graph is highly interconnected.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--neon-amber))]">
                  <Zap className="w-3.5 h-3.5" /> Avg Pulse
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The energetic "frequency" of your system based on recent study activity and topic mastery rates.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors group"
          title="Dismiss Forever"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
