import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update relative group
text = text.replace(
    '<div className="relative group">',
    '<div className={`relative group ${isFocusMode ? "flex-1 flex flex-col min-h-0 mt-2" : ""}`}>'
)

# 2. Update cyber-card
text = text.replace(
    'className="bg-[#0b101a] border border-border/50 rounded-2xl p-5 md:p-6 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden"',
    'className={`bg-[#0b101a] border border-border/50 rounded-2xl p-5 md:p-6 cyber-card shadow-2xl relative z-10 transition-all duration-500 overflow-hidden ${isFocusMode ? "flex-1 flex flex-col min-h-0" : ""}`}'
)

# 3. Update Title container to not shrink
text = text.replace(
    '<div className="mb-3 pb-3 border-b border-border/40 flex justify-between items-end mt-1">',
    '<div className="mb-3 pb-3 border-b border-border/40 flex justify-between items-end mt-1 shrink-0">'
)

# 4. Update Pages Container
text = text.replace(
    'className="relative w-full pb-4"',
    'className={`relative w-full ${isFocusMode ? "flex-1 min-h-0" : "pb-4"}`}'
)

text = text.replace(
    "height: isFocusMode ? 'calc(100vh - 280px)' : 'calc(100vh - 190px)'",
    "height: isFocusMode ? '100%' : 'calc(100vh - 190px)'"
)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
