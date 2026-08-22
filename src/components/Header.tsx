import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Image, UploadCloud, Moon, Monitor, Settings, Palette, Volume2, VolumeX, Menu, Sparkles, Brain, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { searchQuery, setSearchQuery, theme, setTheme, soundEnabled, setSoundEnabled, autoDim, setAutoDim, customBg, isSidebarOpen, setSidebarOpen, notes, topics, setIsOracleOpen, isOracleOpen, setIsSettingsOpen, geminiKey } = useApp();
  const [showBgModal, setShowBgModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Search Logic
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { notes: [], topics: [] };
    const q = searchQuery.toLowerCase();
    return {
      notes: notes.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)).slice(0, 4),
      topics: topics.filter(t => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)).slice(0, 3)
    };
  }, [searchQuery, notes, topics]);

  return (
    <>
      <header className="h-14 glass-header border-b border-white/10 px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 flex-1 max-w-md relative">
          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => { sounds.playClick(); setSidebarOpen(!isSidebarOpen); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors shrink-0"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Back Navigation (Only show if not on root) */}
          {location.pathname !== '/' && (
            <button
              onClick={() => { sounds.playClick(); navigate(-1); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors shrink-0 flex items-center gap-1 text-xs font-mono pr-3 border border-transparent hover:border-white/5"
              title="Go Back"
            >
              <span className="text-lg leading-none mb-0.5">‹</span> Back
            </button>
          )}

          {/* Search Input */}
          <div className="relative w-full ml-1 z-50">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes, topics, commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full h-9 bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 font-mono text-xs"
            />
            
            {/* Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() && (searchResults.notes.length > 0 || searchResults.topics.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 cyber-card max-h-[400px] overflow-y-auto">
                
                {searchResults.topics.length > 0 && (
                  <div className="p-2 border-b border-white/5">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-2 pb-1.5">Topics</p>
                    {searchResults.topics.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { sounds.playClick(); navigate(`/topics/${t.id}`); setSearchQuery(''); }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 group"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color || 'var(--primary)' }} />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchResults.notes.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-2 pb-1.5">Notes</p>
                    {searchResults.notes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { sounds.playClick(); navigate(`/notes/${n.id}`); setSearchQuery(''); }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{n.summary}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status indicator (always visible, minimal) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary mr-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>NEURAL CORE ACTIVE</span>
          </div>

          {/* AI Oracle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              if (!geminiKey) {
                setIsSettingsOpen(true);
              } else {
                setIsOracleOpen(!isOracleOpen);
              }
            }}
            className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
              isOracleOpen ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,224,255,0.4)] text-primary' : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-neon-glow'
            }`}
            title="Summon AI Oracle"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-mono font-bold">Ask Oracle</span>
          </button>

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

                {/* AI Key Settings */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsSettingsOpen(true);
                    setSettingsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs font-mono text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Neural AI Core Setup</span>
                  </div>
                  {geminiKey && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>

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
