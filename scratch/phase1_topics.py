import re

with open('src/pages/TopicsPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure realms is extracted
text = text.replace('const { topics, notes, addTopic, updateTopic, deleteTopic } = useApp();', 'const { realms, addRealm, topics, notes, addTopic, updateTopic, deleteTopic } = useApp();')

# When submitting new topic, if realm doesn't exist, create it!
# Wait, this is getting complex. Let's just create a quick function helper inside handleCreate.
old_handle_create = r"""  const handleCreate = \(e: React\.FormEvent\) => \{
    e\.preventDefault\(\);
    if \(!newTopicName\.trim\(\)\) return;

    sounds\.playSuccess\(\);
    addTopic\(\{
      name: newTopicName,
      description: newTopicDesc,
      category: newTopicRealm \|\| 'Core Concept',
      color: 'hsl\(var\(--primary\)\)',
      code: newTopicName\.substring\(0, 3\)\.toUpperCase\(\),
      icon: 'box'
    \}\);"""

new_handle_create = """  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    sounds.playSuccess();
    
    let targetRealm = realms.find(r => r.name.toLowerCase() === (newTopicRealm || 'Core Concept').toLowerCase());
    if (!targetRealm) {
      targetRealm = addRealm({
        name: newTopicRealm || 'Core Concept',
        color: 'hsl(var(--primary))'
      });
    }

    addTopic({
      name: newTopicName,
      description: newTopicDesc,
      category: targetRealm.name, // Deprecated fallback
      realmId: targetRealm.id,
      color: 'hsl(var(--primary))',
      code: newTopicName.substring(0, 3).toUpperCase(),
      icon: 'box'
    });"""

text = re.sub(old_handle_create, new_handle_create, text)

# Edit logic
old_handle_update = r"""  const handleUpdate = \(e: React\.FormEvent\) => \{
    e\.preventDefault\(\);
    if \(!editingTopic \|\| !editTopicName\.trim\(\)\) return;
    
    sounds\.playSuccess\(\);
    updateTopic\(editingTopic\.id, \{
      name: editTopicName,
      description: editTopicDesc,
      category: editTopicRealm \|\| 'Core Concept',
      code: editTopicName\.substring\(0, 3\)\.toUpperCase\(\),
    \}\);"""

new_handle_update = """  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    
    sounds.playSuccess();
    
    let targetRealm = realms.find(r => r.name.toLowerCase() === (editTopicRealm || 'Core Concept').toLowerCase());
    if (!targetRealm) {
      targetRealm = addRealm({
        name: editTopicRealm || 'Core Concept',
        color: 'hsl(var(--primary))'
      });
    }

    updateTopic(editingTopic.id, {
      name: editTopicName,
      description: editTopicDesc,
      category: targetRealm.name, // Deprecated fallback
      realmId: targetRealm.id,
      code: editTopicName.substring(0, 3).toUpperCase(),
    });"""

text = re.sub(old_handle_update, new_handle_update, text)

with open('src/pages/TopicsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
