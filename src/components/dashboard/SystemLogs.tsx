import React, { useEffect, useState } from 'react';
import { Terminal, Cpu } from 'lucide-react';

export const SystemLogs: React.FC = () => {
  const [liveLogs, setLiveLogs] = useState<string[]>([
    'System initialized.',
    'Neural pathways connected.',
    'Waiting for user input...'
  ]);

  useEffect(() => {
    const msgs = [
      'Scanning mem-cache...',
      'Optimizing fractal rendering...',
      'Syncing local storage...',
      'Processing new telemetry...'
    ];
    const timer = setInterval(() => {
      setLiveLogs(prev => {
        const next = [...prev, msgs[Math.floor(Math.random() * msgs.length)]];
        if (next.length > 50) next.shift();
        return next;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Terminal className="w-3 h-3" /> System Logs
        </span>
      </div>
      <div className="p-2.5 rounded-xl bg-black/40 border border-primary/20 flex gap-3">
        <div className="flex flex-col items-center gap-1 mt-0.5">
          <Cpu className="w-4 h-4 text-primary animate-pulse" />
          <div className="w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
        </div>
        <div className="font-mono text-[10px] text-emerald-400/90 h-24 overflow-y-auto space-y-1 pr-1 w-full custom-scrollbar">
          {liveLogs.map((log, idx) => (
            <div key={idx} className="truncate">
              <span className="text-primary font-bold mr-1">{'>'}</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
