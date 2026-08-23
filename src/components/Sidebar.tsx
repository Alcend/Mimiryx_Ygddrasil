import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Terminal,
  KanbanSquare,
  Bug,
  GraduationCap,
  Sparkles,
  Compass,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';
import { sounds } from '../utils/audio';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/topics', label: 'Topics', icon: Boxes },
  { path: '/labs', label: 'Labs', icon: Terminal },
  { path: '/board', label: 'Board', icon: KanbanSquare },
  { path: '/assistant', label: 'Lab Debugger', icon: Bug },
  { path: '/tutor', label: 'IT Tutor', icon: GraduationCap },
  { path: '/agent', label: 'AI Learning Agent', icon: Sparkles },
  { path: '/data-journey', label: 'Learning Concepts', icon: Compass },
  { path: '/templates', label: 'Templates', icon: Copy },
];

const THEMES: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'cyan', label: 'Cyan', color: 'bg-[hsl(180_100%_50%)]' },
  { id: 'green', label: 'Green', color: 'bg-[hsl(135_100%_50%)]' },
  { id: 'purple', label: 'Purple', color: 'bg-[hsl(265_90%_68%)]' },
  { id: 'amber', label: 'Amber', color: 'bg-[hsl(38_100%_56%)]' },
];

export const Sidebar: React.FC = () => {
  const { theme, setTheme, soundEnabled, setSoundEnabled, masteryPercentage } = useApp();
  const location = useLocation();

  return (
    <aside className="w-64 glass-sidebar border-r border-white/10 flex flex-col h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg border border-primary/40 flex items-center justify-center shadow-neon-glow group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img src="/logo.jpg" alt="Mimiryx Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg tracking-[0.08em] text-foreground neon-text flex items-center gap-1.5">
              MIMIRYX
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Neural Network
            </p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-1">
          Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => sounds.playClick()}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme & Controls Footer */}
      <div className="p-3 border-t border-white/10 space-y-3 bg-white/[0.03]">
        {/* Mastery Pill */}
        <div className="px-3 py-2 rounded-lg bg-card border border-border flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3 h-3 text-primary" /> Mastery
          </div>
          <span className="text-xs font-bold font-mono text-primary">{masteryPercentage}%</span>
        </div>
      </div>
    </aside>
  );
};
