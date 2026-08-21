import { Topic, Note, Lab } from '../../types';

export interface CurvePoint {
  x: number;
  y: number;
}

export interface FractalBranch {
  id: string;
  parentId?: string;
  type: 'trunk' | 'category' | 'topic' | 'twig' | 'root_main' | 'root_sub';
  level: number;
  p0: CurvePoint;
  cp1: CurvePoint;
  cp2: CurvePoint;
  p1: CurvePoint;
  startWidth: number;
  endWidth: number;
  length: number;
  birthTime: number; // for growth animation
  pulseOffset: number;
  topicId?: string;
  noteId?: string;
  labId?: string;
  title: string;
  status: 'learning' | 'reviewing' | 'mastered' | 'neutral';
  nodeRadius: number;
}

export interface FractalRoot {
  id: string;
  parentId?: string;
  p0: CurvePoint;
  cp1: CurvePoint;
  cp2: CurvePoint;
  p1: CurvePoint;
  startWidth: number;
  endWidth: number;
  length: number;
  birthTime: number;
  title: string;
  category: string;
  status: 'mastered' | 'foundation';
  nodeRadius: number;
}

export interface FloatingRuneItem {
  char: string;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  phase: number;
}

export interface OrganicTreeLayout {
  trunkFibers: Array<{
    p0: CurvePoint;
    cp1: CurvePoint;
    cp2: CurvePoint;
    p1: CurvePoint;
    width: number;
    speed: number;
    offset: number;
  }>;
  branches: FractalBranch[];
  roots: FractalRoot[];
  runes: FloatingRuneItem[];
  stats: {
    learning: number;
    reviewing: number;
    mastered: number;
    total: number;
    growthPercentage: number;
  };
}

const RUNES_SET = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

function bezierLength(p0: CurvePoint, cp1: CurvePoint, cp2: CurvePoint, p1: CurvePoint): number {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const chord = Math.hypot(dx, dy);
  const cont = Math.hypot(cp1.x - p0.x, cp1.y - p0.y) + Math.hypot(cp2.x - cp1.x, cp2.y - cp1.y) + Math.hypot(p1.x - cp2.x, p1.y - cp2.y);
  return (chord + cont) / 2;
}

export function generateOrganicFractalTree(
  topics: Topic[],
  notes: Note[],
  labs: Lab[],
  birthTimestamps: Map<string, number>
): OrganicTreeLayout {
  const now = performance.now();
  const branches: FractalBranch[] = [];
  const roots: FractalRoot[] = [];

  const trunkBaseY = 90;   // Single foundation point origin
  const trunkTopY = -230;  // Primary crown split
  const trunkBaseX = 0;

  // 1. GENERATE VOLUMETRIC CIRCUIT TRUNK (Single Foundation Origin)
  const trunkFibers: Array<{
    p0: CurvePoint;
    cp1: CurvePoint;
    cp2: CurvePoint;
    p1: CurvePoint;
    width: number;
    speed: number;
    offset: number;
  }> = [];

  const fiberCount = 28;
  for (let i = 0; i < fiberCount; i++) {
    const norm = (i / (fiberCount - 1)) - 0.5; // -0.5 to +0.5
    const baseX = norm * 70;
    const topX = norm * 35;
    const wave1 = Math.sin(i * 0.4) * 8;
    const wave2 = Math.cos(i * 0.5) * 6;

    trunkFibers.push({
      p0: { x: trunkBaseX + baseX, y: trunkBaseY },
      cp1: { x: trunkBaseX + baseX * 0.7 + wave1, y: -40 },
      cp2: { x: trunkBaseX + topX * 1.1 - wave2, y: -145 },
      p1: { x: trunkBaseX + topX, y: trunkTopY },
      width: Math.abs(norm) < 0.25 ? 3.0 : 1.6,
      speed: 1.0 + (i % 3) * 0.3,
      offset: i * 0.08,
    });
  }

  // 2. GROUP TOPICS BY CATEGORY / DOMAIN FOR FULL DATA-DRIVEN HIERARCHY
  const categoriesMap = new Map<string, Topic[]>();
  topics.forEach((t) => {
    const cat = t.category || 'General Knowledge';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(t);
  });

  const categories = Array.from(categoriesMap.entries());
  const categoryCount = categories.length || 1;

  // LEVEL 1: Major Category Boughs arching from trunk top
  categories.forEach(([catName, catTopics], cIdx) => {
    const catFrac = categoryCount > 1 ? (cIdx / (categoryCount - 1)) - 0.5 : 0; // -0.5 to +0.5
    const catBirth = birthTimestamps.get(`cat-${catName}`) || 0;

    // Staggered departure along upper trunk
    const startY = trunkTopY + 25 + Math.abs(catFrac) * 45;
    const startX = catFrac * 25;

    // Natural curved arch for category bough
    const boughAngle = -Math.PI / 2 + catFrac * (Math.PI * 0.78);
    const boughDist = 180 + Math.abs(catFrac) * 60;
    const catEndX = startX + Math.sin(catFrac * Math.PI * 0.6) * boughDist;
    const catEndY = startY - Math.cos(catFrac * Math.PI * 0.4) * boughDist * 0.85;

    const catBranchId = `cat-${catName}`;
    const p0 = { x: startX, y: startY };
    const cp1 = { x: startX + catFrac * 80, y: startY - 50 };
    const cp2 = { x: catEndX * 0.8, y: catEndY + 40 };
    const p1 = { x: catEndX, y: catEndY };

    branches.push({
      id: catBranchId,
      type: 'category',
      level: 1,
      p0,
      cp1,
      cp2,
      p1,
      startWidth: 14.0,
      endWidth: 8.5,
      length: bezierLength(p0, cp1, cp2, p1),
      birthTime: catBirth,
      pulseOffset: cIdx * 0.25,
      title: catName,
      status: 'neutral',
      nodeRadius: 0,
    });

    // LEVEL 2: Topics branching off the Category bough
    const topicCount = catTopics.length;
    catTopics.forEach((topic, tIdx) => {
      const topicBirth = birthTimestamps.get(topic.id) || 0;
      const tFrac = topicCount > 1 ? (tIdx / (topicCount - 1)) - 0.5 : 0;
      const subOriginT = 0.4 + ((tIdx + 1) / (topicCount + 1)) * 0.55;

      // Position along parent category bough
      const u = 1 - subOriginT;
      const subStartX = u * u * u * p0.x + 3 * u * u * subOriginT * cp1.x + 3 * u * subOriginT * subOriginT * cp2.x + subOriginT * subOriginT * subOriginT * p1.x;
      const subStartY = u * u * u * p0.y + 3 * u * u * subOriginT * cp1.y + 3 * u * subOriginT * subOriginT * cp2.y + subOriginT * subOriginT * subOriginT * p1.y;

      // Natural fork angle with organic curve
      const forkSpreadX = (catFrac + tFrac * 0.6) * 160 + (tIdx % 2 === 0 ? 30 : -30);
      const forkSpreadY = -80 - Math.abs(tFrac) * 50 - (tIdx % 3) * 20;
      const topicEndX = subStartX + forkSpreadX;
      const topicEndY = subStartY + forkSpreadY;

      const tp0 = { x: subStartX, y: subStartY };
      const tcp1 = { x: subStartX + tFrac * 40, y: subStartY - 30 };
      const tcp2 = { x: topicEndX * 0.9, y: topicEndY + 25 };
      const tp1 = { x: topicEndX, y: topicEndY };

      // Find topic mastery
      const topicNotes = notes.filter((n) => n.topicId === topic.id);
      const topicLabs = labs.filter((l) => l.topicId === topic.id);
      const totalTopicItems = topicNotes.length + topicLabs.length;
      const masteredTopicItems = topicNotes.filter((n) => n.status === 'mastered').length + topicLabs.filter((l) => l.status === 'completed').length;
      const topicStatus = totalTopicItems === 0 ? 'learning' : masteredTopicItems === totalTopicItems ? 'mastered' : 'learning';

      const topicBranchId = `topic-${topic.id}`;
      branches.push({
        id: topicBranchId,
        parentId: catBranchId,
        type: 'topic',
        level: 2,
        p0: tp0,
        cp1: tcp1,
        cp2: tcp2,
        p1: tp1,
        startWidth: 7.5,
        endWidth: 4.0,
        length: bezierLength(tp0, tcp1, tcp2, tp1),
        birthTime: topicBirth,
        pulseOffset: cIdx * 0.25 + tIdx * 0.15,
        topicId: topic.id,
        title: topic.name,
        status: topicStatus,
        nodeRadius: 7.0,
      });

      // LEVEL 3: Notes & Labs (Twigs branching off Topic)
      const combinedItems = [
        ...topicNotes.map((n) => ({ ...n, _kind: 'note' })),
        ...topicLabs.map((l) => ({ ...l, _kind: 'lab', summary: l.description, tags: [] })),
      ];

      const twigCount = combinedItems.length;
      combinedItems.forEach((item, nIdx) => {
        const itemBirth = birthTimestamps.get(item.id) || 0;
        const twigFrac = twigCount > 1 ? (nIdx / (twigCount - 1)) - 0.5 : 0;
        const twigOriginT = 0.5 + ((nIdx + 1) / (twigCount + 1)) * 0.48;

        const tu = 1 - twigOriginT;
        const twigStartX = tu * tu * tu * tp0.x + 3 * tu * tu * twigOriginT * tcp1.x + 3 * tu * twigOriginT * twigOriginT * tcp2.x + twigOriginT * twigOriginT * twigOriginT * tp1.x;
        const twigStartY = tu * tu * tu * tp0.y + 3 * tu * tu * twigOriginT * tcp1.y + 3 * tu * twigOriginT * twigOriginT * tcp2.y + twigOriginT * twigOriginT * twigOriginT * tp1.y;

        // Organic blossom angle around topic tip
        const angle = (nIdx / (twigCount || 1)) * Math.PI * 1.5 - Math.PI * 0.75 + (catFrac > 0 ? 0.3 : -0.3);
        const dist = 38 + (nIdx % 3) * 14;
        const twigEndX = tp1.x + Math.cos(angle) * dist;
        const twigEndY = tp1.y + Math.sin(angle) * dist - 10;

        const twp0 = { x: twigStartX, y: twigStartY };
        const twcp1 = { x: twigStartX + (twigEndX - twigStartX) * 0.4 + (nIdx % 2 === 0 ? 10 : -10), y: twigStartY - 15 };
        const twcp2 = { x: twigEndX - (twigEndX - twigStartX) * 0.2, y: twigEndY + 10 };
        const twp1 = { x: twigEndX, y: twigEndY };

        const itemStatus = item.status === 'mastered' || item.status === 'completed' ? 'mastered' : item.status === 'reviewing' || item.status === 'in_progress' ? 'reviewing' : 'learning';

        branches.push({
          id: `twig-${item.id}`,
          parentId: topicBranchId,
          type: 'twig',
          level: 3,
          p0: twp0,
          cp1: twcp1,
          cp2: twcp2,
          p1: twp1,
          startWidth: 3.2,
          endWidth: 1.5,
          length: bezierLength(twp0, twcp1, twcp2, twp1),
          birthTime: itemBirth,
          pulseOffset: cIdx * 0.25 + tIdx * 0.15 + nIdx * 0.08,
          topicId: topic.id,
          noteId: item._kind === 'note' ? item.id : undefined,
          labId: item._kind === 'lab' ? item.id : undefined,
          title: item.title,
          status: itemStatus,
          nodeRadius: itemStatus === 'mastered' ? 5.5 : 4.0,
        });
      });
    });
  });

  // 3. GENERATE ORGANIC DATA-DRIVEN ROOTS (UNDERGROUND FOUNDATIONS)
  // Roots represent Mastered Knowledge Foundations, emerging from single foundation point (trunkBaseX, trunkBaseY)
  const masteredNotes = notes.filter((n) => n.status === 'mastered');
  const completedLabs = labs.filter((l) => l.status === 'completed');
  const allMastered = [...masteredNotes.map((n) => ({ id: n.id, title: n.title, category: 'Mastered Note' })), ...completedLabs.map((l) => ({ id: l.id, title: l.title, category: 'Completed Lab' }))];

  const foundationCategories = [
    { title: 'Computational Theory & Logic', category: 'Foundation' },
    { title: 'Operating Systems & Kernels', category: 'Foundation' },
    { title: 'Network Protocols & Physics', category: 'Foundation' },
    { title: 'Information Security & Cryptography', category: 'Foundation' },
    { title: 'Distributed Systems & Consensus', category: 'Foundation' },
  ];

  const rootTrunkCount = Math.max(foundationCategories.length, 5);
  for (let r = 0; r < rootTrunkCount; r++) {
    const rFrac = rootTrunkCount > 1 ? (r / (rootTrunkCount - 1)) - 0.5 : 0;
    const rootBirth = birthTimestamps.get(`root-main-${r}`) || 0;

    const startX = trunkBaseX + rFrac * 60;
    const startY = trunkBaseY;

    // Organic downward spread
    const rootEndX = trunkBaseX + rFrac * 680 + (r % 2 === 0 ? 30 : -30);
    const rootEndY = trunkBaseY + 160 + Math.abs(rFrac) * 140 + (r % 2 === 0 ? 25 : 0);

    const rp0 = { x: startX, y: startY };
    const rcp1 = { x: startX + rFrac * 100, y: startY + 60 };
    const rcp2 = { x: rootEndX * 0.75, y: rootEndY * 0.75 };
    const rp1 = { x: rootEndX, y: rootEndY };

    const fndObj = foundationCategories[r % foundationCategories.length];
    const mainRootId = `root-main-${r}`;

    roots.push({
      id: mainRootId,
      p0: rp0,
      cp1: rcp1,
      cp2: rcp2,
      p1: rp1,
      startWidth: 8.5,
      endWidth: 4.5,
      length: bezierLength(rp0, rcp1, rcp2, rp1),
      birthTime: rootBirth,
      title: fndObj.title,
      category: fndObj.category,
      status: 'foundation',
      nodeRadius: 6.5,
    });

    // Sub-rootlets for mastered items
    const rootItems = allMastered.filter((_, idx) => idx % rootTrunkCount === r);
    rootItems.forEach((mItem, subIdx) => {
      const itemBirth = birthTimestamps.get(mItem.id) || 0;
      const subOriginT = 0.5 + ((subIdx + 1) / (rootItems.length + 1)) * 0.45;
      const ru = 1 - subOriginT;
      const sStartX = ru * ru * ru * rp0.x + 3 * ru * ru * subOriginT * rcp1.x + 3 * ru * subOriginT * subOriginT * rcp2.x + subOriginT * subOriginT * subOriginT * rp1.x;
      const sStartY = ru * ru * ru * rp0.y + 3 * ru * ru * subOriginT * rcp1.y + 3 * ru * subOriginT * subOriginT * rcp2.y + subOriginT * subOriginT * subOriginT * rp1.y;

      const subSpreadX = (rFrac + (subIdx % 2 === 0 ? 0.2 : -0.2)) * 90;
      const subSpreadY = 50 + (subIdx % 3) * 25;
      const sEndX = sStartX + subSpreadX;
      const sEndY = sStartY + subSpreadY;

      const s0 = { x: sStartX, y: sStartY };
      const sc1 = { x: sStartX + subSpreadX * 0.4, y: sStartY + 20 };
      const sc2 = { x: sEndX * 0.9, y: sEndY - 10 };
      const s1 = { x: sEndX, y: sEndY };

      roots.push({
        id: `root-sub-${mItem.id}`,
        parentId: mainRootId,
        p0: s0,
        cp1: sc1,
        cp2: sc2,
        p1: s1,
        startWidth: 3.5,
        endWidth: 1.8,
        length: bezierLength(s0, sc1, sc2, s1),
        birthTime: itemBirth,
        title: mItem.title,
        category: mItem.category,
        status: 'mastered',
        nodeRadius: 4.5,
      });
    });
  }

  // 4. FLOATING GLOWING NORSE RUNES
  const runes: FloatingRuneItem[] = [];
  const runePositions = [
    { x: -160, y: -30 }, { x: -230, y: 50 }, { x: -290, y: -80 },
    { x: -140, y: 120 }, { x: -210, y: -160 }, { x: -270, y: 10 },
    { x: 160, y: -40 }, { x: 230, y: 60 }, { x: 290, y: -70 },
    { x: 140, y: 110 }, { x: 220, y: -150 }, { x: 280, y: 20 },
    { x: -110, y: -220 }, { x: 110, y: -210 }, { x: -70, y: 40 }, { x: 70, y: 50 },
  ];

  runePositions.forEach((pos, idx) => {
    runes.push({
      char: RUNES_SET[idx % RUNES_SET.length],
      x: pos.x,
      y: pos.y,
      scale: 15 + (idx % 3) * 3,
      alpha: 0.5 + (idx % 2) * 0.2,
      phase: idx * 0.45,
    });
  });

  // Calculate statistics
  let lCount = 0;
  let rCount = 0;
  let mCount = 0;
  branches.forEach((b) => {
    if (b.type === 'twig') {
      if (b.status === 'mastered') mCount++;
      else if (b.status === 'reviewing') rCount++;
      else lCount++;
    }
  });

  const total = lCount + rCount + mCount || 1;
  const growthPercentage = Math.round((mCount / total) * 100);

  return {
    trunkFibers,
    branches,
    roots,
    runes,
    stats: {
      learning: lCount,
      reviewing: rCount,
      mastered: mCount,
      total,
      growthPercentage,
    },
  };
}
