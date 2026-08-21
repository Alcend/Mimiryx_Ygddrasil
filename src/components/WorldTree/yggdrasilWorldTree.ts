/**
 * yggdrasilWorldTree.ts
 * 
 * Layout engine for the Yggdrasil World Tree visualization.
 * Generates FILLED POLYGON SILHOUETTES — shapes with area and mass —
 * not stroked lines. The trunk, branches, and roots are all tapered
 * polygons built from sampled Bezier curves with perpendicular offsets.
 */

import { Topic, Note, Lab } from '../../types';

// ────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface TreeSegment {
  polygon: Vec2[];
  centerLine: { p0: Vec2; cp1: Vec2; cp2: Vec2; p1: Vec2 };
}

export interface BranchNode {
  id: string;
  segment: TreeSegment;
  level: number; // 1 = major bough, 2 = topic limb, 3 = note/lab twig
  tipPos: Vec2;
  title: string;
  topicId?: string;
  noteId?: string;
  labId?: string;
  status: 'learning' | 'reviewing' | 'mastered' | 'neutral';
  nodeRadius: number;
  birthTime: number;
}

export interface YggdrasilLayout {
  trunk: TreeSegment;
  canopyOutline: Vec2[];
  branches: BranchNode[];
  roots: BranchNode[];
  groundY: number;
  stats: {
    learning: number;
    reviewing: number;
    mastered: number;
    total: number;
    growthPct: number;
  };
}

// ────────────────────────────────────────────────────
// Constants — world-coordinate dimensions
// ────────────────────────────────────────────────────

export const GROUND_Y = 200;

export const TRUNK_CFG = {
  baseY: 200,
  crownY: -300,
  baseHW: 110,   // half-width at base → total width 220px
  crownHW: 25,   // half-width at crown → total width 50px
  center: {
    p0:  { x: 0, y: 200 }   as Vec2,
    cp1: { x: 5, y: -10 }   as Vec2,
    cp2: { x: -3, y: -190 } as Vec2,
    p1:  { x: 0, y: -300 }  as Vec2,
  },
};

const CANOPY = { cx: 0, cy: -300, rx: 440, ry: 260 };

// Structural bough departure positions along the trunk
const BOUGH_TEMPLATES: Array<{
  trunkT: number;
  side: number;   // -1 = left, 1 = right
  tipDeg: number;  // angle on canopy ellipse (0=right, 90=top, 180=left)
  tipR: number;    // fraction of canopy radius for tip placement
  bw: number;      // total base width of this bough
}> = [
  { trunkT: 0.72, side: -1, tipDeg: 142, tipR: 0.80, bw: 30 },
  { trunkT: 0.75, side:  1, tipDeg: 38,  tipR: 0.82, bw: 28 },
  { trunkT: 0.60, side: -1, tipDeg: 158, tipR: 0.74, bw: 24 },
  { trunkT: 0.63, side:  1, tipDeg: 22,  tipR: 0.76, bw: 24 },
  { trunkT: 0.84, side: -1, tipDeg: 112, tipR: 0.83, bw: 20 },
  { trunkT: 0.87, side:  1, tipDeg: 68,  tipR: 0.85, bw: 18 },
];

// Root departure positions (near trunk base)
const ROOT_TEMPLATES: Array<{
  trunkT: number;
  side: number;
  tipX: number;
  tipY: number;
  bw: number;
}> = [
  { trunkT: 0.04, side: -1, tipX: -380, tipY: 430, bw: 26 },
  { trunkT: 0.05, side:  1, tipX:  400, tipY: 410, bw: 24 },
  { trunkT: 0.09, side: -1, tipX: -220, tipY: 460, bw: 20 },
  { trunkT: 0.07, side:  1, tipX:  240, tipY: 450, bw: 20 },
  { trunkT: 0.13, side: -1, tipX:  -90, tipY: 470, bw: 16 },
  { trunkT: 0.11, side:  1, tipX:  110, tipY: 465, bw: 16 },
];

const ROOT_LABELS = [
  'Computational Logic', 'System Architecture', 'Network Theory',
  'Cryptographic Foundations', 'Data Structures', 'Algorithm Design',
];

// ────────────────────────────────────────────────────
// Math helpers
// ────────────────────────────────────────────────────

export function sampleBezier(
  p0: Vec2, cp1: Vec2, cp2: Vec2, p1: Vec2, t: number
): Vec2 {
  const u = 1 - t;
  return {
    x: u*u*u*p0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p1.x,
    y: u*u*u*p0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p1.y,
  };
}

export function bezierTangent(
  p0: Vec2, cp1: Vec2, cp2: Vec2, p1: Vec2, t: number
): Vec2 {
  const u = 1 - t;
  return {
    x: 3*u*u*(cp1.x-p0.x) + 6*u*t*(cp2.x-cp1.x) + 3*t*t*(p1.x-cp2.x),
    y: 3*u*u*(cp1.y-p0.y) + 6*u*t*(cp2.y-cp1.y) + 3*t*t*(p1.y-cp2.y),
  };
}

export function trunkHalfWidth(t: number): number {
  return TRUNK_CFG.crownHW
    + (TRUNK_CFG.baseHW - TRUNK_CFG.crownHW) * Math.pow(1 - t, 1.5);
}

// ────────────────────────────────────────────────────
// Tapered polygon generator
//
// Samples a cubic Bezier center-line, offsets each sample
// point by a perpendicular scaled to the local half-width.
// Returns a closed polygon with organic noise on the edges.
// ────────────────────────────────────────────────────

function taperedPoly(
  p0: Vec2, cp1: Vec2, cp2: Vec2, p1: Vec2,
  startHW: number, endHW: number,
  taperExp: number = 1,
  samples: number = 18,
  seed: number = 0,
): Vec2[] {
  const sideA: Vec2[] = [];
  const sideB: Vec2[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pos = sampleBezier(p0, cp1, cp2, p1, t);
    const tan = bezierTangent(p0, cp1, cp2, p1, t);
    const len = Math.hypot(tan.x, tan.y) || 1;

    // Clockwise perpendicular (left side in screen coords going upward)
    const nx = tan.y / len;
    const ny = -tan.x / len;

    // Non-linear taper with organic edge noise
    const baseHW = endHW + (startHW - endHW) * Math.pow(1 - t, taperExp);
    const noise = 1
      + Math.sin(t * 17.3 + seed) * 0.04
      + Math.sin(t * 31.0 + seed * 2.7) * 0.025;
    const hw = baseHW * noise;

    sideA.push({ x: pos.x + nx * hw, y: pos.y + ny * hw });
    sideB.push({ x: pos.x - nx * hw, y: pos.y - ny * hw });
  }

  return [...sideA, ...sideB.reverse()];
}

// Trunk-specific polygon with buttressed base taper
function trunkPoly(): Vec2[] {
  const { p0, cp1, cp2, p1 } = TRUNK_CFG.center;
  const sideA: Vec2[] = [];
  const sideB: Vec2[] = [];
  const N = 28;

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const pos = sampleBezier(p0, cp1, cp2, p1, t);
    const tan = bezierTangent(p0, cp1, cp2, p1, t);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const nx = tan.y / len;
    const ny = -tan.x / len;

    const hw = trunkHalfWidth(t)
      * (1 + Math.sin(t * 19.1) * 0.03 + Math.sin(t * 37.7) * 0.015);

    sideA.push({ x: pos.x + nx * hw, y: pos.y + ny * hw });
    sideB.push({ x: pos.x - nx * hw, y: pos.y - ny * hw });
  }

  return [...sideA, ...sideB.reverse()];
}

// ────────────────────────────────────────────────────
// Canopy dome outline
// ────────────────────────────────────────────────────

function canopyDome(): Vec2[] {
  const pts: Vec2[] = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const a = Math.PI - (Math.PI * i / N); // PI → 0 (left → right)
    const bump = Math.sin(i * 5.3 + 1.7) * 14 + Math.sin(i * 11.2 + 3.2) * 9;
    pts.push({
      x: CANOPY.cx + Math.cos(a) * (CANOPY.rx + bump),
      y: CANOPY.cy - Math.sin(a) * (CANOPY.ry + bump * 0.4),
    });
  }
  return pts;
}

// ────────────────────────────────────────────────────
// Main layout generator
// ────────────────────────────────────────────────────

export function generateYggdrasilLayout(
  topics: Topic[],
  notes: Note[],
  labs: Lab[],
  birthTimestamps: Map<string, number>,
): YggdrasilLayout {
  const branches: BranchNode[] = [];
  const roots: BranchNode[] = [];

  // ── Trunk ──
  const trunk: TreeSegment = {
    polygon: trunkPoly(),
    centerLine: TRUNK_CFG.center,
  };

  // ── Canopy dome ──
  const canopyOutline = canopyDome();

  // ── Group topics by category ──
  const catMap = new Map<string, Topic[]>();
  topics.forEach(t => {
    const c = t.category || 'General';
    if (!catMap.has(c)) catMap.set(c, []);
    catMap.get(c)!.push(t);
  });
  const categories = Array.from(catMap.entries());

  // ── Boughs + topic branches + twigs ──
  const numBoughs = Math.max(BOUGH_TEMPLATES.length, categories.length);

  for (let bi = 0; bi < numBoughs; bi++) {
    const tmpl = BOUGH_TEMPLATES[bi % BOUGH_TEMPLATES.length];
    const extraAngle = Math.floor(bi / BOUGH_TEMPLATES.length) * 12;
    const cat = bi < categories.length ? categories[bi] : null;

    // Departure point on trunk edge
    const tc = TRUNK_CFG.center;
    const tPos = sampleBezier(tc.p0, tc.cp1, tc.cp2, tc.p1, tmpl.trunkT);
    const tHW = trunkHalfWidth(tmpl.trunkT);
    const sx = tPos.x + tmpl.side * tHW;
    const sy = tPos.y;

    // Tip on canopy inner ellipse
    const aRad = (tmpl.tipDeg + extraAngle) * Math.PI / 180;
    const tipX = CANOPY.cx + Math.cos(aRad) * CANOPY.rx * tmpl.tipR;
    const tipY = CANOPY.cy - Math.sin(aRad) * CANOPY.ry * tmpl.tipR;

    // Natural arch: initially horizontal, then sweeps upward
    const dx = tipX - sx;
    const dy = tipY - sy;
    const bc1 = { x: sx + dx * 0.35, y: sy + dy * 0.06 };
    const bc2 = { x: sx + dx * 0.72, y: sy + dy * 0.60 };
    const bStart: Vec2 = { x: sx, y: sy };
    const bEnd: Vec2   = { x: tipX, y: tipY };

    const bPoly = taperedPoly(bStart, bc1, bc2, bEnd, tmpl.bw / 2, 3, 1.2, 16, bi * 7.3);

    const boughId = cat ? `bough-${cat[0]}` : `struct-${bi}`;
    branches.push({
      id: boughId,
      segment: { polygon: bPoly, centerLine: { p0: bStart, cp1: bc1, cp2: bc2, p1: bEnd } },
      level: 1,
      tipPos: bEnd,
      title: cat ? cat[0] : '',
      status: 'neutral',
      nodeRadius: 0,
      birthTime: 0,
    });

    // ── Topic sub-branches off this bough ──
    if (!cat) continue;
    const [, catTopics] = cat;

    catTopics.forEach((topic, tIdx) => {
      const topicBirth = birthTimestamps.get(topic.id) || 0;

      // Departure along parent bough
      const dt = 0.30 + ((tIdx + 1) / (catTopics.length + 1)) * 0.60;
      const dp = sampleBezier(bStart, bc1, bc2, bEnd, dt);

      // Direction: outward from canopy center + slight variance
      const outA = Math.atan2(dp.y - CANOPY.cy, dp.x - CANOPY.cx)
        + (tIdx % 2 === 0 ? -0.25 : 0.25);
      const subLen = 65 + (tIdx * 17 % 35);
      const stX = dp.x + Math.cos(outA) * subLen;
      const stY = dp.y + Math.sin(outA) * subLen - 20;

      const sc1 = { x: dp.x + (stX - dp.x) * 0.4,  y: dp.y + (stY - dp.y) * 0.12 };
      const sc2 = { x: stX  - (stX - dp.x) * 0.12, y: stY  - (stY - dp.y) * 0.08 };
      const sEnd: Vec2 = { x: stX, y: stY };

      const sPoly = taperedPoly(dp, sc1, sc2, sEnd, 6, 2, 1, 12, tIdx * 13 + bi * 3);

      // Topic mastery status
      const tNotes = notes.filter(n => n.topicId === topic.id);
      const tLabs  = labs.filter(l => l.topicId === topic.id);
      const total  = tNotes.length + tLabs.length;
      const mast   = tNotes.filter(n => n.status === 'mastered').length
                   + tLabs.filter(l => l.status === 'completed').length;
      const tStatus: 'learning' | 'mastered' =
        total > 0 && mast === total ? 'mastered' : 'learning';

      branches.push({
        id: `topic-${topic.id}`,
        segment: { polygon: sPoly, centerLine: { p0: dp, cp1: sc1, cp2: sc2, p1: sEnd } },
        level: 2,
        tipPos: sEnd,
        title: topic.name,
        topicId: topic.id,
        status: tStatus,
        nodeRadius: 7,
        birthTime: topicBirth,
      });

      // ── Note / Lab twigs ──
      const items: Array<{
        id: string; title: string; kind: 'note' | 'lab'; rawStatus: string;
      }> = [
        ...tNotes.map(n => ({
          id: n.id, title: n.title, kind: 'note' as const, rawStatus: n.status,
        })),
        ...tLabs.map(l => ({
          id: l.id, title: l.title, kind: 'lab' as const, rawStatus: l.status,
        })),
      ];

      items.forEach((item, ni) => {
        const iBirth = birthTimestamps.get(item.id) || 0;
        const twA = outA + (ni - (items.length - 1) / 2) * 0.45;
        const twLen = 32 + (ni % 3) * 12;
        const twTip: Vec2 = {
          x: stX + Math.cos(twA) * twLen,
          y: stY + Math.sin(twA) * twLen - 8,
        };

        const twc1 = {
          x: stX + (twTip.x - stX) * 0.4,
          y: stY + (twTip.y - stY) * 0.2,
        };
        const twc2 = {
          x: twTip.x - (twTip.x - stX) * 0.12,
          y: twTip.y + 4,
        };

        const twPoly = taperedPoly(sEnd, twc1, twc2, twTip, 2.8, 1, 1, 8, ni * 17 + tIdx * 5);

        const mStatus: 'learning' | 'reviewing' | 'mastered' =
          item.kind === 'note'
            ? (item.rawStatus === 'mastered' ? 'mastered'
              : item.rawStatus === 'reviewing' ? 'reviewing' : 'learning')
            : (item.rawStatus === 'completed' ? 'mastered'
              : item.rawStatus === 'in_progress' ? 'reviewing' : 'learning');

        branches.push({
          id: `twig-${item.id}`,
          segment: { polygon: twPoly, centerLine: { p0: sEnd, cp1: twc1, cp2: twc2, p1: twTip } },
          level: 3,
          tipPos: twTip,
          title: item.title,
          topicId: topic.id,
          noteId: item.kind === 'note' ? item.id : undefined,
          labId: item.kind === 'lab' ? item.id : undefined,
          status: mStatus,
          nodeRadius: mStatus === 'mastered' ? 5 : 4,
          birthTime: iBirth,
        });
      });
    });
  }

  // ── Dynamic Roots mapped to topic foundations ──
  const TOPIC_FOUNDATIONS: Record<string, string> = {
    'Core Infrastructure': 'Linux Kernel & POSIX Architecture',
    'Distributed Systems': 'Consensus Theory & State Machine Replication',
    'Machine Intelligence': 'Linear Algebra & Neural Backpropagation',
    'Cloud Engineering': 'Container Runtimes & Overlay Networking',
    'Cyber Defense': 'Cryptographic Primitives & Zero Trust Architecture',
    'Quantum Computing': 'Quantum Information Theory & Hilbert Spaces',
    'Database Internals': 'Storage Engine Internals & B-Tree Mechanics',
    'General Knowledge': 'Computational Logic & Discrete Mathematics',
  };

  const dynamicRootLabels: string[] = categories.map(([catName]) => {
    return TOPIC_FOUNDATIONS[catName] || `Foundational Axioms of ${catName}`;
  });

  // Ensure minimum number of root labels
  while (dynamicRootLabels.length < ROOT_TEMPLATES.length) {
    const fallback = [
      'Computational Logic & Graph Theory',
      'System Architecture & Memory Subsystems',
      'Network Flow Dynamics & Routing Topology',
      'Information Theory & Entropy Foundations',
    ];
    dynamicRootLabels.push(fallback[dynamicRootLabels.length % fallback.length]);
  }

  ROOT_TEMPLATES.forEach((rt, ri) => {
    const tc = TRUNK_CFG.center;
    const rPos = sampleBezier(tc.p0, tc.cp1, tc.cp2, tc.p1, rt.trunkT);
    const rHW = trunkHalfWidth(rt.trunkT);
    const rsx = rPos.x + rt.side * rHW;
    const rsy = rPos.y;

    const rdx = rt.tipX - rsx;
    const rdy = rt.tipY - rsy;
    const rc1 = { x: rsx + rdx * 0.25, y: rsy + rdy * 0.12 };
    const rc2 = { x: rt.tipX - rdx * 0.08, y: rt.tipY - rdy * 0.18 };
    const rStart: Vec2 = { x: rsx, y: rsy };
    const rEnd: Vec2   = { x: rt.tipX, y: rt.tipY };

    const rPoly = taperedPoly(rStart, rc1, rc2, rEnd, rt.bw / 2, 2.5, 1.3, 16, ri * 11);

    roots.push({
      id: `root-${ri}`,
      segment: { polygon: rPoly, centerLine: { p0: rStart, cp1: rc1, cp2: rc2, p1: rEnd } },
      level: 1,
      tipPos: rEnd,
      title: dynamicRootLabels[ri % dynamicRootLabels.length],
      status: 'neutral',
      nodeRadius: 5,
      birthTime: 0,
    });

    // Sub-rootlets from mastered items
    const allMastered = [
      ...notes.filter(n => n.status === 'mastered').map(n => ({ id: n.id, title: n.title })),
      ...labs.filter(l => l.status === 'completed').map(l => ({ id: l.id, title: l.title })),
    ];
    const myMastered = allMastered.filter((_, idx) => idx % ROOT_TEMPLATES.length === ri);

    myMastered.forEach((m, si) => {
      const mBirth = birthTimestamps.get(m.id) || 0;
      const subT = 0.40 + ((si + 1) / (myMastered.length + 1)) * 0.50;
      const subPos = sampleBezier(rStart, rc1, rc2, rEnd, subT);

      const subAngle = Math.atan2(rt.tipY - GROUND_Y, rt.tipX) + (si % 2 === 0 ? 0.35 : -0.35);
      const subDist = 35 + (si % 3) * 14;
      const subTip: Vec2 = {
        x: subPos.x + Math.cos(subAngle) * subDist,
        y: subPos.y + Math.sin(subAngle) * subDist + 12,
      };

      const smc1 = { x: subPos.x + (subTip.x - subPos.x) * 0.4, y: subPos.y + (subTip.y - subPos.y) * 0.3 };
      const smc2 = { x: subTip.x - (subTip.x - subPos.x) * 0.12, y: subTip.y - 4 };
      const smPoly = taperedPoly(subPos, smc1, smc2, subTip, 2.8, 1, 1, 8, si * 19 + ri * 7);

      roots.push({
        id: `rootlet-${m.id}`,
        segment: { polygon: smPoly, centerLine: { p0: subPos, cp1: smc1, cp2: smc2, p1: subTip } },
        level: 2,
        tipPos: subTip,
        title: m.title,
        status: 'mastered',
        nodeRadius: 3.5,
        birthTime: mBirth,
      });
    });
  });

  // ── Stats ──
  let lc = 0, rc = 0, mc = 0;
  branches.forEach(b => {
    if (b.level >= 2) {
      if (b.status === 'mastered') mc++;
      else if (b.status === 'reviewing') rc++;
      else if (b.status === 'learning') lc++;
    }
  });
  const tot = lc + rc + mc || 1;

  return {
    trunk,
    canopyOutline,
    branches,
    roots,
    groundY: GROUND_Y,
    stats: {
      learning: lc,
      reviewing: rc,
      mastered: mc,
      total: tot,
      growthPct: Math.round((mc / tot) * 100),
    },
  };
}
