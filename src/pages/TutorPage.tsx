import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Send, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

export const TutorPage: React.FC = () => {
  const [topic, setTopic] = useState('eBPF vs Kernel Modules');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Welcome to your private IT & Systems Tutor. Ask me any conceptual question about Linux internals, Kubernetes architecture, or Neural Networks, and I will break it down simply.'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sounds.playClick();
    const newMsgs = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMsgs);
    const q = input;
    setInput('');

    setTimeout(() => {
      sounds.playSuccess();
      const reply = `### Concept Explanation: ${q}\n\n- **Analogy**: Imagine the Linux kernel as an ancient guarded citadel (Asgard). Traditional modules require rebuilding the gates; eBPF acts like a trusted fast courier passing safely through the gates with verified credentials.\n- **Key Takeaway**: Zero downtime, instant observability, and cryptographic safety verified by the kernel JIT verifier before execution.`;
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> IT & Systems Conceptual Tutor
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Master deep technical concepts through structured analogies and step-by-step breakdowns.
        </p>
      </div>

      <div className="rounded-2xl cyber-card border border-border flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground font-mono font-medium'
                    : 'bg-black/50 border border-border text-foreground font-mono whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-black/40 border-t border-border flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything (e.g. How does container isolation work?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
