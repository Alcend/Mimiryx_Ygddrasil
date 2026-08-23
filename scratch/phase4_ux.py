import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Imports
if 'Maximize2' not in text:
    text = text.replace(
        "  BrainCircuit,\n} from 'lucide-react';",
        "  BrainCircuit,\n  Maximize2,\n  Minimize2,\n} from 'lucide-react';"
    )

# 2. Add State and Ref
state_injection = """  const [activeRecallMode, setActiveRecallMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);"""

text = text.replace("  const [activeRecallMode, setActiveRecallMode] = useState(false);", state_injection)

# 3. Add Fullscreen Logic
logic_injection = """  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
        sounds.stopFocusDrone();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFocusMode = async () => {
    try {
      if (!document.fullscreenElement && fullscreenContainerRef.current) {
        await fullscreenContainerRef.current.requestFullscreen();
        setIsFocusMode(true);
        sounds.playFocusDrone();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFocusMode(false);
        sounds.stopFocusDrone();
      }
    } catch (err) {
      console.error("Fullscreen error", err);
    }
  };

  // Notes in the same topic for suggestions"""

text = text.replace("  // Notes in the same topic for suggestions", logic_injection)

# 4. Inject Button and Wrapper
# Find the main return block: return ( <div className="space-y-4">
old_return = r"""  return \(
    <div className="space-y-4">
      \{/\* Top Reading Toolbar \*/\}"""

new_return = """  return (
    <div ref={fullscreenContainerRef} className={isFocusMode ? "bg-[#020605] text-emerald-400/90 w-screen h-screen overflow-hidden flex flex-col p-8 md:p-16 relative" : "space-y-4 relative"}>
      {isFocusMode && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 0%, #000 100%)',
          zIndex: 0
        }} />
      )}
      {/* Top Reading Toolbar */}"""

text = re.sub(old_return, new_return, text)

# 5. Add Focus Toggle Button
old_toolbar_end = r"""        <div className="flex items-center gap-2">
          <button 
            onClick=\{\(\) => \{ setActiveRecallMode\(!activeRecallMode\); sounds\.playClick\?\.\(\); \}\}"""

new_toolbar_end = """        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFocusMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors border ${
              isFocusMode 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Sensory Deprivation Mode"
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFocusMode ? 'Exit Deep Dive' : 'Deep Dive'}
          </button>

          <button 
            onClick={() => { setActiveRecallMode(!activeRecallMode); sounds.playClick?.(); }}"""

text = re.sub(old_toolbar_end, new_toolbar_end, text)

# 6. Adjust height for Focus Mode Book Container
old_height = r"""style=\{\{ 
              height: 'calc\(100vh - 320px\)',"""

new_height = """style={{ 
              height: isFocusMode ? 'calc(100vh - 200px)' : 'calc(100vh - 320px)',"""

text = re.sub(old_height, new_height, text)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
