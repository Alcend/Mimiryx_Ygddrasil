import os

filepath = 'src/components/WorldTree/YggdrasilWorldTreeCanvas.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add prop interface
content = content.replace(
    "export const YggdrasilWorldTreeCanvas: React.FC = () => {",
    "export const YggdrasilWorldTreeCanvas: React.FC<{ activeRealm?: string | null }> = ({ activeRealm }) => {"
)

# Filter topics and notes based on realm
old_destructure = "const { topics, notes, labs, customBg } = useApp();"
new_destructure = """const { topics: allTopics, notes: allNotes, labs, customBg } = useApp();

  // Filter by Realm if specified
  const topics = useMemo(() => {
    if (!activeRealm || activeRealm === 'ALL') return allTopics;
    return allTopics.filter(t => t.category === activeRealm);
  }, [allTopics, activeRealm]);

  const notes = useMemo(() => {
    if (!activeRealm || activeRealm === 'ALL') return allNotes;
    const realmTopicIds = new Set(topics.map(t => t.id));
    return allNotes.filter(n => realmTopicIds.has(n.topicId));
  }, [allNotes, topics, activeRealm]);
"""

content = content.replace(old_destructure, new_destructure)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
