import os

filepath = 'src/context/AppContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """        updatedTopics.push(created);
      }
    });

    const addedNotes: Note[] = [];
    newNotes.forEach((n) => {
      let targetTopicId = n.topicId;

      if (targetTopicId && topicIdMap.has(targetTopicId)) {
        targetTopicId = topicIdMap.get(targetTopicId);
      } else if (targetTopicId && topicIdMap.has(targetTopicId.trim().toLowerCase())) {
        targetTopicId = topicIdMap.get(targetTopicId.trim().toLowerCase());
      }"""

new_logic = """        updatedTopics.push(created);
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
      }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
else:
    print("Could not find logic")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
