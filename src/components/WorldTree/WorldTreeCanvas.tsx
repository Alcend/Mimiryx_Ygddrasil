import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TreeNode, TreeData, Camera } from './types';
import { buildTreeLayout } from './treeLayoutEngine';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface WorldTreeCanvasProps {
  onSelectNode: (node: TreeNode | null) => void;
  searchQuery: string;
  syntheticCount?: number;
  cameraRef: React.MutableRefObject<Camera>;
}

export const WorldTreeCanvas: React.FC<WorldTreeCanvasProps> = ({
  onSelectNode,
  searchQuery,
  syntheticCount = 0,
  cameraRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { topics, notes } = useApp();

  const [treeData, setTreeData] = useState<TreeData>(() =>
    buildTreeLayout(topics, notes, syntheticCount)
  );

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Rebuild tree layout whenever topics/notes/synthetic count changes
  useEffect(() => {
    const data = buildTreeLayout(topics, notes, syntheticCount);
    setTreeData(data);
  }, [topics, notes, syntheticCount]);

  // Smooth search navigation & centering
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    for (const [id, node] of treeData.nodes.entries()) {
      if (node.title.toLowerCase().includes(query)) {
        cameraRef.current.targetX = -node.x * cameraRef.current.zoom;
        cameraRef.current.targetY = -node.y * cameraRef.current.zoom;
        cameraRef.current.targetZoom = 1.3;
        setSelectedNodeId(node.id);
        onSelectNode(node);
        sounds.playClick();
        break;
      }
    }
  }, [searchQuery, treeData, onSelectNode, cameraRef]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate static starry background points
    const starCount = 80;
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 3000,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
    }));

    // Find Ancestor & Descendant Lineage IDs for glowing hover path
    const getLineageIds = (targetId: string | null): Set<string> => {
      const set = new Set<string>();
      if (!targetId) return set;
      set.add(targetId);

      // Add Ancestors
      let curr = treeData.nodes.get(targetId);
      while (curr && curr.parentId) {
        set.add(curr.parentId);
        curr = treeData.nodes.get(curr.parentId);
      }

      // Add Descendants
      const addChildren = (id: string) => {
        const node = treeData.nodes.get(id);
        if (!node) return;
        node.childrenIds.forEach((cId) => {
          set.add(cId);
          addChildren(cId);
        });
      };
      addChildren(targetId);

      return set;
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth camera interpolation
      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * 0.12;
      cam.y += (cam.targetY - cam.y) * 0.12;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.12;

      // Viewport bounds for culling in world coordinates
      const halfW = width / (2 * cam.zoom);
      const halfH = height / (2 * cam.zoom);
      const camWorldX = -cam.x / cam.zoom;
      const camWorldY = -cam.y / cam.zoom;
      const viewMinX = camWorldX - halfW - 100;
      const viewMaxX = camWorldX + halfW + 100;
      const viewMinY = camWorldY - halfH - 100;
      const viewMaxY = camWorldY + halfH + 100;

      // Clear with dark void tone
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply Camera Transform
      ctx.translate(width / 2 + cam.x, height / 2 + cam.y);
      ctx.scale(cam.zoom, cam.zoom);

      // 1. Draw Starfield & Ambient Dust
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius / cam.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 200, 255, ${s.alpha * 0.6})`;
        ctx.fill();
      });

      // 2. Draw Subtle Perspective Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
      ctx.lineWidth = 1 / cam.zoom;
      const gridStep = 100;
      for (let gx = -1500; gx <= 1500; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, -1500);
        ctx.lineTo(gx, 1500);
        ctx.stroke();
      }
      for (let gy = -1500; gy <= 1500; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(-1500, gy);
        ctx.lineTo(1500, gy);
        ctx.stroke();
      }

      // Lineage set
      const lineage = getLineageIds(hoveredNodeId || selectedNodeId);
      const hasLineage = lineage.size > 0;

      // 3. Draw Organic Central Trunk Fibers (MIMIRYX STEM)
      const trunkTopY = -230;
      const trunkBottomY = 30;
      const fiberCount = 6;
      const pulseTime = time * 0.002;

      for (let f = 0; f < fiberCount; f++) {
        const offset = (f - (fiberCount - 1) / 2) * 4;
        const wave = Math.sin(pulseTime + f) * 3;

        ctx.beginPath();
        ctx.moveTo(offset, trunkBottomY);
        ctx.bezierCurveTo(
          offset * 1.5 + wave,
          -50,
          offset * 0.8 - wave,
          -150,
          offset * 0.4,
          trunkTopY
        );
        ctx.strokeStyle = f === 2 || f === 3 ? '#00f0ff' : 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = (f === 2 || f === 3 ? 3.5 : 1.8);
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 4. Draw Branches & Root Connections
      treeData.nodes.forEach((node) => {
        if (!node.parentId) return;
        const parent = treeData.nodes.get(node.parentId);
        if (!parent) return;

        // Viewport culling for branches
        const inView =
          (node.x >= viewMinX && node.x <= viewMaxX && node.y >= viewMinY && node.y <= viewMaxY) ||
          (parent.x >= viewMinX && parent.x <= viewMaxX && parent.y >= viewMinY && parent.y <= viewMaxY);
        if (!inView) return;

        const isLineage = hasLineage && lineage.has(node.id) && lineage.has(parent.id);
        const isDimmed = hasLineage && !isLineage;

        // Bezier Branch Curve
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.bezierCurveTo(
          node.bezierControlPoints.cp1x,
          node.bezierControlPoints.cp1y,
          node.bezierControlPoints.cp2x,
          node.bezierControlPoints.cp2y,
          node.x,
          node.y
        );

        if (isLineage) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(2.5, node.branchThickness * 1.3);
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = isDimmed ? 'rgba(255, 255, 255, 0.08)' : `${node.color}66`;
          ctx.lineWidth = isDimmed ? 1 : Math.max(1, node.branchThickness);
          ctx.stroke();
        }

        // Synaptic Energy Pulse traveling along branch
        if (!isDimmed) {
          const pulseT = ((time * 0.001 + node.pulseOffset) % 1.5) / 1.5;
          // Approximate point on cubic bezier
          const t = pulseT;
          const u = 1 - t;
          const tt = t * t;
          const uu = u * u;
          const uuu = uu * u;
          const ttt = tt * t;

          const p0x = parent.x;
          const p0y = parent.y;
          const p1x = node.bezierControlPoints.cp1x;
          const p1y = node.bezierControlPoints.cp1y;
          const p2x = node.bezierControlPoints.cp2x;
          const p2y = node.bezierControlPoints.cp2y;
          const p3x = node.x;
          const p3y = node.y;

          const px = uuu * p0x + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * p3x;
          const py = uuu * p0y + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * p3y;

          ctx.beginPath();
          ctx.arc(px, py, isLineage ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = isLineage ? '#ffffff' : node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 5. Draw Tree Nodes (Roots, Domains, Topics, Notes)
      const renderedLabels: { x: number; y: number; width: number; height: number }[] = [];

      treeData.nodes.forEach((node) => {
        // Viewport Culling
        if (node.x < viewMinX || node.x > viewMaxX || node.y < viewMinY || node.y > viewMaxY) {
          return;
        }

        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNodeId === node.id;
        const isLineage = hasLineage && lineage.has(node.id);
        const isDimmed = hasLineage && !isLineage;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Core Node (Center Trunk)
        if (node.type === 'root_core') {
          const corePulse = Math.sin(time * 0.003) * 4;
          // Outer Aura
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + 8 + corePulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.fill();

          // Inner Diamond
          ctx.beginPath();
          ctx.moveTo(0, -node.radius - corePulse);
          ctx.lineTo(node.radius + corePulse, 0);
          ctx.lineTo(0, node.radius + corePulse);
          ctx.lineTo(-node.radius - corePulse, 0);
          ctx.closePath();

          ctx.fillStyle = '#061325';
          ctx.fill();
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Core Label
          ctx.font = 'bold 11px Space Grotesk, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('MIMIRYX', 0, 0);
        }
        // Foundation Roots (Green Nodes)
        else if (node.type === 'foundation_root') {
          ctx.beginPath();
          ctx.arc(0, 0, isHovered ? node.radius + 3 : node.radius, 0, Math.PI * 2);
          ctx.fillStyle = isDimmed ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.3)';
          ctx.fill();
          ctx.strokeStyle = isLineage || isHovered ? '#ffffff' : '#00ff88';
          ctx.lineWidth = isLineage ? 2.5 : 1.5;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = isHovered ? 15 : 6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Root Label (LOD: show when zoom > 0.5 or hovered)
          if (cam.zoom > 0.45 || isHovered || isSelected) {
            ctx.font = '9px Fira Code, monospace';
            ctx.fillStyle = isHovered ? '#ffffff' : '#a7f3d0';
            ctx.textAlign = 'center';
            ctx.fillText(node.title, 0, node.radius + 12);
          }
        }
        // Domain Clusters & Topics (Diamond Crystals)
        else if (node.type === 'domain_branch' || node.type === 'topic_cluster') {
          const sz = isHovered ? node.radius + 4 : node.radius;

          // Diamond Shape
          ctx.beginPath();
          ctx.moveTo(0, -sz);
          ctx.lineTo(sz, 0);
          ctx.lineTo(0, sz);
          ctx.lineTo(-sz, 0);
          ctx.closePath();

          ctx.fillStyle = isDimmed ? 'rgba(10, 20, 35, 0.6)' : '#07101e';
          ctx.fill();
          ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : isDimmed ? 'rgba(255,255,255,0.2)' : node.color;
          ctx.lineWidth = isHovered || isSelected ? 2.5 : 1.8;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isHovered ? 20 : 8;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Mastery Percent Badge Inside Diamond
          if (cam.zoom > 0.5) {
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.4)' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${node.mastery}%`, 0, 1);
          }

          // Domain Label (Collision checked)
          if (cam.zoom > 0.35 || isHovered || isSelected) {
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillStyle = isHovered ? '#ffffff' : isDimmed ? 'rgba(203, 213, 225, 0.4)' : '#e2e8f0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(node.title, 0, sz + 8);
          }
        }
        // Leaf Notes (Small nodes/constellations)
        else {
          const r = isHovered ? node.radius + 3 : node.radius;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#ffffff' : node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isHovered ? 12 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          // LOD for Leaf Labels: show at close zoom (> 1.0) or on hover
          if (cam.zoom > 0.95 || isHovered || isSelected) {
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = isHovered ? '#ffffff' : isDimmed ? 'rgba(203, 213, 225, 0.4)' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(node.title, 0, r + 6);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    // Mouse Interaction Handlers
    const getMouseWorldPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cam = cameraRef.current;
      const wx = (mx - width / 2 - cam.x) / cam.zoom;
      const wy = (my - height / 2 - cam.y) / cam.zoom;
      return { mx, my, wx, wy };
    };

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (cameraRef.current.isLocked) return;
      isDragging = true;
      dragStartX = e.clientX - cameraRef.current.x;
      dragStartY = e.clientY - cameraRef.current.y;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      if (isDragging && !cameraRef.current.isLocked) {
        cameraRef.current.x = e.clientX - dragStartX;
        cameraRef.current.y = e.clientY - dragStartY;
        cameraRef.current.targetX = cameraRef.current.x;
        cameraRef.current.targetY = cameraRef.current.y;
      }

      // Hit testing for hover
      let found: TreeNode | null = null;
      for (const [id, node] of treeData.nodes.entries()) {
        const dx = wx - node.x;
        const dy = wy - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= node.radius + 8 / cameraRef.current.zoom) {
          found = node;
          break;
        }
      }

      if (found?.id !== hoveredNodeId) {
        setHoveredNodeId(found ? found.id : null);
        canvas.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'default';
        if (found) sounds.playNodePulse();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      let found: TreeNode | null = null;
      for (const [id, node] of treeData.nodes.entries()) {
        const dx = wx - node.x;
        const dy = wy - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= node.radius + 10 / cameraRef.current.zoom) {
          found = node;
          break;
        }
      }

      if (found) {
        sounds.playClick();
        setSelectedNodeId(found.id);
        onSelectNode(found);
        // Smoothly center camera on clicked node
        cameraRef.current.targetX = -found.x * cameraRef.current.zoom;
        cameraRef.current.targetY = -found.y * cameraRef.current.zoom;
      } else {
        setSelectedNodeId(null);
        onSelectNode(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cameraRef.current.isLocked) return;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(3.5, Math.max(0.2, cameraRef.current.zoom * zoomFactor));

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;

      cameraRef.current.x -= (mx - cameraRef.current.x) * (zoomFactor - 1);
      cameraRef.current.y -= (my - cameraRef.current.y) * (zoomFactor - 1);
      cameraRef.current.zoom = newZoom;
      cameraRef.current.targetX = cameraRef.current.x;
      cameraRef.current.targetY = cameraRef.current.y;
      cameraRef.current.targetZoom = newZoom;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationId);
    };
  }, [treeData, hoveredNodeId, selectedNodeId, onSelectNode, cameraRef]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block select-none touch-none focus:outline-none"
    />
  );
};
