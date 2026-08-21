import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/audio';

interface Node {
  id: string;
  name: string;
  category: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

export const NeuralGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { topics, notes, labs } = useApp();
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Build visual nodes
    const colors = ['#00f0ff', '#00ff88', '#b026ff', '#ffb020', '#f43f5e'];
    const nodes: Node[] = topics.map((t, idx) => {
      const angle = (idx / topics.length) * Math.PI * 2;
      const radiusDist = Math.min(width, height) * 0.32;
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        color: colors[idx % colors.length],
        x: width / 2 + Math.cos(angle) * radiusDist,
        y: height / 2 + Math.sin(angle) * radiusDist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 18,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    // Central Core Node (MIMIR NODE)
    const coreNode: Node = {
      id: 'core-mimir',
      name: 'MIMIRYX CORE',
      category: 'Neural Synapse Hub',
      color: '#00f0ff',
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 26,
      pulsePhase: 0,
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update positions subtly
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += 0.04;

        // Bounce back to orbital range
        const dx = node.x - width / 2;
        const dy = node.y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(width, height) * 0.4;
        const minDist = 80;

        if (dist > maxDist) {
          node.vx -= (dx / dist) * 0.05;
          node.vy -= (dy / dist) * 0.05;
        } else if (dist < minDist) {
          node.vx += (dx / dist) * 0.05;
          node.vy += (dy / dist) * 0.05;
        }
      });

      // Draw Connections to Core
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.moveTo(coreNode.x, coreNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `rgba(0, 240, 255, 0.15)`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulse signal along line
        const pulsePos = (Math.sin(node.pulsePhase) + 1) / 2;
        const px = coreNode.x + (node.x - coreNode.x) * pulsePos;
        const py = coreNode.y + (node.y - coreNode.y) * pulsePos;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw inter-topic connections
      for (let i = 0; i < nodes.length; i++) {
        const next = nodes[(i + 1) % nodes.length];
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Core Node
      const corePulse = Math.sin(Date.now() / 400) * 3;
      ctx.beginPath();
      ctx.arc(coreNode.x, coreNode.y, coreNode.radius + corePulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('MIMIR', coreNode.x, coreNode.y + 3);

      // Draw Topic Nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const nodePulse = Math.sin(node.pulsePhase) * 2;

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered ? 6 : nodePulse), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? `${node.color}33` : `${node.color}18`;
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 18 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = isHovered ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: Node | null = null;
      for (const node of nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 6) {
          found = node;
          break;
        }
      }
      setHoveredNode(found);
      canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handleClick = () => {
      if (hoveredNode) {
        sounds.playNodePulse();
        navigate(`/topics/${hoveredNode.id}`);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [topics, hoveredNode, navigate]);

  return (
    <div className="relative w-full rounded-xl cyber-card overflow-hidden p-1 border border-border/70">
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Interactive Neural Knowledge Topology
        </span>
      </div>
      <div className="absolute top-3 right-4 text-[10px] font-mono text-muted-foreground z-10">
        Click any node to explore
      </div>
      <canvas ref={canvasRef} className="w-full block" />
    </div>
  );
};
