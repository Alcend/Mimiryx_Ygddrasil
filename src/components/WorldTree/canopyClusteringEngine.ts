import { Topic, Note, Lab } from '../../types';

export interface TrunkCable {
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  color: string;
  speed: number;
  offset: number;
  depth: number; // -1 (back) to +1 (front)
}

export interface RealmBough {
  id: string;
  realmName: string;
  norseName: string;
  color: string;
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  topics: Topic[];
  notes: Note[];
  labs: Lab[];
  masteryPct: number;
  subBranches: Array<{
    id: string;
    topicId: string;
    topicName: string;
    p0: { x: number; y: number };
    cp1: { x: number; y: number };
    cp2: { x: number; y: number };
    p1: { x: number; y: number };
    width: number;
    color: string;
  }>;
}

export interface FoliageParticle {
  id: string;
  x: number;
  y: number;
  originX: number;
  originY: number;
  radius: number;
  color: string;
  status: 'learning' | 'reviewing' | 'mastered' | 'ambient';
  mastery: number;
  title: string;
  boughId: string;
  topicId?: string;
  noteId?: string;
  labId?: string;
  swaySpeed: number;
  swayPhase: number;
  swayAmplitude: number;
  isInteractive: boolean;
}

export interface TaprootConduit {
  id: string;
  title: string;
  category: string;
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
  width: number;
  subTendrils: Array<{
    p0: { x: number; y: number };
    cp1: { x: number; y: number };
    cp2: { x: number; y: number };
    p1: { x: number; y: number };
    width: number;
  }>;
}

export interface FloatingRune {
  char: string;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  phase: number;
}

export interface VolumetricTreeModel {
  trunkCables: TrunkCable[];
  boughs: RealmBough[];
  foliage: FoliageParticle[];
  roots: TaprootConduit[];
  runes: FloatingRune[];
  stats: {
    learning: number;
    reviewing: number;
    mastered: number;
    total: number;
    growthPercentage: number;
  };
}

const NORSE_REALMS = [
  { name: 'Asgard', norse: 'Ásgarðr', domain: 'High Architecture & Systems', color: '#00f0ff' },
  { name: 'Alfheim', norse: 'Álfheimr', domain: 'AI & Neural Networks', color: '#38bdf8' },
  { name: 'Vanaheim', norse: 'Vanaheimr', domain: 'Distributed Networks', color: '#00ff88' },
  { name: 'Midgard', norse: 'Miðgarðr', domain: 'Core Software & Web', color: '#34d399' },
  { name: 'Jotunheim', norse: 'Jötunheimr', domain: 'Data Engineering & Big Data', color: '#a855f7' },
  { name: 'Muspelheim', norse: 'Múspellsheimr', domain: 'Performance & Optimization', color: '#ffb020' },
  { name: 'Niflheim', norse: 'Niflheimr', domain: 'Cybersecurity & Zero-Trust', color: '#f43f5e' },
  { name: 'Helheim', norse: 'Helheimr', domain: 'Operating Systems & Kernel', color: '#b026ff' },
];

const RUNES_SET = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

export function generateVolumetricTree(
  topics: Topic[],
  notes: Note[],
  labs: Lab[],
  benchmarkScale: number = 0
): VolumetricTreeModel {
  // 1. BRAIDED VOLUMETRIC TRUNK (48 ORGANIC CABLES WITH 3D DEPTH)
  const trunkCables: TrunkCable[] = [];
  const trunkBaseY = 110;
  const trunkTopY = -280;
  const cableCount = 48;

  for (let i = 0; i < cableCount; i++) {
    const norm = (i / (cableCount - 1)) - 0.5; // -0.5 to +0.5
    const depth = Math.cos(norm * Math.PI); // 1.0 (front center) to 0.0 (edges)
    const baseX = norm * 110;
    const topX = norm * 55;
    const wave1 = Math.sin(i * 0.35) * 12;
    const wave2 = Math.cos(i * 0.45) * 10;

    trunkCables.push({
      p0: { x: baseX, y: trunkBaseY },
      cp1: { x: baseX * 0.65 + wave1, y: -45 },
      cp2: { x: topX * 1.15 - wave2, y: -175 },
      p1: { x: topX, y: trunkTopY },
      width: 2.2 + depth * 2.2,
      color: depth > 0.6 ? '#00f0ff' : depth > 0.3 ? '#00d2eb' : 'rgba(0, 240, 255, 0.4)',
      speed: 0.8 + (i % 4) * 0.25,
      offset: i * 0.06,
      depth,
    });
  }

  // 2. SUBTERRANEAN TAPROOTS (FOUNDATIONS)
  const roots: TaprootConduit[] = [];
  const rootCount = 8;
  const foundationTitles = [
    'Formal Logic & Mathematics',
    'Computer Architecture & ASM',
    'Operating System Primitives',
    'Information & Shannon Entropy',
    'Distributed Consensus Physics',
    'Cryptography & Hash Chains',
    'Networking Protocols & TCP/IP',
    'Algorithmics & Complexity Tiers'
  ];

  for (let r = 0; r < rootCount; r++) {
    const frac = (r / (rootCount - 1)) - 0.5;
    const startX = frac * 85;
    const targetX = frac * 760;
    const targetY = 240 + Math.abs(frac) * 180 + (r % 2 === 0 ? 35 : 0);

    const subTendrils: Array<{ p0: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p1: { x: number; y: number }; width: number }> = [];
    
    // Sub-root 1
    subTendrils.push({
      p0: { x: targetX * 0.55, y: targetY * 0.6 },
      cp1: { x: targetX * 0.75, y: targetY * 0.8 },
      cp2: { x: targetX * 1.1, y: targetY + 30 },
      p1: { x: targetX * 1.25, y: targetY + 70 },
      width: 3.5,
    });
    // Sub-root 2
    subTendrils.push({
      p0: { x: targetX * 0.35, y: targetY * 0.4 },
      cp1: { x: targetX * 0.5, y: targetY * 0.65 },
      cp2: { x: targetX * 0.7, y: targetY + 50 },
      p1: { x: targetX * 0.85, y: targetY + 90 },
      width: 2.5,
    });

    roots.push({
      id: `root-${r}`,
      title: foundationTitles[r % foundationTitles.length],
      category: 'Foundation',
      p0: { x: startX, y: trunkBaseY },
      cp1: { x: startX + frac * 140, y: trunkBaseY + 75 },
      cp2: { x: targetX * 0.7, y: targetY * 0.75 },
      p1: { x: targetX, y: targetY },
      width: 8.5,
      subTendrils,
    });
  }

  // 3. 8 MAJOR CANOPY REALM BOUGHS & SPHERICAL FRACTAL CLUSTERING
  const boughs: RealmBough[] = [];
  const foliage: FoliageParticle[] = [];

  // Distribute topics among the 8 realms to prevent clutter
  const realmCount = 8;
  NORSE_REALMS.forEach((realm, bIdx) => {
    const frac = (bIdx / (realmCount - 1)) - 0.5; // -0.5 to +0.5
    const crownArcX = frac * 720;
    const crownArcY = -350 - (1 - Math.abs(frac) * 0.8) * 180; // majestic parabolic dome

    const startY = trunkTopY + 35 + Math.abs(frac) * 65;
    const startX = frac * 32;

    // Filter topics belonging to this realm or slice dynamically
    const assignedTopics = topics.filter((_, tIdx) => tIdx % realmCount === bIdx);
    const assignedNotes = notes.filter(n => assignedTopics.some(t => t.id === n.topicId));
    const assignedLabs = labs.filter(l => assignedTopics.some(t => t.id === l.topicId));

    const totalAssigned = assignedNotes.length + assignedLabs.length;
    const masteredAssigned = assignedNotes.filter(n => n.status === 'mastered').length + assignedLabs.filter(l => l.status === 'completed').length;
    const masteryPct = totalAssigned ? Math.round((masteredAssigned / totalAssigned) * 100) : 0;

    const boughId = `realm-bough-${bIdx}`;
    const subBranches: Array<{ id: string; topicId: string; topicName: string; p0: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p1: { x: number; y: number }; width: number; color: string }> = [];

    // Generate secondary & tertiary twigs branching off this major bough
    const branchCount = Math.max(3, assignedTopics.length || 2);
    for (let sb = 0; sb < branchCount; sb++) {
      const sbFrac = (sb / (branchCount - 1 || 1)) - 0.5;
      const subOriginT = 0.45 + (sb / branchCount) * 0.5;

      const subStartX = startX + (crownArcX - startX) * subOriginT;
      const subStartY = startY + (crownArcY - startY) * subOriginT;

      const subEndX = crownArcX + sbFrac * 160 + (frac > 0 ? 35 : -35);
      const subEndY = crownArcY - 45 + sbFrac * 60;

      const topicObj = assignedTopics[sb % (assignedTopics.length || 1)];

      subBranches.push({
        id: `sub-${bIdx}-${sb}`,
        topicId: topicObj?.id || `synth-top-${bIdx}-${sb}`,
        topicName: topicObj?.name || `${realm.name} Branch ${sb + 1}`,
        p0: { x: subStartX, y: subStartY },
        cp1: { x: subStartX + sbFrac * 50, y: subStartY - 30 },
        cp2: { x: subEndX * 0.9, y: subEndY + 20 },
        p1: { x: subEndX, y: subEndY },
        width: 7.5,
        color: realm.color,
      });

      // Distribute interactive note leaves around this sub-branch tip
      const topicNotes = assignedNotes.filter(n => n.topicId === topicObj?.id);
      topicNotes.forEach((note, nIdx) => {
        const spreadAngle = (nIdx / (topicNotes.length || 1)) * Math.PI * 2;
        const leafDist = 20 + (nIdx % 3) * 12;
        const lx = subEndX + Math.cos(spreadAngle) * leafDist;
        const ly = subEndY + Math.sin(spreadAngle) * leafDist;

        foliage.push({
          id: note.id,
          x: lx,
          y: ly,
          originX: lx,
          originY: ly,
          radius: note.status === 'mastered' ? 6 : 4.5,
          color: note.status === 'mastered' ? '#00ff88' : note.status === 'reviewing' ? '#ffb020' : '#00f0ff',
          status: note.status,
          mastery: note.status === 'mastered' ? 100 : note.status === 'reviewing' ? 65 : 25,
          title: note.title,
          boughId,
          topicId: topicObj?.id,
          noteId: note.id,
          swaySpeed: 1.2 + Math.random() * 0.8,
          swayPhase: Math.random() * Math.PI * 2,
          swayAmplitude: 3.5,
          isInteractive: true,
        });
      });
    }

    // 4. GENERATE VOLUMETRIC LUSH CANOPY FOLIAGE PARTICLES (2,000+ BIOLUMINESCENT PARTICLES)
    // Distributed in organic clusters around the bough crown to give dense, lush fantasy foliage
    const ambientCount = 200 + (benchmarkScale > 0 ? benchmarkScale / 4 : 0);
    for (let p = 0; p < ambientCount; p++) {
      const radiusCluster = Math.random() * 110;
      const angleCluster = Math.random() * Math.PI * 2;
      const px = crownArcX + Math.cos(angleCluster) * radiusCluster;
      const py = crownArcY + Math.sin(angleCluster) * (radiusCluster * 0.65);

      const colorTier = p % 5 === 0 ? '#00ff88' : p % 3 === 0 ? '#00f0ff' : '#22d3ee';

      foliage.push({
        id: `foliage-${bIdx}-${p}`,
        x: px,
        y: py,
        originX: px,
        originY: py,
        radius: 1.2 + Math.random() * 2.2,
        color: colorTier,
        status: 'ambient',
        mastery: 0,
        title: '',
        boughId,
        swaySpeed: 1.5 + Math.random() * 1.5,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmplitude: 2.5 + Math.random() * 3.0,
        isInteractive: false,
      });
    }

    boughs.push({
      id: boughId,
      realmName: realm.name,
      norseName: realm.norse,
      color: realm.color,
      p0: { x: startX, y: startY },
      cp1: { x: frac * 240, y: startY - 60 },
      cp2: { x: crownArcX * 0.7, y: crownArcY + 70 },
      p1: { x: crownArcX, y: crownArcY },
      width: 19.0,
      topics: assignedTopics,
      notes: assignedNotes,
      labs: assignedLabs,
      masteryPct,
      subBranches,
    });
  });

  // 5. FLOATING NORSE CYBER-RUNES
  const runes: FloatingRune[] = [];
  const runeCoords = [
    { x: -170, y: -40 }, { x: -240, y: 40 }, { x: -300, y: -90 },
    { x: -150, y: 110 }, { x: -220, y: -170 }, { x: -280, y: 0 },
    { x: 170, y: -50 }, { x: 240, y: 50 }, { x: 300, y: -80 },
    { x: 150, y: 100 }, { x: 230, y: -160 }, { x: 290, y: 10 },
    { x: -120, y: -230 }, { x: 120, y: -220 }, { x: -80, y: 20 }, { x: 80, y: 30 },
  ];

  runeCoords.forEach((coord, idx) => {
    runes.push({
      char: RUNES_SET[idx % RUNES_SET.length],
      x: coord.x,
      y: coord.y,
      scale: 16 + (idx % 3) * 4,
      alpha: 0.55 + (idx % 2) * 0.2,
      phase: idx * 0.5,
    });
  });

  // Stats
  const masteredCount = notes.filter(n => n.status === 'mastered').length + labs.filter(l => l.status === 'completed').length;
  const reviewingCount = notes.filter(n => n.status === 'reviewing').length;
  const learningCount = notes.filter(n => n.status === 'learning').length;
  const totalItems = notes.length + labs.length || 1;
  const growthPercentage = Math.round((masteredCount / totalItems) * 100);

  return {
    trunkCables,
    boughs,
    foliage,
    roots,
    runes,
    stats: {
      learning: learningCount,
      reviewing: reviewingCount,
      mastered: masteredCount,
      total: totalItems,
      growthPercentage,
    }
  };
}
