import os

# 1. Update src/types/index.ts
types_path = 'src/types/index.ts'
with open(types_path, 'r', encoding='utf-8') as f:
    types_content = f.read()

realm_interface = """export interface Realm {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {"""

if 'export interface Realm' not in types_content:
    types_content = types_content.replace('export interface Topic {', realm_interface)
    # Add realmId to Topic
    types_content = types_content.replace('  category: string;', '  category: string; // Deprecated\n  realmId?: string;')
    
    with open(types_path, 'w', encoding='utf-8') as f:
        f.write(types_content)
    print("Updated types/index.ts")

# 2. Update src/context/AppContext.tsx
app_context_path = 'src/context/AppContext.tsx'
with open(app_context_path, 'r', encoding='utf-8') as f:
    app_context = f.read()

# Add Realm to imports
if 'Realm,' not in app_context:
    app_context = app_context.replace("import { Topic, Note, Lab, LabStatus, BoardCard, SystemMetric, ActivityLog } from '../types';", "import { Realm, Topic, Note, Lab, LabStatus, BoardCard, SystemMetric, ActivityLog } from '../types';")

# Add REALMS to STORAGE_KEYS
if 'REALMS: \'mimiryx_realms\',' not in app_context:
    app_context = app_context.replace("TOPICS: 'mimiryx_topics',", "TOPICS: 'mimiryx_topics',\n  REALMS: 'mimiryx_realms',")

# Add realms context typing
context_typing = """  // Realms
  realms: Realm[];
  addRealm: (realm: Omit<Realm, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => Realm;
  updateRealm: (id: string, updates: Partial<Realm>) => void;
  deleteRealm: (id: string) => void;

  // Topics"""
if '// Realms' not in app_context:
    app_context = app_context.replace('  // Topics', context_typing)

# Add realms state
state_def = """  const [realms, setRealms] = useState<Realm[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);"""
if 'const [realms, setRealms]' not in app_context:
    app_context = app_context.replace('  const [topics, setTopics] = useState<Topic[]>([]);', state_def)

# Add realms to localforage loading
load_logic_old = """      const [loadedTopics, loadedNotes, loadedLabs, loadedBoard, loadedLogs] = await Promise.all([
        localforage.getItem<Topic[]>(STORAGE_KEYS.TOPICS),
        localforage.getItem<Note[]>(STORAGE_KEYS.NOTES),
        localforage.getItem<Lab[]>(STORAGE_KEYS.LABS),
        localforage.getItem<BoardCard[]>(STORAGE_KEYS.BOARD),
        localforage.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS)
      ]);

      if (loadedTopics) setTopics(loadedTopics);"""

load_logic_new = """      const [loadedRealms, loadedTopics, loadedNotes, loadedLabs, loadedBoard, loadedLogs] = await Promise.all([
        localforage.getItem<Realm[]>(STORAGE_KEYS.REALMS),
        localforage.getItem<Topic[]>(STORAGE_KEYS.TOPICS),
        localforage.getItem<Note[]>(STORAGE_KEYS.NOTES),
        localforage.getItem<Lab[]>(STORAGE_KEYS.LABS),
        localforage.getItem<BoardCard[]>(STORAGE_KEYS.BOARD),
        localforage.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS)
      ]);

      let finalRealms = loadedRealms || [];
      let finalTopics = loadedTopics || [];

      // ONE-TIME MIGRATION: If we have topics but no realms, promote categories to Realms
      if (finalTopics.length > 0 && finalRealms.length === 0) {
        const generatedRealms: Realm[] = [];
        finalTopics.forEach(t => {
          if (t.category && !generatedRealms.find(r => r.name.toLowerCase() === t.category.toLowerCase())) {
            generatedRealms.push({
              id: generateUniqueId('realm'),
              name: t.category,
              color: t.color || '#00f0ff',
              order: generatedRealms.length,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        });
        finalRealms = generatedRealms;
        
        // Backfill topics with realmId
        finalTopics = finalTopics.map(t => {
           const matchedRealm = finalRealms.find(r => r.name.toLowerCase() === t.category.toLowerCase());
           return { ...t, realmId: matchedRealm?.id || '' };
        });
        
        await localforage.setItem(STORAGE_KEYS.REALMS, finalRealms);
        await localforage.setItem(STORAGE_KEYS.TOPICS, finalTopics);
      }

      setRealms(finalRealms);
      setTopics(finalTopics);"""

if load_logic_old in app_context:
    app_context = app_context.replace(load_logic_old, load_logic_new)
else:
    print("Could not find load_logic_old")

# Add realms debounce save
debounce_save = """  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.REALMS, realms), 500);
    return () => clearTimeout(timer);
  }, [realms, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.TOPICS, topics), 500);"""
if 'STORAGE_KEYS.REALMS, realms' not in app_context:
    app_context = app_context.replace("""  useEffect(() => {
    if (!isDataLoaded) return;
    const timer = setTimeout(() => localforage.setItem(STORAGE_KEYS.TOPICS, topics), 500);""", debounce_save)

# Add realm methods
realm_methods = """
  const addRealm = (realmData: Omit<Realm, 'id' | 'order' | 'createdAt' | 'updatedAt'>): Realm => {
    sounds.playSuccess();
    const newRealm: Realm = {
      ...realmData,
      id: generateUniqueId('realm'),
      order: realms.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRealms(prev => [...prev, newRealm]);
    addActivity('Created Realm', newRealm.name, 'topic');
    return newRealm;
  };

  const updateRealm = (id: string, updates: Partial<Realm>) => {
    setRealms(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteRealm = (id: string) => {
    sounds.playClick();
    setRealms(prev => prev.filter(r => r.id !== id));
    // Also delete all topics tied to this realm? Or re-assign them. For now, leave orphaned or delete.
  };

  const addTopic"""
if 'const addRealm' not in app_context:
    app_context = app_context.replace('  const addTopic', realm_methods)

# Add to provider value
if 'realms,\n          addRealm,\n          updateRealm,\n          deleteRealm,\n          topics,' not in app_context:
    app_context = app_context.replace('          topics,\n          addTopic,', '          realms,\n          addRealm,\n          updateRealm,\n          deleteRealm,\n          topics,\n          addTopic,')

with open(app_context_path, 'w', encoding='utf-8') as f:
    f.write(app_context)
print("Updated AppContext.tsx")
