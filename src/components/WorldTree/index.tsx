import React, { useRef, useState } from 'react';
import { YggdrasilCanvas } from './YggdrasilCanvas';
import { WorldTreeHUD } from './WorldTreeHUD';
import { NodeInspectorDrawer } from './NodeInspectorDrawer';
import { Camera } from './types';
import { generateYggdrasilTree } from './yggdrasilTreeEngine';
import { useApp } from '../../context/AppContext';

export const WorldTree: React.FC = () => {
  const { topics, notes } = useApp();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syntheticCount, setSyntheticCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const cameraRef = useRef<Camera>({
    x: 0,
    y: 40,
    zoom: 0.68,
    targetX: 0,
    targetY: 40,
    targetZoom: 0.68,
    isLocked: false,
  });

  const treeModel = generateYggdrasilTree(topics, notes, syntheticCount);

  const handleResetCamera = () => {
    cameraRef.current.targetX = 0;
    cameraRef.current.targetY = 40;
    cameraRef.current.targetZoom = 0.68;
  };

  const handleToggleLock = () => {
    setIsLocked((prev) => {
      const next = !prev;
      cameraRef.current.isLocked = next;
      return next;
    });
  };

  return (
    <div className="relative w-full h-[720px] rounded-2xl overflow-hidden border border-primary/30 cyber-card shadow-2xl bg-[#050711]">
      {/* True Digital Yggdrasil Canvas */}
      <YggdrasilCanvas
        onSelectNode={setSelectedNode}
        searchQuery={searchQuery}
        syntheticCount={syntheticCount}
        cameraRef={cameraRef}
      />

      {/* World Tree HUD Overlay */}
      <WorldTreeHUD
        treeData={{
          nodes: new Map(),
          rootCoreId: 'core-mimiryx',
          foundations: [],
          domains: [],
          stats: treeModel.stats,
        }}
        cameraRef={cameraRef}
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        onResetCamera={handleResetCamera}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        syntheticCount={syntheticCount}
        onSetSyntheticCount={setSyntheticCount}
      />

      {/* Node Inspector Drawer */}
      <NodeInspectorDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
};
