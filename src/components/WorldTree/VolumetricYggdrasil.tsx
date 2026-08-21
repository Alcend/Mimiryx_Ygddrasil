import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateVolumetricTree, VolumetricTreeModel, FoliageParticle, RealmBough } from './canopyClusteringEngine';
import { Lock, Unlock, RotateCcw, Plus, Minus, Search, Sparkles, BookOpen, X, Play, Sliders } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useNavigate } from 'react-router-dom';

export const VolumetricYggdrasil: React.FC = () => {
  const { topics, notes, labs, customBg } = useApp();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [benchmarkScale, setBenchmarkScale] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; title: string; x: number; y: number } | null>(null);

  // Camera coordinates & target
  const cam = useRef({
    x: 0,
    y: 30,
    zoom: 0.72,
    targetX: 0,
    targetY: 30,
    targetZoom: 0.72,
  });

  const treeModel = useRef<VolumetricTreeModel>(
    generateVolumetricTree(topics, notes, labs, benchmarkScale)
  );

  useEffect(() => {
    treeModel.current = generateVolumetricTree(topics, notes, labs, benchmarkScale);
  }, [topics, notes, labs, benchmarkScale]);

  // Handle Search Highlight & Flight
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const leaf = treeModel.current.foliage.find(f => f.isInteractive && f.title.toLowerCase().includes(q));
    if (leaf) {
      cam.current.targetX = -leaf.x * 1.3;
      cam.current.targetY = -leaf.y * 1.3;
      cam.current.targetZoom = 1.4;
      sounds.playClick();
    }
  }, [searchQuery]);

  // 60 FPS Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

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

    const render = (time: number) => {
      // Smooth Camera Flight Interpolation
      const c = cam.current;
      c.x += (c.targetX - c.x) * 0.08;
      c.y += (c.targetY - c.y) * 0.08;
      c.zoom += (c.targetZoom - c.zoom) * 0.08;

      // Clear Canvas
      if (customBg) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(5, 8, 20, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      // Apply Camera Transform
      ctx.translate(width / 2 + c.x, height / 2 + c.y);
      ctx.scale(c.zoom, c.zoom);

      // 1. STARFIELD
      stars.forEach((s, idx) => {
        const tw = (Math.sin(time * 0.002 * s.twinkle + idx) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size / c.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 235, 255, ${s.alpha * tw})`;
        ctx.fill();
      });

      // 2. CELESTIAL PLANETS (Matching Concept Artwork)
      // Planet 1: Ringed Purple Giant (Right)
      ctx.save();
      const p1x = 440;
      const p1y = 40;
      ctx.beginPath();
      ctx.arc(p1x, p1y, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#581c87';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p1x, p1y, 78, 14, -0.35, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.restore();

      // Planet 2: Cyan Moon (Left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(-390, 70, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 3. FLOWING AURORA BOREALIS (Ribbon over crown canopy)
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
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.38)';
      ctx.lineWidth = 55;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 35;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. SUBTERRANEAN DIGITAL HORIZON GRID
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.09)';
      ctx.lineWidth = 1;
      for (let gz = 130; gz <= 520; gz += 45) {
        ctx.beginPath();
        ctx.moveTo(-1000, gz);
        ctx.lineTo(1000, gz);
        ctx.stroke();
      }
      for (let gx = -900; gx <= 900; gx += 90) {
        ctx.beginPath();
        ctx.moveTo(gx * 0.2, 110);
        ctx.lineTo(gx, 540);
        ctx.stroke();
      }
      ctx.restore();

      // 5. VOLUMETRIC TAPROOT NETWORK (FOUNDATIONS)
      treeModel.current.roots.forEach((root) => {
        ctx.beginPath();
        ctx.moveTo(root.p0.x, root.p0.y);
        ctx.bezierCurveTo(root.cp1.x, root.cp1.y, root.cp2.x, root.cp2.y, root.p1.x, root.p1.y);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = root.width;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        root.subTendrils.forEach((st) => {
          ctx.beginPath();
          ctx.moveTo(st.p0.x, st.p0.y);
          ctx.bezierCurveTo(st.cp1.x, st.cp1.y, st.cp2.x, st.cp2.y, st.p1.x, st.p1.y);
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.65)';
          ctx.lineWidth = st.width;
          ctx.stroke();
        });

        // Foundation Subterranean Node
        ctx.beginPath();
        ctx.arc(root.p1.x, root.p1.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (c.zoom > 0.45) {
          ctx.font = 'bold 9.5px monospace';
          ctx.fillStyle = '#a7f3d0';
          ctx.textAlign = 'center';
          ctx.fillText(root.title, root.p1.x, root.p1.y + 18);
        }
      });

      // 6. THICK BRAIDED VOLUMETRIC TRUNK CABLES (48 CABLES)
      treeModel.current.trunkCables.forEach((cable) => {
        ctx.beginPath();
        ctx.moveTo(cable.p0.x, cable.p0.y);
        ctx.bezierCurveTo(cable.cp1.x, cable.cp1.y, cable.cp2.x, cable.cp2.y, cable.p1.x, cable.p1.y);
        ctx.strokeStyle = cable.color;
        ctx.lineWidth = cable.width;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Circuit pulse climbing up trunk
        const pulseT = ((time * 0.001 * cable.speed + cable.offset) % 1.0);
        const t = pulseT;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const px = uuu * cable.p0.x + 3 * uu * t * cable.cp1.x + 3 * u * tt * cable.cp2.x + ttt * cable.p1.x;
        const py = uuu * cable.p0.y + 3 * uu * t * cable.cp1.y + 3 * u * tt * cable.cp2.y + ttt * cable.p1.y;

        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Central Trunk MIMIRYX Nexus
      const nexusY = -95;
      ctx.beginPath();
      ctx.moveTo(0, nexusY - 22);
      ctx.lineTo(22, nexusY);
      ctx.lineTo(0, nexusY + 22);
      ctx.lineTo(-22, nexusY);
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
      ctx.fillText('MIMIRYX', 0, nexusY);

      // 7. FLOATING NORSE CYBER-RUNES
      treeModel.current.runes.forEach((r) => {
        const floatY = Math.sin(time * 0.0015 + r.phase) * 12;
        ctx.font = `${r.scale}px serif`;
        ctx.fillStyle = `rgba(0, 240, 255, ${r.alpha})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.textAlign = 'center';
        ctx.fillText(r.char, r.x, r.y + floatY);
        ctx.shadowBlur = 0;
      });

      // 8. ARCHING REALM BOUGHS & RECURSIVE TWIGS
      treeModel.current.boughs.forEach((bough) => {
        // Main Arching Limb
        ctx.beginPath();
        ctx.moveTo(bough.p0.x, bough.p0.y);
        ctx.bezierCurveTo(bough.cp1.x, bough.cp1.y, bough.cp2.x, bough.cp2.y, bough.p1.x, bough.p1.y);
        ctx.strokeStyle = bough.color;
        ctx.lineWidth = bough.width;
        ctx.shadowColor = bough.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Secondary Twigs
        bough.subBranches.forEach((sb) => {
          ctx.beginPath();
          ctx.moveTo(sb.p0.x, sb.p0.y);
          ctx.bezierCurveTo(sb.cp1.x, sb.cp1.y, sb.cp2.x, sb.cp2.y, sb.p1.x, sb.p1.y);
          ctx.strokeStyle = sb.color;
          ctx.lineWidth = sb.width;
          ctx.stroke();
        });

        // Realm Title Header
        if (c.zoom > 0.35) {
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = bough.color;
          ctx.shadowBlur = 10;
          ctx.fillText(`${bough.realmName.toUpperCase()} · ${bough.norseName}`, bough.p1.x, bough.p1.y - 14);
          ctx.shadowBlur = 0;
        }
      });

      // 9. VOLUMETRIC LUSH FOLIAGE CANOPY (2,000+ PARTICLES)
      treeModel.current.foliage.forEach((leaf) => {
        // Sway Physics in Cybernetic Breeze
        const swayX = Math.sin(time * 0.001 * leaf.swaySpeed + leaf.swayPhase) * leaf.swayAmplitude;
        const swayY = Math.cos(time * 0.001 * leaf.swaySpeed + leaf.swayPhase) * (leaf.swayAmplitude * 0.5);
        leaf.x = leaf.originX + swayX;
        leaf.y = leaf.originY + swayY;

        ctx.beginPath();
        ctx.arc(leaf.x, leaf.y, leaf.radius, 0, Math.PI * 2);
        ctx.fillStyle = leaf.color;
        if (leaf.isInteractive) {
          ctx.shadowColor = leaf.color;
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Label when zoomed in
          if (c.zoom > 0.95) {
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.fillText(leaf.title, leaf.x, leaf.y + leaf.radius + 8);
          }
        } else {
          ctx.fill();
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Mouse Interactions & Flight
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

      // Check hover
      let hit: FoliageParticle | null = null;
      for (const f of treeModel.current.foliage) {
        if (!f.isInteractive) continue;
        const dx = wx - f.x;
        const dy = wy - f.y;
        if (Math.hypot(dx, dy) <= f.radius + 8 / cam.current.zoom) {
          hit = f;
          break;
        }
      }

      if (hit) {
        canvas.style.cursor = 'pointer';
        setHoveredNode({ id: hit.id, title: hit.title, x: hit.x, y: hit.y });
      } else {
        canvas.style.cursor = isDragging ? 'grabbing' : 'default';
        setHoveredNode(null);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const { wx, wy } = getMouseWorldPos(e);

      // 1. Check if clicked a note leaf
      let hitLeaf: FoliageParticle | null = null;
      for (const f of treeModel.current.foliage) {
        if (!f.isInteractive) continue;
        const dx = wx - f.x;
        const dy = wy - f.y;
        if (Math.hypot(dx, dy) <= f.radius + 10 / cam.current.zoom) {
          hitLeaf = f;
          break;
        }
      }

      if (hitLeaf) {
        sounds.playClick();
        const fullNote = notes.find(n => n.id === hitLeaf?.noteId);
        if (fullNote) setSelectedNote(fullNote);
        cam.current.targetX = -hitLeaf.x * 1.3;
        cam.current.targetY = -hitLeaf.y * 1.3;
        cam.current.targetZoom = 1.4;
        return;
      }

      // 2. Check if clicked a realm bough tip
      for (const b of treeModel.current.boughs) {
        const dx = wx - b.p1.x;
        const dy = wy - b.p1.y;
        if (Math.hypot(dx, dy) <= 60) {
          sounds.playSuccess();
          cam.current.targetX = -b.p1.x * 1.1;
          cam.current.targetY = -b.p1.y * 1.1;
          cam.current.targetZoom = 1.1;
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
  }, [treeModel, customBg, isLocked, notes]);

  const handleResetCamera = () => {
    sounds.playClick();
    cam.current.targetX = 0;
    cam.current.targetY = 30;
    cam.current.targetZoom = 0.72;
  };

  return (
    <div className="relative w-full h-[650px] overflow-hidden rounded-2xl border border-primary/30 cyber-card shadow-2xl bg-[#050711] select-none">
      {/* HTML5 Volumetric Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none focus:outline-none" />

      {/* Floating HUD Controls */}
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

      {/* Benchmark Scaling Bar (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 z-20">
        <span className="text-[10px] font-mono text-muted-foreground px-2 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-primary" /> Scale:
        </span>
        {[0, 100, 250, 500, 1000].map(cnt => (
          <button
            key={cnt}
            onClick={() => {
              sounds.playSuccess();
              setBenchmarkScale(cnt);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              benchmarkScale === cnt
                ? 'bg-primary text-primary-foreground font-bold shadow-neon-glow'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            {cnt === 0 ? 'Live' : `${cnt}`}
          </button>
        ))}
      </div>

      {/* Realm Crown Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] text-[hsl(var(--neon-blue)/0.65)] pointer-events-none">
        YGGDRASIL · VOLUMETRIC KNOWLEDGE ORGANISM
      </div>

      {/* Selected Note Inspector Drawer */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-xl cyber-card space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
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
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-muted-foreground bg-black/30 p-3.5 rounded-xl border border-border/60">
              {selectedNote.summary}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedNote(null)}
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
