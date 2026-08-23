import os

filepath = 'src/context/AppContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """  const importVaultData = (
    newTopics: Array<Omit<Topic, 'id' | 'order'> & { id?: string }>,
    newNotes: Array<Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; topicName?: string }>
  ) => {
    sounds.playSuccess();
    const topicIdMap = new Map<string, string>();
    const updatedTopics = [...topics];

    newTopics.forEach((t) => {
      const trimmedName = (t.name || '').trim();
      const existing = updatedTopics.find(
        (et) =>
          (t.id && et.id === t.id) ||
          et.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (existing) {
        if (t.id) topicIdMap.set(t.id, existing.id);
        topicIdMap.set(trimmedName.toLowerCase(), existing.id);
      } else {
        const canonicalId = t.id && !updatedTopics.some(et => et.id === t.id) ? t.id : generateUniqueId('topic');
        const created: Topic = {
          ...t,
          id: canonicalId,
          name: trimmedName || 'New Knowledge Domain',
          order: updatedTopics.length + 1,
          icon: t.icon || 'Boxes',
          color: t.color || '#00f0ff',
          category: t.category || 'Knowledge Domain',
        };
        updatedTopics.push(created);
        if (t.id) topicIdMap.set(t.id, created.id);
        topicIdMap.set(trimmedName.toLowerCase(), created.id);
      }
    });

    const addedNotes: Note[] = [];
    newNotes.forEach((n) => {
      let targetTopicId = n.topicId;

      if (targetTopicId && topicIdMap.has(targetTopicId)) {
        targetTopicId = topicIdMap.get(targetTopicId);
      } else if (targetTopicId && topicIdMap.has(targetTopicId.trim().toLowerCase())) {
        targetTopicId = topicIdMap.get(targetTopicId.trim().toLowerCase());
      }

      // If still unmatched, find if any topic matches by name
      if (targetTopicId) {
        const matchedByName = updatedTopics.find(
          t => t.name.trim().toLowerCase() === targetTopicId?.trim().toLowerCase() ||
               t.id.toLowerCase() === targetTopicId?.toLowerCase()
        );
        if (matchedByName) targetTopicId = matchedByName.id;
      }

      if (!targetTopicId) {
        targetTopicId = updatedTopics[0]?.id || 'topic-general';
      }

      const createdNote: Note = {
        ...n,
        id: n.id || generateUniqueId('note'),
        topicId: targetTopicId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addedNotes.push(createdNote);
    });"""

new_logic = """  const importVaultData = (
    newTopics: Array<Omit<Topic, 'id' | 'order'> & { id?: string }>,
    newNotes: Array<Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; topicName?: string }>
  ) => {
    sounds.playSuccess();
    const topicIdMap = new Map<string, string>();
    const updatedTopics = [...topics];

    newTopics.forEach((t) => {
      const trimmedName = (t.name || '').trim();
      const existing = updatedTopics.find(
        (et) =>
          (t.id && et.id === t.id) ||
          et.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (existing) {
        if (t.id) topicIdMap.set(t.id, existing.id);
        topicIdMap.set(trimmedName.toLowerCase(), existing.id);
      } else {
        const canonicalId = t.id && !updatedTopics.some(et => et.id === t.id) ? t.id : generateUniqueId('topic');
        const created: Topic = {
          ...t,
          id: canonicalId,
          name: trimmedName || 'New Knowledge Domain',
          order: updatedTopics.length + 1,
          icon: t.icon || 'Boxes',
          color: t.color || '#00f0ff',
          category: t.category || 'Knowledge Domain',
        };
        updatedTopics.push(created);
        if (t.id) topicIdMap.set(t.id, created.id);
        topicIdMap.set(trimmedName.toLowerCase(), created.id);
      }
    });

    const addedNotes: Note[] = [];
    newNotes.forEach((n) => {
      let targetTopicId = n.topicId;

      // Also check topicName if topicId is missing
      if (!targetTopicId && n.topicName) {
         targetTopicId = n.topicName;
      }

      if (targetTopicId && topicIdMap.has(targetTopicId)) {
        targetTopicId = topicIdMap.get(targetTopicId);
      } else if (targetTopicId && topicIdMap.has(targetTopicId.trim().toLowerCase())) {
        targetTopicId = topicIdMap.get(targetTopicId.trim().toLowerCase());
      }

      // If still unmatched, find if any topic matches by name
      if (targetTopicId) {
        const matchedByName = updatedTopics.find(
          t => t.name.trim().toLowerCase() === targetTopicId?.trim().toLowerCase() ||
               t.id.toLowerCase() === targetTopicId?.toLowerCase()
        );
        if (matchedByName) targetTopicId = matchedByName.id;
      }

      if (!targetTopicId) {
        targetTopicId = updatedTopics[0]?.id || 'topic-general';
      }

      const createdNote: Note = {
        ...n,
        id: n.id || generateUniqueId('note'),
        topicId: targetTopicId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addedNotes.push(createdNote);
    });"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
else:
    print("Could not find importVaultData logic")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
