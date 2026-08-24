import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Key, ShieldCheck, ShieldAlert, Sparkles, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { AIKeyUsage, getAllKeyUsages, hashKey, resetAllKeyUsages } from '../db/aiJobsStore';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, geminiKey, setGeminiKey } = useApp();
  const [inputKey, setInputKey] = useState(geminiKey || '');
  const [usages, setUsages] = useState<Record<string, AIKeyUsage>>({});

  useEffect(() => {
    if (isSettingsOpen) {
      loadUsages();
      const interval = setInterval(loadUsages, 2000); // Live poll for cooldowns
      return () => clearInterval(interval);
    }
  }, [isSettingsOpen]);

  const loadUsages = async () => {
    const allUsages = await getAllKeyUsages();
    const usageMap: Record<string, AIKeyUsage> = {};
    for (const u of allUsages) {
      usageMap[u.keyHash] = u;
    }
    setUsages(usageMap);
  };

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiKey(inputKey.trim() || null);
    sounds.playSuccess();
    setIsSettingsOpen(false);
  };

  // Parse keys to render the Key Ring
  const parsedKeys = inputKey.split(/[, \n]+/).map(k => k.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-primary/30 rounded-2xl w-full max-w-md cyber-card shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between p-4 border-b border-border/70 shrink-0">
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
        
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-mono text-foreground">
              <Key className="w-4 h-4 text-primary" />
              <span>Google Gemini API Key(s)</span>
            </div>
            
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              MIMIRYX uses the Gemini 3.6 Flash model. 
              Your keys are saved <strong>locally in your browser's encrypted storage</strong>.
              Paste multiple keys separated by commas to enable automatic load-balancing and quota protection.
            </p>

            <div className="relative">
              <textarea
                rows={3}
                placeholder="AIzaSy..., AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/60 font-mono pr-10 shadow-inner resize-none custom-scrollbar"
                style={{ minHeight: '80px' }}
              />
              <div className="absolute right-3 top-4">
                {parsedKeys.length > 0 ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 opacity-50" />
                )}
              </div>
            </div>
          </div>

          {/* Key Ring Dashboard */}
          {parsedKeys.length > 0 && (
            <div className="space-y-3 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between text-sm font-mono text-foreground">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Active Key Ring</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    sounds.playClick();
                    await resetAllKeyUsages();
                    await loadUsages();
                    alert('All key cooldowns and depleted states have been reset!');
                  }}
                  className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 rounded text-[10px] font-mono transition-colors"
                >
                  Reset All Keys
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {parsedKeys.map((key, i) => {
                  const hashed = hashKey(key);
                  const usage = usages[hashed];
                  const isCooldown = usage?.status === 'COOLDOWN' && usage.cooldownUntil && Date.now() < usage.cooldownUntil;
                  const cooldownSecs = isCooldown ? Math.ceil((usage.cooldownUntil! - Date.now()) / 1000) : 0;
                  
                  return (
                    <div key={i} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isCooldown ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                        ) : usage?.status === 'DEPLETED' ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-xs font-mono font-bold text-white">Key {i + 1} <span className="text-muted-foreground font-normal">({hashed})</span></p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {isCooldown ? (
                              <span className="text-amber-500">COOLDOWN ({cooldownSecs}s)</span>
                            ) : usage?.status === 'DEPLETED' ? (
                              <span className="text-red-500">DEPLETED TODAY</span>
                            ) : (
                              <span className="text-emerald-500">ACTIVE & READY</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-xs font-mono font-bold text-white">{usage?.requestsToday || 0} reqs</p>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            sounds.playClick();
                            try {
                              alert("Running Diagnostics on Key " + (i+1) + "...");
                              const { checkGeminiConfiguration } = await import('../utils/aiConfig');
                              const result = await checkGeminiConfiguration(key);
                              if (result.isValid) {
                                alert("Success! Key is valid.\nModels verified:\n" + result.availableModels.join('\n'));
                              } else {
                                alert("Failed: " + result.errors.join('\n') + "\n\nAvailable Models on your Key:\n" + (result.rawModelsList || []).join('\n'));
                              }
                            } catch (err: any) {
                              alert("Diagnostic crashed: " + err.message);
                            }
                          }}
                          className="px-2 py-0.5 bg-primary/20 text-primary hover:bg-primary/40 rounded text-[10px] font-mono transition-colors"
                        >
                          Diagnose Key
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/50 shrink-0">
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
              {inputKey ? 'Lock Keys into Neural Core' : 'Clear Keys'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
