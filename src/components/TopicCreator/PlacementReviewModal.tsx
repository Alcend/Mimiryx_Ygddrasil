import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Plus, Check, BrainCircuit, ChevronDown, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { cosineSimilarity } from '../../utils/embeddings';
import { Realm, Topic } from '../../types';

interface PlacementReviewModalProps {
  placement: {
    title: string;
    summary: string;
    synthesisText: string;
    vector: number[];
    grounding: any;
  };
  onClose: () => void;
  onConfirm: (data: any) => void;
}

interface RankedRealm {
  realm: Realm;
  similarity: number;
}

interface RankedTopic {
  topic: Topic;
  similarity: number;
}

export const PlacementReviewModal: React.FC<PlacementReviewModalProps> = ({ placement, onClose, onConfirm }) => {
  const { realms, topics } = useApp();
  
  const [rankedRealms, setRankedRealms] = useState<RankedRealm[]>([]);
  const [rankedTopics, setRankedTopics] = useState<RankedTopic[]>([]);
  
  const [selectedRealmId, setSelectedRealmId] = useState<string>('new');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  
  const [newRealmName, setNewRealmName] = useState('');

  useEffect(() => {
    // 1. Rank all realms
    const scoredRealms: RankedRealm[] = realms.map(r => {
      const sim = (r.centroidVector && r.centroidVector.length > 0) 
        ? cosineSimilarity(placement.vector, r.centroidVector) 
        : 0;
      return { realm: r, similarity: sim };
    }).sort((a, b) => b.similarity - a.similarity);

    setRankedRealms(scoredRealms);

    // Auto-select best realm if confidence is reasonable
    if (scoredRealms.length > 0 && scoredRealms[0].similarity > 0.5) {
      const bestRealmId = scoredRealms[0].realm.id;
      setSelectedRealmId(bestRealmId);
      
      // Rank topics within this best realm
      rankTopicsForRealm(bestRealmId);
    } else {
      setSelectedRealmId('new');
      setNewRealmName(placement.title); // Default new realm name
    }
  }, [placement.vector, realms, topics]);

  const rankTopicsForRealm = (realmId: string) => {
    const realmTopics = topics.filter(t => t.realmId === realmId);
    const scoredTopics: RankedTopic[] = realmTopics.map(t => {
      const sim = (t.embeddingVector && t.embeddingVector.length > 0)
        ? cosineSimilarity(placement.vector, t.embeddingVector)
        : 0;
      return { topic: t, similarity: sim };
    }).sort((a, b) => b.similarity - a.similarity);
    
    setRankedTopics(scoredTopics);
    
    if (scoredTopics.length > 0 && scoredTopics[0].similarity > 0.8) {
      setSelectedParentId(scoredTopics[0].topic.id);
    } else {
      setSelectedParentId(null);
    }
  };

  const handleRealmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setSelectedRealmId(rId);
    if (rId === 'new') {
      setNewRealmName(placement.title);
      setRankedTopics([]);
      setSelectedParentId(null);
    } else {
      rankTopicsForRealm(rId);
    }
  };

  const handleConfirm = () => {
    sounds.playSuccess();
    
    let finalRealm = null;
    let createNewRealm = false;
    
    if (selectedRealmId === 'new') {
      createNewRealm = true;
      // The parent component handles creating the realm with newRealmName
      // Currently the container might not support naming the new realm in addTopic, 
      // but we prepare the data.
    } else {
      finalRealm = realms.find(r => r.id === selectedRealmId);
    }
    
    const finalParent = selectedParentId ? topics.find(t => t.id === selectedParentId) : null;

    onConfirm({
      realm: finalRealm,
      parent: finalParent,
      createNewRealm,
      newRealmName: createNewRealm ? newRealmName : undefined
    });
  };

  const getConfidenceColor = (sim: number) => {
    if (sim > 0.85) return 'text-emerald-400';
    if (sim > 0.65) return 'text-primary';
    return 'text-amber-400';
  };

  const bestRealm = rankedRealms[0];
  const isAutoSuggesting = bestRealm && bestRealm.similarity > 0.5;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101a] border border-primary/30 w-full max-w-lg rounded-2xl p-6 cyber-card shadow-[0_0_30px_rgba(var(--color-primary),0.15)] flex flex-col max-h-[90vh]">
        
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">The Smart Librarian</h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">Vector Similarity Placement</p>
          </div>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6">
          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase mb-1">New Knowledge Node</p>
            <p className="text-sm font-bold text-white">{placement.title}</p>
            {placement.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{placement.summary}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-primary mb-2 uppercase tracking-wider">
                Destination Realm
              </label>
              
              <div className="relative">
                <select 
                  value={selectedRealmId}
                  onChange={handleRealmChange}
                  className="w-full appearance-none bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="new" className="bg-[#0b101a] text-white">✨ Create New Realm</option>
                  <optgroup label="AI Recommended" className="bg-[#0b101a] text-white">
                    {rankedRealms.map(r => (
                      <option key={r.realm.id} value={r.realm.id} className="bg-[#0b101a] text-white">
                        {r.realm.name} ({(r.similarity * 100).toFixed(0)}% match)
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {selectedRealmId === 'new' ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
                  New Realm Name
                </label>
                <input 
                  type="text" 
                  value={newRealmName}
                  onChange={(e) => setNewRealmName(e.target.value)}
                  className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                  placeholder="E.g., Quantum Mechanics"
                />
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-xs font-mono text-primary mb-2 uppercase tracking-wider">
                  Parent Topic (Optional)
                </label>
                <div className="relative">
                  <select 
                    value={selectedParentId || ''}
                    onChange={(e) => setSelectedParentId(e.target.value || null)}
                    className="w-full appearance-none bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="" className="bg-[#0b101a] text-white">-- Root Level (No Parent) --</option>
                    {rankedTopics.map(t => (
                      <option key={t.topic.id} value={t.topic.id} className="bg-[#0b101a] text-white">
                        {t.topic.name} ({(t.similarity * 100).toFixed(0)}% match)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end mt-6 pt-4 border-t border-border/50 shrink-0">
          <button 
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(0,224,255,0.3)] hover:shadow-[0_0_25px_rgba(0,224,255,0.5)]"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm Placement
          </button>
        </div>

      </div>
    </div>
  );
};
