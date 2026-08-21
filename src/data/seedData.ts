import { Topic, Note, Lab, BoardCard, SystemMetric } from '../types';

export const SEED_TOPICS: Topic[] = [
  {
    id: 'topic-yggdrasil',
    name: 'Yggdrasil Infra Root',
    code: 'INFRA-01',
    description: 'The architectural backbone: Linux kernel primitives, container runtimes, and system virtualization.',
    icon: 'Layers',
    color: 'var(--neon-blue)',
    category: 'Core Infrastructure',
    order: 1,
  },
  {
    id: 'topic-mimir',
    name: 'Mimir Knowledge Engine',
    code: 'AI-02',
    description: 'Large language model inference pipelines, vector embeddings, RAG architectures, and memory weights.',
    icon: 'Brain',
    color: 'var(--neon-green)',
    category: 'Machine Intelligence',
    order: 2,
  },
  {
    id: 'topic-bifrost',
    name: 'Bifrost Networking',
    code: 'NET-03',
    description: 'eBPF telemetry, service mesh traffic control, SDN overlay networks, and gRPC multiplexing.',
    icon: 'Radio',
    color: 'var(--neon-purple)',
    category: 'Distributed Systems',
    order: 3,
  },
  {
    id: 'topic-valhalla',
    name: 'Valhalla Cloud Orchestration',
    code: 'CLOUD-04',
    description: 'Kubernetes control plane, auto-scaling operator patterns, and cloud-native resilience paradigms.',
    icon: 'Server',
    color: 'var(--neon-amber)',
    category: 'Cloud Engineering',
    order: 4,
  },
  {
    id: 'topic-asgard',
    name: 'Asgard Security & Zero-Trust',
    code: 'SEC-05',
    description: 'Cryptographic identity protocols, mTLS attestation, supply chain signing, and IAM boundaries.',
    icon: 'Shield',
    color: '#f43f5e',
    category: 'Cyber Defense',
    order: 5,
  }
];

export const SEED_NOTES: Note[] = [
  {
    id: 'note-ebpf-telemetry',
    topicId: 'topic-bifrost',
    title: 'eBPF Kernel Probing & Deep Packet Telemetry',
    summary: 'How eBPF executes bytecode directly inside the Linux kernel without modifying source or loading modules.',
    content: `# eBPF Deep Dive & Packet Observation

eBPF (Extended Berkeley Packet Filter) allows developers to run sandboxed mini-programs inside the Linux kernel without altering kernel code or rebooting.

### Key Capabilities
- Zero-overhead observability: Hook into socket buffers and syscalls.
- High-performance networking: XDP enables packet manipulation before sk_buff allocation.
- Kprobes & Tracepoints: Dynamic instrumentation on function entry and exit.

\`\`\`c
SEC("tracepoint/syscalls/sys_enter_execve")
int trace_execve(struct trace_event_raw_sys_enter *ctx) {
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));
    bpf_printk("Executing command: %s", comm);
    return 0;
}
\`\`\`

### Verification Checkpoints
1. Ensure CONFIG_BPF=y in your running kernel.
2. Use bpftool prog list to inspect active JIT-compiled bytecode.`,
    tags: ['eBPF', 'Linux Kernel', 'Networking', 'Observability'],
    status: 'mastered',
    difficulty: 'advanced',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-k8s-crd',
    topicId: 'topic-valhalla',
    title: 'Custom Resource Definitions & Operator Reconcile Loop',
    summary: 'Building state reconciliation loops in Kubernetes using Controller-Runtime and declarative APIs.',
    content: `# Kubernetes Operators & The Reconcile Pattern

Operators encode operational domain knowledge into declarative software controllers.

### The Reconcile Loop
The controller constantly observes the current cluster state and performs mutations until it matches the desired spec.

\`\`\`go
func (r *DatabaseReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    var db customv1.Database
    if err := r.Get(ctx, req.NamespacedName, &db); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    return ctrl.Result{RequeueAfter: time.Minute * 5}, nil
}
\`\`\`

### Best Practices
- Keep reconcilers idempotent.
- Use Leader Election for high-availability controllers.`,
    tags: ['Kubernetes', 'Operators', 'Go', 'Cloud Native'],
    status: 'learning',
    difficulty: 'intermediate',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-rag-vector',
    topicId: 'topic-mimir',
    title: 'Hierarchical RAG & Vector Chunk Embeddings',
    summary: 'Techniques for parent-child retrieval and semantic dense embedding search using cosine distance.',
    content: `# Neural Knowledge Retrieval: Hierarchical RAG

Retrieval-Augmented Generation bridges static LLM weights with live organizational knowledge bases.

### Processing Pipeline
1. Document Chunking: Split text into semantic sections.
2. Dense Vector Embeddings: Pass chunks into embedding models.
3. Similarity Search: Calculate HNSW index nearest neighbors.

\`\`\`python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["Neural query", "Document context"])
similarity = np.dot(embeddings[0], embeddings[1])
\`\`\`
`,
    tags: ['AI', 'RAG', 'Vector Search', 'Embeddings'],
    status: 'reviewing',
    difficulty: 'intermediate',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-cgroups-v2',
    topicId: 'topic-yggdrasil',
    title: 'Linux cgroups v2 Memory & CPU Enforcement',
    summary: 'Unified hierarchy resource control underpinning modern container runtimes.',
    content: `# Linux cgroups v2 Architecture

cgroups v2 replaces legacy multi-hierarchy models with a unified hierarchy tree.

### Core Controllers
- memory.max: Ceiling triggering OOM killer when exceeded.
- cpu.weight: Proportional CPU share bandwidth.
- io.weight: Block I/O scheduler prioritization.
`,
    tags: ['cgroups', 'Linux', 'Containers', 'Memory'],
    status: 'learning',
    difficulty: 'beginner',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SEED_LABS: Lab[] = [
  {
    id: 'lab-mesh-routing',
    topicId: 'topic-bifrost',
    title: 'Lab 01: Service Mesh Traffic Shaping & Canary Deployment',
    description: 'Deploy an Envoy-based proxy and apply weighted routing rules to split traffic 80/20 between v1 and v2 workloads.',
    difficulty: 'intermediate',
    status: 'in_progress',
    estimatedMinutes: 25,
    steps: [
      {
        id: 'step-1',
        title: 'Inspect Target Service Endpoints',
        instruction: 'Execute the cluster service lookup to confirm both workload versions are ready.',
        expectedCommand: 'kubectl get pods -l app=mimir-core',
        simulatedOutput: 'NAME                          READY   STATUS    RESTARTS   AGE\nmimir-core-v1-7d94cf-x8q1    1/1     Running   0          4m\nmimir-core-v2-5c82fe-9k2l    1/1     Running   0          1m',
        hint: 'Use kubectl to query pods with the app label filter.',
        completed: true
      },
      {
        id: 'step-2',
        title: 'Apply Canary VirtualService Rule',
        instruction: 'Configure the routing rule to send 80% of requests to v1 and 20% of traffic to v2.',
        expectedCommand: 'kubectl apply -f canary-route.yaml',
        simulatedOutput: 'virtualservice.networking.istio.io/mimir-core-route configured\ndestinationrule.networking.istio.io/mimir-core-subsets configured',
        hint: 'Apply the declarative manifest using kubectl apply -f.',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Verify HTTP Traffic Distribution',
        instruction: 'Simulate 10 continuous curl requests to verify response header version tags.',
        expectedCommand: 'for i in {1..10}; do curl -s http://bifrost.mesh/version; done',
        simulatedOutput: 'v1\nv1\nv1\nv2\nv1\nv1\nv2\nv1\nv1\nv1\n[OK] 80% v1 / 20% v2 ratio verified successfully.',
        hint: 'Run a bash loop sending requests to the mesh gateway.',
        completed: false
      }
    ]
  },
  {
    id: 'lab-vector-index',
    topicId: 'topic-mimir',
    title: 'Lab 02: Building an In-Memory Vector Index & Semantic Probe',
    description: 'Construct a cosine similarity search index and benchmark nearest-neighbor latency across 5,000 synthetic embeddings.',
    difficulty: 'advanced',
    status: 'not_started',
    estimatedMinutes: 30,
    steps: [
      {
        id: 'step-1',
        title: 'Initialize Vector Store Schema',
        instruction: 'Generate the embedding collection with dimension size 384 and metric cosine.',
        expectedCommand: 'python init_index.py --dim 384 --metric cosine',
        simulatedOutput: '[SUCCESS] Initialized collection "mimir_knowledge_v1" (dim=384, metric=cosine)',
        hint: 'Run the initialization script with dimension and metric parameters.',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Ingest Topic Notes into Index',
        instruction: 'Embed and push all active markdown knowledge notes into the vector index.',
        expectedCommand: 'python ingest_notes.py --batch-size 32',
        simulatedOutput: 'Indexed 4 documents (42 chunks) in 284ms. Index state: SYNCED',
        hint: 'Execute the batch ingestion utility.',
        completed: false
      }
    ]
  }
];

export const SEED_BOARD_CARDS: BoardCard[] = [
  {
    id: 'card-1',
    title: 'Implement eBPF Socket Filter',
    description: 'Write a prototype C program to intercept TCP SYN packets.',
    column: 'in_progress',
    topicId: 'topic-bifrost',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'card-2',
    title: 'Study Kubernetes CNI Spec',
    description: 'Review Calico vs Cilium architecture comparison notes.',
    column: 'backlog',
    topicId: 'topic-valhalla',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'card-3',
    title: 'Vector Embedding Benchmark',
    description: 'Compare HNSW indexing latency against Flat IP search.',
    column: 'review',
    topicId: 'topic-mimir',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'card-4',
    title: 'Linux Namespaces & Isolation',
    description: 'Completed hands-on unshare and mount namespace exploration.',
    column: 'mastered',
    topicId: 'topic-yggdrasil',
    priority: 'low',
    createdAt: new Date().toISOString(),
  }
];

export const SEED_METRICS: SystemMetric[] = [
  { id: 'm-1', name: 'Neural Synapse Load', value: 34.2, unit: '%', status: 'optimal', trend: 'stable' },
  { id: 'm-2', name: 'Knowledge Graph Density', value: 89.6, unit: 'pts', status: 'optimal', trend: 'up' },
  { id: 'm-3', name: 'Vector Query Latency', value: 4.8, unit: 'ms', status: 'optimal', trend: 'down' },
  { id: 'm-4', name: 'Lab Sandbox Memory', value: 1.4, unit: 'GB', status: 'optimal', trend: 'stable' },
];
