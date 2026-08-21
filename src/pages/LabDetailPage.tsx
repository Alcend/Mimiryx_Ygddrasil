import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Terminal, CheckCircle2, RotateCcw, Play, HelpCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export const LabDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { labs, updateLabStep, resetLab } = useApp();
  const navigate = useNavigate();

  const lab = labs.find((l) => l.id === id);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'MIMIRYX Simulated Kernel v5.15-neural ready.',
    'Type the expected command or click [Execute] to verify step.',
    '---'
  ]);
  const [showHint, setShowHint] = useState(false);

  if (!lab) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-heading font-bold text-foreground">Lab Not Found</h3>
        <button
          onClick={() => navigate('/labs')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono"
        >
          Back to Labs
        </button>
      </div>
    );
  }

  const currentStep = lab.steps[activeStepIndex] || lab.steps[0];

  const handleExecuteCommand = (cmdToRun?: string) => {
    const cmd = (cmdToRun || terminalInput).trim();
    if (!cmd) return;

    sounds.playClick();
    const newHistory = [...terminalHistory, `$ ${cmd}`];

    if (currentStep.expectedCommand && (cmd === currentStep.expectedCommand || cmdToRun)) {
      if (currentStep.simulatedOutput) {
        newHistory.push(currentStep.simulatedOutput);
      }
      newHistory.push('[VERIFIED] Step completed successfully!');
      updateLabStep(lab.id, currentStep.id, true);

      // Check if all steps complete
      const allDone = lab.steps.every((s, i) => i === activeStepIndex ? true : s.completed);
      if (allDone) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        sounds.playSuccess();
      }

      if (activeStepIndex < lab.steps.length - 1) {
        setActiveStepIndex(activeStepIndex + 1);
      }
    } else {
      newHistory.push(`Output: Executed '${cmd}'. Expected: '${currentStep.expectedCommand}'`);
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            navigate('/labs');
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Labs
        </button>
        <button
          onClick={() => {
            if (confirm('Reset all steps for this lab?')) {
              resetLab(lab.id);
              setActiveStepIndex(0);
              setTerminalHistory(['Lab environment reset to initial state.']);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Lab
        </button>
      </div>

      {/* Lab Header */}
      <div className="p-6 rounded-2xl cyber-card border border-primary/30">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {lab.title}
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          {lab.description}
        </p>
      </div>

      {/* Main Two Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Guide Left Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Step Objectives
          </h3>

          <div className="space-y-3">
            {lab.steps.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveStepIndex(idx);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-primary/10 border-primary/50 shadow-neon-glow'
                      : step.completed
                      ? 'bg-card border-emerald-500/30'
                      : 'bg-card/50 border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground">
                      Step {idx + 1}: {step.title}
                    </span>
                    {step.completed && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {step.instruction}
                  </p>

                  {step.expectedCommand && (
                    <div className="mt-3 p-2 rounded bg-black/40 border border-border/60 font-mono text-[11px] text-primary flex items-center justify-between">
                      <code>{step.expectedCommand}</code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteCommand(step.expectedCommand);
                        }}
                        className="text-[10px] uppercase font-bold text-primary hover:underline"
                      >
                        Auto-Run
                      </button>
                    </div>
                  )}

                  {step.hint && (
                    <div className="mt-2 text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Hint: {step.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive CLI Terminal Simulator */}
        <div className="lg:col-span-7 rounded-2xl cyber-card border border-border/90 flex flex-col overflow-hidden h-[500px]">
          {/* Terminal Window Bar */}
          <div className="px-4 py-2.5 bg-black/60 border-b border-border flex items-center justify-between font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="text-foreground ml-2 font-bold">mimiryx-node-01: ~</span>
            </div>
            <span>BASH 5.1</span>
          </div>

          {/* Terminal Logs Output */}
          <div className="flex-1 p-4 bg-black/90 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1.5 whitespace-pre-wrap">
            {terminalHistory.map((line, idx) => (
              <div key={idx} className={line.startsWith('$') ? 'text-cyan-300 font-bold' : line.includes('[VERIFIED]') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {line}
              </div>
            ))}
          </div>

          {/* Terminal Input Line */}
          <div className="p-3 bg-black/80 border-t border-border flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold">$</span>
            <input
              type="text"
              placeholder="Enter command (or click Auto-Run on step)..."
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
              className="flex-1 bg-transparent text-xs font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => handleExecuteCommand()}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow"
            >
              Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
