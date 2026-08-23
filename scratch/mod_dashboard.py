import os

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add unique realms computation
state_injection = """  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();

  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');
  const [activeRealm, setActiveRealm] = useState<string>('ALL');

  const availableRealms = useMemo(() => {
    const categories = Array.from(new Set(topics.map(t => t.category))).filter(Boolean);
    return ['ALL', ...categories];
  }, [topics]);
"""

# replace existing navigate and activeSideTab
content = content.replace(
"""  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();

  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');""",
state_injection)

# 2. Add Realm Switcher UI
realm_ui = """
          {/* Realm Switcher UI */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
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
          </div>

          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full">
            <YggdrasilWorldTreeCanvas activeRealm={activeRealm} />
          </div>
"""

content = content.replace(
"""          {/* Yggdrasil Canvas Viewport */}
          <div className="w-full">
            <YggdrasilWorldTreeCanvas />
          </div>""", realm_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
