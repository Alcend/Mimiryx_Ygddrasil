import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { DigitalVinesFrame } from './DigitalVinesFrame';
import { SettingsModal } from './SettingsModal';
import { OracleChat } from './OracleChat';

export const Layout: React.FC = () => {
  const { customBg, bgOpacity, bgBlur, autoDim, isSidebarOpen } = useApp();
  const [isIdle, setIsIdle] = useState(false);

  // Auto-Dim ambient logic
  useEffect(() => {
    if (!autoDim) {
      setIsIdle(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, 4000); // 4 seconds of inactivity triggers dim
    };

    // Initial trigger
    handleActivity();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('wheel', handleActivity);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('wheel', handleActivity);
    };
  }, [autoDim]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Full-Screen Custom Background Wallpaper Image Layer */}
      {customBg && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url("${customBg}")`,
              filter: `blur(${bgBlur}px)`,
              transform: bgBlur > 0 ? 'scale(1.05)' : 'none',
            }}
          />
          {/* Dark overlay backdrop for glowing node contrast */}
          <div
            className="absolute inset-0 bg-background transition-opacity duration-700"
            style={{ opacity: isIdle ? Math.min(bgOpacity, 0.15) : bgOpacity }}
          />
        </div>
      )}

      {/* Sidebar & Shell */}
      <div
        className={`shrink-0 transition-all duration-700 ease-in-out hover:opacity-100 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } ${isIdle && isSidebarOpen ? 'opacity-10' : 'opacity-100'} overflow-hidden`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div
          className={`transition-all duration-700 ease-in-out hover:opacity-100 ${
            isIdle ? 'opacity-10' : 'opacity-100'
          }`}
        >
          <Header />
        </div>
        
        {/* Pass isIdle to Outlet context so Dashboard can read it if needed, or we just handle it globally */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-700 w-full max-w-[1700px] mx-auto">
          <Outlet context={{ isIdle }} />
        </main>
      </div>
      
      {/* Decorative ultra-wide frame */}
      <DigitalVinesFrame />
      
      {/* Global Overlays */}
      <OracleChat />
      <SettingsModal />
    </div>
  );
};
