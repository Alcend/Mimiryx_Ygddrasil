import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, RotateCcw, Plus, Minus, BookOpen, X } from 'lucide-react';
import { sounds } from '../../utils/audio';

// EXACT CONSTANTS FROM BASE44 APP BUNDLE
const _o = 760; // viewBox height
const Qi = 560; // Trunk base Y
const kK = 128; // Crown bough Y
const pIe = 8;  // Max leaves per topic crystal
const NK = { trunk: 1.2, main: 1, sub: 0.8, twig: 0.6, root: 1.05, rootlet: 0.75 };

const ln = {
  learning: 'hsl(180 100% 50%)',
  reviewing: 'hsl(45 100% 58%)',
  mastered: 'hsl(135 100% 50%)',
  unstarted: 'hsl(180 32% 56%)'
};

function Ik(status: string) {
  if (status === 'learning' || status === 'in_progress' || status === 'active') return ln.learning;
  if (status === 'reviewing') return ln.reviewing;
  if (status === 'mastered' || status === 'completed') return ln.mastered;
  return ln.unstarted;
}

function hIe(status: string) {
  const map: Record<string, string> = {
    learning: 'Learning',
    reviewing: 'Reviewing',
    mastered: 'Mastered',
    in_progress: 'In progress',
    not_started: 'Not started',
    completed: 'Completed',
    unstarted: 'Not started'
  };
  return map[status] || status;
}

const du = (a: number, b: number, t: number) => a + (b - a) * t;
const h6 = (p1: { x: number; y: number }, p2: { x: number; y: number }, t: number) => ({
  x: du(p1.x, p2.x, t),
  y: du(p1.y, p2.y, t)
});

function ra(x1: number, y1: number, x2: number, y2: number, curvature = 0.12) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  return `M ${x1} ${y1} Q ${midX + (-dy / dist) * dist * curvature} ${midY + (dx / dist) * dist * curvature} ${x2} ${y2}`;
}

function mIe(x: number, y: number, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function gIe(topicsCount: number) {
  return Math.max(760, topicsCount * 175);
}

function Oy(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

export const Base44Tree: React.FC = () => {
  const { topics, notes, labs } = useApp();
  const navigate = useNavigate();

  const [focusTopicId, setFocusTopicId] = useState<string | null>(null);
  const [hoverTopicId, setHoverTopicId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ topicId: string | null; leafId: string | null }>({ topicId: null, leafId: null });
  const [isLocked, setIsLocked] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const camRef = useRef<{ zoom: number; pan: { x: number; y: number } }>({ zoom: 1.15, pan: { x: 0, y: -20 } });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const movedRef = useRef(false);

  const viewWidth = useMemo(() => gIe(topics.length), [topics.length]);
  const centerX = viewWidth / 2;

  // EXACT BASE44 MATHEMATICAL TREE LAYOUT ALGORITHM (yIe)
  const treeData = useMemo(() => {
    const branches: Array<{ id: string; d: string; w: number; kind: string; topicId: string; col: string; gd: number }> = [];
    const crystals: Array<{ id: string; label: string; x: number; y: number; size: number; state: string; count: number; mastery: number; color: string; last: number | null; gd: number }> = [];
    const leaves: Array<{ id: string; label: string; x: number; y: number; topicId: string; kind: string; state: string; color: string; difficulty: string; gd: number }> = [];
    const rootSeg: Array<{ id: string; d: string; w: number; kind: string; col: string; gd: number }> = [];
    const roots: Array<{ id: string; label: string; x: number; y: number; kind: string; state: string; color: string; gd: number }> = [];
    const sparks: Array<{ x: number; y: number; r: number; gd: number; root?: boolean; topicId?: string }> = [];

    const topicCount = topics.length;
    const trunkSegments = 14;
    const trunkSway = 9;
    const trunkNodes: Array<{ x: number; y: number; w: number }> = [];

    // 1. Calculate Trunk Points
    for (let z = 0; z <= trunkSegments; z++) {
      const u = z / trunkSegments;
      const x = centerX + Math.sin(u * Math.PI * 1.6) * trunkSway * u;
      const y = du(Qi, kK, u);
      const w = du(24, 6, u);
      trunkNodes.push({ x, y, w });
    }

    // 2. Build Trunk Polygon Contour
    const leftContour: Array<{ x: number; y: number }> = [];
    const rightContour: Array<{ x: number; y: number }> = [];
    for (let z = 0; z < trunkNodes.length; z++) {
      const curr = trunkNodes[z];
      const next = trunkNodes[Math.min(z + 1, trunkSegments)];
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      leftContour.push({ x: curr.x - nx * (curr.w / 2), y: curr.y - ny * (curr.w / 2) });
      rightContour.push({ x: curr.x + nx * (curr.w / 2), y: curr.y + ny * (curr.w / 2) });
    }
    const trunkPoly = [...leftContour, ...rightContour.reverse()].map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const trunkVeinD = ra(centerX, Qi, trunkNodes[trunkSegments].x, kK, 0.06);

    sparks.push({ x: centerX, y: Qi + 6, r: 1.4, gd: 0, topicId: '' });

    // 3. Build Upper Limbs, Sub-branches & Leaf Starburst Clusters
    topics.forEach((topic, idx) => {
      const frac = topicCount > 1 ? idx / (topicCount - 1) : 0.5;
      const spreadY = Math.abs(frac - 0.5) * 2;
      const spreadWidth = Math.max(viewWidth * 0.42, 240);
      const targetX = centerX + (frac - 0.5) * 2 * spreadWidth;
      const targetY = kK + 22 + spreadY * 200;

      const trunkForkY = du(Qi - 18, kK + 12, frac);
      const startPt = { x: centerX + (frac - 0.5) * 10, y: trunkForkY };

      const mid1 = h6(startPt, { x: targetX, y: targetY }, 0.45);
      mid1.x += (targetX - centerX) * 0.06;
      const mid2 = h6(mid1, { x: targetX, y: targetY }, 0.74);
      const curvature = 0.12;

      // Main limb
      branches.push({ id: `m-${topic.id}`, d: ra(startPt.x, startPt.y, mid1.x, mid1.y, curvature), w: 6.5, kind: 'main', topicId: topic.id, col: ln.learning, gd: 0.28 + idx * 0.05 });
      // Secondary branches
      branches.push({ id: `s1-${topic.id}`, d: ra(mid1.x, mid1.y, mid2.x, mid2.y, curvature), w: 4.2, kind: 'sub', topicId: topic.id, col: ln.learning, gd: 0.4 + idx * 0.05 });
      branches.push({ id: `s2-${topic.id}`, d: ra(mid2.x, mid2.y, targetX, targetY, curvature), w: 3.0, kind: 'sub', topicId: topic.id, col: ln.learning, gd: 0.55 + idx * 0.05 });
      sparks.push({ x: mid1.x, y: mid1.y, r: 1.1, topicId: topic.id, gd: 0.6 + idx * 0.05 });

      // Outrigger bough
      const dx = targetX - centerX;
      const dy = targetY - Qi;
      const dist = Math.hypot(dx, dy) || 1;
      const rot = mIe(dx / dist, dy / dist, frac < 0.5 ? 0.6 : -0.6);
      const outX = mid1.x + rot.x * 48;
      const outY = mid1.y + rot.y * 48;
      branches.push({ id: `o-${topic.id}`, d: ra(mid1.x, mid1.y, outX, outY, curvature), w: 3.0, kind: 'sub', topicId: topic.id, col: ln.learning, gd: 0.5 + idx * 0.05 });
      sparks.push({ x: outX, y: outY, r: 1.0, topicId: topic.id, gd: 0.9 + idx * 0.05 });

      // Topic notes & labs
      const topicNotes = notes.filter(n => n.topicId === topic.id);
      const topicLabs = labs.filter(l => l.topicId === topic.id);
      const totalItems = topicNotes.length + topicLabs.length;
      const masteredCount = topicNotes.filter(n => n.status === 'mastered').length + topicLabs.filter(l => l.status === 'completed').length;
      const mastery = totalItems ? masteredCount / totalItems : 0;
      const crystalSize = 7 + Math.min(totalItems, 10) * 0.6;

      crystals.push({
        id: topic.id,
        label: topic.name,
        x: targetX,
        y: targetY,
        size: crystalSize,
        state: mastery === 1 ? 'mastered' : totalItems > 0 ? 'learning' : 'unstarted',
        count: totalItems,
        mastery,
        color: Ik(mastery === 1 ? 'mastered' : 'learning'),
        last: Date.now(),
        gd: 0.7 + idx * 0.06
      });

      // Radiating Leaf Notes & Labs
      const combinedLeaves = [
        ...topicNotes.map(n => ({ ...n, _kind: 'note' })),
        ...topicLabs.map(l => ({ ...l, _kind: 'lab' }))
      ].slice(0, pIe);

      const leafCount = combinedLeaves.length;
      const arcSpan = Math.min(2.2, 0.4 + leafCount * 0.22);
      const baseAngle = Math.atan2(targetY - Qi, (Math.abs(targetX - centerX) < 1 ? 1 : Math.sign(targetX - centerX)) * Math.max(8, Math.abs(targetX - centerX)));

      combinedLeaves.forEach((item, lIdx) => {
        const offsetAngle = leafCount > 1 ? -arcSpan / 2 + (lIdx / (leafCount - 1)) * arcSpan : 0;
        const finalAngle = baseAngle + offsetAngle;
        const radius = 42 + (lIdx % 2) * 14;
        const leafX = targetX + Math.cos(finalAngle) * radius;
        const leafY = targetY + Math.sin(finalAngle) * radius - 6;

        leaves.push({
          id: item.id,
          label: item.title,
          x: leafX,
          y: leafY,
          topicId: topic.id,
          kind: item._kind,
          state: item.status,
          color: Ik(item.status),
          difficulty: item.difficulty || 'beginner',
          gd: 0.95 + idx * 0.06 + lIdx * 0.05
        });

        // Twig branch to leaf
        branches.push({
          id: `tw-${item.id}`,
          d: ra(targetX, targetY, leafX, leafY, 0.1),
          w: 1.8,
          kind: 'twig',
          topicId: topic.id,
          col: Ik(item.status),
          gd: 0.85 + idx * 0.06 + lIdx * 0.05
        });
      });
    });

    // 4. Build Mastered Root Network (Foundations)
    const masteredItems = [
      ...notes.filter(n => n.status === 'mastered').map(n => ({ ...n, _kind: 'note' })),
      ...labs.filter(l => l.status === 'completed').map(l => ({ ...l, _kind: 'lab' }))
    ];

    const rootBranchCount = Math.max(2, Math.min(5, Math.ceil(topics.length / 2) + 1));
    for (let z = 0; z < rootBranchCount; z++) {
      const u = rootBranchCount > 1 ? z / (rootBranchCount - 1) : 0.5;
      const angle = du(-62, 62, u) * (Math.PI / 180);
      const rootX = centerX + Math.sin(angle) * 130;
      const rootY = Qi + Math.abs(Math.cos(angle)) * 78 + 28;

      rootSeg.push({ id: `rm-${z}`, d: ra(centerX, Qi, rootX, rootY, 0.16), w: 6.0, kind: 'root', col: ln.mastered, gd: 0.3 + z * 0.05 });

      for (let bIdx = 0; bIdx < 2; bIdx++) {
        const subAngle = angle + (bIdx - 0.5) * 0.42;
        const subLen = 58;
        const subX = rootX + Math.sin(subAngle) * subLen;
        const subY = rootY + Math.abs(Math.cos(subAngle)) * subLen * 0.6 + 12;

        rootSeg.push({ id: `rl-${z}-${bIdx}`, d: ra(rootX, rootY, subX, subY, 0.22), w: 3.0, kind: 'rootlet', col: ln.mastered, gd: 0.6 + z * 0.05 + bIdx * 0.04 });

        const item = masteredItems[z * 2 + bIdx];
        if (item) {
          roots.push({ id: item.id, label: item.title, x: subX, y: subY, kind: item._kind, state: item.status, color: ln.mastered, gd: 0.95 + z * 0.05 + bIdx * 0.04 });
        } else if (sparks.length < 24) {
          sparks.push({ x: subX, y: subY, r: 1.1, root: true, gd: 1 + z * 0.05 + bIdx * 0.04 });
        }
      }
    }

    const totalLeavesAndRoots = leaves.length + roots.length;
    const growth = totalLeavesAndRoots ? roots.length / totalLeavesAndRoots : 0;
    const overallMastery = notes.length ? notes.filter(n => n.status === 'mastered').length / notes.length : 0;

    return {
      trunkPoly,
      trunkVeinD,
      branches,
      crystals,
      leaves,
      rootSeg,
      roots,
      sparks,
      growth,
      overall: overallMastery,
      barkColor: `hsl(${Math.round(180 - 45 * overallMastery)} 100% 50%)`
    };
  }, [topics, notes, labs, viewWidth, centerX]);

  // Apply camera transform to SVG
  const applyTransform = () => {
    if (!svgGroupRef.current) return;
    const { zoom, pan } = camRef.current;
    svgGroupRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  };

  const handleZoom = (factor: number) => {
    const newZoom = Oy(camRef.current.zoom * factor, 0.6, 3.5);
    camRef.current.zoom = newZoom;
    applyTransform();
    sounds.playClick();
  };

  const handleResetView = () => {
    camRef.current = { zoom: 1.15, pan: { x: 0, y: -20 } };
    applyTransform();
    sounds.playClick();
  };

  // Drag Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    isDraggingRef.current = true;
    movedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      px: camRef.current.pan.x,
      py: camRef.current.pan.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || isLocked) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) movedRef.current = true;
    camRef.current.pan = {
      x: dragStartRef.current.px + dx,
      y: dragStartRef.current.py + dy
    };
    applyTransform();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] overflow-hidden rounded-2xl border border-primary/30 cyber-card select-none cursor-grab active:cursor-grabbing shadow-2xl bg-[#060a16]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Background Yggdrasil Artwork Layer */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-65"
        style={{ backgroundImage: `url('/yggdrasil_bg.png')` }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 pointer-events-none bg-background/55 backdrop-blur-[1px]" />

      {/* SVG TREE CANVAS */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewWidth} ${_o}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <radialGradient id="baseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={treeData.barkColor} stopOpacity={0.35} />
            <stop offset="55%" stopColor={treeData.barkColor} stopOpacity={0.08} />
            <stop offset="100%" stopColor={treeData.barkColor} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="bark" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={treeData.barkColor} stopOpacity={0.6} />
            <stop offset="55%" stopColor={treeData.barkColor} stopOpacity={0.95} />
            <stop offset="100%" stopColor={treeData.barkColor} stopOpacity={0.75} />
          </linearGradient>
        </defs>

        <g ref={svgGroupRef} style={{ transform: 'translate(0px, -20px) scale(1.15)', transformOrigin: '0 0' }}>
          {/* Base Auras */}
          <circle cx={centerX} cy={Qi} r={240} fill="url(#baseGlow)" className="animate-pulse" />
          <ellipse cx={centerX} cy={Qi + 18} rx={180} ry={24} fill="url(#baseGlow)" />
          <line x1={20} y1={Qi} x2={viewWidth - 20} y2={Qi} stroke={treeData.barkColor} strokeWidth={0.6} strokeDasharray="2 7" opacity={0.3} />

          {/* Mastered Root Network */}
          {treeData.rootSeg.map(seg => (
            <path key={seg.id} d={seg.d} fill="none" stroke={seg.col} strokeWidth={seg.w} strokeLinecap="round" opacity={0.7} />
          ))}

          {/* Root Crystals */}
          {treeData.roots.map(root => (
            <g key={root.id} className="cursor-pointer">
              <polygon
                points={`${root.x},${root.y - 4.5} ${root.x + 3.2},${root.y} ${root.x},${root.y + 4.5} ${root.x - 3.2},${root.y}`}
                fill="hsl(var(--background))"
                stroke={ln.mastered}
                strokeWidth={1}
                style={{ filter: `drop-shadow(0 0 6px ${ln.mastered})` }}
              />
              <polygon
                points={`${root.x},${root.y - 4.5} ${root.x + 3.2},${root.y} ${root.x},${root.y + 4.5} ${root.x - 3.2},${root.y}`}
                fill={ln.mastered}
                opacity={0.3}
              />
            </g>
          ))}

          {/* Trunk Glowing Vein & Polygon */}
          <path d={treeData.trunkVeinD} fill="none" stroke={treeData.barkColor} strokeWidth={26} strokeLinecap="round" opacity={0.15} style={{ filter: 'blur(4px)' }} />
          <polygon points={treeData.trunkPoly} fill="url(#bark)" />
          <path d={treeData.trunkVeinD} fill="none" stroke={treeData.barkColor} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 11" opacity={0.8} />

          {/* Canopy Boughs & Twigs */}
          {treeData.branches.map(br => (
            <path key={br.id} d={br.d} fill="none" stroke={br.col} strokeWidth={br.w} strokeLinecap="round" opacity={0.75} />
          ))}

          {/* Particles & Sparks */}
          {treeData.sparks.map((sp, idx) => (
            <circle key={idx} cx={sp.x} cy={sp.y} r={sp.r} fill={sp.root ? ln.mastered : treeData.barkColor} opacity={0.6} />
          ))}

          {/* Center Identity Node (MIMIRYX) */}
          <g
            className="cursor-pointer"
            onClick={() => {
              sounds.playClick();
              setFocusTopicId(null);
            }}
          >
            <polygon
              points={`${centerX},${Qi - 9} ${centerX + 6.3},${Qi} ${centerX},${Qi + 9} ${centerX - 6.3},${Qi}`}
              fill="hsl(var(--background))"
              stroke={treeData.barkColor}
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 10px ${treeData.barkColor})` }}
            />
            <text
              x={centerX}
              y={Qi - 24}
              textAnchor="middle"
              fill={treeData.barkColor}
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, letterSpacing: '0.26em', fontWeight: 700, filter: `drop-shadow(0 0 8px ${treeData.barkColor})` }}
            >
              MIMIRYX
            </text>
          </g>

          {/* Topic Diamond Crystals */}
          {treeData.crystals.map(c => {
            const isHovered = hoverTooltip.topicId === c.id;
            return (
              <g
                key={c.id}
                className="cursor-pointer"
                onClick={() => {
                  sounds.playClick();
                  setFocusTopicId(focusTopicId === c.id ? null : c.id);
                }}
                onMouseEnter={() => setHoverTooltip({ topicId: c.id, leafId: null })}
                onMouseLeave={() => setHoverTooltip({ topicId: null, leafId: null })}
              >
                <polygon
                  points={`${c.x},${c.y - c.size} ${c.x + c.size * 0.7},${c.y} ${c.x},${c.y + c.size} ${c.x - c.size * 0.7},${c.y}`}
                  fill="hsl(var(--background))"
                  stroke={c.color}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  style={{ filter: `drop-shadow(0 0 ${isHovered ? 14 : 7}px ${c.color})` }}
                />
                <polygon
                  points={`${c.x},${c.y - c.size} ${c.x + c.size * 0.7},${c.y} ${c.x},${c.y + c.size} ${c.x - c.size * 0.7},${c.y}`}
                  fill={c.color}
                  opacity={0.25}
                />
                <text
                  x={c.x}
                  y={c.y - c.size - 6}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, filter: 'drop-shadow(0 1px 3px black)' }}
                >
                  {c.label}
                </text>
                <text
                  x={c.x}
                  y={c.y + c.size + 11}
                  textAnchor="middle"
                  fill={c.color}
                  style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 600 }}
                >
                  {c.count} · {Math.round(c.mastery * 100)}%
                </text>
              </g>
            );
          })}

          {/* Leaf Notes & Labs Crystals */}
          {treeData.leaves.map(leaf => (
            <g
              key={leaf.id}
              className="cursor-pointer"
              onClick={() => {
                sounds.playClick();
                setSelectedNoteId(leaf.id);
              }}
              onMouseEnter={() => setHoverTooltip({ topicId: leaf.topicId, leafId: leaf.id })}
              onMouseLeave={() => setHoverTooltip({ topicId: null, leafId: null })}
            >
              <polygon
                points={`${leaf.x},${leaf.y - 3.8} ${leaf.x + 2.7},${leaf.y} ${leaf.x},${leaf.y + 3.8} ${leaf.x - 2.7},${leaf.y}`}
                fill="hsl(var(--background))"
                stroke={leaf.color}
                strokeWidth={0.9}
                style={{ filter: `drop-shadow(0 0 5px ${leaf.color})` }}
              />
              <polygon
                points={`${leaf.x},${leaf.y - 3.8} ${leaf.x + 2.7},${leaf.y} ${leaf.x},${leaf.y + 3.8} ${leaf.x - 2.7},${leaf.y}`}
                fill={leaf.color}
                opacity={0.3}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Floating HUD Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
        <button
          onClick={() => handleZoom(1.25)}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setIsLocked(!isLocked);
          }}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
            isLocked ? 'bg-primary/20 border-primary text-primary' : 'border-border bg-card/70 text-foreground'
          }`}
          title={isLocked ? 'Unlock zoom/pan' : 'Lock view'}
        >
          {isLocked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      {/* Crown / Roots Headers */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] text-[hsl(var(--neon-blue)/0.6)] pointer-events-none">
        CROWN · BRANCHES
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] text-[hsl(var(--neon-green)/0.6)] pointer-events-none">
        ROOTS · FOUNDATION
      </div>

      {/* Bottom Status Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 text-[10px] font-mono text-muted-foreground pointer-events-none bg-black/60 backdrop-blur px-3 py-2 rounded-xl border border-border/60">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(180_100%_50%)] shadow-[0_0_5px_hsl(180_100%_50%)]" />
          LEARNING {treeData.leaves.filter(l => l.state === 'learning').length}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(45_100%_58%)] shadow-[0_0_5px_hsl(45_100%_58%)]" />
          REVIEWING {treeData.leaves.filter(l => l.state === 'reviewing').length}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(135_100%_50%)] shadow-[0_0_5px_hsl(135_100%_50%)]" />
          MASTERED {treeData.roots.length}
        </span>
        <span className="flex items-center gap-1.5 mt-0.5 pt-1 border-t border-border/40 font-bold text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          GROWTH {Math.round(treeData.growth * 100)}%
        </span>
      </div>

      {/* Bottom Left Lock status */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground pointer-events-none hidden sm:block bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-border/60">
        {isLocked ? (
          <span><strong className="text-emerald-400">Locked</strong> — scroll the page • unlock to zoom/pan</span>
        ) : (
          <span><strong className="text-primary">Unlocked</strong> — drag to pan • scroll to zoom</span>
        )}
      </div>

      {/* Selected Note Modal (wIe matching original app) */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-xl cyber-card space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
                  {selectedNote.difficulty.toUpperCase()} · {selectedNote.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-heading font-bold text-foreground mt-2">
                  {selectedNote.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNoteId(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-muted-foreground bg-black/30 p-3 rounded-xl border border-border/60">
              {selectedNote.summary}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedNoteId(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-foreground hover:bg-white/10"
              >
                Close
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  navigate(`/notes/${selectedNote.id}`);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Open in Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
