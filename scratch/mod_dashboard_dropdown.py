import os

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the old Realm Switcher UI
old_ui = """          {/* Realm Switcher UI */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {availableRealms.map(realm => (
              <button
                key={realm}
                onClick={() => { sounds.playClick(); setActiveRealm(realm); }}
                className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  activeRealm === realm
                    ? 'border-[hsl(var(--neon-green))] bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))] shadow-[0_0_10px_hsl(var(--neon-green)/0.2)]'
                    : 'border-border/40 bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {realm === 'ALL' ? 'YGGDRASIL (ALL REALMS)' : `REALM OF ${realm.toUpperCase()}`}
              </button>
            ))}
          </div>"""

if old_ui in content:
    content = content.replace(old_ui, "")
else:
    print("Could not find Realm Switcher UI")

# 2. Add the Dropdown inside the Canvas Viewport wrapper
old_canvas_wrap = """          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full">
            <YggdrasilWorldTreeCanvas activeRealm={activeRealm} />
          </div>"""

new_canvas_wrap = """          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full relative rounded-2xl overflow-hidden border border-border/40 cyber-card shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-mono text-muted-foreground px-2 uppercase tracking-widest hidden sm:inline-block">Filter Realm:</span>
                <select
                  value={activeRealm}
                  onChange={(e) => { sounds.playClick(); setActiveRealm(e.target.value); }}
                  className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all text-xs font-mono font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer uppercase tracking-wider"
                >
                  {availableRealms.map(realm => (
                    <option key={realm} value={realm} className="bg-[#0b101a] text-foreground font-mono">
                      {realm === 'ALL' ? 'ALL REALMS' : realm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <YggdrasilWorldTreeCanvas activeRealm={activeRealm} />
          </div>"""

if old_canvas_wrap in content:
    content = content.replace(old_canvas_wrap, new_canvas_wrap)
else:
    print("Could not find Canvas wrap")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
