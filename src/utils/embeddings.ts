export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const updateRunningCentroid = (
  oldCentroid: number[] | undefined,
  oldCount: number,
  newVector: number[]
): number[] => {
  if (!oldCentroid || oldCentroid.length === 0) return [...newVector];
  if (oldCentroid.length !== newVector.length) return [...newVector];
  
  return oldCentroid.map((val, i) => {
    return ((val * oldCount) + newVector[i]) / (oldCount + 1);
  });
};

export interface ClusterNode {
  id: string; // Original item ID or cluster ID
  vector: number[];
  children?: ClusterNode[];
  items?: string[]; // IDs of original items
}

// Simple agglomerative clustering
export const clusterTopics = async (
  items: { id: string; vector: number[] }[],
  distanceThreshold: number = 0.25 // 1 - similarity (0.75 sim = 0.25 dist)
): Promise<ClusterNode[]> => {
  let clusters: ClusterNode[] = items.map(item => ({
    id: `cluster-${item.id}`,
    vector: item.vector,
    items: [item.id]
  }));

  let merged = true;
  while (merged && clusters.length > 1) {
    merged = false;
    let bestScore = -1;
    let mergeA = -1;
    let mergeB = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sim = cosineSimilarity(clusters[i].vector, clusters[j].vector);
        if (sim > bestScore) {
          bestScore = sim;
          mergeA = i;
          mergeB = j;
        }
      }
    }

    if (bestScore >= (1 - distanceThreshold)) {
      // Merge A and B
      const cA = clusters[mergeA];
      const cB = clusters[mergeB];
      
      const newItems = [...(cA.items || []), ...(cB.items || [])];
      
      // Calculate new centroid
      const countA = cA.items?.length || 1;
      const countB = cB.items?.length || 1;
      const newVector = cA.vector.map((val, idx) => {
        return ((val * countA) + (cB.vector[idx] * countB)) / newItems.length;
      });

      const newCluster: ClusterNode = {
        id: `merged-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
        vector: newVector,
        children: [cA, cB],
        items: newItems
      };

      // Remove A and B, push new
      clusters = clusters.filter((_, idx) => idx !== mergeA && idx !== mergeB);
      clusters.push(newCluster);
      merged = true;
      
      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return clusters;
};
