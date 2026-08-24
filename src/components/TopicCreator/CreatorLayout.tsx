import React, { useState, useEffect, useRef } from 'react';
import { Type, BrainCircuit, Wand2, Plus, Sparkles, Check, Database, List, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { PlacementReviewModal } from './PlacementReviewModal';
import { BulkPlacementReviewModal } from './BulkPlacementReviewModal';
import { AIJob, createJob, getAllJobs, clearCompletedJobs } from '../../db/aiJobsStore';

export const CreatorLayout: React.FC = () => {
  const { geminiKey, topics, notes, realms, addTopic, addNote, updateRealm, addRealm } = useApp();
  
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [topicInput, setTopicInput] = useState('');
  
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const workerRef = useRef<Worker | null>(null);
  
  // Placement State
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../../workers/aiPipeline.worker.ts', import.meta.url), {
      type: 'module'
    });
    
    workerRef.current.postMessage({ type: 'INIT', payload: { geminiKey } });
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'JOB_UPDATED') {
        refreshJobs();
      }
    };
    
    refreshJobs();
    
    return () => {
      workerRef.current?.terminate();
    };
  }, [geminiKey]);
  
  const refreshJobs = async () => {
    const allJobs = await getAllJobs();
    setJobs(allJobs);
  };

  const handleStartCreation = async () => {
    if (!geminiKey) { alert("API key required."); return; }
    if (!topicInput.trim()) return;

    sounds.playClick();
    
    if (mode === 'bulk') {
      const items = topicInput.split('\n').map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        await createJob(item);
      }
    } else {
      await createJob(topicInput.trim());
    }
    
    setTopicInput('');
    workerRef.current?.postMessage({ type: 'WAKE' });
    refreshJobs();
  };
  
  const handleReviewPlacement = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowPlacementModal(true);
  };
  
  const handleClearCompleted = async () => {
    await clearCompletedJobs();
    refreshJobs();
  };

  const handleRetryJob = async (jobId: string) => {
    sounds.playClick();
    const { updateJob } = await import('../../db/aiJobsStore');
    await updateJob(jobId, { status: 'QUEUED', retryCount: 0, lastError: undefined, nextRetryAt: undefined });
    workerRef.current?.postMessage({ type: 'WAKE' });
    refreshJobs();
  };

  const activeJob = mode === 'single' ? jobs[0] : null;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => { sounds.playClick(); setMode('single'); }}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg border transition-all ${
            mode === 'single' 
              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]' 
              : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/30'
          }`}
        >
          Single Topic
        </button>
        <button
          onClick={() => { sounds.playClick(); setMode('bulk'); }}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg border transition-all ${
            mode === 'bulk' 
              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]' 
              : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/30'
          }`}
        >
          Bulk Import Queue
        </button>
      </div>

      <div className="flex gap-4">
        {mode === 'bulk' ? (
          <textarea 
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Paste multiple topics (one per line)..."
            className="flex-1 h-32 bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        ) : (
          <input 
            type="text" 
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter a topic to research..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleStartCreation()}
          />
        )}
        
        <button 
          onClick={handleStartCreation}
          disabled={!topicInput.trim()}
          className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 h-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Queue Job</span>
        </button>
      </div>

      {mode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
          {/* Left Pane: Raw Dump */}
          <div className="flex flex-col h-full bg-[#020605] border border-emerald-500/30 rounded-xl overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
            <div className="flex items-center justify-between bg-black/40 border-b border-emerald-500/20 px-4 py-2 text-[10px] font-mono text-emerald-500 uppercase">
              <span className="flex items-center gap-1.5"><Type className="w-3 h-3" /> RAW SYNAPTIC STREAM</span>
              <span className="opacity-50">
                {activeJob?.status || 'Idle'}
                {activeJob?.lastError && <span className="text-red-400 ml-2">({activeJob.lastError})</span>}
              </span>
            </div>
            <div className="flex-1 p-5 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-y-auto whitespace-pre-wrap">
              {activeJob?.researchText || <span className="opacity-30">Awaiting job...</span>}
              {activeJob?.status === 'RESEARCHING' && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 align-middle" />}
            </div>
          </div>

          {/* Right Pane: Compiled Node (Live Preview) */}
          <div className="flex flex-col h-full bg-[#070d14] border border-primary/30 rounded-xl overflow-hidden shadow-[inset_0_0_20px_rgba(var(--color-primary),0.05)] relative">
            <div className="flex items-center justify-between bg-black/40 border-b border-primary/20 px-4 py-2 text-[10px] font-mono text-primary uppercase">
              <span className="flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> COMPILED NEURAL NODE</span>
              <span className="opacity-50">
                {activeJob?.status === 'AWAITING_REVIEW' ? (
                  <button onClick={() => handleReviewPlacement(activeJob.id)} className="bg-primary text-black px-2 py-1 rounded">Review Placement</button>
                ) : activeJob?.status}
              </span>
            </div>
            
            <div className="flex-1 p-5 font-mono text-sm text-foreground leading-relaxed overflow-y-auto whitespace-pre-wrap">
              {activeJob?.synthesisText || <span className="opacity-30">Waiting for synthesis layer...</span>}
              {activeJob?.status === 'STRUCTURING' && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />}
            </div>
          </div>
        </div>
      )}
      
      {mode === 'bulk' && (
        <div className="flex flex-col flex-1 bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-black/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-mono text-sm text-white flex items-center gap-2"><List className="w-4 h-4" /> Background Jobs</h3>
            <button onClick={handleClearCompleted} className="text-xs text-muted-foreground hover:text-white">Clear Completed</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {jobs.length === 0 && <div className="text-muted-foreground font-mono text-sm text-center py-8">Queue is empty.</div>}
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between bg-card border border-white/5 p-3 rounded-lg">
                <div>
                  <h4 className="text-sm font-bold text-white">{job.topic}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Status: <span className="text-primary">{job.status}</span></p>
                  {job.lastError && <p className="text-xs text-red-400 font-mono mt-1">Error: {job.lastError} (Retries: {job.retryCount})</p>}
                </div>
                <div>
                  {job.status === 'AWAITING_REVIEW' && (
                    <button 
                      onClick={() => handleReviewPlacement(job.id)}
                      className="bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/30"
                    >
                      Review
                    </button>
                  )}
                  {job.status === 'DEAD_LETTER' && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-red-500 text-xs font-mono border border-red-500/20 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" /> FAILED
                      </div>
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs font-mono transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {(() => { const activeModalJob = jobs.find(j => j.id === selectedJobId); return showPlacementModal && activeModalJob && (
        <PlacementReviewModal 
          placement={{
            title: activeModalJob.topic || '',
            summary: activeModalJob.topic || '', 
            synthesisText: activeModalJob.synthesisText || '',
            vector: activeModalJob.vector || [],
            grounding: activeModalJob.grounding
          }} 
          onClose={() => setShowPlacementModal(false)}
          onConfirm={(finalPlacement) => {
            sounds.playSuccess();
            // Same insertion logic as before
            const job = jobs.find(j => j.id === selectedJobId)!;
            const { realm, parent, createNewRealm, newRealmName } = finalPlacement;
            
            let title = job.topic;
            let summary = '';
            const yamlMatch = job.synthesisText?.match(/---\n([\s\S]*?)\n---/);
            if (yamlMatch) {
              const titleMatch = yamlMatch[1].match(/title:\s*"?([^"]+)"?/);
              if (titleMatch) title = titleMatch[1];
              const summaryMatch = yamlMatch[1].match(/summary:\s*"?([^"]+)"?/);
              if (summaryMatch) summary = summaryMatch[1];
            }

            let targetRealmId = realm?.id;
            if (createNewRealm && newRealmName) {
              const newRealm = addRealm({
                name: newRealmName,
                description: 'Auto-generated realm from Topic Creator',
                color: 'bg-primary/20 text-primary border-primary/30',
                icon: 'Brain',
                centroidVector: []
              });
              targetRealmId = newRealm.id;
            } else if (createNewRealm) {
              targetRealmId = realms[0]?.id || 'r1';
            }
            
            const newTopic = addTopic({
              name: title,
              code: title.substring(0, 3).toUpperCase(),
              description: summary,
              icon: 'Brain',
              color: 'text-primary',
              category: 'Research',
              realmId: targetRealmId,
              parentId: parent?.id,
              embeddingVector: job.vector!
            });
            
            addNote({
              topicId: newTopic.id,
              title: title,
              summary: summary,
              content: job.synthesisText!,
              tags: ['auto-generated'],
              status: 'learning',
              difficulty: 'intermediate',
              sourceCitations: job.grounding?.webUrls || [],
              autoGenerated: true,
              confidenceScore: 0.95
            });
            
            // Mark job complete in DB
            import('../../db/aiJobsStore').then(({ updateJob }) => {
              updateJob(job.id, { status: 'COMPLETED' }).then(() => refreshJobs());
            });
            
            setShowPlacementModal(false);
          }}
        />
      ); })()}
    </div>
  );
};
