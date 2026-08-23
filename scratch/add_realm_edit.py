import os

filepath = 'src/pages/TopicsPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for Realm (Category) and Editing
new_states = """  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicRealm, setNewTopicRealm] = useState('Core Concept');
  
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDesc, setEditTopicDesc] = useState('');
  const [editTopicRealm, setEditTopicRealm] = useState('');"""

content = content.replace(
"""  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');""",
new_states)

# Update creation logic
old_create = """  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    addTopic({
      name: newTopicName,
      description: newTopicDesc,
      category: 'Core Concept',
      color: 'hsl(var(--primary))',
      code: newTopicName.substring(0, 3).toUpperCase(),
      icon: 'box'
    });
    
    setNewTopicName('');
    setNewTopicDesc('');
    setShowCreateModal(false);
    sounds.playSuccess();
  };"""

new_create = """  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    addTopic({
      name: newTopicName,
      description: newTopicDesc,
      category: newTopicRealm || 'Core Concept',
      color: 'hsl(var(--primary))',
      code: newTopicName.substring(0, 3).toUpperCase(),
      icon: 'box'
    });
    
    setNewTopicName('');
    setNewTopicDesc('');
    setNewTopicRealm('Core Concept');
    setShowCreateModal(false);
    sounds.playSuccess();
  };

  const handleUpdateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    
    updateTopic(editingTopic.id, {
      name: editTopicName,
      description: editTopicDesc,
      category: editTopicRealm || 'Core Concept',
      code: editTopicName.substring(0, 3).toUpperCase(),
    });
    
    setEditingTopic(null);
    sounds.playSuccess();
  };

  const openEditModal = (t: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setEditingTopic(t);
    setEditTopicName(t.name);
    setEditTopicDesc(t.description);
    setEditTopicRealm(t.category);
  };"""

content = content.replace(old_create, new_create)

# Add Edit button to Topic Cards
old_card_header = """                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleFlip(topic.id, e)}
                          className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Flip Card"
                        >
                          <Settings className="w-4 h-4" />
                        </button>"""

new_card_header = """                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => openEditModal(topic, e)}
                          className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
                          title="Edit Topic & Realm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleToggleFlip(topic.id, e)}
                          className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Flip Card"
                        >
                          <Settings className="w-4 h-4" />
                        </button>"""

content = content.replace(old_card_header, new_card_header)

# Change hardcoded `topic.category` to `topic.category` (since UI should show REALM)
content = content.replace("{topic.code} // {topic.category}", "{topic.code} // {topic.category.toUpperCase()} REALM")

# Update Create Modal UI & add Edit Modal UI
old_modal = """              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of this knowledge domain..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">"""

new_modal = """              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Realm (Category)</label>
                <input
                  type="text"
                  placeholder="e.g., Tech, Science, Math"
                  value={newTopicRealm}
                  onChange={(e) => setNewTopicRealm(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of this knowledge domain..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">"""

content = content.replace(old_modal, new_modal)

edit_modal = """
      {/* Edit Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-md cyber-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" /> Edit Topic & Realm
              </h3>
              <button onClick={() => setEditingTopic(null)} className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTopic} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Topic Name</label>
                <input type="text" autoFocus required value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary font-bold uppercase flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5"/> Realm (Category)</label>
                <input type="text" required value={editTopicRealm} onChange={(e) => setEditTopicRealm(e.target.value)} className="w-full bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-primary/50 font-mono shadow-inner" />
                <p className="text-[9px] text-muted-foreground mt-1">Changing this will instantly move this topic and all its notes to the specified Realm tree.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
                <textarea rows={3} value={editTopicDesc} onChange={(e) => setEditTopicDesc(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                <button type="button" onClick={() => setEditingTopic(null)} className="px-4 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={!editTopicName.trim() || !editTopicRealm.trim()} className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n};\n", edit_modal + "    </div>\n  );\n};\n")

# Import Edit3 and FolderTree in TopicsPage.tsx
if "import { Plus, Search, FolderTree, BookOpen, Star, MoreVertical, Layers, ChevronRight, Settings, Trash2, X } from 'lucide-react';" in content:
    content = content.replace(
        "import { Plus, Search, FolderTree, BookOpen, Star, MoreVertical, Layers, ChevronRight, Settings, Trash2, X } from 'lucide-react';",
        "import { Plus, Search, FolderTree, BookOpen, Star, MoreVertical, Layers, ChevronRight, Settings, Trash2, X, Edit3 } from 'lucide-react';"
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
