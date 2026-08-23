import os

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

state_injection = """  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();

  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');
  const [activeRealm, setActiveRealm] = useState<string>('ALL');

  const availableRealms = React.useMemo(() => {
    const categories = Array.from(new Set(topics.map(t => t.category))).filter(Boolean);
    return ['ALL', ...categories];
  }, [topics]);
"""

content = content.replace(
"""  const { isIdle } = useOutletContext<{ isIdle: boolean }>() || { isIdle: false };
  const navigate = useNavigate();""",
state_injection)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
