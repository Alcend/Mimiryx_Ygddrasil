import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateOrganicFractalTree } from './organicFractalEngine';
import { Lock, Unlock, RotateCcw, Plus, Minus, BookOpen, X } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useNavigate } from 'react-router-dom';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

export const OrganicYggdrasilCanvas: React.FC = () => {
  const { topics, notes, labs, customBg } = useApp();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);

  // Live growth tracking: Record birth timestamp of each newly added item
  const birthTimestamps = useRef<Map<string, number>>(new Map());
  const prevItemsSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentSet = new Set<string>();
    topics.forEach(t => currentSet.add(t.id));
    notes.forEach(n => currentSet.add(n.id));
    labs.forEach(l => currentSet.add(l.id));

    // If new item appeared, mark birthTime for growth animation
    currentSet.forEach(id => {
      if (!prevItemsSet.current.has(id)) {
        birthTimestamps.current.set(id, performance.now());
      }
    });
    prevItemsSet.current = currentSet;
  }, [topics, notes, labs]);

  const treeLayout = useMemo(() => {
    return generateOrganicFractalTree(topics, notes, labs, birthTimestamps.current);
  }, [topics, notes, labs]);

  // Camera coordinates
  const cam = useRef<CameraState>({
    x: 0,
    y: 35,
    zoom: 0.75,
    targetX: 0,
    targetY: 35,
    targetZoom: 0.75,
  });

  // Search Focus
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const branch = treeLayout.branches.find(b => b.title.toLowerCase().includes(q));
    if (branch) {
      cam.current.targetX = -branch.p1.x * 1.3;
      cam.current.targetY = -branch.p1.y * 1.3;
      cam.current.targetZoom = 1.4;
      sounds.playClick();
    }
  }, [searchQuery, treeLayout]);

  // 60 FPS Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 660);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const stars = Array.from({ length: 150 }, () => ({
      x: (Math.random() - 0.5) * 4000,
      y: (Math.random() - 0.5) * 4000,
      size: Math.random() * 1.6 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 2 + 1,
    }));

    const GROWTH_DURATION = 950; // ms for live branch growth animation

    const render = (time: number) => {
      // Camera smooth damping
      const c = cam.current;
      c.x += (c.targetX - c.x) * 0.09;
      c.y += (c.targetY - c.y) * 0.09;
      c.zoom += (c.targetZoom - c.zoom) * 0.09;

      // Background clearing
      if (customBg) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(5, 8, 20, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.translate(width / 2 + c.x, height / 2 + c.y);
      ctx.scale(c.zoom, c.zoom);

      // 1. STARFIELD
      stars.forEach((s, idx) => {
        const tw = (Math.sin(time * 0.002 * s.twinkle + idx) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size / c.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 235, 255, ${s.alpha * tw})`;
        ctx.fill();
      });

      // 2. CELESTIAL BODIES (Space Background Preserved)
      // Planet 1: Ringed Purple Planet (Right)
      ctx.save();
      const p1x = 440;
      const p1y = 35;
      ctx.beginPath();
      ctx.arc(p1x, p1y, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#581c87';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p1x, p1y, 76, 14, -0.32, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.restore();

      // Planet 2: Dark Cyan Moon (Left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(-390, 65, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 3. AURORA BOREALIS (Waving Sky Ribbon)
      ctx.save();
      const auroraSegments = 45;
      ctx.beginPath();
      for (let i = 0; i <= auroraSegments; i++) {
        const ax = -900 + (i / auroraSegments) * 1800;
        const wave = Math.sin(time * 0.0012 + i * 0.22) * 55 + Math.cos(time * 0.0009 + i * 0.14) * 35;
        const ay = -520 + wave - (Math.abs(ax) * 0.12);
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 55;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 35;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. SUBTERRANEAN DIGITAL HORIZON GRID
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gz = 120; gz <= 500; gz += 45) {
        ctx.beginPath();
        ctx.moveTo(-1000, gz);
        ctx.lineTo(1000, gz);
        ctx.stroke();
      }
      for (let gx = -900; gx <= 900; gx += 90) {
        ctx.beginPath();
        ctx.moveTo(gx * 0.2, 100);
        ctx.lineTo(gx, 520);
        ctx.stroke();
      }
      ctx.restore();

      // 5. ORGANIC DATA-DRIVEN ROOTS (CIRCUIT-VEIN TEXTURE)
      treeLayout.roots.forEach((root) => {
        // Growth animation progress
        let growthT = 1.0;
        if (root.birthTime > 0) {
          const elapsed = time - root.birthTime;
          growthT = Math.min(1.0, Math.max(0.0, elapsed / GROWTH_DURATION));
          growthT = 1 - Math.pow(1 - growthT, 3); // ease-out
        }

        const isHovered = hoveredBranchId === root.id;

        // Draw curved root path with tapering width & circuit glow
        ctx.beginPath();
        ctx.moveTo(root.p0.x, root.p0.y);
        if (growthT >= 0.99) {
          ctx.bezierCurveTo(root.cp1.x, root.cp1.y, root.cp2.x, root.cp2.y, root.p1.x, root.p1.y);
        } else {
          const t = growthT;
          const u = 1 - t;
          const cx = u * u * u * root.p0.x + 3 * u * u * t * root.cp1.x + 3 * u * t * t * root.cp2.x + t * t * t * root.p1.x;
          const cy = u * u * u * root.p0.y + 3 * u * u * t * root.cp1.y + 3 * u * t * t * root.cp2.y + t * t * t * root.p1.y;
          ctx.lineTo(cx, cy);
        }

        // Circuit outer sheath
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = root.startWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = isHovered ? 18 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glowing conductor trace
        ctx.beginPath();
        ctx.moveTo(root.p0.x, root.p0.y);
        ctx.bezierCurveTo(root.cp1.x, root.cp1.y, root.cp2.x, root.cp2.y, root.p1.x, root.p1.y);
        ctx.strokeStyle = isHovered ? '#ffffff' : '#00ff88';
        ctx.lineWidth = Math.max(1, root.startWidth * 0.35);
        ctx.stroke();

        // Foundation Root Node Crystal
        if (growthT > 0.8) {
          const sz = root.nodeRadius;
          ctx.beginPath();
          ctx.arc(root.p1.x, root.p1.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Foundation title label
          if (c.zoom > 0.45) {
            ctx.font = 'bold 9.5px Space Grotesk, monospace';
            ctx.fillStyle = isHovered ? '#ffffff' : '#a7f3d0';
            ctx.textAlign = 'center';
            ctx.fillText(root.title, root.p1.x, root.p1.y + sz + 12);
          }
        }
      });

      // 6. VOLUMETRIC BRAIDED CIRCUIT TRUNK (Single Foundation Origin)
      treeLayout.trunkFibers.forEach((fiber) => {
        ctx.beginPath();
        ctx.moveTo(fiber.p0.x, fiber.p0.y);
        ctx.bezierCurveTo(fiber.cp1.x, fiber.cp1.y, fiber.cp2.x, fiber.cp2.y, fiber.p1.x, fiber.p1.y);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
        ctx.lineWidth = fiber.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Traveling circuit pulse packet
        const pulseT = (time * 0.001 * fiber.speed + fiber.offset) % 1.0;
        const t = pulseT;
        const u = 1 - t;
        const px = u * u * u * fiber.p0.x + 3 * u * u * t * fiber.cp1.x + 3 * u * t * t * fiber.cp2.x + t * t * t * fiber.p1.x;
        const py = u * u * u * fiber.p0.y + 3 * u * u * t * fiber.cp1.y + 3 * u * t * t * fiber.cp2.y + t * t * t * fiber.p1.y;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Central Trunk MIMIRYX Nexus Core
      const coreY = -90;
      ctx.beginPath();
      ctx.moveTo(0, coreY - 22);
      ctx.lineTo(22, coreY);
      ctx.lineTo(0, coreY + 22);
      ctx.lineTo(-22, coreY);
      ctx.closePath();
      ctx.fillStyle = '#061a2e';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9.5px Space Grotesk, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MIMIRYX', 0, coreY);

      // 7. FLOATING GLOWING NORSE RUNES
      treeLayout.runes.forEach((r) => {
        const floatY = Math.sin(time * 0.0015 + r.phase) * 12;
        ctx.font = `${r.scale}px serif`;
        ctx.fillStyle = `rgba(0, 240, 255, ${r.alpha})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.textAlign = 'center';
        ctx.fillText(r.char, r.x, r.y + floatY);
        ctx.shadowBlur = 0;
      });

      // 8. DATA-DRIVEN FRACTAL BRANCHES & TWIGS (CIRCUIT-VEIN TEXTURE)
      treeLayout.branches.forEach((br) => {
        // Growth animation progress
        let growthT = 1.0;
        if (br.birthTime > 0) {
          const elapsed = time - br.birthTime;
          growthT = Math.min(1.0, Math.max(0.0, elapsed / GROWTH_DURATION));
          growthT = 1 - Math.pow(1 - growthT, 3); // cubic ease-out
        }

        const isHovered = hoveredBranchId === br.id;

        ctx.beginPath();
        ctx.moveTo(br.p0.x, br.p0.y);
        if (growthT >= 0.99) {
          ctx.bezierCurveTo(br.cp1.x, br.cp1.y, br.cp2.x, br.cp2.y, br.p1.x, br.p1.y);
        } else {
          const t = growthT;
          const u = 1 - t;
          const cx = u * u * u * br.p0.x + 3 * u * u * t * br.cp1.x + 3 * u * t * t * br.cp2.x + t * t * t * br.p1.x;
          const cy = u * u * u * br.p0.y + 3 * u * u * t * br.cp1.y + 3 * u * t * t * br.cp2.y + t * t * t * br.p1.y;
          ctx.lineTo(cx, cy);
        }

        // Circuit outer sheath (Monochrome Teal/Cyan)
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = br.startWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = isHovered ? 16 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glowing core conductor line
        ctx.beginPath();
        ctx.moveTo(br.p0.x, br.p0.y);
        ctx.bezierCurveTo(br.cp1.x, br.cp1.y, br.cp2.x, br.cp2.y, br.p1.x, br.p1.y);
        ctx.strokeStyle = isHovered ? '#ffffff' : br.status === 'mastered' ? '#00ff88' : '#00f0ff';
        ctx.lineWidth = Math.max(1, br.startWidth * 0.35);
        ctx.stroke();

        // Node Crystal at Branch Tip
        if (br.nodeRadius > 0 && growthT > 0.75) {
          const sz = isHovered ? br.nodeRadius + 2.5 : br.nodeRadius;
          const nodeColor = br.status === 'mastered' ? '#00ff88' : br.status === 'reviewing' ? '#ffb020' : '#00f0ff';

          // Diamond Crystal Node
          ctx.beginPath();
          ctx.moveTo(br.p1.x, br.p1.y - sz);
          ctx.lineTo(br.p1.x + sz * 0.75, br.p1.y);
          ctx.lineTo(br.p1.x, br.p1.y + sz);
          ctx.lineTo(br.p1.x - sz * 0.75, br.p1.y);
          ctx.closePath();
          ctx.fillStyle = isHovered ? '#ffffff' : nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = isHovered ? 20 : 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Data-driven Label
          if (c.zoom > 0.55 || isHovered) {
            ctx.font = br.type === 'topic' ? 'bold 10px Space Grotesk, sans-serif' : '9px Inter, sans-serif';
            ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.fillText(br.title, br.p1.x, br.p1.y + sz + 9);
          }
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Mouse Hit Detection & Flight
    const getMouseWorldPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const c = cam.current;
      const wx = (mx - width / 2 - c.x) / c.zoom;
      const wy = (my - height / 2 - c.y) / c.zoom;
      return { mx, my, wx, wy };
    };

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (isLocked) return;
      isDragging = true;
      dragStartX = e.clientX - cam.current.x;
      dragStartY = e.clientY - cam.current.y;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      if (isDragging && !isLocked) {
        cam.current.x = e.clientX - dragStartX;
        cam.current.y = e.clientY - dragStartY;
        cam.current.targetX = cam.current.x;
        cam.current.targetY = cam.current.y;
      }

      // Check hover on branch tip nodes
      let hitId: string | null = null;
      for (const br of treeLayout.branches) {
        if (br.nodeRadius <= 0) continue;
        const dx = wx - br.p1.x;
        const dy = wy - br.p1.y;
        if (Math.hypot(dx, dy) <= br.nodeRadius + 8 / cam.current.zoom) {
          hitId = br.id;
          break;
        }
      }

      if (!hitId) {
        for (const root of treeLayout.roots) {
          const dx = wx - root.p1.x;
          const dy = wy - root.p1.y;
          if (Math.hypot(dx, dy) <= root.nodeRadius + 8 / cam.current.zoom) {
            hitId = root.id;
            break;
          }
        }
      }

      if (hitId !== hoveredBranchId) {
        setHoveredBranchId(hitId);
        canvas.style.cursor = hitId ? 'pointer' : isDragging ? 'grabbing' : 'default';
        if (hitId) sounds.playNodePulse();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      // Check clicked branch
      for (const br of treeLayout.branches) {
        if (br.nodeRadius <= 0) continue;
        const dx = wx - br.p1.x;
        const dy = wy - br.p1.y;
        if (Math.hypot(dx, dy) <= br.nodeRadius + 10 / cam.current.zoom) {
          sounds.playClick();
          if (br.noteId) {
            const fullNote = notes.find(n => n.id === br.noteId);
            if (fullNote) setSelectedItem({ ...fullNote, type: 'note' });
          } else if (br.labId) {
            const fullLab = labs.find(l => l.id === br.labId);
            if (fullLab) setSelectedItem({ ...fullLab, type: 'lab' });
          } else if (br.topicId) {
            const fullTopic = topics.find(t => t.id === br.topicId);
            if (fullTopic) setSelectedItem({ ...fullTopic, type: 'topic' });
          }
          cam.current.targetX = -br.p1.x * 1.3;
          cam.current.targetY = -br.p1.y * 1.3;
          cam.current.targetZoom = 1.35;
          return;
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isLocked) return;

      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(3.5, Math.max(0.25, cam.current.zoom * factor));

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;

      cam.current.x -= (mx - cam.current.x) * (factor - 1);
      cam.current.y -= (my - cam.current.y) * (factor - 1);
      cam.current.zoom = newZoom;
      cam.current.targetX = cam.current.x;
      cam.current.targetY = cam.current.y;
      cam.current.targetZoom = newZoom;
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
      cancelAnimationFrame(animId);
    };
  }, [treeLayout, customBg, isLocked, notes, labs, topics, hoveredBranchId]);

  const handleResetCamera = () => {
    sounds.playClick();
    cam.current.targetX = 0;
    cam.current.targetY = 35;
    cam.current.targetZoom = 0.75;
  };

  return (
    <div className="relative w-full h-[650px] overflow-hidden rounded-2xl border border-primary/30 cyber-card shadow-2xl bg-[#050711] select-none">
      {/* 60 FPS HTML5 Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none focus:outline-none" />

      {/* Top-Right Navigation Controls (Exact Position & Behavior) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            sounds.playClick();
            cam.current.targetZoom = Math.min(3.5, cam.current.zoom * 1.25);
          }}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            cam.current.targetZoom = Math.max(0.25, cam.current.zoom * 0.8);
          }}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          disabled={isLocked}
          className="w-8 h-8 rounded-lg border border-border bg-card/70 backdrop-blur flex items-center justify-center text-foreground hover:border-primary/50 disabled:opacity-30"
          title="Reset Camera"
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
          title={isLocked ? 'Unlock camera' : 'Lock camera'}
        >
          {isLocked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      {/* Header Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] text-[hsl(var(--neon-blue)/0.65)] pointer-events-none">
        MIMIRYX · ORGANIC DIGITAL YGGDRASIL
      </div>

      {/* Bottom Status Legend (Monochrome Teal/Cyan) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-[10px] font-mono text-muted-foreground pointer-events-none bg-black/60 backdrop-blur px-3 py-2 rounded-xl border border-border/60">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]" />
          LEARNING {treeLayout.stats.learning}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb020] shadow-[0_0_5px_#ffb020]" />
          REVIEWING {treeLayout.stats.reviewing}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_5px_#00ff88]" />
          MASTERED {treeLayout.stats.mastered}
        </span>
        <span className="flex items-center gap-1.5 mt-0.5 pt-1 border-t border-border/40 font-bold text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          GROWTH {treeLayout.stats.growthPercentage}%
        </span>
      </div>

      {/* Item Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-xl cyber-card space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
                  {selectedItem.type?.toUpperCase()} · {selectedItem.status?.toUpperCase() || 'ACTIVE'}
                </span>
                <h3 className="text-lg font-heading font-bold text-foreground mt-2">
                  {selectedItem.title || selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-muted-foreground bg-black/30 p-3.5 rounded-xl border border-border/60">
              {selectedItem.summary || selectedItem.description || 'Knowledge branch record in MIMIRYX Neural Network.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-foreground hover:bg-white/10"
              >
                Close
              </button>
              {selectedItem.type === 'note' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    navigate(`/notes/${selectedItem.id}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Open in Editor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
