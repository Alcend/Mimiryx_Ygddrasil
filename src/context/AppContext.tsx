import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, Topic, Note, Lab, BoardCard, SystemMetric, ActivityLog, NoteStatus, LabStatus } from '../types';
import { SEED_TOPICS, SEED_NOTES, SEED_LABS, SEED_BOARD_CARDS, SEED_METRICS } from '../data/seedData';
import { sounds } from '../utils/audio';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // AI & Security Settings
  geminiKey: string | null;
  setGeminiKey: (key: string | null) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isOracleOpen: boolean;
  setIsOracleOpen: (isOpen: boolean) => void;

  // Custom Background
  customBg: string | null;
  setCustomBg: (url: string | null) => void;
  bgOpacity: number;
  setBgOpacity: (val: number) => void;
  bgBlur: number;
  setBgBlur: (val: number) => void;
  
  // Topics
  topics: Topic[];
  addTopic: (topic: Omit<Topic, 'id' | 'order'>) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  clearAllNotes: () => void;
  importVaultData: (
    newTopics: Array<Omit<Topic, 'id' | 'order'> & { id?: string }>,
    newNotes: Array<Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; topicName?: string }>
  ) => void;

  // Labs
  labs: Lab[];
  updateLabStep: (labId: string, stepId: string, completed: boolean) => void;
  resetLab: (labId: string) => void;
  addLab: (lab: Omit<Lab, 'id'>) => Lab;

  // Board
  boardCards: BoardCard[];
  addBoardCard: (card: Omit<BoardCard, 'id' | 'createdAt'>) => BoardCard;
  moveBoardCard: (cardId: string, toColumn: BoardCard['column']) => void;
  deleteBoardCard: (cardId: string) => void;

  // Metrics & Activity
  metrics: SystemMetric[];
  activityLogs: ActivityLog[];
  addActivity: (action: string, target: string, type: ActivityLog['type']) => void;

  // Stats
  masteryPercentage: number;
  completedLabsCount: number;
  totalNotesCount: number;
  totalTopicsCount: number;

  // Ambient / Auto-Dim Mode
  autoDim: boolean;
  setAutoDim: (enabled: boolean) => void;

  // UI State
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'mimiryx:theme',
  SOUND: 'mimiryx:sound',
  CUSTOM_BG: 'mimiryx:custom_bg',
  BG_OPACITY: 'mimiryx:bg_opacity',
  BG_BLUR: 'mimiryx:bg_blur',
  TOPICS: 'mimiryx:topics',
  NOTES: 'mimiryx:notes',
  LABS: 'mimiryx:labs',
  BOARD: 'mimiryx:board',
  LOGS: 'mimiryx:logs',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'cyan';
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [customBg, setCustomBgState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_BG);
  });

  const [bgOpacity, setBgOpacityState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BG_OPACITY);
    return saved ? Number(saved) : 0.65;
  });

  const [bgBlur, setBgBlurState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BG_BLUR);
    return saved ? Number(saved) : 8;
  });

  const [geminiKey, setGeminiKey] = useState<string | null>(() => {
    return localStorage.getItem('mimiryx_gemini_key');
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [autoDim, setAutoDim] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Self-Healing Unique ID Generator
  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  };

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
    let parsed: Topic[] = saved ? JSON.parse(saved) : SEED_TOPICS;
    
    // Deduplicate IDs
    const seenIds = new Set<string>();
    parsed = parsed.map(t => {
      let id = t.id;
      if (seenIds.has(id)) id = generateUniqueId('topic');
      seenIds.add(id);
      return { ...t, id };
    });
    return parsed;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    let parsed: Note[] = saved ? JSON.parse(saved) : SEED_NOTES;
    
    // Deduplicate IDs
    const seenIds = new Set<string>();
    parsed = parsed.map(n => {
      let id = n.id;
      if (seenIds.has(id)) id = generateUniqueId('note');
      seenIds.add(id);
      return { ...n, id };
    });
    return parsed;
  });

  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LABS);
    return saved ? JSON.parse(saved) : SEED_LABS;
  });

  const [boardCards, setBoardCards] = useState<BoardCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOARD);
    return saved ? JSON.parse(saved) : SEED_BOARD_CARDS;
  });

  const [metrics, setMetrics] = useState<SystemMetric[]>(SEED_METRICS);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [
      { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), action: 'Initialized', target: 'MIMIRYX Neural Engine', type: 'mastery' },
      { id: 'log-2', timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), action: 'Knowledge Synced', target: '4 Topics Loaded', type: 'topic' }
    ];
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  const setCustomBg = (url: string | null) => {
    setCustomBgState(url);
    if (url) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BG, url);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_BG);
    }
  };

  const setBgOpacity = (val: number) => {
    setBgOpacityState(val);
    localStorage.setItem(STORAGE_KEYS.BG_OPACITY, String(val));
  };

  const setBgBlur = (val: number) => {
    setBgBlurState(val);
    localStorage.setItem(STORAGE_KEYS.BG_BLUR, String(val));
  };

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(labs)); }, [labs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOARD, JSON.stringify(boardCards)); }, [boardCards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs)); }, [activityLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        const delta = (Math.random() - 0.5) * 1.5;
        const newVal = Math.max(1, Math.min(99, +(m.value + delta).toFixed(1)));
        return { ...m, value: newVal };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const setTheme = (t: ThemeMode) => {
    sounds.playClick();
    setThemeState(t);
  };

  const setSoundEnabled = (val: boolean) => {
    sounds.playClick();
    setSoundEnabledState(val);
  };

  const addActivity = (action: string, target: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      target,
      type
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 20)]);
  };



  const addTopic = (topicData: Omit<Topic, 'id' | 'order'>): Topic => {
    sounds.playSuccess();
    const newTopic: Topic = {
      ...topicData,
      id: generateUniqueId('topic'),
      order: topics.length + 1,
    };
    setTopics(prev => [...prev, newTopic]);
    addActivity('Created Topic', newTopic.name, 'topic');
    return newTopic;
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addActivity('Updated Topic', updates.name || id, 'topic');
  };

  const deleteTopic = (id: string) => {
    sounds.playClick();
    const target = topics.find(t => t.id === id);
    setTopics(prev => prev.filter(t => t.id !== id));
    addActivity('Deleted Topic', target?.name || id, 'topic');
  };

  const clearAllNotes = () => {
    sounds.playClick();
    setNotes([]);
    addActivity('Cleared Vault', 'All notes deleted', 'mastery');
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    sounds.playSuccess();
    const newNote: Note = {
      ...noteData,
      id: generateUniqueId('note'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    addActivity('Created Note', newNote.title, 'note');
    return newNote;
  };

  const importVaultData = (
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
        if (t.id) topicIdMap.set(t.id, canonicalId);
        topicIdMap.set(trimmedName.toLowerCase(), canonicalId);
      }
    });

    const addedNotes: Note[] = [];
    newNotes.forEach((n) => {
      let targetTopicId = n.topicId || (n.topicName ? topicIdMap.get(n.topicName.trim().toLowerCase()) : undefined);

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
    });

    setTopics(updatedTopics);
    setNotes((prev) => [...addedNotes, ...prev]);
    addActivity('Imported Records', `${addedNotes.length} notes across ${updatedTopics.length} topics`, 'mastery');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    const target = notes.find(n => n.id === id);
    addActivity('Updated Note', updates.title || target?.title || id, 'note');
  };

  const deleteNote = (id: string) => {
    sounds.playClick();
    const target = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    addActivity('Deleted Note', target?.title || id, 'note');
  };

  const updateLabStep = (labId: string, stepId: string, completed: boolean) => {
    setLabs(prev => prev.map(lab => {
      if (lab.id !== labId) return lab;
      const newSteps = lab.steps.map(step => step.id === stepId ? { ...step, completed } : step);
      const allCompleted = newSteps.every(s => s.completed);
      const newStatus: LabStatus = allCompleted ? 'completed' : 'in_progress';
      
      if (completed) sounds.playSuccess();
      return {
        ...lab,
        steps: newSteps,
        status: newStatus,
      };
    }));
    addActivity('Lab Step ' + (completed ? 'Completed' : 'Reset'), labId, 'lab');
  };

  const resetLab = (labId: string) => {
    sounds.playClick();
    setLabs(prev => prev.map(lab => {
      if (lab.id !== labId) return lab;
      return {
        ...lab,
        status: 'not_started',
        steps: lab.steps.map(s => ({ ...s, completed: false }))
      };
    }));
  };

  const addLab = (labData: Omit<Lab, 'id'>): Lab => {
    sounds.playSuccess();
    const newLab: Lab = {
      ...labData,
      id: 'lab-' + Date.now()
    };
    setLabs(prev => [...prev, newLab]);
    addActivity('Created Lab', newLab.title, 'lab');
    return newLab;
  };

  const addBoardCard = (cardData: Omit<BoardCard, 'id' | 'createdAt'>): BoardCard => {
    sounds.playClick();
    const newCard: BoardCard = {
      ...cardData,
      id: 'card-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setBoardCards(prev => [...prev, newCard]);
    return newCard;
  };

  const moveBoardCard = (cardId: string, toColumn: BoardCard['column']) => {
    sounds.playClick();
    setBoardCards(prev => prev.map(c => c.id === cardId ? { ...c, column: toColumn } : c));
  };

  const deleteBoardCard = (cardId: string) => {
    sounds.playClick();
    setBoardCards(prev => prev.filter(c => c.id !== cardId));
  };

  const masteredNotes = notes.filter(n => n.status === 'mastered').length;
  const completedLabs = labs.filter(l => l.status === 'completed').length;
  const totalItems = (notes.length + labs.length) || 1;
  const masteryPercentage = Math.round(((masteredNotes + completedLabs) / totalItems) * 100);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        soundEnabled,
        setSoundEnabled,
        searchQuery,
        setSearchQuery,
        geminiKey,
        setGeminiKey: (k: string | null) => {
          setGeminiKey(k);
          if (k) localStorage.setItem('mimiryx_gemini_key', k);
          else localStorage.removeItem('mimiryx_gemini_key');
        },
        isSettingsOpen,
        setIsSettingsOpen,
        isOracleOpen,
        setIsOracleOpen,
        customBg,
        setCustomBg,
        bgOpacity,
        setBgOpacity,
        bgBlur,
        setBgBlur,
        topics,
        addTopic,
        updateTopic,
        deleteTopic,
        notes,
        addNote,
        updateNote,
        deleteNote,
        clearAllNotes,
        importVaultData,
        labs,
        updateLabStep,
        resetLab,
        addLab,
        boardCards,
        addBoardCard,
        moveBoardCard,
        deleteBoardCard,
        metrics,
        activityLogs,
        addActivity,
        masteryPercentage,
        completedLabsCount: completedLabs,
        totalNotesCount: notes.length,
        totalTopicsCount: topics.length,
        autoDim,
        setAutoDim,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
