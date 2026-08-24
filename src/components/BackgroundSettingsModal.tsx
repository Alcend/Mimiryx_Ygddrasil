import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Image, Upload, Link2, Trash2, X, Sliders, Check, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

const PRESET_WALLPAPERS = [
  {
    id: 'preset-default-anime',
    name: 'Default Anime Realm',
    url: '/default-bg.jpg',
  },
  {
    id: 'preset-yggdrasil-cosmic',
    name: 'Cosmic Yggdrasil Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'preset-cyber-grid',
    name: 'Deep Cyberpunk Grid',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'preset-aurora-borealis',
    name: 'Arctic Aurora Night',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'preset-galaxy-stars',
    name: 'Milky Way Deep Void',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  }
];

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({ isOpen, onClose }) => {
  const { customBg, setCustomBg, bgOpacity, setBgOpacity, bgBlur, setBgBlur } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomBg(dataUrl);
        sounds.playSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    sounds.playSuccess();
    setCustomBg(urlInput.trim());
    setUrlInput('');
  };

  const handleRemoveBg = () => {
    sounds.playClick();
    setCustomBg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-primary/40 p-6 rounded-2xl w-full max-w-xl cyber-card space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-foreground">
                Dashboard Wallpaper & Background
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                Upload your own image or paste a URL as a full-screen backdrop.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload & URL Input Row */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-background border border-dashed border-primary/50 hover:border-primary text-xs font-mono font-bold text-foreground flex flex-col items-center justify-center gap-1.5 hover:bg-primary/5 transition-all shadow-neon-glow"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Image from PC</span>
                <span className="text-[10px] text-muted-foreground font-normal">PNG, JPG, WEBP, GIF</span>
              </button>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleUrlSubmit} className="flex flex-col justify-between">
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Paste image URL here..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-border text-xs font-mono text-foreground font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-primary" /> Apply Image URL
              </button>
            </form>
          </div>
        </div>

        {/* Preset Wallpapers Gallery */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Preset Sci-Fi Wallpapers
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_WALLPAPERS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  sounds.playSuccess();
                  setCustomBg(preset.url);
                }}
                className={`relative rounded-xl overflow-hidden border cursor-pointer group h-16 transition-all ${
                  customBg === preset.url ? 'ring-2 ring-primary border-primary shadow-neon-glow' : 'border-border hover:border-primary/50'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                  <span className="text-[9px] font-mono text-white truncate drop-shadow">{preset.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dark Overlay Opacity & Blur Sliders */}
        <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> Dark Overlay Darkness
            </span>
            <span className="text-primary font-bold">{Math.round(bgOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.05"
            value={bgOpacity}
            onChange={(e) => setBgOpacity(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-muted-foreground">Background Blur Effect</span>
            <span className="text-primary font-bold">{bgBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="1"
            value={bgBlur}
            onChange={(e) => setBgBlur(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {customBg ? (
            <button
              onClick={handleRemoveBg}
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Custom Background
            </button>
          ) : <div />}

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
