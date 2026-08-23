import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Server } from 'lucide-react';

export const MonitorPage: React.FC = () => {
  const { metrics, activityLogs } = useApp();
  const [logs, setLogs] = useState<string[]>([
    'SYNAPSE-ROOT-01: Heartbeat acknowledged (RTT 0.42ms)',
    'EBPF-TELEMETRY: Socket buffer filters active across 4 nodes',
    'VECTOR-INDEX-CLUSTER: Index health 100% (density 0.94)',
    'ROUTING-GATEWAY: Envoy proxy mesh operational',
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const msgs = [
        'K8S-RECONCILER: 0 drift detected in custom operator',
        'SYNAPSE-ROOT-01: Cache synchronization complete',
        'AUTH-ZERO-TRUST: mTLS certificates renewed automatically',
        'NEURAL-GATEWAY: Ingested 128 telemetry records'
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [`${new Date().toLocaleTimeString()}: ${randomMsg}`, ...prev.slice(0, 15)]);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Real-Time Neural & System Monitor
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Live cluster telemetry, latency metrics, memory pools, and kernel events.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl cyber-card border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{m.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="my-3">
              <h3 className="text-3xl font-bold font-mono text-foreground">
                {m.value}<span className="text-xs text-primary font-normal ml-1">{m.unit}</span>
              </h3>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, m.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Real Time Log Terminal */}
      <div className="rounded-2xl cyber-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" /> Live Kernel & Synapse Telemetry Stream
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            STREAMING LIVE
          </span>
        </div>

        <div className="bg-black/90 p-4 rounded-xl font-mono text-xs text-emerald-400/90 h-64 overflow-y-auto space-y-2 border border-border/50">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary font-bold">{'>'}</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
