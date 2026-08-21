import React, { useRef, useEffect, useState, useCallback } from 'react';
import { generateYggdrasilTree, YggdrasilTreeModel, YggdrasilLeaf, YggdrasilRoot } from './yggdrasilTreeEngine';
import { useApp } from '../../context/AppContext';
import { Camera } from './types';
import { sounds } from '../../utils/audio';

interface YggdrasilCanvasProps {
  onSelectNode: (node: any) => void;
  searchQuery: string;
  syntheticCount?: number;
  cameraRef: React.MutableRefObject<Camera>;
}

export const YggdrasilCanvas: React.FC<YggdrasilCanvasProps> = ({
  onSelectNode,
  searchQuery,
  syntheticCount = 0,
  cameraRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { topics, notes, customBg } = useApp();

  const [treeModel, setTreeModel] = useState<YggdrasilTreeModel>(() =>
    generateYggdrasilTree(topics, notes, syntheticCount)
  );

  const [hoveredLeafId, setHoveredLeafId] = useState<string | null>(null);
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);

  useEffect(() => {
    const model = generateYggdrasilTree(topics, notes, syntheticCount);
    setTreeModel(model);
  }, [topics, notes, syntheticCount]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    const targetLeaf = treeModel.leaves.find((l) => l.title.toLowerCase().includes(query));
    if (targetLeaf) {
      cameraRef.current.targetX = -targetLeaf.x * 1.2;
      cameraRef.current.targetY = -targetLeaf.y * 1.2;
      cameraRef.current.targetZoom = 1.3;
      setSelectedLeafId(targetLeaf.id);
      onSelectNode({
        id: targetLeaf.id,
        title: targetLeaf.title,
        category: targetLeaf.category,
        status: targetLeaf.status,
        mastery: targetLeaf.mastery,
        description: targetLeaf.description,
        tags: targetLeaf.tags,
        noteId: targetLeaf.noteId,
        type: 'note_leaf',
      });
      sounds.playClick();
    }
  }, [searchQuery, treeModel, onSelectNode, cameraRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 680);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * 3500,
      y: (Math.random() - 0.5) * 3500,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1,
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * 0.1;
      cam.y += (cam.targetY - cam.y) * 0.1;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

      // Clear canvas: transparent if custom wallpaper active, or deep galactic void
      if (customBg) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(5, 7, 17, 0.4)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.translate(width / 2 + cam.x, height / 2 + cam.y);
      ctx.scale(cam.zoom, cam.zoom);

      // 1. STARFIELD
      stars.forEach((s, idx) => {
        const tw = (Math.sin(time * 0.002 * s.twinkleSpeed + idx) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size / cam.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${s.alpha * tw})`;
        ctx.fill();
      });

      // 2. CELESTIAL PLANETS
      ctx.save();
      const p1x = 420;
      const p1y = 20;
      ctx.beginPath();
      ctx.arc(p1x, p1y, 35, 0, Math.PI * 2);
      ctx.fillStyle = '#6b21a8';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p1x, p1y, 65, 12, -0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(-360, 60, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 3. AURORA BOREALIS
      ctx.save();
      const auroraSegments = 40;
      ctx.beginPath();
      for (let i = 0; i <= auroraSegments; i++) {
        const ax = -800 + (i / auroraSegments) * 1600;
        const wave = Math.sin(time * 0.0015 + i * 0.25) * 50 + Math.cos(time * 0.001 + i * 0.15) * 30;
        const ay = -480 + wave - (Math.abs(ax) * 0.1);
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      }
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.35)';
      ctx.lineWidth = 45;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. SUBTERRANEAN GRID
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gz = 120; gz <= 480; gz += 40) {
        ctx.beginPath();
        ctx.moveTo(-900, gz);
        ctx.lineTo(900, gz);
        ctx.stroke();
      }
      for (let gx = -800; gx <= 800; gx += 80) {
        ctx.beginPath();
        ctx.moveTo(gx * 0.2, 100);
        ctx.lineTo(gx, 500);
        ctx.stroke();
      }
      ctx.restore();

      // 5. ROOTS
      treeModel.roots.forEach((root) => {
        ctx.beginPath();
        ctx.moveTo(root.p0.x, root.p0.y);
        ctx.bezierCurveTo(root.cp1.x, root.cp1.y, root.cp2.x, root.cp2.y, root.p1.x, root.p1.y);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = root.width;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        root.subRoots.forEach((sr) => {
          ctx.beginPath();
          ctx.moveTo(sr.p0.x, sr.p0.y);
          ctx.bezierCurveTo(sr.cp1.x, sr.cp1.y, sr.cp2.x, sr.cp2.y, sr.p1.x, sr.p1.y);
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
          ctx.lineWidth = sr.width;
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.arc(root.p1.x, root.p1.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (cam.zoom > 0.45) {
          ctx.font = 'bold 9px Space Grotesk, monospace';
          ctx.fillStyle = '#a7f3d0';
          ctx.textAlign = 'center';
          ctx.fillText(root.title, root.p1.x, root.p1.y + 16);
        }
      });

      // 6. TRUNK FIBERS
      treeModel.trunkFibers.forEach((fiber) => {
        ctx.beginPath();
        ctx.moveTo(fiber.p0.x, fiber.p0.y);
        ctx.bezierCurveTo(fiber.cp1.x, fiber.cp1.y, fiber.cp2.x, fiber.cp2.y, fiber.p1.x, fiber.p1.y);
        ctx.strokeStyle = fiber.color;
        ctx.lineWidth = fiber.width;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const pulseT = ((time * 0.001 * fiber.speed + fiber.offset) % 1.0);
        const t = pulseT;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const px = uuu * fiber.p0.x + 3 * uu * t * fiber.cp1.x + 3 * u * tt * fiber.cp2.x + ttt * fiber.p1.x;
        const py = uuu * fiber.p0.y + 3 * uu * t * fiber.cp1.y + 3 * u * tt * fiber.cp2.y + ttt * fiber.p1.y;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      const coreY = -90;
      ctx.beginPath();
      ctx.moveTo(0, coreY - 20);
      ctx.lineTo(20, coreY);
      ctx.lineTo(0, coreY + 20);
      ctx.lineTo(-20, coreY);
      ctx.closePath();
      ctx.fillStyle = '#061a2e';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9px Space Grotesk, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MIMIRYX', 0, coreY);

      // 7. RUNES
      treeModel.runes.forEach((r) => {
        const floatY = Math.sin(time * 0.0015 + r.driftPhase) * 10;
        ctx.font = `${r.scale}px serif`;
        ctx.fillStyle = `rgba(0, 240, 255, ${r.alpha})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.textAlign = 'center';
        ctx.fillText(r.char, r.x, r.y + floatY);
        ctx.shadowBlur = 0;
      });

      // 8. BRANCHES
      treeModel.branches.forEach((br) => {
        ctx.beginPath();
        ctx.moveTo(br.p0.x, br.p0.y);
        ctx.bezierCurveTo(br.cp1.x, br.cp1.y, br.cp2.x, br.cp2.y, br.p1.x, br.p1.y);
        ctx.strokeStyle = br.color;
        ctx.lineWidth = br.width;
        ctx.shadowColor = br.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (br.level === 1 && br.title && cam.zoom > 0.35) {
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = br.color;
          ctx.shadowBlur = 8;
          ctx.fillText(br.title, br.p1.x, br.p1.y - 12);
          ctx.shadowBlur = 0;
        }
      });

      // 9. LEAVES
      treeModel.leaves.forEach((leaf) => {
        const isHovered = hoveredLeafId === leaf.id;
        const isSelected = selectedLeafId === leaf.id;
        const sz = isHovered ? leaf.radius + 3 : leaf.radius;

        ctx.beginPath();
        ctx.arc(leaf.x, leaf.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#ffffff' : leaf.color;
        ctx.shadowColor = leaf.color;
        ctx.shadowBlur = isHovered ? 18 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (cam.zoom > 0.95 || isHovered || isSelected) {
          ctx.font = '9px Inter, sans-serif';
          ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(leaf.title, leaf.x, leaf.y + sz + 8);
        }
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

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

      let found: YggdrasilLeaf | null = null;
      for (const l of treeModel.leaves) {
        const dx = wx - l.x;
        const dy = wy - l.y;
        if (Math.sqrt(dx * dx + dy * dy) <= l.radius + 8 / cameraRef.current.zoom) {
          found = l;
          break;
        }
      }

      if (found?.id !== hoveredLeafId) {
        setHoveredLeafId(found ? found.id : null);
        canvas.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'default';
        if (found) sounds.playNodePulse();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      let found: YggdrasilLeaf | null = null;
      for (const l of treeModel.leaves) {
        const dx = wx - l.x;
        const dy = wy - l.y;
        if (Math.sqrt(dx * dx + dy * dy) <= l.radius + 10 / cameraRef.current.zoom) {
          found = l;
          break;
        }
      }

      if (found) {
        sounds.playClick();
        setSelectedLeafId(found.id);
        onSelectNode({
          id: found.id,
          title: found.title,
          category: found.category,
          status: found.status,
          mastery: found.mastery,
          description: found.description,
          tags: found.tags,
          noteId: found.noteId,
          type: 'note_leaf',
        });
        cameraRef.current.targetX = -found.x * cameraRef.current.zoom;
        cameraRef.current.targetY = -found.y * cameraRef.current.zoom;
      } else {
        setSelectedLeafId(null);
        onSelectNode(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cameraRef.current.isLocked) return;

      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(3.5, Math.max(0.2, cameraRef.current.zoom * factor));

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;

      cameraRef.current.x -= (mx - cameraRef.current.x) * (factor - 1);
      cameraRef.current.y -= (my - cameraRef.current.y) * (factor - 1);
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
  }, [treeModel, hoveredLeafId, selectedLeafId, onSelectNode, cameraRef, customBg]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block select-none touch-none focus:outline-none"
    />
  );
};
