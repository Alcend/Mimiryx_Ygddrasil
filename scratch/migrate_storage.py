import os

filepath = 'src/context/AppContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add localforage import
content = content.replace(
    "import { sounds } from '../utils/audio';",
    "import { sounds } from '../utils/audio';\nimport localforage from 'localforage';\nimport { Sparkles } from 'lucide-react';"
)

# Find the start of topics useState
start_str = "  const [topics, setTopics] = useState<Topic[]>(() => {"
end_str = "  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs)); }, [activityLogs]);\n"

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

if start_idx != -1 and end_idx != -1:
    new_state = """  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [boardCards, setBoardCards] = useState<BoardCard[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>(SEED_METRICS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Deduplicate IDs safely
  const deduplicateIds = <T extends { id: string }>(items: T[], prefix: string): T[] => {
    const seen = new Set<string>();
    return items.map(item => {
      let id = item.id;
      if (seen.has(id)) id = generateUniqueId(prefix);
      seen.add(id);
      return { ...item, id };
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [savedTopics, savedNotes, savedLabs, savedBoard, savedLogs] = await Promise.all([
          localforage.getItem<Topic[]>(STORAGE_KEYS.TOPICS),
          localforage.getItem<Note[]>(STORAGE_KEYS.NOTES),
          localforage.getItem<Lab[]>(STORAGE_KEYS.LABS),
          localforage.getItem<BoardCard[]>(STORAGE_KEYS.BOARD),
          localforage.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS),
        ]);

        setTopics(savedTopics ? deduplicateIds(savedTopics, 'topic') : SEED_TOPICS);
        setNotes(savedNotes ? deduplicateIds(savedNotes, 'note') : SEED_NOTES);
        setLabs(savedLabs || SEED_LABS);
        setBoardCards(savedBoard || SEED_BOARD_CARDS);
        setActivityLogs(savedLogs || [
          { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), action: 'Initialized', target: 'MIMIRYX Neural Engine', type: 'mastery' },
          { id: 'log-2', timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), action: 'Knowledge Synced', target: '4 Topics Loaded', type: 'topic' }
        ]);
      } catch (err) {
        console.error("Failed to load localforage data", err);
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadData();
  }, []);

  // Debounced Save Hooks to prevent UI blocking
  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.TOPICS, topics), 500);
    return () => clearTimeout(timer);
  }, [topics, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.NOTES, notes), 500);
    return () => clearTimeout(timer);
  }, [notes, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.LABS, labs), 500);
    return () => clearTimeout(timer);
  }, [labs, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.BOARD, boardCards), 500);
    return () => clearTimeout(timer);
  }, [boardCards, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.LOGS, activityLogs), 500);
    return () => clearTimeout(timer);
  }, [activityLogs, isDataLoaded]);
"""
    content = content[:start_idx] + new_state + content[end_idx:]
    
    # Add loading screen to the return statement
    return_str = "  return (\n    <AppContext.Provider"
    new_return = """  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-[#02050A] flex flex-col items-center justify-center font-mono text-primary">
        <Sparkles className="w-8 h-8 animate-pulse mb-4 text-emerald-400" />
        <h2 className="text-sm font-bold tracking-widest text-emerald-400">INITIALIZING NEURAL ENGINE...</h2>
        <p className="text-[10px] text-muted-foreground mt-2">Loading synapses from local IndexedDB...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider"""
    
    content = content.replace(return_str, new_return)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success!")
else:
    print("Could not find boundaries")
