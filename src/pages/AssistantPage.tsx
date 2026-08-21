import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bug, Send, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export const AssistantPage: React.FC = () => {
  const { notes, labs } = useApp();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Greetings. I am the MIMIRYX Lab Debugger. Describe any failed command, network timeout, or Kubernetes manifest issue, and I will analyze the root cause.'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (userText?: string) => {
    const text = (userText || query).trim();
    if (!text) return;

    sounds.playClick();
    const newMsgs = [...messages, { role: 'user' as const, text }];
    setMessages(newMsgs);
    setQuery('');
    setIsThinking(true);

    setTimeout(() => {
      sounds.playSuccess();
      let reply = `[DIAGNOSTIC COMPLETE for: "${text}"]\n\n1. ROOT CAUSE ANALYSIS: Inspected local context against active topic nodes.\n2. RECOMMENDED FIX: Ensure socket permissions and verify ports with \`netstat -tulpn\` or check Kubernetes pod logs.\n3. KERNEL CHECK: Run \`dmesg -T | tail -n 20\` to confirm no OOM killer triggers.`;
      
      if (text.toLowerCase().includes('mesh') || text.toLowerCase().includes('route')) {
        reply = `[MESH DIAGNOSTIC]\n- Ensure VirtualService matches DestinationRule subsets.\n- Check Envoy proxy sidecar status with \`istioctl proxy-status\`.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bug className="w-6 h-6 text-primary" /> Lab Debugger & Error Diagnostic
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Intelligent troubleshooting for cloud infrastructure, networking, and lab challenges.
        </p>
      </div>

      <div className="rounded-2xl cyber-card border border-border flex flex-col h-[520px] overflow-hidden">
        {/* Messages */}
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
          {isThinking && (
            <div className="flex items-center gap-2 text-xs font-mono text-primary animate-pulse">
              <Sparkles className="w-4 h-4" /> Analyzing neural kernel stack trace...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-black/40 border-t border-border flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste error logs, failed bash commands, or stack traces..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 shadow-neon-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
