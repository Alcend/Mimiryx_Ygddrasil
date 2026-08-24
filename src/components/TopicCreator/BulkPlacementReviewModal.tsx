import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Plus, Check, BrainCircuit, Layers } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { cosineSimilarity, ClusterNode } from '../../utils/embeddings';
import { Realm } from '../../types';

interface BulkPlacementReviewModalProps {
  clusters: ClusterNode[];
  onClose: () => void;
  onConfirm: (finalPlacements: any[]) => void;
}

export const BulkPlacementReviewModal: React.FC<BulkPlacementReviewModalProps> = ({ clusters, onClose, onConfirm }) => {
  const { realms, topics } = useApp();
  const [placements, setPlacements] = useState<any[]>([]);

  useEffect(() => {
    const computed = clusters.map(cluster => {
      let bestRealm: Realm | null = null;
      let bestSim = -1;

      for (const r of realms) {
        if (r.centroidVector && r.centroidVector.length > 0) {
          const sim = cosineSimilarity(cluster.vector, r.centroidVector);
          if (sim > bestSim) {
            bestSim = sim;
            bestRealm = r;
          }
        }
      }

      let mode: 'auto' | 'suggest' | 'new' = 'new';
      let bestTopic = null;

      if (bestSim >= 0.75 && bestRealm) {
        mode = 'auto';
        const realmTopics = topics.filter(t => t.realmId === bestRealm?.id);
        let bestTopicSim = -1;
        for (const t of realmTopics) {
          if (t.embeddingVector && t.embeddingVector.length > 0) {
            const sim = cosineSimilarity(cluster.vector, t.embeddingVector);
            if (sim > bestTopicSim && sim > 0.85) {
              bestTopicSim = sim;
              bestTopic = t;
            }
          }
        }
      } else if (bestSim >= 0.55 && bestRealm) {
        mode = 'suggest';
      }

      return {
        cluster,
        bestRealm,
        bestTopic,
        similarity: bestSim,
        mode
      };
    });

    setPlacements(computed);
  }, [clusters, realms, topics]);

  const handleConfirm = () => {
    sounds.playSuccess();
    onConfirm(placements);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101a] border border-primary/30 w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl p-6 cyber-card shadow-[0_0_30px_rgba(var(--color-primary),0.15)]">
        
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Bulk Placement Review</h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">Found {clusters.length} distinct clusters from import.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 pr-2">
          {placements.map((p, idx) => (
            <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-4 flex gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase">Cluster #{idx + 1}</p>
                <div className="flex flex-wrap gap-2">
                  {p.cluster.items?.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-64 border-l border-white/10 pl-4 flex flex-col justify-center">
                {p.mode === 'auto' && p.bestRealm && (
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> Auto-Place ({Math.round(p.similarity * 100)}%)</p>
                    <p className="text-xs text-muted-foreground">Realm: {p.bestRealm.name}</p>
                  </div>
                )}
                {p.mode === 'suggest' && p.bestRealm && (
                  <div>
                    <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><Check className="w-3 h-3"/> Suggest ({Math.round(p.similarity * 100)}%)</p>
                    <p className="text-xs text-muted-foreground">Realm: {p.bestRealm.name}</p>
                  </div>
                )}
                {p.mode === 'new' && (
                  <div>
                    <p className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1"><Plus className="w-3 h-3"/> New Realm Needed</p>
                    <p className="text-[10px] text-muted-foreground">No strong match found.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-end shrink-0">
          <button 
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Confirm Batch Placements
          </button>
        </div>

      </div>
    </div>
  );
};
