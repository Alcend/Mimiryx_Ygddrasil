import os

filepath = 'src/context/AppContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

missing_code = """
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  const setCustomBg = (url: string | null) => {
    setCustomBgState(url);
    if (url) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BG, url);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_BG);
    }
  };

  const setBgOpacity = (val: number) => {
    setBgOpacityState(val);
    localStorage.setItem(STORAGE_KEYS.BG_OPACITY, String(val));
  };

  const setBgBlur = (val: number) => {
    setBgBlurState(val);
    localStorage.setItem(STORAGE_KEYS.BG_BLUR, String(val));
  };

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    const interval = setInterval", missing_code + "    const interval = setInterval")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
