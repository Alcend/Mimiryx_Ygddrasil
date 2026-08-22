import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Key, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, geminiKey, setGeminiKey } = useApp();
  const [inputKey, setInputKey] = useState(geminiKey || '');

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiKey(inputKey.trim() || null);
    sounds.playSuccess();
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-primary/30 rounded-2xl w-full max-w-md cyber-card shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between p-4 border-b border-border/70">
          <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Core Neural Settings
          </h3>
          <button
            onClick={() => {
              sounds.playClick();
              setIsSettingsOpen(false);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-mono text-foreground">
              <Key className="w-4 h-4 text-primary" />
              <span>Google Gemini API Key</span>
            </div>
            
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              MIMIRYX uses the Gemini 3.6 Flash model for the Neural Oracle and Note Expansion. 
              Your key is saved <strong>locally in your browser's encrypted storage</strong>. It is never transmitted to our servers or saved in the codebase.
            </p>

            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 font-mono pr-10 shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {inputKey ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 opacity-50" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-primary/70">
              <span>Get a free API key at</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                Google AI Studio
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/50">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsSettingsOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,224,255,0.3)] hover:shadow-[0_0_25px_rgba(0,224,255,0.5)]"
            >
              {inputKey ? 'Lock Key into Neural Core' : 'Clear Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
