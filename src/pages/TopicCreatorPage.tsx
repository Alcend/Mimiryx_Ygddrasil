import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wand2, Layers, Search, BrainCircuit, Type } from 'lucide-react';
import { sounds } from '../utils/audio';

// We will split these into separate files as we refine them
import { CreatorLayout } from '../components/TopicCreator/CreatorLayout';

export const TopicCreatorPage: React.FC = () => {
  const { theme } = useApp();
  
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 max-w-[1600px] mx-auto w-full relative">
      <div className="flex items-center justify-between bg-card/60 backdrop-blur-md border border-white/10 px-4 py-2.5 sm:py-3 rounded-xl cyber-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-foreground leading-tight">Topic Creator Engine</h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Autonomous research and synthesis module
            </p>
          </div>
        </div>
      </div>

      <CreatorLayout />
    </div>
  );
};
