export type TreeNodeType = 
  | 'root_core' 
  | 'foundation_root' 
  | 'domain_branch' 
  | 'topic_cluster' 
  | 'subtopic' 
  | 'note_leaf';

export interface TreeNode {
  id: string;
  title: string;
  type: TreeNodeType;
  category: string;
  status: 'learning' | 'reviewing' | 'mastered' | 'foundation';
  mastery: number;
  depth: number;
  parentId?: string;
  foundationIds?: string[];
  childrenIds: string[];
  relatedIds?: string[];
  noteId?: string;
  topicId?: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  radius: number;
  weight: number;
  angle: number;
  bezierControlPoints: { cp1x: number; cp1y: number; cp2x: number; cp2y: number };
  branchThickness: number;
  color: string;
  pulseOffset: number;
  description?: string;
  tags?: string[];
}

export interface TreeData {
  nodes: Map<string, TreeNode>;
  rootCoreId: string;
  foundations: string[];
  domains: string[];
  stats: {
    learning: number;
    reviewing: number;
    mastered: number;
    total: number;
    growthPercentage: number;
  };
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
  isLocked: boolean;
}
