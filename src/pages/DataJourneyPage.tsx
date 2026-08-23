import React from 'react';
import { Compass, Layers, Brain, Radio, Server, Shield } from 'lucide-react';

const JOURNEY_STAGES = [
  {
    step: '01',
    title: 'Norse Wisdom & Foundational Principles',
    desc: 'Ancient conceptual roots of memory (Mimir) and structural interconnectedness (Yggdrasil).',
    icon: Brain,
    color: 'text-primary'
  },
  {
    step: '02',
    title: 'Linux Kernel & Primitive Virtualization',
    desc: 'Namespaces, cgroups v2, and low-level syscalls building sandbox isolation.',
    icon: Layers,
    color: 'text-[hsl(var(--neon-green))]'
  },
  {
    step: '03',
    title: 'Distributed Mesh & Telemetry',
    desc: 'eBPF probes, gRPC transport, and service mesh traffic shaping.',
    icon: Radio,
    color: 'text-[hsl(var(--neon-purple))]'
  },
  {
    step: '04',
    title: 'Cloud Native Orchestration',
    desc: 'Declarative Kubernetes controllers, operator reconcile loops, and automated resilience.',
    icon: Server,
    color: 'text-[hsl(var(--neon-amber))]'
  },
  {
    step: '05',
    title: 'Neural Vectors & Machine Intelligence',
    desc: 'Vector chunk embeddings, cosine nearest-neighbor search, and autonomous LLM agents.',
    icon: Shield,
    color: 'text-rose-400'
  }
];

export const DataJourneyPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Compass className="w-6 h-6 text-primary" /> Concept Flow & Data Journey
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          The evolutionary pathway connecting foundational infrastructure to distributed AI networks.
        </p>
      </div>

      <div className="space-y-4">
        {JOURNEY_STAGES.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl cyber-card border border-border flex items-start gap-5 group hover:border-primary/50 transition-all"
            >
              <div className="text-2xl font-bold font-mono text-primary/40 group-hover:text-primary transition-colors">
                {s.step}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${s.color}`} /> {s.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-1.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
