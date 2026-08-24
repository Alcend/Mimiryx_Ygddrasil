import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wand2, Layers, Search, BrainCircuit, Type } from 'lucide-react';
import { sounds } from '../utils/audio';

// We will split these into separate files as we refine them
import { CreatorLayout } from '../components/TopicCreator/CreatorLayout';

export const TopicCreatorPage: React.FC = () => {
  const { theme } = useApp();
  
  return (
    <div className="flex flex-col h-full gap-4 max-w-[1600px] mx-auto w-full relative">
      <div className="flex items-center justify-between bg-card/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl cyber-card">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Topic Creator Engine</h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Autonomous research and synthesis module
            </p>
          </div>
        </div>
      </div>

      <CreatorLayout />
    </div>
  );
};
