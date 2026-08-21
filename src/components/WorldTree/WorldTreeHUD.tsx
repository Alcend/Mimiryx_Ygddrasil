import React from 'react';
import { Plus, Minus, RotateCcw, Lock, Unlock, Search, Sparkles, Activity, Layers } from 'lucide-react';
import { TreeData, Camera } from './types';
import { sounds } from '../../utils/audio';

interface WorldTreeHUDProps {
  treeData: TreeData;
  cameraRef: React.MutableRefObject<Camera>;
  isLocked: boolean;
  onToggleLock: () => void;
  onResetCamera: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  syntheticCount: number;
  onSetSyntheticCount: (count: number) => void;
}

export const WorldTreeHUD: React.FC<WorldTreeHUDProps> = ({
  treeData,
  cameraRef,
  isLocked,
  onToggleLock,
  onResetCamera,
  searchQuery,
  onSearchChange,
  syntheticCount,
  onSetSyntheticCount,
}) => {
  const handleZoom = (delta: number) => {
    sounds.playClick();
    const cam = cameraRef.current;
    cam.targetZoom = Math.min(3.5, Math.max(0.2, cam.targetZoom * delta));
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between select-none">
      {/* Top Banner (CROWN · BRANCHES) */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-border/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-foreground uppercase tracking-widest font-bold">
              CROWN · BRANCHES
            </span>
          </div>

          {/* Quick Node Search inside Tree */}
          <div className="relative hidden sm:block w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Locate note or branch..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-black/60 backdrop-blur-md border border-border/80 rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Floating Zoom & Lock Controls (matching reference image top-right) */}
        <div className="flex flex-col gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-border/80 shadow-2xl">
          <button
            onClick={() => handleZoom(1.25)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onResetCamera();
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onToggleLock();
            }}
            className={`p-2 rounded-xl transition-all ${
              isLocked
                ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
            title={isLocked ? 'Unlock Canvas' : 'Lock Canvas (Scroll page freely)'}
          >
            {isLocked ? <Lock className="w-4 h-4 text-purple-400" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Center (ROOTS · FOUNDATION) & Bottom Right Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto">
        {/* Lock Hint & Scale Benchmark Tester */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-mono text-muted-foreground/80 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/60">
            {isLocked ? (
              <span className="text-purple-400 font-semibold">Locked — scroll the page freely</span>
            ) : (
              <span>Unlocked — drag to pan • scroll wheel to zoom</span>
            )}
          </div>

          {/* Scale Benchmark Switcher */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-border/60 text-[10px] font-mono">
            <span className="text-muted-foreground px-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-primary" /> Stress Scale:
            </span>
            {[0, 25, 100, 250, 500, 1000].map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  sounds.playClick();
                  onSetSyntheticCount(cnt);
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  syntheticCount === cnt
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {cnt === 0 ? 'Live' : `${cnt}`}
              </button>
            ))}
          </div>
        </div>

        {/* Center Roots Label */}
        <div className="self-center hidden md:block">
          <div className="px-4 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-border/80 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ROOTS · FOUNDATION
          </div>
        </div>

        {/* Right Status Legend (matching reference UI) */}
        <div className="bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-border/80 font-mono text-xs space-y-1.5 shadow-2xl">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            <span>LEARNING {treeData.stats.learning}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb020] shadow-[0_0_8px_#ffb020]" />
            <span>REVIEWING {treeData.stats.reviewing}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            <span>MASTERED {treeData.stats.mastered}</span>
          </div>
          <div className="flex items-center gap-2 text-teal-300 pt-1 border-t border-border/40 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]" />
            <span>GROWTH {treeData.stats.growthPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
