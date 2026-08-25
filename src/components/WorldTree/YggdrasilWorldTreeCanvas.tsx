/**
 * YggdrasilWorldTreeCanvas.tsx
 *
 * Pixel-Perfect Curved Fractal Renderer for the Yggdrasil World Tree.
 *
 * Faithful reproduction of the cyber World Tree architecture:
 *   - Luminous central vertical trunk with soft radiant cyan glow aura and MIMIRYX core
 *   - Upper Crown Branches: bowed quadratic Bézier curves with monochrome teal glow & dotted circuit veins
 *   - Lower Underworld Roots: bowed quadratic Bézier curves with vibrant emerald green glow & circuit veins
 *   - Tapered stroke widths by depth hierarchy (thickest near trunk, delicate toward leaf tips)
 *   - Glowing diamond crystals with Topic Title & Progress %
 *   - High-DPI Retina scaling (devicePixelRatio) for crisp, razor-sharp vector strokes
 *   - Synaptic pulse particles traveling along curves
 *   - Interactive Hover HUD Popover & Persistent Clicked Branch Inspector Modal
 *   - Camera lock/unlock (mouse wheel passes page scroll when locked, zooms when unlocked)
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Topic, Note } from '../../types';
import {
  Lock,
  Unlock,
  RotateCcw,
  Plus,
  Minus,
  X,
  BookOpen,
  ArrowRight,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { DigitalButterflies } from '../DigitalButterflies';
import { BUTTERFLY_TRIVIA } from '../../pages/Dashboard';

interface Cam {
  x: number;
  y: number;
  zoom: number;
  tx: number;
  ty: number;
  tz: number;
}

interface HoverHUDInfo {
  x: number;
  y: number;
  title: string;
  category: string;
  color: string;
  notesCount: number;
  completedCount: number;
  masteryPct: number;
  subtopics: string[];
  branchId: string;
}

interface TreeRenderNode {
  id: string;
  parentId?: string;
  type: 'core' | 'topic' | 'subtopic' | 'note' | 'root_main' | 'root_sub';
  title: string;
  category?: string;
  topicId?: string;
  noteId?: string;
  labId?: string;
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  cpx: number;
  cpy: number;
  depth: number;
  thickness: number;
  color: string;
  status: 'learning' | 'reviewing' | 'mastered' | 'foundation';
  mastery: number;
  nodeRadius: number;
  pulseOffset: number;
  birthTime: number;
}

// Deterministic hash helper for consistent natural curvature
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Pure Recursive Canopy Branching Engine:
 * Generates multi-level organic fractal sub-branches with strict 2-3 fanout cap,
 * quadratic Bézier curves on every segment, length decay, and tapered widths.
 */
function generateRecursiveCluster(
  parentPos: { x: number; y: number },
  parentId: string,
  items: Note[],
  currentDepth: number,
  maxDepth: number,
  baseAngle: number,
  baseLength: number,
  topic: Topic,
  topicBirth: number,
  birthTSMap: Map<string, number>,
  nodesList: TreeRenderNode[]
) {
  if (items.length === 0 || currentDepth > maxDepth) return;

  // Fan-out strictly capped at 2 to 3 branches per junction
  const childBranchCount = Math.min(3, Math.max(2, Math.ceil(items.length / 2)));
  const itemsPerChild = Math.ceil(items.length / childBranchCount);

  for (let b = 0; b < childBranchCount; b++) {
    const slice = items.slice(b * itemsPerChild, (b + 1) * itemsPerChild);
    if (slice.length === 0) continue;

    // Wide angular distribution to prevent crossing
    const spread = (b - (childBranchCount - 1) / 2) * (0.42 / Math.pow(1.1, currentDepth));
    const branchAngle = baseAngle + spread;
    const branchLength = baseLength * (0.64 + (b % 2 === 0 ? 0.08 : 0)); // Length decay per depth

    // Compute end position
    const endP = {
      x: parentPos.x + Math.cos(branchAngle) * branchLength * 1.25,
      y: parentPos.y + Math.sin(branchAngle) * branchLength * 0.85,
    };

    // Quadratic Bézier control point bowed organically outward
    const mx = (parentPos.x + endP.x) / 2;
    const my = (parentPos.y + endP.y) / 2;
    const dx = endP.x - parentPos.x;
    const dy = endP.y - parentPos.y;
    const segLen = Math.hypot(dx, dy) || 1;
    const nx = -dy / segLen;
    const ny = dx / segLen;
    const seed = hashSeed(`${parentId}-rec-${currentDepth}-${b}`);
    const curveAmount = segLen * (0.16 + (seed % 0.06));
    const sideSign = spread >= 0 ? 1 : -1;
    const cpx = mx + nx * curveAmount * sideSign;
    const cpy = my + ny * curveAmount * sideSign - 4;

    const isLeafLevel = currentDepth >= maxDepth || slice.length === 1;

    if (isLeafLevel && slice.length === 1) {
      // Terminal note leaf
      const note = slice[0];
      const noteBirth = birthTSMap.get(note.id) || 0;
      const progress = note.status === 'mastered' ? 100 : note.status === 'reviewing' ? 60 : 20;

      nodesList.push({
        id: `note-${note.id}`,
        parentId,
        type: 'note',
        title: note.title,
        category: topic.name,
        topicId: topic.id,
        noteId: note.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth + 1,
        thickness: Math.max(1.4, 3.8 - currentDepth * 0.7),
        color: note.status === 'mastered' ? '#00ff88' : note.status === 'reviewing' ? '#ffb020' : '#00f0ff',
        status: note.status,
        mastery: progress,
        nodeRadius: 3.8,
        pulseOffset: currentDepth * 0.2 + b * 0.1,
        birthTime: noteBirth,
      });
    } else {
      // Intermediate recursive limb
      const branchId = `${parentId}-rec-${currentDepth}-${b}`;
      const limbThickness = Math.max(1.8, 4.4 - currentDepth * 0.85);

      nodesList.push({
        id: branchId,
        parentId,
        type: 'subtopic',
        title: `${topic.name} Sub-Branch ${b + 1}`,
        category: topic.name,
        topicId: topic.id,
        p0: parentPos,
        p1: endP,
        cpx,
        cpy,
        depth: currentDepth + 1,
        thickness: limbThickness,
        color: '#00f0ff',
        status: 'learning',
        mastery: 50,
        nodeRadius: Math.max(3.8, 6.0 - currentDepth * 0.9),
        pulseOffset: currentDepth * 0.2 + b * 0.1,
        birthTime: topicBirth,
      });

      // Recurse deeper with the remaining subset of items
      generateRecursiveCluster(
        endP,
        branchId,
        slice,
        currentDepth + 1,
        maxDepth,
        branchAngle,
        branchLength,
        topic,
        topicBirth,
        birthTSMap,
        nodesList
      );
    }
  }
}

export interface YggdrasilWorldTreeCanvasProps {
  activeRealm?: string | null;
  onSelectRealm?: (realm: string) => void;
  availableRealms?: string[];
}

export const YggdrasilWorldTreeCanvas: React.FC<YggdrasilWorldTreeCanvasProps> = ({
  activeRealm,
  onSelectRealm,
  availableRealms,
}) => {
  const { topics: allTopics, notes: allNotes, labs, customBg } = useApp();

  // Filter by Realm if specified
  const topics = useMemo(() => {
    if (!activeRealm || activeRealm === 'ALL') return allTopics;
    return allTopics.filter(t => t.category === activeRealm);
  }, [allTopics, activeRealm]);

  const notes = useMemo(() => {
    if (!activeRealm || activeRealm === 'ALL') return allNotes;
    const realmTopicIds = new Set(topics.map(t => t.id));
    return allNotes.filter(n => realmTopicIds.has(n.topicId));
  }, [allNotes, topics, activeRealm]);

  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLocked, setIsLocked] = useState(true);
  const [glowAll, setGlowAll] = useState(false);
  const [pinnedBranch, setPinnedBranch] = useState<any | null>(null);
  const [hoverHUD, setHoverHUD] = useState<HoverHUDInfo | null>(null);
  const hoveredRef = useRef<string | null>(null);

  // Birth-timestamp tracking for growth animation
  const birthTS = useRef<Map<string, number>>(new Map());
  const prevIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const cur = new Set<string>();
    topics.forEach((t) => cur.add(t.id));
    notes.forEach((n) => cur.add(n.id));
    labs.forEach((l) => cur.add(l.id));
    cur.forEach((id) => {
      if (!prevIds.current.has(id)) birthTS.current.set(id, performance.now());
    });
    prevIds.current = cur;
  }, [topics, notes, labs]);

  // Fluid Camera Engine (Smooth pan/zoom via lerp)
  const cam = useRef<Cam>({ x: 0, y: 35, zoom: 0.65, tx: 0, ty: 35, tz: 0.65 });

  // ── Build Tree Hierarchy with Curved Bézier Geometry ──
  const treeNodes = useMemo(() => {
    const nodesList: TreeRenderNode[] = [];
    const corePos = { x: 0, y: 0 };
    const trunkTop = { x: 0, y: -220 };

    // 1. Central Trunk Segment
    nodesList.push({
      id: 'trunk-core',
      type: 'core',
      title: 'MIMIRYX',
      category: 'Neural Trunk Core',
      p0: corePos,
      p1: trunkTop,
      cpx: 0,
      cpy: -110,
      depth: 0,
      thickness: 10,
      color: '#00f0ff',
      status: 'mastered',
      mastery: 100,
      nodeRadius: 18,
      pulseOffset: 0,
      birthTime: 0,
    });

    // 2. Upper Topic Branches (Crown)
    const effectiveTopics = [...topics];
    const topicCount = effectiveTopics.length || 1;

    effectiveTopics.forEach((topic, idx) => {
      const topicNotes = notes.filter((n) => n.topicId === topic.id);
      const masteredNotes = topicNotes.filter((n) => n.status === 'mastered').length;
      const progress = topicNotes.length ? Math.round((masteredNotes / topicNotes.length) * 100) : 0;
      const topicBirth = birthTS.current.get(topic.id) || 0;

      // Angular spread across upper hemisphere (-0.88*PI to -0.12*PI)
      const spread = topicCount === 1 ? 0.5 : idx / (topicCount - 1);
      const angle = -Math.PI * 0.88 + spread * (Math.PI * 0.76);
      const len = 220 + (idx % 2 === 0 ? 35 : 0);

      // Staggered emergence along upper trunk
      const emergeT = 0.65 + (idx % 3) * 0.14;
      const startP = { x: 0, y: -220 * emergeT };
      const endP = {
        x: Math.cos(angle) * len * 1.55,
        y: -220 + Math.sin(angle) * len * 0.75,
      };

      // Quadratic Bézier control point bowed gracefully upward/outward
      const mx = (startP.x + endP.x) / 2;
      const my = (startP.y + endP.y) / 2;
      const dx = endP.x - startP.x;
      const dy = endP.y - startP.y;
      const segLen = Math.hypot(dx, dy) || 1;
      const nx = -dy / segLen;
      const ny = dx / segLen;
      const seed = hashSeed(topic.id);
      const curveAmount = segLen * (0.15 + (seed % 0.08));
      const sideSign = endP.x >= 0 ? 1 : -1;
      const cpx = mx + nx * curveAmount * sideSign;
      const cpy = my + ny * curveAmount * sideSign - 15;

      const topicNode: TreeRenderNode = {
        id: `topic-${topic.id}`,
        parentId: 'trunk-core',
        type: 'topic',
        title: topic.name,
        category: topic.category || 'Knowledge Domain',
        topicId: topic.id,
        p0: startP,
        p1: endP,
        cpx,
        cpy,
        depth: 1,
        thickness: 5.5,
        color: '#00f0ff',
        status: progress >= 80 ? 'mastered' : progress > 0 ? 'reviewing' : 'learning',
        mastery: progress,
        nodeRadius: 10,
        pulseOffset: idx * 0.3,
        birthTime: topicBirth,
      };
      nodesList.push(topicNode);

      // 3. GENUINE RECURSIVE CANOPY HIERARCHY
      generateRecursiveCluster(
        endP,
        topicNode.id,
        topicNotes,
        1,       // current depth in cluster
        3,       // max recursion depth
        angle,   // base angle
        88,      // initial length
        topic,
        topicBirth,
        birthTS.current,
        nodesList
      );
    });

    // 4. Lower Roots (Foundations)
    const ROOT_FOUNDATIONS = [
      { id: 'root-0', title: 'Computational Logic & Graph Theory', angleRatio: 0.15, len: 215 },
      { id: 'root-1', title: 'Systems & Kernel Architecture', angleRatio: 0.35, len: 260 },
      { id: 'root-2', title: 'Network Theory & Routing Dynamics', angleRatio: 0.50, len: 275 },
      { id: 'root-3', title: 'Consensus & State Machine Replication', angleRatio: 0.65, len: 260 },
      { id: 'root-4', title: 'Information Theory & Cryptography', angleRatio: 0.85, len: 215 },
    ];

    ROOT_FOUNDATIONS.forEach((rf, ri) => {
      const rootAngle = Math.PI * 0.22 + rf.angleRatio * (Math.PI * 0.56);
      const rootEndP = {
        x: Math.cos(rootAngle) * rf.len * 1.45,
        y: Math.sin(rootAngle) * rf.len * 0.95,
      };

      const rmx = (corePos.x + rootEndP.x) / 2;
      const rmy = (corePos.y + rootEndP.y) / 2;
      const rdx = rootEndP.x - corePos.x;
      const rdy = rootEndP.y - corePos.y;
      const rlen = Math.hypot(rdx, rdy) || 1;
      const rnx = -rdy / rlen;
      const rny = rdx / rlen;
      const rSide = rootEndP.x >= 0 ? -1 : 1;
      const rcpx = rmx + rnx * rlen * 0.16 * rSide;
      const rcpy = rmy + rny * rlen * 0.16 * rSide;

      const rootNode: TreeRenderNode = {
        id: rf.id,
        parentId: 'trunk-core',
        type: 'root_main',
        title: rf.title,
        category: 'Root Foundation',
        p0: corePos,
        p1: rootEndP,
        cpx: rcpx,
        cpy: rcpy,
        depth: 1,
        thickness: 5.0,
        color: '#00ff88',
        status: 'foundation',
        mastery: 100,
        nodeRadius: 7,
        pulseOffset: ri * 0.25,
        birthTime: 0,
      };
      nodesList.push(rootNode);

      // Sub-root anchors
      for (let s = 0; s < 2; s++) {
        const subRootAngle = rootAngle + (s === 0 ? -0.22 : 0.22);
        const subRootLen = rf.len + 45;
        const subRootEndP = {
          x: Math.cos(subRootAngle) * subRootLen * 1.35,
          y: Math.sin(subRootAngle) * subRootLen * 0.95,
        };
        const srmx = (rootEndP.x + subRootEndP.x) / 2;
        const srmy = (rootEndP.y + subRootEndP.y) / 2;

        nodesList.push({
          id: `${rf.id}-sub-${s}`,
          parentId: rootNode.id,
          type: 'root_sub',
          title: s === 0 ? 'Deep Synapse' : 'Ground Anchor',
          category: 'Root Anchor',
          p0: rootEndP,
          p1: subRootEndP,
          cpx: srmx,
          cpy: srmy,
          depth: 2,
          thickness: 2.2,
          color: '#00ff88',
          status: 'foundation',
          mastery: 100,
          nodeRadius: 3.5,
          pulseOffset: ri * 0.25 + s * 0.12,
          birthTime: 0,
        });
      }
    });

    return nodesList;
  }, [topics, notes, labs]);

  // ─── Canvas render loop + interaction ────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d', { alpha: true });
    if (!ctx) return;
    let raf: number;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = cvs.parentElement?.clientWidth || 1100;
    let H = cvs.parentElement?.clientHeight || 660;

    cvs.width = W * dpr;
    cvs.height = H * dpr;
    ctx.scale(dpr, dpr);

    const resizeObserver = new ResizeObserver(() => {
      if (!cvs.parentElement) return;
      W = cvs.parentElement.clientWidth;
      H = cvs.parentElement.clientHeight;
      cvs.width = W * dpr;
      cvs.height = H * dpr;
      ctx.scale(dpr, dpr);
    });
    if (cvs.parentElement) {
      resizeObserver.observe(cvs.parentElement);
    }

    // Starfield
    const stars = Array.from({ length: 110 }, (_, i) => ({
      x: (Math.sin(i * 17.31 + 0.1) - 0.0) * 2600 + (i % 7) * 180 - 630,
      y: (Math.cos(i * 23.73 + 0.3) - 0.0) * 2600 + (i % 5) * 200 - 500,
      s: 0.5 + (i % 5) * 0.25,
      a: 0.25 + (i % 4) * 0.18,
      tw: 1 + (i % 3) * 0.5,
    }));

    // Binary Rain State
    const MAX_COLS = 200;
    const rainDrops = Array.from({ length: MAX_COLS }, () => ({
      y: Math.random() * -1000,
      speed: 0.5 + Math.random() * 1.2,
      chars: Array.from({ length: 6 + Math.floor(Math.random() * 15) }, () => Math.random() > 0.5 ? '1' : '0')
    }));

    const GROWTH_DURATION = 1200;

    // ── Render frame (GPU optimized, 60fps) ────────
    const render = (time: number) => {
      const c = cam.current;
      c.x += (c.tx - c.x) * 0.1;
      c.y += (c.ty - c.y) * 0.1;
      c.zoom += (c.tz - c.zoom) * 0.1;

      // Background
      ctx.clearRect(0, 0, W, H);
      if (!isIdle) {
        if (customBg) {
          ctx.fillStyle = 'rgba(3, 6, 14, 0.55)';
          ctx.fillRect(0, 0, W, H);
        } else {
          ctx.fillStyle = '#030810';
          ctx.fillRect(0, 0, W, H);
        }
      }
      // ── Cyber Binary Rain (Screen Space) ──
      ctx.save();
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const colsToRender = Math.min(MAX_COLS, Math.floor(W / 14));
      for (let i = 0; i < colsToRender; i++) {
        const drop = rainDrops[i];
        const x = i * 14 + 7;
        for (let j = 0; j < drop.chars.length; j++) {
          const charY = drop.y - j * 10;
          if (charY > 0 && charY < H + 10) {
             if (Math.random() < 0.02) drop.chars[j] = Math.random() > 0.5 ? '1' : '0';
             const alpha = 1 - (j / drop.chars.length);
             ctx.fillStyle = j === 0 ? `rgba(180, 255, 255, ${alpha * 0.4})` : `rgba(0, 200, 255, ${alpha * 0.15})`;
             ctx.fillText(drop.chars[j], x, charY);
          }
        }
        drop.y += drop.speed;
        if (drop.y - drop.chars.length * 10 > H) {
          drop.y = Math.random() * -50;
          drop.speed = 0.5 + Math.random() * 1.2;
        }
      }
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + c.x, H / 2 + c.y);
      ctx.scale(c.zoom, c.zoom);

      // ── 0. Cosmic Starfield ──
      stars.forEach((s, i) => {
        const tw = (Math.sin(time * 0.002 * s.tw + i) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 225, 255, ${s.a * tw})`;
        ctx.fill();
      });

      // ── 1. Header: C R O W N · B R A N C H E S ──
      ctx.save();
      ctx.font = 'bold 10px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.55)';
      ctx.textAlign = 'center';
      ctx.fillText('C R O W N   ·   B R A N C H E S', 0, -360);
      ctx.restore();

      // ── 1.5. Holographic Root Pedestal (Ground Plane) ──
      ctx.save();
      // Translate to exactly where the longest roots terminate (y: ~235)
      ctx.translate(0, 235);
      
      const pedPulse = Math.sin(time * 0.0012) * 0.5 + 0.5;

      // Core glowing aura
      ctx.beginPath();
      ctx.ellipse(0, 0, 320, 55, 0, 0, Math.PI * 2);
      const groundAura = ctx.createRadialGradient(0, 0, 0, 0, 0, 320);
      groundAura.addColorStop(0, `rgba(0, 255, 136, ${0.12 + pedPulse * 0.05})`); // Emerald match
      groundAura.addColorStop(0.5, `rgba(0, 255, 136, ${0.03 + pedPulse * 0.02})`);
      groundAura.addColorStop(1, 'rgba(0, 255, 136, 0)');
      ctx.fillStyle = groundAura;
      ctx.fill();

      // Concentric structural rings
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, i * 64, i * 11, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.25 - i * 0.04 + pedPulse * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Radiating circuit lines
      for (let i = 0; i < 16; i++) {
        const theta = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        // Inner gap so they don't crowd the center
        ctx.moveTo(Math.cos(theta) * 40, Math.sin(theta) * 7); 
        ctx.lineTo(Math.cos(theta) * 300, Math.sin(theta) * 51.5);
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 + pedPulse * 0.04})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Floating data particles rising from the ground
      for (let i = 0; i < 15; i++) {
        const pT = (time * 0.0002 + i * 0.43) % 1.0;
        const px = Math.cos(i * 1.7) * 200 * pT;
        const py = (Math.sin(i * 1.7) * 35 * pT) - (pT * 50); // rise upwards
        
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${1 - pT})`;
        ctx.fill();
      }
      ctx.restore();

      // ── 2. Organic Tapered S-Curved Trunk & Radiant Cyan Glow ──
      const trunkTC = {
        p0: { x: 0, y: 0 },
        cp1: { x: -6, y: -75 },
        cp2: { x: 4, y: -150 },
        p1: { x: 0, y: -220 },
      };

      // Helper to evaluate trunk cubic curve at t
      const sampleTrunk = (t: number) => {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        return {
          x: uuu * trunkTC.p0.x + 3 * uu * t * trunkTC.cp1.x + 3 * u * tt * trunkTC.cp2.x + ttt * trunkTC.p1.x,
          y: uuu * trunkTC.p0.y + 3 * uu * t * trunkTC.cp1.y + 3 * u * tt * trunkTC.cp2.y + ttt * trunkTC.p1.y,
        };
      };

      const trunkTangent = (t: number) => {
        const u = 1 - t;
        return {
          x: 3 * u * u * (trunkTC.cp1.x - trunkTC.p0.x) + 6 * u * t * (trunkTC.cp2.x - trunkTC.cp1.x) + 3 * t * t * (trunkTC.p1.x - trunkTC.cp2.x),
          y: 3 * u * u * (trunkTC.cp1.y - trunkTC.p0.y) + 6 * u * t * (trunkTC.cp2.y - trunkTC.cp1.y) + 3 * t * t * (trunkTC.p1.y - trunkTC.cp2.y),
        };
      };

      // Taper function: 38px at root base, gracefully narrowing to 16px at crown
      const trunkWidthAt = (t: number) => {
        return 16.0 + (38.0 - 16.0) * Math.pow(1 - t, 1.25);
      };

      // Ambient radial glow behind the organic trunk (Respecting Surroundings)
      const trunkPulse = Math.sin(time * 0.0015) * 0.5 + 0.5;
      ctx.save();
      const trunkMid = sampleTrunk(0.45);
      const trunkAura = ctx.createRadialGradient(trunkMid.x, trunkMid.y, 10, trunkMid.x, trunkMid.y, 300);
      trunkAura.addColorStop(0, `rgba(0, 240, 255, ${0.18 + trunkPulse * 0.08})`);
      trunkAura.addColorStop(0.5, `rgba(0, 200, 240, ${0.05 + trunkPulse * 0.02})`);
      trunkAura.addColorStop(1, 'rgba(0, 200, 240, 0.0)');
      ctx.fillStyle = trunkAura;
      ctx.beginPath();
      ctx.arc(trunkMid.x, trunkMid.y, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Tapered Trunk Multi-Vein Circuit Structure (5 parallel organic fibers)
      const fiberOffsets = [-0.42, -0.21, 0, 0.21, 0.42];

      fiberOffsets.forEach((off) => {
        const isCenter = Math.abs(off) < 0.01;
        const fiberPoints: Array<{ x: number; y: number }> = [];

        for (let step = 0; step <= 28; step++) {
          const t = step / 28;
          const pos = sampleTrunk(t);
          const tan = trunkTangent(t);
          const tlen = Math.hypot(tan.x, tan.y) || 1;
          const nx = tan.y / tlen;
          const ny = -tan.x / tlen;
          const hw = trunkWidthAt(t) / 2;

          fiberPoints.push({
            x: pos.x + nx * hw * off,
            y: pos.y + ny * hw * off,
          });
        }

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const drawFiberLayer = (w: number, color: string, blur: number = 0) => {
          ctx.beginPath();
          ctx.moveTo(fiberPoints[0].x, fiberPoints[0].y);
          for (let p = 1; p < fiberPoints.length; p++) ctx.lineTo(fiberPoints[p].x, fiberPoints[p].y);
          ctx.strokeStyle = color;
          ctx.lineWidth = w;
          if (blur > 0) {
            ctx.shadowBlur = 0; // Disabled for performance
          }
          ctx.stroke();
        };

        if (isCenter) {
          // Central Core Fiber Glow
          drawFiberLayer(12.0, `rgba(0, 240, 255, ${0.08 + trunkPulse * 0.04})`, 20);
          drawFiberLayer(5.0, `rgba(0, 220, 255, ${0.25 + trunkPulse * 0.1})`);
          drawFiberLayer(2.8, `rgba(100, 240, 255, 0.8)`);
          drawFiberLayer(1.0, `rgba(255, 255, 255, 1.0)`);
        } else {
          // Outer Fibers (Subtler)
          drawFiberLayer(6.0, `rgba(0, 200, 255, ${0.05 + trunkPulse * 0.02})`);
          drawFiberLayer(2.0, `rgba(0, 180, 220, ${0.3 + trunkPulse * 0.05})`);
          drawFiberLayer(1.0, `rgba(200, 255, 255, 0.6)`);
        }

        // Secondary Dashed / Dotted Circuit Vein Texture
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 0.025 * (isCenter ? 1.3 : 1.0);
        ctx.strokeStyle = isCenter ? '#00f0ff' : 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      // Traveling Synaptic Energy Pulses moving up the curved trunk
      for (let p = 0; p < 3; p++) {
        const pulseT = (time * 0.0007 + p * 0.33) % 1.0;
        const pulsePos = sampleTrunk(pulseT);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pulsePos.x, pulsePos.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // Smooth Root Junction Flare Hub (y = 0)
      ctx.save();
      const rootHub = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      rootHub.addColorStop(0, 'rgba(0, 255, 180, 0.45)');
      rootHub.addColorStop(0.6, 'rgba(0, 240, 255, 0.15)');
      rootHub.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      ctx.fillStyle = rootHub;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Smooth Canopy Split Flare Hub (y = -220)
      ctx.save();
      const crownHub = ctx.createRadialGradient(0, -220, 2, 0, -220, 14);
      crownHub.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      crownHub.addColorStop(0.6, 'rgba(0, 200, 240, 0.15)');
      crownHub.addColorStop(1, 'rgba(0, 200, 240, 0.0)');
      ctx.fillStyle = crownHub;
      ctx.beginPath();
      ctx.arc(0, -220, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 3. Draw All Curved Branches & Roots (Layered Rendering) ──
      const hovered = hoveredRef.current;

      treeNodes.forEach((node) => {
        if (node.type === 'core') return; // Handled by dedicated organic tapered trunk renderer

        let gt = 1;
        if (node.birthTime > 0) {
          gt = Math.min(1, Math.max(0, (time - node.birthTime) / GROWTH_DURATION));
          gt = 1 - Math.pow(1 - gt, 3);
        }
        if (gt < 0.05) return;

        const isRoot = node.type === 'root_main' || node.type === 'root_sub';
        const isMainBranch = node.type === 'topic';
        const isHovered = hovered === node.id || hovered === node.topicId;

        const p0 = node.p0;
        const p1 = node.p1;
        const cpx = node.cpx;
        const cpy = node.cpy;

        ctx.globalAlpha = gt;

        // Determine branch colors based on state
        let stroke1, stroke2, stroke3, strokeDash;

        if (isRoot) {
          stroke1 = 'rgba(0, 255, 136, 0.18)';
          stroke2 = 'rgba(0, 220, 120, 0.85)';
          stroke3 = 'rgba(210, 255, 230, 0.95)';
          strokeDash = 'rgba(0, 255, 136, 0.95)';
        } else if (isHovered) {
          // Intense Luminous Cyan Hover State
          stroke1 = 'rgba(0, 240, 255, 0.65)';
          stroke2 = 'rgba(0, 250, 255, 1.0)';
          stroke3 = 'rgba(230, 255, 255, 1.0)';
          strokeDash = 'rgba(0, 255, 255, 1.0)';
        } else {
          // ALL branches are dim by default to create maximum contrast on hover
          stroke1 = 'rgba(0, 140, 180, 0.08)';
          stroke2 = 'rgba(0, 150, 200, 0.40)';
          stroke3 = 'rgba(150, 200, 220, 0.30)';
          strokeDash = 'rgba(0, 180, 220, 0.50)';
        }

        // A. Hyper-Realistic Multi-Layer Light Falloff
        const isGlowing = isHovered || glowAll;
        const pulse = Math.sin(time * 0.0015 + node.pulseOffset * 10) * 0.5 + 0.5; // 0 to 1 breathing pulse
        
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw multiple stroked layers instead of relying heavily on shadowBlur
        const drawLayer = (widthMult: number, colorStr: string, blur: number = 0) => {
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(cpx, cpy, p1.x, p1.y);
          ctx.strokeStyle = colorStr;
          ctx.lineWidth = node.thickness * widthMult;
          if (blur > 0) {
            // Disabled shadowBlur for massive FPS gain. We rely on wide low-opacity strokes instead.
            ctx.shadowBlur = 0;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
        };

        if (isGlowing) {
          if (isRoot) {
            // Emerald Glow
            drawLayer(6.0, `rgba(0, 255, 136, ${0.05 + pulse * 0.03})`, 12);
            drawLayer(3.5, `rgba(0, 255, 136, ${0.15 + pulse * 0.1})`);
            drawLayer(1.5, `rgba(150, 255, 200, ${0.6 + pulse * 0.2})`);
            drawLayer(0.6, `rgba(230, 255, 240, 0.95)`); // warm/white core
          } else {
            // Cyan Glow
            drawLayer(6.0, `rgba(0, 240, 255, ${0.05 + pulse * 0.03})`, 12);
            drawLayer(3.5, `rgba(0, 220, 255, ${0.2 + pulse * 0.1})`);
            drawLayer(1.5, `rgba(150, 240, 255, ${0.6 + pulse * 0.2})`);
            drawLayer(0.6, `rgba(230, 255, 255, 0.95)`); // warm/white core
          }
        } else {
          // Dim state
          if (isRoot) {
            drawLayer(2.0, 'rgba(0, 180, 100, 0.05)');
            drawLayer(1.0, 'rgba(0, 220, 120, 0.2)');
          } else {
            drawLayer(2.0, 'rgba(0, 140, 180, 0.08)');
            drawLayer(1.0, 'rgba(0, 180, 220, 0.3)');
          }
        }

        // B. Secondary Dashed Circuit-Vein Texture with Pulsing Animation
        ctx.setLineDash([3, 5]);
        ctx.lineDashOffset = -time * 0.02 * (node.depth === 1 ? 1.4 : 1.0);
        ctx.strokeStyle = strokeDash;
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // C. Synaptic Traveling Energy Pulse Dot
        if (node.depth <= 2) {
          const pt = ((time * 0.0006 + node.pulseOffset) % 1.0);
          const u = 1 - pt;
          const dotX = u * u * p0.x + 2 * u * pt * cpx + pt * pt * p1.x;
          const dotY = u * u * p0.y + 2 * u * pt * cpy + pt * pt * p1.y;

          ctx.beginPath();
          ctx.arc(dotX, dotY, isRoot ? 2.2 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      });

      // ── 4. Central Trunk Core MIMIRYX & Labels ──
      // Central MIMIRYX text directly at base
      ctx.save();
      ctx.font = 'bold 12px "Space Grotesk", monospace, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M I M I R Y X', 0, -22);
      ctx.restore();

      // ── 5. Diamond Crystals at Node Endpoints ──
      treeNodes.forEach((node) => {
        if (node.nodeRadius <= 0) return;
        const tp = node.p1;
        const isHovered = hovered === node.id;
        const isTopic = node.type === 'topic';
        const isRoot = node.type === 'root_main' || node.type === 'root_sub';
        const r = isHovered ? node.nodeRadius + 3 : node.nodeRadius;
        const color = isRoot
          ? '#00ff88'
          : node.status === 'mastered'
          ? '#00ff88'
          : node.status === 'reviewing'
          ? '#ffb020'
          : '#00f0ff';

        // Outer Diamond Crystal
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tp.x, tp.y - r);
        ctx.lineTo(tp.x + r * 0.8, tp.y);
        ctx.lineTo(tp.x, tp.y + r);
        ctx.lineTo(tp.x - r * 0.8, tp.y);
        ctx.closePath();
        ctx.fillStyle = isHovered ? '#ffffff' : color;
        ctx.fill();

        // Outer Glowing Ring for Topics
        if (isTopic || node.type === 'core') {
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}66`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // ⭐ TOPIC TITLE LABELS & MASTERY % (Crisp & Clean)
        if (isTopic && (c.zoom > 0.45 || isHovered)) {
          const labelText = node.title;
          const pctText = `${node.mastery}.0%`;

          ctx.font = 'bold 10.5px "Space Grotesk", sans-serif';
          ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(labelText, tp.x, tp.y + r + 5);

          ctx.font = '9px "Space Grotesk", sans-serif';
          ctx.fillStyle = color;
          ctx.fillText(pctText, tp.x, tp.y + r + 18);
        }

        ctx.restore();
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    // ── Interaction: Optimized Hit Detection ─────
    const worldPos = (e: MouseEvent) => {
      const r = cvs.getBoundingClientRect();
      const c = cam.current;
      return {
        x: (e.clientX - r.left - W / 2 - c.x) / c.zoom,
        y: (e.clientY - r.top - H / 2 - c.y) / c.zoom,
      };
    };

    let dragging = false;
    let dsx = 0, dsy = 0;

    const onDown = (e: MouseEvent) => {
      if (isLocked) return;
      dragging = true;
      dsx = e.clientX - cam.current.x;
      dsy = e.clientY - cam.current.y;
    };

    const onMove = (e: MouseEvent) => {
      if (dragging && !isLocked) {
        cam.current.x = e.clientX - dsx;
        cam.current.y = e.clientY - dsy;
        cam.current.tx = cam.current.x;
        cam.current.ty = cam.current.y;
      }

      const wp = worldPos(e);
      let hitNode: TreeRenderNode | null = null;

      for (const node of treeNodes) {
        if (node.nodeRadius <= 0) continue;
        const dist = Math.hypot(wp.x - node.p1.x, wp.y - node.p1.y);
        if (dist <= node.nodeRadius + 12 / cam.current.zoom) {
          hitNode = node;
          break;
        }
      }

      if (hitNode) {
        if (hoveredRef.current !== hitNode.id) {
          hoveredRef.current = hitNode.id;
          cvs.style.cursor = 'pointer';
          sounds.playNodePulse();

          const r = cvs.getBoundingClientRect();
          const screenX = e.clientX - r.left;
          const screenY = e.clientY - r.top;

          const branchNotes = notes.filter((n) => n.topicId === hitNode?.topicId);
          const masteredCount = branchNotes.filter((n) => n.status === 'mastered').length;
          const mastery = branchNotes.length ? Math.round((masteredCount / branchNotes.length) * 100) : 0;
          const currentTopic = topics.find((t) => t.id === hitNode?.topicId);

          setHoverHUD({
            x: screenX,
            y: screenY,
            title: hitNode.title,
            category: currentTopic?.category || hitNode.category || 'Neural Cluster',
            color: hitNode.color,
            notesCount: branchNotes.length,
            completedCount: masteredCount,
            masteryPct: mastery,
            subtopics: branchNotes.slice(0, 4).map((n) => n.title),
            branchId: hitNode.id,
          });
        }
      } else {
        if (hoveredRef.current !== null) {
          hoveredRef.current = null;
          cvs.style.cursor = dragging ? 'grabbing' : 'default';
          setHoverHUD(null);
        }
      }
    };

    const onUp = () => { dragging = false; };

    const onClick = (e: MouseEvent) => {
      const wp = worldPos(e);
      for (const node of treeNodes) {
        if (node.nodeRadius <= 0) continue;
        if (Math.hypot(wp.x - node.p1.x, wp.y - node.p1.y) <= node.nodeRadius + 12 / cam.current.zoom) {
          sounds.playClick();
          const currentTopic = topics.find((t) => t.id === node.topicId);
          const topicNotes = notes.filter((n) => n.topicId === node.topicId);
          const topicLabs = labs.filter((l) => l.topicId === node.topicId);

          setPinnedBranch({
            id: node.id,
            title: node.title,
            topic: currentTopic,
            notes: topicNotes,
            labs: topicLabs,
            noteId: node.noteId,
            labId: node.labId,
            status: node.status,
          });
          return;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (isLocked) return;
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.14 : 0.86;
      const nz = Math.min(3.5, Math.max(0.2, cam.current.zoom * f));
      const mx = e.clientX - cvs.getBoundingClientRect().left - W / 2;
      const my = e.clientY - cvs.getBoundingClientRect().top - H / 2;
      cam.current.x -= (mx - cam.current.x) * (f - 1);
      cam.current.y -= (my - cam.current.y) * (f - 1);
      cam.current.zoom = nz;
      cam.current.tx = cam.current.x;
      cam.current.ty = cam.current.y;
      cam.current.tz = nz;
    };

    cvs.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    cvs.addEventListener('click', onClick);
    cvs.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      cvs.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cvs.removeEventListener('click', onClick);
      cvs.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    };
  }, [treeNodes, customBg, isLocked, notes, labs, topics]);

  const resetCam = () => {
    sounds.playClick();
    cam.current.tx = 0;
    cam.current.ty = 35;
    cam.current.tz = 0.65;
    setPinnedBranch(null);
  };

  return (
    <div className={`relative w-full h-full min-h-[580px] lg:min-h-[640px] overflow-hidden select-none transition-colors duration-700 ${
      isIdle 
        ? 'bg-transparent' 
        : 'bg-[#030810]'
    }`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full block focus:outline-none ${isLocked ? '' : 'touch-none'}`}
      />

      {/* Embedded Trivia Butterflies bounded to this canvas container */}
      <DigitalButterflies triviaPool={BUTTERFLY_TRIVIA} maxCount={8} />

      {/* Controls — top-right */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            sounds.playClick();
            cam.current.tz = Math.min(3.5, cam.current.zoom * 1.25);
          }}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/80 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30 transition-all"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            cam.current.tz = Math.max(0.2, cam.current.zoom * 0.8);
          }}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/80 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30 transition-all"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={resetCam}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/80 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30 transition-all"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setGlowAll((v) => !v);
          }}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
            glowAll
              ? 'bg-primary/20 border-primary text-primary shadow-neon-glow'
              : 'border-border bg-card/80 text-foreground hover:border-primary/50'
          }`}
          title={glowAll ? 'Disable Global Glow' : 'Enable Global Glow'}
        >
          <Sun className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setIsLocked((v) => !v);
          }}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
            isLocked
              ? 'bg-primary/20 border-primary text-primary shadow-neon-glow'
              : 'border-border bg-card/80 text-foreground'
          }`}
          title={isLocked ? 'Unlock camera to zoom/pan' : 'Lock camera'}
        >
          {isLocked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Hover Popover HUD (Follows cursor smoothly) */}
      {hoverHUD && !pinnedBranch && (
        <div
          className="absolute z-40 pointer-events-none p-3.5 rounded-xl bg-black/90 backdrop-blur-md border shadow-2xl max-w-xs space-y-2 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: hoverHUD.x > 500 ? hoverHUD.x - 300 : hoverHUD.x + 18,
            top: Math.min(520, Math.max(16, hoverHUD.y - 40)),
            borderColor: `${hoverHUD.color}66`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 15px ${hoverHUD.color}22`,
          }}
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <span
              className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${hoverHUD.color}20`, color: hoverHUD.color }}
            >
              {hoverHUD.category}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {hoverHUD.notesCount} Records · {hoverHUD.masteryPct}%
            </span>
          </div>

          <h4 className="text-xs font-heading font-bold text-foreground truncate">
            {hoverHUD.title}
          </h4>

          {hoverHUD.subtopics.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                Branch Records:
              </span>
              <div className="space-y-0.5">
                {hoverHUD.subtopics.map((st, idx) => (
                  <div key={idx} className="text-[10px] font-mono text-foreground/80 truncate flex items-center gap-1">
                    <span className="text-primary">•</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1 text-[9px] font-mono text-primary flex items-center justify-between border-t border-border/30">
            <span>Click to lock & view details</span>
            <span>↵</span>
          </div>
        </div>
      )}

      {/* Floating Pill Overlay for Realms Selection (Bottom-Left) */}
      {availableRealms && availableRealms.length > 0 && onSelectRealm && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="relative inline-flex items-center">
            <select
              value={activeRealm || 'ALL'}
              onChange={(e) => {
                sounds.playClick();
                onSelectRealm(e.target.value);
              }}
              className="appearance-none bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-primary/50 text-foreground hover:text-primary transition-all text-xs font-mono pl-3.5 pr-8 py-2 rounded-full outline-none cursor-pointer tracking-wider shadow-lg flex items-center gap-1.5 focus:ring-1 focus:ring-primary/50"
            >
              {availableRealms.map((realm) => (
                <option key={realm} value={realm} className="bg-[#0b101a] text-foreground font-mono">
                  {realm === 'ALL' ? 'All realms' : realm}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Legend — bottom right (matches reference image) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 text-[10px] font-mono text-muted-foreground pointer-events-none bg-black/75 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-border/60">
        <span className="flex items-center gap-2 text-foreground font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          LEARNING
        </span>
        <span className="flex items-center gap-2 text-foreground font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#ffb020] shadow-[0_0_6px_#ffb020]" />
          REVIEWING
        </span>
        <span className="flex items-center gap-2 text-foreground font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
          MASTERED
        </span>
      </div>

      {/* Pinned Branch Inspector Modal (Locks open when clicked until closed) */}
      {pinnedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-150">
          <div className="bg-card border border-primary/50 rounded-2xl p-6 w-full max-w-lg cyber-card space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 bg-[#070e17]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${pinnedBranch.topic?.color || '#00f0ff'}15`,
                    color: pinnedBranch.topic?.color || '#00f0ff',
                    borderColor: `${pinnedBranch.topic?.color || '#00f0ff'}40`,
                  }}
                >
                  {pinnedBranch.topic?.category || 'Neural Cluster'}
                </span>
                <h3 className="text-lg font-heading font-bold text-foreground mt-1">
                  {pinnedBranch.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setPinnedBranch(null);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Topic Summary / Description */}
            <p className="text-xs font-mono text-muted-foreground bg-black/40 p-3 rounded-xl border border-border/60">
              {pinnedBranch.topic?.description || 'Knowledge records attached to this Yggdrasil branch.'}
            </p>

            {/* Attached Notes & Multi-Page Books */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Branch Notes ({pinnedBranch.notes.length})</span>
                </span>
                <span>Click to read as Book</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {pinnedBranch.notes.length === 0 ? (
                  <p className="text-xs font-mono text-muted-foreground/60 italic p-3">
                    No notes documented in this branch yet.
                  </p>
                ) : (
                  pinnedBranch.notes.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        sounds.playClick();
                        navigate(`/notes/${n.id}`);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-primary/10 border border-border/40 hover:border-primary/50 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {n.title}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate">{n.summary}</p>
                      </div>
                      <span className="text-xs font-mono text-primary flex items-center gap-1 shrink-0">
                        Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              {pinnedBranch.topic && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/notes`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono hover:opacity-90 transition-all shadow-neon-glow"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Note
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/topics/${pinnedBranch.topic.id}`);
                    }}
                    className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
                  >
                    Manage Topic →
                  </button>
                </div>
              )}
              <button
                onClick={() => setPinnedBranch(null)}
                className="px-4 py-1.5 rounded-xl bg-white/5 text-xs font-mono text-foreground hover:bg-white/10 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
