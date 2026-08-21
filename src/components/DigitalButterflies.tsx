import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Sparkles, BrainCircuit, CheckCircle2, Share2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface TriviaFact {
  id: string;
  category: string;
  color: string;
  q: string;
  a: string;
  takeaway: string;
}

interface DigitalButterfliesProps {
  triviaPool: TriviaFact[];
  maxCount?: number;
}

export const DigitalButterflies: React.FC<DigitalButterfliesProps> = ({ triviaPool, maxCount = 8 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const butterfliesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);

  // State
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [activeTrivia, setActiveTrivia] = useState<TriviaFact | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());

  const [visibleCount, setVisibleCount] = useState(maxCount);

  useEffect(() => {
    // Responsive count capping
    const w = window.innerWidth;
    if (w < 768) setVisibleCount(Math.min(maxCount, 4));
    else if (w < 1024) setVisibleCount(Math.min(maxCount, 6));
    else setVisibleCount(maxCount);
    
    // Load local storage progress
    try {
      const saved = localStorage.getItem('mimiryx:discovered_trivia');
      if (saved) setDiscoveredIds(new Set(JSON.parse(saved)));
    } catch (e) {}
  }, [maxCount]);

  // Launch WAAPI Flight Animations
  useEffect(() => {
    if (triviaPool.length === 0 || !containerRef.current) return;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    butterfliesRef.current.forEach((el, idx) => {
      if (!el) return;
      if (animationsRef.current[idx]) animationsRef.current[idx].cancel();

      const keyframes: Keyframe[] = [];
      const numWaypoints = 45;
      let currX = Math.random() * w;
      let currY = Math.random() * h;
      let currentAngle = Math.random() * Math.PI * 2;
      let cumulativeRot = 0;

      for (let step = 0; step <= numWaypoints; step++) {
        // Organic drifting heading
        currentAngle += (Math.random() - 0.5) * Math.PI * 0.9;
        const dist = 60 + Math.random() * 120;
        
        let nextX = currX + Math.cos(currentAngle) * dist;
        let nextY = currY + Math.sin(currentAngle) * dist;

        // Soft edge bounce
        if (nextX < 40 || nextX > w - 40) {
          currentAngle = Math.PI - currentAngle;
          nextX = Math.max(40, Math.min(w - 40, nextX));
        }
        if (nextY < 40 || nextY > h - 40) {
          currentAngle = -currentAngle;
          nextY = Math.max(40, Math.min(h - 40, nextY));
        }

        // Calculate rotation pointing to next waypoint
        const dx = nextX - currX;
        const dy = nextY - currY;
        let targetRot = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        // Prevent 360 snap spinning
        if (step > 0) {
          let diff = targetRot - (cumulativeRot % 360);
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          cumulativeRot += diff;
        } else {
          cumulativeRot = targetRot;
        }

        keyframes.push({
          offset: step / numWaypoints,
          transform: `translate3d(${currX}px, ${currY}px, 0) rotate(${cumulativeRot}deg)`,
          easing: 'linear'
        });

        currX = nextX;
        currY = nextY;
      }

      const anim = el.animate(keyframes, {
        duration: 40000 + Math.random() * 25000,
        iterations: Infinity,
        direction: 'alternate',
      });
      
      // Desynchronize start times
      anim.currentTime = Math.random() * 10000;
      animationsRef.current[idx] = anim;
    });

    return () => {
      animationsRef.current.forEach(a => a.cancel());
    };
  }, [visibleCount, triviaPool.length]);

  // Click Handler
  const handleButterflyClick = (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    sounds.playClick();
    
    // Pause animation
    const anim = animationsRef.current[idx];
    if (anim) anim.pause();

    // Determine trivia to show (Shuffle-bag pulling from undiscovered first)
    const undiscovered = triviaPool.filter(t => !discoveredIds.has(t.id));
    const poolToUse = undiscovered.length > 0 ? undiscovered : triviaPool;
    const selectedTrivia = poolToUse[Math.floor(Math.random() * poolToUse.length)];

    // Mark discovered
    const newDiscovered = new Set(discoveredIds);
    newDiscovered.add(selectedTrivia.id);
    setDiscoveredIds(newDiscovered);
    localStorage.setItem('mimiryx:discovered_trivia', JSON.stringify(Array.from(newDiscovered)));

    // Calculate Popover Position with edge clamping (relative to container)
    const btn = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const popoverWidth = 280;
    const popoverHeight = 200;
    
    let popX = btn.offsetLeft + btn.offsetWidth / 2;
    let popY = btn.offsetTop + btn.offsetHeight;

    // Clamp X
    if (popX + popoverWidth / 2 > w - 16) popX = w - popoverWidth / 2 - 16;
    if (popX - popoverWidth / 2 < 16) popX = popoverWidth / 2 + 16;
    
    // Clamp Y (flip above if too low)
    if (popY + popoverHeight > h - 16) {
      popY = btn.offsetTop - popoverHeight - 16;
    }

    setPopoverPos({ x: popX, y: popY });
    setActiveTrivia(selectedTrivia);
    setActiveIdx(idx);
  };

  const handleClose = () => {
    sounds.playClick();
    if (activeIdx !== null && animationsRef.current[activeIdx]) {
      animationsRef.current[activeIdx].play();
    }
    setActiveIdx(null);
    setActiveTrivia(null);
  };

  // SVGs for Data Sprite (Butterfly)
  const renderDataSprite = (color: string) => (
    <svg viewBox="0 0 100 100" className="w-8 h-8 opacity-80 drop-shadow-lg" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <g className="origin-center animate-[flap_0.2s_ease-in-out_infinite_alternate]" style={{ transformOrigin: '50% 50%' }}>
        <path d="M50 20 L40 50 L10 40 L30 80 L48 90 L50 95 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
        <path d="M50 20 L60 50 L90 40 L70 80 L52 90 L50 95 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
        <line x1="40" y1="50" x2="25" y2="45" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
        <line x1="60" y1="50" x2="75" y2="45" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="50" cy="30" r="3" fill="#fff" />
      </g>
    </svg>
  );

  if (triviaPool.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" ref={containerRef} aria-live="polite">
      
      {/* CSS Keyframes injected for wing flapping */}
      <style>{`
        @keyframes flap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.15); }
        }
      `}</style>

      {/* Render Butterflies */}
      {Array.from({ length: visibleCount }).map((_, i) => {
        const tColor = triviaPool[i % triviaPool.length].color;
        const isActive = activeIdx === i;
        
        return (
          <button
            key={i}
            ref={el => butterfliesRef.current[i] = el}
            onClick={(e) => handleButterflyClick(i, e)}
            className="absolute top-0 left-0 p-4 -ml-4 -mt-4 pointer-events-auto rounded-full hover:bg-white/5 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ 
              opacity: isActive ? 1 : 0.6,
            }}
            aria-label="Reveal a trivia fact"
            role="button"
          >
            {renderDataSprite(isActive ? '#fff' : tColor)}
          </button>
        );
      })}

      {/* Active Trivia Popover */}
      {activeTrivia && activeIdx !== null && (
        <>
          <div className="absolute inset-0 pointer-events-auto" onClick={handleClose} />
          
          <div 
            className="absolute z-50 pointer-events-auto w-[280px] bg-[#030810]/95 backdrop-blur-xl border cyber-card shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200"
            style={{
              left: popoverPos.x,
              top: popoverPos.y,
              transform: 'translate(-50%, 0)', // Center horizontally on the calculated X
              borderColor: activeTrivia.color,
              boxShadow: `0 10px 40px rgba(0,0,0,0.8), 0 0 20px ${activeTrivia.color}30`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" style={{ color: activeTrivia.color }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: activeTrivia.color }}>
                  {activeTrivia.category}
                </span>
              </div>
              <button onClick={handleClose} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm font-heading font-bold text-white leading-snug">
                {activeTrivia.q}
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  {activeTrivia.a}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-primary/90 leading-normal">
                    {activeTrivia.takeaway}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer / Gamification */}
            <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 rounded-b-2xl flex items-center justify-between">
              <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{discoveredIds.size}/{triviaPool.length} Discovered</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Trivia: ${activeTrivia.q}\nFact: ${activeTrivia.a}`);
                  sounds.playSuccess();
                }}
                className="flex items-center gap-1 text-[9px] font-mono text-primary hover:text-white transition-colors"
              >
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
