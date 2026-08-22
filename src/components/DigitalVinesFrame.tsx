import React from 'react';

export const DigitalVinesFrame: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50 mix-blend-screen hidden lg:block">
      {/* Left Frame Vines */}
      <svg className="absolute top-0 left-0 w-[400px] h-full drop-shadow-[0_0_8px_hsl(var(--neon-green))]" viewBox="0 0 400 1080" preserveAspectRatio="none">
        <path 
          d="M 0,0 C 150,200 50,400 200,600 C 300,800 100,1000 0,1080" 
          fill="none" 
          stroke="url(#vineGradLeft)" 
          strokeWidth="3" 
        />
        <path 
          d="M 0,100 C 100,250 80,500 150,700 C 200,900 50,1000 0,1080" 
          fill="none" 
          stroke="url(#vineGradLeft)" 
          strokeWidth="1.5" 
          strokeDasharray="4 8"
        />
        <path 
          d="M 0,300 C 50,400 200,500 120,800 C 80,950 0,1000 0,1080" 
          fill="none" 
          stroke="url(#vineGradLeft)" 
          strokeWidth="2" 
          opacity="0.6"
        />
        {/* Glowing Data Nodes */}
        <circle cx="120" cy="300" r="4" fill="hsl(var(--neon-green))" />
        <circle cx="200" cy="600" r="6" fill="hsl(var(--neon-blue))" />
        <circle cx="150" cy="700" r="3" fill="hsl(var(--neon-purple))" />
        <circle cx="120" cy="800" r="5" fill="hsl(var(--neon-green))" />

        <defs>
          <linearGradient id="vineGradLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-green))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--neon-blue))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--neon-purple))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Right Frame Vines */}
      <svg className="absolute top-0 right-0 w-[400px] h-full drop-shadow-[0_0_8px_hsl(var(--neon-blue))]" viewBox="0 0 400 1080" preserveAspectRatio="none">
        <path 
          d="M 400,0 C 250,200 350,400 200,600 C 100,800 300,1000 400,1080" 
          fill="none" 
          stroke="url(#vineGradRight)" 
          strokeWidth="3" 
        />
        <path 
          d="M 400,100 C 300,250 320,500 250,700 C 200,900 350,1000 400,1080" 
          fill="none" 
          stroke="url(#vineGradRight)" 
          strokeWidth="1.5" 
          strokeDasharray="4 8"
        />
        <path 
          d="M 400,300 C 350,400 200,500 280,800 C 320,950 400,1000 400,1080" 
          fill="none" 
          stroke="url(#vineGradRight)" 
          strokeWidth="2" 
          opacity="0.6"
        />
        {/* Glowing Data Nodes */}
        <circle cx="280" cy="300" r="4" fill="hsl(var(--neon-blue))" />
        <circle cx="200" cy="600" r="6" fill="hsl(var(--neon-purple))" />
        <circle cx="250" cy="700" r="3" fill="hsl(var(--neon-green))" />
        <circle cx="280" cy="800" r="5" fill="hsl(var(--neon-blue))" />

        <defs>
          <linearGradient id="vineGradRight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-blue))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--neon-purple))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--neon-green))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
