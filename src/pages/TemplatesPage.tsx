import React from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/audio';

const TEMPLATES = [
  {
    id: 'tmpl-k8s',
    title: 'Kubernetes CRD Operator Spec',
    summary: 'Comprehensive template for declarative controller design and reconcile state loops.',
    content: `# Kubernetes CRD & Controller Specification\n\n### API Group & Version\n\`\`\`yaml\napiVersion: infra.mimiryx.io/v1alpha1\nkind: ClusterNodePool\nmetadata:\n  name: production-nodes\nspec:\n  replicas: 5\n  instanceType: e2-standard-4\n\`\`\`\n\n### Reconcile Invariants\n1. Verify cloud provider quota before provisioning.\n2. Apply zero-downtime rolling node upgrade policy.`,
    tags: ['Kubernetes', 'Operator', 'CRD']
  },
  {
    id: 'tmpl-ebpf',
    title: 'eBPF TC & Socket Probe Program',
    summary: 'C skeleton for TC (Traffic Control) packet filtering and map buffer inspection.',
    content: `# eBPF Traffic Filter Program\n\n\`\`\`c\n#include <linux/bpf.h>\n#include <bpf/bpf_helpers.h>\n\nSEC("tc")\nint handle_ingress(struct __sk_buff *skb) {\n    // Inspect IP header\n    return BPF_OK;\n}\n\nchar _license[] SEC("license") = "GPL";\n\`\`\``,
    tags: ['eBPF', 'C', 'Networking']
  },
  {
    id: 'tmpl-rag',
    title: 'Hierarchical RAG Pipeline Architecture',
    summary: 'Design document for embedding generation, metadata filtering, and re-ranking.',
    content: `# Hierarchical RAG Design Spec\n\n### Components\n1. Document Parser & Chunker (512 token windows)\n2. Sentence Transformers Vectorizer\n3. Cosine HNSW Similarity Index\n4. Cross-Encoder Re-ranker`,
    tags: ['AI', 'RAG', 'Vector']
  }
];

export const TemplatesPage: React.FC = () => {
  const { addNote, topics } = useApp();
  const navigate = useNavigate();

  const handleUseTemplate = (tmpl: typeof TEMPLATES[0]) => {
    sounds.playSuccess();
    const newNote = addNote({
      title: tmpl.title,
      summary: tmpl.summary,
      content: tmpl.content,
      topicId: topics[0]?.id || '',
      difficulty: 'intermediate',
      status: 'learning',
      tags: tmpl.tags,
    });
    navigate(`/notes/${newNote.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Copy className="w-6 h-6 text-primary" /> Starter Knowledge Templates
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          One-click reusable templates for architecture blueprints, eBPF programs, and RAG pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-2xl cyber-card border border-border flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base font-heading font-bold text-foreground">
                {tmpl.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {tmpl.summary}
              </p>
              <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                {tmpl.tags.map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-primary">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleUseTemplate(tmpl)}
              className="mt-6 w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
