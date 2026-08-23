export type ThemeMode = 'cyan' | 'green' | 'purple' | 'amber';

export type NoteStatus = 'learning' | 'reviewing' | 'mastered';
export type NoteDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LabStatus = 'not_started' | 'in_progress' | 'completed';
export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Realm {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  category: string; // Deprecated
  realmId?: string;
  order: number;
}

export interface Note {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  status: NoteStatus;
  difficulty: NoteDifficulty;
  lastReviewed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabStep {
  id: string;
  title: string;
  instruction: string;
  expectedCommand?: string;
  simulatedOutput?: string;
  hint?: string;
  completed: boolean;
}

export interface Lab {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  status: LabStatus;
  estimatedMinutes: number;
  steps: LabStep[];
  completedStepsCount?: number;
}

export interface BoardCard {
  id: string;
  title: string;
  description: string;
  column: 'backlog' | 'in_progress' | 'review' | 'mastered';
  topicId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  type: 'note' | 'lab' | 'topic' | 'mastery' | 'ai';
}
