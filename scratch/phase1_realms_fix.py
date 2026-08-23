import os

app_context_path = 'src/context/AppContext.tsx'
with open(app_context_path, 'r', encoding='utf-8') as f:
    app_context = f.read()

load_logic_old = """        try {
        const [savedTopics, savedNotes, savedLabs, savedBoard, savedLogs] = await Promise.all([
          localforage.getItem<Topic[]>(STORAGE_KEYS.TOPICS),
          localforage.getItem<Note[]>(STORAGE_KEYS.NOTES),
          localforage.getItem<Lab[]>(STORAGE_KEYS.LABS),
          localforage.getItem<BoardCard[]>(STORAGE_KEYS.BOARD),
          localforage.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS),
        ]);

        setTopics(savedTopics ? deduplicateIds(savedTopics, 'topic') : SEED_TOPICS);
        setNotes(savedNotes ? deduplicateIds(savedNotes, 'note') : SEED_NOTES);"""

load_logic_new = """        try {
        const [savedRealms, savedTopics, savedNotes, savedLabs, savedBoard, savedLogs] = await Promise.all([
          localforage.getItem<Realm[]>(STORAGE_KEYS.REALMS),
          localforage.getItem<Topic[]>(STORAGE_KEYS.TOPICS),
          localforage.getItem<Note[]>(STORAGE_KEYS.NOTES),
          localforage.getItem<Lab[]>(STORAGE_KEYS.LABS),
          localforage.getItem<BoardCard[]>(STORAGE_KEYS.BOARD),
          localforage.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS),
        ]);

        let finalRealms = savedRealms || [];
        let finalTopics = savedTopics ? deduplicateIds(savedTopics, 'topic') : SEED_TOPICS;

        // ONE-TIME MIGRATION: Promote Categories to Realms
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
          
          finalTopics = finalTopics.map(t => {
             const matchedRealm = finalRealms.find(r => r.name.toLowerCase() === (t.category || '').toLowerCase());
             return { ...t, realmId: matchedRealm?.id || '' };
          });
          
          await localforage.setItem(STORAGE_KEYS.REALMS, finalRealms);
          await localforage.setItem(STORAGE_KEYS.TOPICS, finalTopics);
        }

        setRealms(finalRealms);
        setTopics(finalTopics);
        setNotes(savedNotes ? deduplicateIds(savedNotes, 'note') : SEED_NOTES);"""

if load_logic_old in app_context:
    app_context = app_context.replace(load_logic_old, load_logic_new)
else:
    print("Could not find load_logic_old part 2")

with open(app_context_path, 'w', encoding='utf-8') as f:
    f.write(app_context)
