import os

# 1. Fix Dashboard
dash = 'src/pages/Dashboard.tsx'
with open(dash, 'r', encoding='utf-8') as f:
    d = f.read()
d = d.replace("  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics'>('all');\n", "")
with open(dash, 'w', encoding='utf-8') as f:
    f.write(d)


# 2. Fix TopicDetailPage
top = 'src/pages/TopicDetailPage.tsx'
with open(top, 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace("import { BookReader, chunkNoteIntoPages } from '../components/BookReader';", "import { BookReader } from '../components/BookReader';")
with open(top, 'w', encoding='utf-8') as f:
    f.write(t)


# 3. Fix NotesPage
notes_f = 'src/pages/NotesPage.tsx'
with open(notes_f, 'r', encoding='utf-8') as f:
    n = f.read()

# Replace the flipped card rendering logic
old_flipped_logic = """            const currentBackPageNum = flippedCards[note.id] || 1;
            const currentBackPage = pages[currentBackPageNum - 1] || pages[0];

            return (
              <div
                key={note.id}
                className="group relative h-48 [perspective:1000px] cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                <div
                  className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                >
                  {/* Front of Card */}
                  <div className="absolute inset-0 w-full h-full bg-card/60 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between cyber-card group-hover:border-primary/40 transition-colors [backface-visibility:hidden]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-muted-foreground uppercase truncate max-w-[120px]"
                          title={topic.name}
                        >
                          {topic.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setPreviewBookNote(note);
                            }}
                            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100"
                            title="Quick Read"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setEditingNote(note);
                              setNewTitle(note.title);
                              setNewTopicId(note.topicId);
                              setNewSummary(note.summary);
                              setNewContent(note.content);
                              setNewDifficulty(note.difficulty);
                              setNewTags(note.tags.join(', '));
                            }}
                            className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setFlippedCards((prev) => ({ ...prev, [note.id]: 1 }));
                            }}
                            className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                            title="Flip to Read"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground line-clamp-2 leading-tight">
                        {note.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {note.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(note.status)}
                        {note.tags.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <Tag className="w-3 h-3" /> {note.tags.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                          <BookOpen className="w-2.5 h-2.5 text-primary" />
                          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                        </span>
                        {note.status === 'mastered' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back of Card (Reading Mode) */}
                  <div className="absolute inset-0 w-full h-full bg-card border border-primary/40 rounded-xl p-4 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-[0_0_15px_hsl(var(--neon-blue)/0.15)]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-primary">
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>PAGE {currentBackPage.pageNumber} OF {pages.length}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            setFlippedCards((prev) => {
                              const next = { ...prev };
                              delete next[note.id];
                              return next;
                            });
                          }}
                          className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Flip Back"
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs font-mono text-muted-foreground">
                        <h4 className="font-bold text-foreground mb-1">{currentBackPage.title}</h4>
                        <p className="line-clamp-4 leading-relaxed">{currentBackPage.content}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum - 1, pageCount, e)}
                          disabled={currentBackPageNum <= 1}
                          className="p-1.5 rounded bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            navigate(`/notes/${note.id}`);
                          }}
                          className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          Open Full Note <ArrowUpRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum + 1, pageCount, e)}
                          disabled={currentBackPageNum >= pageCount}
                          className="p-1.5 rounded bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );"""

new_flipped_logic = """            const currentBackPageNum = flippedCards[note.id] || 1;
            const contentChunks = note.content.split('---');
            const currentContent = contentChunks[currentBackPageNum - 1] || note.content;

            return (
              <div
                key={note.id}
                className="group relative h-48 [perspective:1000px] cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                <div
                  className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                >
                  {/* Front of Card */}
                  <div className="absolute inset-0 w-full h-full bg-card/60 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between cyber-card group-hover:border-primary/40 transition-colors [backface-visibility:hidden]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-muted-foreground uppercase truncate max-w-[120px]"
                          title={topic.name}
                        >
                          {topic.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setPreviewBookNote(note);
                            }}
                            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100"
                            title="Quick Read"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setEditingNote(note);
                              setNewTitle(note.title);
                              setNewTopicId(note.topicId);
                              setNewSummary(note.summary);
                              setNewContent(note.content);
                              setNewDifficulty(note.difficulty);
                              setNewTags(note.tags.join(', '));
                            }}
                            className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setFlippedCards((prev) => ({ ...prev, [note.id]: 1 }));
                            }}
                            className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                            title="Flip to Read"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground line-clamp-2 leading-tight">
                        {note.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {note.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(note.status)}
                        {note.tags.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <Tag className="w-3 h-3" /> {note.tags.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                          <BookOpen className="w-2.5 h-2.5 text-primary" />
                          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                        </span>
                        {note.status === 'mastered' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back of Card (Reading Mode) */}
                  <div className="absolute inset-0 w-full h-full bg-card border border-primary/40 rounded-xl p-4 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-[0_0_15px_hsl(var(--neon-blue)/0.15)]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-primary">
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>PAGE {currentBackPageNum} OF {pageCount}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            setFlippedCards((prev) => {
                              const next = { ...prev };
                              delete next[note.id];
                              return next;
                            });
                          }}
                          className="p-1 rounded bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Flip Back"
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs font-mono text-muted-foreground">
                        <h4 className="font-bold text-foreground mb-1">{note.title} (Part {currentBackPageNum})</h4>
                        <p className="line-clamp-4 leading-relaxed">{currentContent}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum - 1, pageCount, e)}
                          disabled={currentBackPageNum <= 1}
                          className="p-1.5 rounded bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            navigate(`/notes/${note.id}`);
                          }}
                          className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          Open Full Note <ArrowUpRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => handleFlipPageChange(note.id, currentBackPageNum + 1, pageCount, e)}
                          disabled={currentBackPageNum >= pageCount}
                          className="p-1.5 rounded bg-white/5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );"""

if old_flipped_logic in n:
    n = n.replace(old_flipped_logic, new_flipped_logic)
else:
    print("WARNING: Could not find old flipped logic in NotesPage.tsx")

with open(notes_f, 'w', encoding='utf-8') as f:
    f.write(n)
