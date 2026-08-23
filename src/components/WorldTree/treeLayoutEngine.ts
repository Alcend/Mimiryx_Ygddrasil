import { TreeNode, TreeData } from './types';
import { Topic, Note } from '../../types';

// Pre-defined foundational roots of knowledge (Underground network)
const SEED_FOUNDATIONS = [
  { id: 'fnd-math', title: 'Mathematics & Logic', category: 'Foundation', description: 'Discrete mathematics, boolean algebra, probability, and graph theory.' },
  { id: 'fnd-cs', title: 'Computer Science Core', category: 'Foundation', description: 'Algorithms, data structures, computation complexity, and memory hierarchy.' },
  { id: 'fnd-systems', title: 'Systems & Hardware Architecture', category: 'Foundation', description: 'CPU pipelining, registers, caching, and operating system primitives.' },
  { id: 'fnd-cyber', title: 'Information Theory & Cryptography', category: 'Foundation', description: 'Entropy, cryptographic primitives, hashing, and Shannon information limits.' },
];

export function buildTreeLayout(
  topics: Topic[],
  notes: Note[],
  syntheticNodeCount: number = 0
): TreeData {
  const nodesMap = new Map<string, TreeNode>();

  // 1. Central Trunk Root (MIMIRYX CORE)
  const coreId = 'core-mimiryx';
  const coreNode: TreeNode = {
    id: coreId,
    title: 'MIMIRYX',
    type: 'root_core',
    category: 'Neural System Core',
    status: 'mastered',
    mastery: 100,
    depth: 0,
    childrenIds: [],
    x: 0,
    y: 0,
    radius: 28,
    weight: 1,
    angle: 0,
    bezierControlPoints: { cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0 },
    branchThickness: 16,
    color: '#00f0ff',
    pulseOffset: 0,
    description: 'The central knowledge identity and neural trunk core.',
  };
  nodesMap.set(coreId, coreNode);

  // 2. Build Downward Roots (Foundations)
  const foundationIds: string[] = [];
  const rootCount = SEED_FOUNDATIONS.length;
  SEED_FOUNDATIONS.forEach((fnd, idx) => {
    // Distribute angles in downward hemisphere (from 0.2*PI to 0.8*PI)
    const angleRatio = (idx + 0.5) / rootCount;
    const angle = Math.PI * 0.25 + angleRatio * (Math.PI * 0.5);
    const length = 180 + (idx % 2 === 0 ? 30 : 0);
    const targetX = Math.cos(angle) * length * 1.5;
    const targetY = Math.sin(angle) * length; // positive Y is downward

    const fndNode: TreeNode = {
      id: fnd.id,
      title: fnd.title,
      type: 'foundation_root',
      category: fnd.category,
      status: 'foundation',
      mastery: 100,
      depth: 1,
      parentId: coreId,
      childrenIds: [],
      x: targetX,
      y: targetY,
      radius: 14,
      weight: 2,
      angle: angle,
      bezierControlPoints: {
        cp1x: targetX * 0.3,
        cp1y: targetY * 0.2,
        cp2x: targetX * 0.7,
        cp2y: targetY * 0.8,
      },
      branchThickness: 6,
      color: '#00ff88',
      pulseOffset: idx * 0.25,
      description: fnd.description,
    };

    // Add 1-2 sub-root tentacles for organic realism
    const subCount = 2;
    for (let s = 0; s < subCount; s++) {
      const subId = `${fnd.id}-sub-${s}`;
      const subAngle = angle + (s === 0 ? -0.2 : 0.2);
      const subLen = length + 50;
      const subX = Math.cos(subAngle) * subLen * 1.4;
      const subY = Math.sin(subAngle) * subLen;

      const subNode: TreeNode = {
        id: subId,
        title: s === 0 ? 'Sub-Root Synapse' : 'Deep Anchor',
        type: 'foundation_root',
        category: 'Foundation Root',
        status: 'foundation',
        mastery: 100,
        depth: 2,
        parentId: fnd.id,
        childrenIds: [],
        x: subX,
        y: subY,
        radius: 6,
        weight: 1,
        angle: subAngle,
        bezierControlPoints: {
          cp1x: targetX + (subX - targetX) * 0.3,
          cp1y: targetY + (subY - targetY) * 0.4,
          cp2x: targetX + (subX - targetX) * 0.7,
          cp2y: targetY + (subY - targetY) * 0.8,
        },
        branchThickness: 3,
        color: '#00ff88',
        pulseOffset: idx * 0.25 + s * 0.1,
      };
      nodesMap.set(subId, subNode);
      fndNode.childrenIds.push(subId);
    }

    nodesMap.set(fnd.id, fndNode);
    coreNode.childrenIds.push(fnd.id);
    foundationIds.push(fnd.id);
  });

  // 3. Build Upper Tree (Trunk, Domains, Topics, Notes)
  // Trunk Top Position
  const trunkTopY = -240;
  const domainIds: string[] = [];

  // Determine active domains / topics
  const effectiveTopics = [...topics];

  // If synthetic test count requested, generate realistic domain clusters
  if (syntheticNodeCount > 0) {
    const syntheticDomains = [
      'Cloud Architecture',
      'Operating Systems',
      'AI & Neural Pipelines',
      'Network Protocols',
      'Cybersecurity & IAM',
      'Database Internals',
      'DevOps & Automation',
      'Distributed Consensus',
    ];
    let created = effectiveTopics.length;
    let dIdx = 0;
    while (created < syntheticNodeCount / 8 && dIdx < syntheticDomains.length) {
      if (!effectiveTopics.some((t) => t.name.includes(syntheticDomains[dIdx]))) {
        effectiveTopics.push({
          id: `synth-topic-${dIdx}`,
          name: syntheticDomains[dIdx],
          code: `DOM-${dIdx + 1}`,
          description: `Synthetic benchmark domain cluster ${syntheticDomains[dIdx]}`,
          icon: 'Boxes',
          color: 'var(--neon-blue)',
          category: syntheticDomains[dIdx],
          order: effectiveTopics.length + 1,
        });
      }
      dIdx++;
      created++;
    }
  }

  // Calculate sector angles for each domain in crown
  const domainCount = effectiveTopics.length || 1;
  const colors = ['#00f0ff', '#00ff88', '#b026ff', '#ffb020', '#f43f5e', '#38bdf8', '#a855f7', '#34d399'];

  effectiveTopics.forEach((topic, idx) => {
    domainIds.push(topic.id);
    const domainColor = colors[idx % colors.length];

    // Angular distribution across top half (from -0.9*PI to -0.1*PI)
    // Left-to-right spread
    const spreadFraction = domainCount === 1 ? 0.5 : idx / (domainCount - 1);
    // Angle in radians (top hemisphere)
    const domainAngle = -Math.PI * 0.9 + spreadFraction * (Math.PI * 0.8);
    
    // Spread along the trunk height where branches emerge
    const trunkEmergeY = -60 - (idx % 3) * 60; // staggered emergence
    const branchLength = 220 + (idx % 2 === 0 ? 40 : 0);
    const domainX = Math.cos(domainAngle) * branchLength * 1.6;
    const domainY = trunkEmergeY + Math.sin(domainAngle) * branchLength * 0.8;

    // Get matching notes for this topic
    const topicNotes = notes.filter((n) => n.topicId === topic.id);
    
    // Add synthetic notes if requested for stress testing
    if (syntheticNodeCount > 0) {
      const targetNotesPerTopic = Math.floor(syntheticNodeCount / domainCount);
      let nIdx = topicNotes.length;
      while (topicNotes.length < targetNotesPerTopic) {
        topicNotes.push({
          id: `synth-note-${topic.id}-${nIdx}`,
          topicId: topic.id,
          title: `${topic.name} Concept #${nIdx + 1}`,
          summary: `Synthetic high-scale knowledge node for ${topic.name}`,
          content: `# Scalability Benchmark Note ${nIdx + 1}`,
          tags: ['Benchmark', topic.name],
          status: nIdx % 3 === 0 ? 'mastered' : nIdx % 2 === 0 ? 'reviewing' : 'learning',
          difficulty: nIdx % 3 === 0 ? 'advanced' : 'intermediate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        nIdx++;
      }
    }

    const masteredNotes = topicNotes.filter((n) => n.status === 'mastered').length;
    const topicMastery = topicNotes.length ? Math.round((masteredNotes / topicNotes.length) * 100) : 0;

    const domainNode: TreeNode = {
      id: topic.id,
      title: topic.name,
      type: 'domain_branch',
      category: topic.category,
      status: topicMastery >= 80 ? 'mastered' : topicMastery > 0 ? 'reviewing' : 'learning',
      mastery: topicMastery,
      depth: 1,
      parentId: coreId,
      childrenIds: [],
      x: domainX,
      y: domainY,
      radius: 16,
      weight: 1 + topicNotes.length,
      angle: domainAngle,
      bezierControlPoints: {
        cp1x: 0,
        cp1y: trunkEmergeY,
        cp2x: domainX * 0.4,
        cp2y: domainY * 0.7,
      },
      branchThickness: 8,
      color: domainColor,
      pulseOffset: idx * 0.3,
      description: topic.description,
    };

    // Sub-cluster notes radiating outward as a leaf blossom / digital constellation
    const noteCount = topicNotes.length;
    if (noteCount > 0) {
      // If many notes (> 8), split into subtopic clusters
      const subClustersCount = noteCount > 8 ? Math.ceil(noteCount / 6) : 1;

      if (subClustersCount > 1) {
        // Multi-tier sub-branching
        for (let sc = 0; sc < subClustersCount; sc++) {
          const subId = `${topic.id}-cluster-${sc}`;
          const clusterAngle = domainAngle + ((sc - (subClustersCount - 1) / 2) * 0.28);
          const clusterDist = 90;
          const clusterX = domainX + Math.cos(clusterAngle) * clusterDist * 1.3;
          const clusterY = domainY + Math.sin(clusterAngle) * clusterDist;

          const clusterNode: TreeNode = {
            id: subId,
            title: `${topic.name} Sub-Cluster ${sc + 1}`,
            type: 'subtopic',
            category: topic.category,
            status: 'learning',
            mastery: 50,
            depth: 2,
            parentId: domainNode.id,
            childrenIds: [],
            x: clusterX,
            y: clusterY,
            radius: 10,
            weight: 3,
            angle: clusterAngle,
            bezierControlPoints: {
              cp1x: domainX + (clusterX - domainX) * 0.3,
              cp1y: domainY + (clusterY - domainY) * 0.3,
              cp2x: domainX + (clusterX - domainX) * 0.7,
              cp2y: domainY + (clusterY - domainY) * 0.8,
            },
            branchThickness: 4,
            color: domainColor,
            pulseOffset: idx * 0.3 + sc * 0.1,
          };

          // Attach slice of notes to this cluster
          const sliceStart = sc * 6;
          const sliceNotes = topicNotes.slice(sliceStart, sliceStart + 6);
          sliceNotes.forEach((n, nIdx) => {
            const leafAngle = clusterAngle + ((nIdx - (sliceNotes.length - 1) / 2) * 0.35);
            const leafDist = 65 + (nIdx % 2 === 0 ? 15 : 0);
            const leafX = clusterX + Math.cos(leafAngle) * leafDist * 1.2;
            const leafY = clusterY + Math.sin(leafAngle) * leafDist;

            const leafNode: TreeNode = {
              id: n.id,
              title: n.title,
              type: 'note_leaf',
              category: topic.name,
              status: n.status,
              mastery: n.status === 'mastered' ? 100 : n.status === 'reviewing' ? 60 : 20,
              depth: 3,
              parentId: subId,
              childrenIds: [],
              noteId: n.id,
              x: leafX,
              y: leafY,
              radius: 6,
              weight: 1,
              angle: leafAngle,
              bezierControlPoints: {
                cp1x: clusterX + (leafX - clusterX) * 0.3,
                cp1y: clusterY + (leafY - clusterY) * 0.3,
                cp2x: clusterX + (leafX - clusterX) * 0.7,
                cp2y: clusterY + (leafY - clusterY) * 0.8,
              },
              branchThickness: 2,
              color: n.status === 'mastered' ? '#00ff88' : n.status === 'reviewing' ? '#ffb020' : '#00f0ff',
              pulseOffset: idx * 0.3 + nIdx * 0.15,
              description: n.summary,
              tags: n.tags,
            };
            nodesMap.set(leafNode.id, leafNode);
            clusterNode.childrenIds.push(leafNode.id);
          });

          nodesMap.set(subId, clusterNode);
          domainNode.childrenIds.push(subId);
        }
      } else {
        // Direct leaf fan
        topicNotes.forEach((n, nIdx) => {
          const leafAngle = domainAngle + ((nIdx - (noteCount - 1) / 2) * 0.32);
          const leafDist = 80 + (nIdx % 2 === 0 ? 20 : 0);
          const leafX = domainX + Math.cos(leafAngle) * leafDist * 1.3;
          const leafY = domainY + Math.sin(leafAngle) * leafDist;

          const leafNode: TreeNode = {
            id: n.id,
            title: n.title,
            type: 'note_leaf',
            category: topic.name,
            status: n.status,
            mastery: n.status === 'mastered' ? 100 : n.status === 'reviewing' ? 60 : 20,
            depth: 2,
            parentId: domainNode.id,
            childrenIds: [],
            noteId: n.id,
            x: leafX,
            y: leafY,
            radius: 6.5,
            weight: 1,
            angle: leafAngle,
            bezierControlPoints: {
              cp1x: domainX + (leafX - domainX) * 0.3,
              cp1y: domainY + (leafY - domainY) * 0.3,
              cp2x: domainX + (leafX - domainX) * 0.7,
              cp2y: domainY + (leafY - domainY) * 0.8,
            },
            branchThickness: 2.2,
            color: n.status === 'mastered' ? '#00ff88' : n.status === 'reviewing' ? '#ffb020' : '#00f0ff',
            pulseOffset: idx * 0.3 + nIdx * 0.15,
            description: n.summary,
            tags: n.tags,
          };
          nodesMap.set(leafNode.id, leafNode);
          domainNode.childrenIds.push(leafNode.id);
        });
      }
    }

    nodesMap.set(domainNode.id, domainNode);
    coreNode.childrenIds.push(domainNode.id);
  });

  // Calculate high-level stats
  let learningCount = 0;
  let reviewingCount = 0;
  let masteredCount = 0;

  nodesMap.forEach((n) => {
    if (n.type === 'note_leaf' || n.type === 'domain_branch') {
      if (n.status === 'mastered') masteredCount++;
      else if (n.status === 'reviewing') reviewingCount++;
      else if (n.status === 'learning') learningCount++;
    }
  });

  const total = learningCount + reviewingCount + masteredCount || 1;
  const growthPercentage = Math.round((masteredCount / total) * 100);

  return {
    nodes: nodesMap,
    rootCoreId: coreId,
    foundations: foundationIds,
    domains: domainIds,
    stats: {
      learning: learningCount,
      reviewing: reviewingCount,
      mastered: masteredCount,
      total,
      growthPercentage,
    },
  };
}
