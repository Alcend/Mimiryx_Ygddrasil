import { Topic, Note } from '../../types';

export interface YggdrasilFiber {
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  color: string;
  speed: number;
  offset: number;
}

export interface YggdrasilBranch {
  id: string;
  parentId?: string;
  level: number; // 1 = major bough, 2 = secondary, 3 = tertiary twig
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  color: string;
  pulseOffset: number;
  domainId?: string;
  title?: string;
}

export interface YggdrasilLeaf {
  id: string;
  branchId: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  status: 'learning' | 'reviewing' | 'mastered';
  mastery: number;
  title: string;
  category: string;
  noteId?: string;
  topicId?: string;
  description?: string;
  tags?: string[];
  pulsePhase: number;
}

export interface YggdrasilRoot {
  id: string;
  title: string;
  category: string;
  description: string;
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  color: string;
  pulseOffset: number;
  subRoots: Array<{
    p0: { x: number; y: number };
    cp1: { x: number; y: number };
    cp2: { x: number; y: number };
    p1: { x: number; y: number };
    width: number;
  }>;
}

export interface YggdrasilRune {
  char: string;
  x: number;
  y: number;
  alpha: number;
  scale: number;
  driftPhase: number;
}

export interface YggdrasilTreeModel {
  trunkFibers: YggdrasilFiber[];
  roots: YggdrasilRoot[];
  branches: YggdrasilBranch[];
  leaves: YggdrasilLeaf[];
  runes: YggdrasilRune[];
  stats: {
    learning: number;
    reviewing: number;
    mastered: number;
    total: number;
    growthPercentage: number;
  };
}

const RUNES_LIST = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

const FOUNDATION_ROOTS = [
  { id: 'fnd-math', title: 'Mathematics & Formal Logic', category: 'Foundation', description: 'Discrete mathematics, boolean algebra, probability theory, and algorithmic complexity.' },
  { id: 'fnd-cs', title: 'Computer Science Core', category: 'Foundation', description: 'Data structures, computational theory, compiler design, and memory models.' },
  { id: 'fnd-systems', title: 'Systems & Hardware Architecture', category: 'Foundation', description: 'CPU registers, caching hierarchies, kernel primitives, and memory buses.' },
  { id: 'fnd-crypto', title: 'Information Theory & Cryptography', category: 'Foundation', description: 'Shannon entropy, public-key primitives, hash trees, and zero-trust attestation.' },
  { id: 'fnd-networks', title: 'Distributed Systems & Network Physics', category: 'Foundation', description: 'CAP theorem, consensus algorithms, latency bounds, and packet switching.' },
];

export function generateYggdrasilTree(
  topics: Topic[],
  notes: Note[],
  syntheticCount: number = 0
): YggdrasilTreeModel {
  // 1. GENERATE MASSIVE MULTI-FIBER COLUMNAR TRUNK
  const trunkFibers: YggdrasilFiber[] = [];
  const trunkBaseY = 90;
  const trunkTopY = -270;
  const fiberCount = 36;

  for (let i = 0; i < fiberCount; i++) {
    const norm = (i / (fiberCount - 1)) - 0.5; // -0.5 to +0.5
    // Base flare is wider (width ~100px), tapering to ~50px at top bough junction
    const baseX = norm * 96;
    const topX = norm * 48;
    // Organic wave variation
    const wave1 = Math.sin(i * 0.4) * 8;
    const wave2 = Math.cos(i * 0.5) * 6;

    trunkFibers.push({
      p0: { x: baseX, y: trunkBaseY },
      cp1: { x: baseX * 0.7 + wave1, y: -40 },
      cp2: { x: topX * 1.1 - wave2, y: -160 },
      p1: { x: topX, y: trunkTopY },
      width: Math.abs(norm) < 0.25 ? 3.0 : 1.8,
      color: Math.abs(norm) < 0.2 ? '#00f0ff' : 'rgba(0, 240, 255, 0.55)',
      speed: 1.0 + (i % 3) * 0.3,
      offset: i * 0.08,
    });
  }

  // 2. GENERATE EXPANSIVE ORGANIC ROOTS (UNDERGROUND NETWORK)
  const roots: YggdrasilRoot[] = [];
  FOUNDATION_ROOTS.forEach((fnd, idx) => {
    const fraction = (idx / (FOUNDATION_ROOTS.length - 1)) - 0.5; // -0.5 to +0.5
    const rootSpreadX = fraction * 720;
    const rootDepthY = 220 + Math.abs(fraction) * 160 + (idx % 2 === 0 ? 40 : 0);
    const startX = fraction * 80;

    const mainRoot: YggdrasilRoot = {
      id: fnd.id,
      title: fnd.title,
      category: fnd.category,
      description: fnd.description,
      p0: { x: startX, y: trunkBaseY },
      cp1: { x: startX + fraction * 120, y: trunkBaseY + 70 },
      cp2: { x: rootSpreadX * 0.7, y: rootDepthY * 0.75 },
      p1: { x: rootSpreadX, y: rootDepthY },
      width: 7.0,
      color: '#00ff88',
      pulseOffset: idx * 0.25,
      subRoots: [
        {
          p0: { x: rootSpreadX * 0.6, y: rootDepthY * 0.65 },
          cp1: { x: rootSpreadX * 0.8, y: rootDepthY * 0.85 },
          cp2: { x: rootSpreadX * 1.15, y: rootDepthY + 40 },
          p1: { x: rootSpreadX * 1.25, y: rootDepthY + 75 },
          width: 3.5,
        },
        {
          p0: { x: rootSpreadX * 0.4, y: rootDepthY * 0.45 },
          cp1: { x: rootSpreadX * 0.5, y: rootDepthY * 0.7 },
          cp2: { x: rootSpreadX * 0.7, y: rootDepthY + 60 },
          p1: { x: rootSpreadX * 0.85, y: rootDepthY + 95 },
          width: 2.5,
        }
      ]
    };
    roots.push(mainRoot);
  });

  // 3. EXPANSIVE CANOPY BOUGHS & RECURSIVE HIERARCHY
  const branches: YggdrasilBranch[] = [];
  const leaves: YggdrasilLeaf[] = [];

  // Effective topics
  const effectiveTopics = [...topics];
  if (syntheticCount > 0) {
    const synthDomains = [
      'Cloud Architecture', 'Operating Systems', 'AI & Neural Systems',
      'Network Protocols', 'Cybersecurity & Zero-Trust', 'Database Internals',
      'DevOps Automation', 'Distributed Computing'
    ];
    let d = 0;
    while (effectiveTopics.length < Math.min(8, Math.max(5, syntheticCount / 12)) && d < synthDomains.length) {
      if (!effectiveTopics.some(t => t.name.includes(synthDomains[d]))) {
        effectiveTopics.push({
          id: `synth-dom-${d}`,
          name: synthDomains[d],
          code: `DOM-${d + 1}`,
          description: `Comprehensive domain cluster for ${synthDomains[d]}`,
          icon: 'Boxes',
          color: 'var(--neon-blue)',
          category: synthDomains[d],
          order: effectiveTopics.length + 1,
        });
      }
      d++;
    }
  }

  const domainColors = ['#00f0ff', '#00ff88', '#b026ff', '#ffb020', '#f43f5e', '#38bdf8', '#a855f7', '#34d399'];
  const domainCount = effectiveTopics.length || 1;

  effectiveTopics.forEach((topic, dIdx) => {
    const domainColor = domainColors[dIdx % domainColors.length];
    const fraction = (dIdx / (domainCount - 1 || 1)) - 0.5; // -0.5 to +0.5 (left to right)
    
    // Staggered emergence along upper trunk
    const startY = trunkTopY + 30 + Math.abs(fraction) * 60 + (dIdx % 2) * 20;
    const startX = fraction * 30;

    // Major arching limb endpoint
    const boughEndX = fraction * 680 + (fraction > 0 ? 80 : -80);
    const boughEndY = -340 - (1 - Math.abs(fraction)) * 140; // arching crown dome

    const majorBoughId = `bough-${topic.id}`;
    branches.push({
      id: majorBoughId,
      level: 1,
      domainId: topic.id,
      title: topic.name,
      p0: { x: startX, y: startY },
      cp1: { x: fraction * 220, y: startY - 50 },
      cp2: { x: boughEndX * 0.7, y: boughEndY + 60 },
      p1: { x: boughEndX, y: boughEndY },
      width: 18.0,
      color: domainColor,
      pulseOffset: dIdx * 0.3,
    });

    // Match or generate notes for this domain
    const topicNotes = notes.filter(n => n.topicId === topic.id);
    if (syntheticCount > 0) {
      const targetPerDomain = Math.floor(syntheticCount / domainCount);
      let n = topicNotes.length;
      while (topicNotes.length < targetPerDomain) {
        topicNotes.push({
          id: `synth-note-${topic.id}-${n}`,
          topicId: topic.id,
          title: `${topic.name} Concept #${n + 1}`,
          summary: `Neural knowledge record for ${topic.name}`,
          content: `# Knowledge Concept ${n + 1}`,
          tags: ['Benchmark', topic.name],
          status: n % 3 === 0 ? 'mastered' : n % 2 === 0 ? 'reviewing' : 'learning',
          difficulty: n % 3 === 0 ? 'advanced' : 'intermediate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        n++;
      }
    }

    // Generate Secondary and Tertiary Branches for this limb
    const subBranchCount = Math.max(3, Math.ceil(topicNotes.length / 5));
    for (let sb = 0; sb < subBranchCount; sb++) {
      const subFrac = (sb / (subBranchCount - 1 || 1)) - 0.5;
      const subOriginT = 0.5 + (sb / (subBranchCount || 1)) * 0.45;
      
      // Point along major bough
      const subStartX = startX + (boughEndX - startX) * subOriginT;
      const subStartY = startY + (boughEndY - startY) * subOriginT;

      const subEndX = boughEndX + subFrac * 140 + (fraction > 0 ? 40 : -40);
      const subEndY = boughEndY - 50 + subFrac * 60;

      const subBranchId = `sub-${topic.id}-${sb}`;
      branches.push({
        id: subBranchId,
        parentId: majorBoughId,
        level: 2,
        domainId: topic.id,
        title: `${topic.name} Sub-Branch ${sb + 1}`,
        p0: { x: subStartX, y: subStartY },
        cp1: { x: subStartX + subFrac * 50, y: subStartY - 30 },
        cp2: { x: subEndX * 0.9, y: subEndY + 20 },
        p1: { x: subEndX, y: subEndY },
        width: 8.0,
        color: domainColor,
        pulseOffset: dIdx * 0.3 + sb * 0.15,
      });

      // Distribute slice of notes as glowing digital leaves / buds along this sub-branch
      const notesSlice = topicNotes.slice(sb * 5, (sb + 1) * 5);
      notesSlice.forEach((note, nIdx) => {
        const leafFrac = (nIdx + 1) / (notesSlice.length + 1);
        // Position along the sub-branch or blooming around its tip
        const lx = subStartX + (subEndX - subStartX) * leafFrac + (Math.sin(nIdx + sb) * 18);
        const ly = subStartY + (subEndY - subStartY) * leafFrac + (Math.cos(nIdx + sb) * 16) - 10;

        leaves.push({
          id: note.id,
          branchId: subBranchId,
          x: lx,
          y: ly,
          radius: note.status === 'mastered' ? 5.5 : 4.5,
          color: note.status === 'mastered' ? '#00ff88' : note.status === 'reviewing' ? '#ffb020' : '#00f0ff',
          status: note.status,
          mastery: note.status === 'mastered' ? 100 : note.status === 'reviewing' ? 65 : 25,
          title: note.title,
          category: topic.name,
          noteId: note.id,
          topicId: topic.id,
          description: note.summary,
          tags: note.tags,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      });
    }
  });

  // 4. GENERATE FLOATING DIGITAL NORSE RUNES
  const runes: YggdrasilRune[] = [];
  const runePositions = [
    { x: -160, y: -20 }, { x: -220, y: 50 }, { x: -280, y: -80 },
    { x: -140, y: 120 }, { x: -200, y: -160 }, { x: -260, y: 10 },
    { x: 160, y: -30 }, { x: 220, y: 60 }, { x: 280, y: -70 },
    { x: 140, y: 110 }, { x: 210, y: -150 }, { x: 270, y: 20 },
    { x: -110, y: -220 }, { x: 110, y: -210 }, { x: -70, y: 30 }, { x: 70, y: 40 }
  ];

  runePositions.forEach((pos, idx) => {
    runes.push({
      char: RUNES_LIST[idx % RUNES_LIST.length],
      x: pos.x,
      y: pos.y,
      alpha: 0.45 + (idx % 3) * 0.15,
      scale: 14 + (idx % 4) * 3,
      driftPhase: idx * 0.4,
    });
  });

  // Stats
  let learningCount = 0;
  let reviewingCount = 0;
  let masteredCount = 0;

  leaves.forEach((l) => {
    if (l.status === 'mastered') masteredCount++;
    else if (l.status === 'reviewing') reviewingCount++;
    else if (l.status === 'learning') learningCount++;
  });

  const total = learningCount + reviewingCount + masteredCount || 1;
  const growthPercentage = Math.round((masteredCount / total) * 100);

  return {
    trunkFibers,
    roots,
    branches,
    leaves,
    runes,
    stats: {
      learning: learningCount,
      reviewing: reviewingCount,
      mastered: masteredCount,
      total,
      growthPercentage,
    },
  };
}
