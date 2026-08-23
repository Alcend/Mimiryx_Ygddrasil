import os
import re

with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "import { ThemeMode, Topic, Note, Lab, BoardCard, SystemMetric, ActivityLog, LabStatus } from '../types';",
    "import { ThemeMode, Realm, Topic, Note, Lab, BoardCard, SystemMetric, ActivityLog, LabStatus } from '../types';"
)

storage_keys_old = '''const STORAGE_KEYS = {
  THEME: 'mimiryx_theme',
  SOUND: 'mimiryx_sound',
  CUSTOM_BG: 'mimiryx_custom_bg',
  BG_OPACITY: 'mimiryx_bg_opacity',
  BG_BLUR: 'mimiryx_bg_blur',
  TOPICS: 'mimiryx_topics',
  NOTES: 'mimiryx_notes',
  LABS: 'mimiryx_labs',
  BOARD: 'mimiryx_board',
  LOGS: 'mimiryx_logs'
};'''

storage_keys_new = '''const STORAGE_KEYS = {
  THEME: 'mimiryx_theme',
  SOUND: 'mimiryx_sound',
  CUSTOM_BG: 'mimiryx_custom_bg',
  BG_OPACITY: 'mimiryx_bg_opacity',
  BG_BLUR: 'mimiryx_bg_blur',
  TOPICS: 'mimiryx_topics',
  REALMS: 'mimiryx_realms',
  NOTES: 'mimiryx_notes',
  LABS: 'mimiryx_labs',
  BOARD: 'mimiryx_board',
  LOGS: 'mimiryx_logs'
};'''

text = text.replace(storage_keys_old, storage_keys_new)

provider_value_old = '''    <AppContext.Provider
      value={{
        theme,'''
        
provider_value_new = '''    <AppContext.Provider
      value={{
        theme,
        realms,
        addRealm,
        updateRealm,
        deleteRealm,'''

text = text.replace(provider_value_old, provider_value_new)

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
