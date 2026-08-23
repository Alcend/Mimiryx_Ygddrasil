import re

with open('src/components/ImportExportModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove Discovered Domains Summary Block
old_summary_block = r"""                    \{/\* Discovered New Topics Summary \*/\}.*?\{/\* Documents List Preview \*/\}"""
text = re.sub(old_summary_block, "{/* Documents List Preview */}", text, flags=re.DOTALL)

# 2. Update Documents List Preview Header to Review Queue
old_header = r"""                      <h5 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                        Parsed Knowledge Records \(\{organizeResult\.documents\.length\}\)
                      </h5>"""
new_header = """                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                          Review Queue ({organizeResult.documents.filter(d => !d.matchedTopicId).length} pending)
                        </h5>
                        <p className="text-[10px] text-amber-400/80">All records must be assigned to a Topic before importing.</p>
                      </div>"""
text = re.sub(old_header, new_header, text)

# 3. Replace the <select> element and add a "New Topic" capability
old_select = r"""                                <select
                                  value=\{doc\.isNewTopic \? `new:\$\{doc\.suggestedTopicName\}` : `ext:\$\{doc\.matchedTopicId\}`\}
                                  onChange=\{\(e\) => \{
                                    const val = e\.target\.value;
                                    sounds\.playClick\(\);
                                    setOrganizeResult\(prev => \{
                                      if \(!prev\) return prev;
                                      const nextDocs = \[\.\.\.prev\.documents\];
                                      if \(val\.startsWith\('ext:'\)\) \{
                                        const tid = val\.replace\('ext:', ''\);
                                        const top = topics\.find\(t => t\.id === tid\);
                                        nextDocs\[idx\] = \{
                                          \.\.\.doc,
                                          isNewTopic: false,
                                          matchedTopicId: tid,
                                          suggestedTopicName: top\?\.name \|\| '',
                                        \};
                                      \} else if \(val\.startsWith\('new:'\)\) \{
                                        const tname = val\.replace\('new:', ''\);
                                        const newTop = prev\.newTopicsToCreate\.find\(t => t\.name === tname\);
                                        nextDocs\[idx\] = \{
                                          \.\.\.doc,
                                          isNewTopic: true,
                                          matchedTopicId: '',
                                          suggestedTopicName: tname,
                                          suggestedCategory: newTop\?\.category,
                                        \};
                                      \}
                                      return \{ \.\.\.prev, documents: nextDocs \};
                                    \}\);
                                  \}\}
                                  className=\{`w-full text-\[10px\] font-mono p-1\.5 rounded bg-black/60 border focus:outline-none focus:border-primary transition-colors \$\{
                                    doc\.isNewTopic \? 'text-emerald-400 border-emerald-500/30' : 'text-primary border-border'
                                  \}`\}
                                >
                                  <optgroup label="AI Discovered Domains">
                                    \{organizeResult\.newTopicsToCreate\.map\(\(nt, tIdx\) => \(
                                      <option key=\{`new-\$\{tIdx\}`\} value=\{`new:\$\{nt\.name\}`\}>
                                        ✨ NEW: \{nt\.name\}
                                      </option>
                                    \)\)\}
                                  </optgroup>
                                  <optgroup label="Your Existing Knowledge Domains">
                                    \{topics\.map\(t => \(
                                      <option key=\{`ext-\$\{t\.id\}`\} value=\{`ext:\$\{t\.id\}`\}>
                                        \{t\.name\}
                                      </option>
                                    \)\)\}
                                  </optgroup>
                                </select>"""

new_select = """                                <div className="flex gap-1.5 w-full">
                                  <select
                                    value={doc.matchedTopicId || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      sounds.playClick();
                                      setOrganizeResult(prev => {
                                        if (!prev) return prev;
                                        const nextDocs = [...prev.documents];
                                        const top = topics.find(t => t.id === val);
                                        nextDocs[idx] = {
                                          ...doc,
                                          matchedTopicId: val,
                                          suggestedTopicName: top?.name || '',
                                        };
                                        return { ...prev, documents: nextDocs };
                                      });
                                    }}
                                    className={`flex-1 text-[10px] font-mono p-1.5 rounded bg-black/60 border focus:outline-none focus:border-primary transition-colors ${
                                      !doc.matchedTopicId ? 'text-amber-400 border-amber-500/50 animate-pulse' : 'text-primary border-border'
                                    }`}
                                  >
                                    <option value="" disabled>⚠️ Needs Review (AI Suggests: {doc.suggestedTopicName})</option>
                                    <optgroup label="Existing Topics">
                                      {topics.map(t => (
                                        <option key={`ext-${t.id}`} value={t.id} className="bg-[#0b101a] text-white">
                                          {t.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>"""
text = re.sub(old_select, new_select, text)

# 4. Disable Apply Button if unassigned
old_apply_btn = r"""                      <button
                        onClick=\{handleApplyAI\}
                        className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Import & Grow Yggdrasil Tree
                      </button>"""
new_apply_btn = """                      <button
                        onClick={handleApplyAI}
                        disabled={organizeResult.documents.some(d => !d.matchedTopicId)}
                        className={`px-5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                          organizeResult.documents.some(d => !d.matchedTopicId)
                            ? 'bg-primary/20 text-primary/50 cursor-not-allowed border border-primary/20'
                            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-neon-glow'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" /> {organizeResult.documents.some(d => !d.matchedTopicId) ? 'Resolve Queue to Import' : 'Import & Grow Yggdrasil Tree'}
                      </button>"""
text = re.sub(old_apply_btn, new_apply_btn, text)

# 5. Fix handleApplyAI payload extraction
old_handle_apply = r"""  const handleApplyAI = \(\) => \{
    if \(!organizeResult\) return;
    sounds\.playSuccess\(\);

    // 1\. Prepare new topics
    const newTopicsPayload = organizeResult\.newTopicsToCreate\.map\(\(newTop\) => \(\{
      name: newTop\.name,
      code: newTop\.code,
      category: newTop\.category,
      description: newTop\.description,
      icon: 'Boxes' as const,
      color: newTop\.color,
    \}\)\);

    // 2\. Prepare notes payload
    const newNotesPayload = organizeResult\.documents\.map\(\(doc\) => \(\{"""

new_handle_apply = """  const handleApplyAI = () => {
    if (!organizeResult) return;
    if (organizeResult.documents.some(d => !d.matchedTopicId)) {
       // Should be blocked by disabled button anyway
       return;
    }
    sounds.playSuccess();

    const newTopicsPayload: any[] = []; // No longer auto-creating topics from bulk import
    const newNotesPayload = organizeResult.documents.map((doc) => ({"""
text = re.sub(old_handle_apply, new_handle_apply, text)

with open('src/components/ImportExportModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
