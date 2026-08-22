import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateGeminiResponse, getOraclePrompt } from '../utils/ai';
import { X, Send, Sparkles, Brain, Loader2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
}

export const OracleChat: React.FC = () => {
  const { isOracleOpen, setIsOracleOpen, geminiKey, setIsSettingsOpen } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'oracle',
      content: 'Greetings. I am the Oracle of Mimiryx. How may I assist your cognitive expansion today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOracleOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (!geminiKey) {
      // Gracefully prompt for settings if no key
      setIsOracleOpen(false);
      setIsSettingsOpen(true);
      return;
    }

    const userText = inputValue.trim();
    setInputValue('');
    sounds.playClick();

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // In a real app we'd pass the full chat history to context, but we'll do a simple prompt here
      const prompt = getOraclePrompt(userText, 'Using Mimiryx Neural UI');
      const response = await generateGeminiResponse(prompt, geminiKey);
      
      sounds.playSuccess();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'oracle', content: response }]);
    } catch (error: any) {
      sounds.playError();
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'oracle', 
        content: `**Neural Link Failed:** ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 flex flex-col bg-card/95 backdrop-blur-xl border-l border-primary/30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#070e17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 relative">
            <Brain className="w-4 h-4 text-primary" />
            <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
              Oracle <Sparkles className="w-3 h-3 text-primary" />
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Synaptic Link Active
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            setIsOracleOpen(false);
          }}
          className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider px-1">
              {msg.role === 'user' ? 'You' : 'Oracle'}
            </span>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm font-mono ${
                  msg.role === 'user' 
                    ? 'bg-primary/20 text-primary-foreground border border-primary/30 rounded-tr-none' 
                    : 'bg-white/5 text-foreground border border-white/10 rounded-tl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="markdown-prose">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider px-1">
              Oracle
            </span>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Synthesizing response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-[#070e17] shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={geminiKey ? "Ask the Oracle..." : "Requires API Key in Settings"}
            className="w-full bg-background/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
