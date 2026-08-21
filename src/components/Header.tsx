import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Image, UploadCloud, Moon, Monitor, Settings, Palette, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/audio';
import { BackgroundSettingsModal } from './BackgroundSettingsModal';
import { ImportExportModal } from './ImportExportModal';
import { ThemeMode } from '../types';

const THEMES: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'cyan', label: 'Cyan', color: 'bg-[hsl(180_100%_50%)]' },
  { id: 'green', label: 'Green', color: 'bg-[hsl(135_100%_50%)]' },
  { id: 'purple', label: 'Purple', color: 'bg-[hsl(265_90%_68%)]' },
  { id: 'amber', label: 'Amber', color: 'bg-[hsl(38_100%_56%)]' },
];

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, theme, setTheme, soundEnabled, setSoundEnabled, autoDim, setAutoDim, customBg } = useApp();
  const [showBgModal, setShowBgModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  return (
    <>
      <header className="h-14 glass-header border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Search Input */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes, topics, commands (e.g. eBPF, k8s)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-background/70 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 font-mono transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status indicator (always visible, minimal) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary mr-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>NEURAL CORE ACTIVE</span>
          </div>

          {/* Unified Settings Menu */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => {
                sounds.playClick();
                setSettingsOpen(!settingsOpen);
              }}
              className={`p-2 rounded-lg border transition-all ${
                settingsOpen ? 'bg-primary/10 border-primary/40 text-primary shadow-neon-glow' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
              title="Settings & Tools"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Dropdown Popover */}
            {settingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 cyber-card rounded-xl border border-white/10 p-3 space-y-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                {/* Theme Selectors */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                    <Palette className="w-3.5 h-3.5 text-muted-foreground" /> Theme Color
                  </div>
                  <div className="flex items-center gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { sounds.playClick(); setTheme(t.id); }}
                        title={t.label}
                        className={`w-4 h-4 rounded-full ${t.color} transition-all ${
                          theme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Audio Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-muted-foreground" /> : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
                    SFX Audio
                  </div>
                  <button
                    onClick={() => { setSoundEnabled(!soundEnabled); sounds.playClick(); }}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                      soundEnabled ? 'bg-primary/20 text-primary border-primary/50' : 'bg-white/5 text-muted-foreground border-border'
                    }`}
                  >
                    {soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Auto-Dim Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                    {autoDim ? <Moon className="w-3.5 h-3.5 text-muted-foreground" /> : <Monitor className="w-3.5 h-3.5 text-muted-foreground" />}
                    Ambient Dim
                  </div>
                  <button
                    onClick={() => { setAutoDim(!autoDim); sounds.playClick(); }}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                      autoDim ? 'bg-primary/20 text-primary border-primary/50' : 'bg-white/5 text-muted-foreground border-border'
                    }`}
                  >
                    {autoDim ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="h-px bg-white/10 my-2" />

                {/* Wallpaper */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowBgModal(true);
                    setSettingsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs font-mono text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Custom Wallpaper</span>
                  </div>
                  {customBg && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>

                {/* Import / Export */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowImportExportModal(true);
                    setSettingsOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 text-xs font-mono text-foreground transition-colors group"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Import / Export Vault</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              sounds.playClick();
              navigate('/notes');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium font-mono hover:opacity-90 transition-opacity shadow-neon-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </header>

      {/* Background Customizer Modal */}
      <BackgroundSettingsModal isOpen={showBgModal} onClose={() => setShowBgModal(false)} />

      {/* Import & Export AI Modal */}
      <ImportExportModal isOpen={showImportExportModal} onClose={() => setShowImportExportModal(false)} />
    </>
  );
};
