import os

filepath = 'src/components/ImportExportModal.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Vault Backup states
state_old = """  const [isProcessing, setIsProcessing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<AIOrganizeResult | null>(null);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);"""

state_new = """  const [isProcessing, setIsProcessing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<AIOrganizeResult | null>(null);
  const [vaultBackupResult, setVaultBackupResult] = useState<{ topics: any[]; notes: any[] } | null>(null);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);"""

content = content.replace(state_old, state_new)

# 2. Modify handleFileSelect
handler_old = """  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    sounds.playClick();
    setIsProcessing(true);
    setOrganizeResult(null);
    setImportedSuccessCount(null);

    try {
      const fileArr = Array.from(files);
      const result = await organizeImportedFiles(fileArr, topics);
      setOrganizeResult(result);
      sounds.playSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };"""

handler_new = """  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    sounds.playClick();
    setIsProcessing(true);
    setOrganizeResult(null);
    setVaultBackupResult(null);
    setImportedSuccessCount(null);

    try {
      const fileArr = Array.from(files);
      
      // Fast-path for Vault JSON Backups
      if (fileArr.length === 1 && fileArr[0].name.endsWith('.json')) {
        try {
          const text = await fileArr[0].text();
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.topics) && Array.isArray(parsed.notes)) {
             setVaultBackupResult({ topics: parsed.topics, notes: parsed.notes });
             sounds.playSuccess();
             setIsProcessing(false);
             return;
          }
        } catch (e) {
          // Fallback to AI parsing if not a valid vault
        }
      }

      const result = await organizeImportedFiles(fileArr, topics);
      setOrganizeResult(result);
      sounds.playSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleApplyVaultBackup = () => {
    if (!vaultBackupResult) return;
    sounds.playSuccess();
    importVaultData(vaultBackupResult.topics, vaultBackupResult.notes);
    setImportedSuccessCount(vaultBackupResult.notes.length);
    setVaultBackupResult(null);
  };"""

content = content.replace(handler_old, handler_new)

# 3. Add Vault Backup UI
ui_old = """                {/* Processing State */}
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm font-mono text-primary animate-pulse tracking-widest">INGESTING KNOWLEDGE...</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Running neural classification on documents</p>
                  </div>
                ) : organizeResult ? ("""

ui_new = """                {/* Processing State */}
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm font-mono text-primary animate-pulse tracking-widest">INGESTING KNOWLEDGE...</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Running neural classification on documents</p>
                  </div>
                ) : vaultBackupResult ? (
                  <div className="p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <FolderPlus className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-foreground">Vault Backup Identified</h3>
                      <p className="text-sm font-mono text-muted-foreground max-w-md">
                        We successfully read your JSON file. It contains <strong className="text-primary">{vaultBackupResult.topics.length} Realms/Topics</strong> and <strong className="text-primary">{vaultBackupResult.notes.length} Knowledge Records</strong>.
                      </p>
                      
                      <div className="pt-6 w-full max-w-md flex flex-col gap-3">
                        <button
                          onClick={handleApplyVaultBackup}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        >
                          Confirm & Merge Backup
                        </button>
                        <button
                          onClick={() => setVaultBackupResult(null)}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-mono text-sm rounded-xl transition-all border border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : organizeResult ? ("""

content = content.replace(ui_old, ui_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
