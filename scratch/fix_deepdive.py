import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Reduce outer padding in Focus Mode to give more reading room
text = text.replace(
    'className={isFocusMode ? "bg-[#020605] text-emerald-400/90 w-screen h-screen overflow-hidden flex flex-col p-8 md:p-16 relative" : "space-y-4 relative"}',
    'className={isFocusMode ? "bg-[#020605] text-emerald-400/90 w-screen h-screen overflow-hidden flex flex-col p-4 md:p-6 relative" : "space-y-4 relative"}'
)

# 2. Fix the height calculation which was pushing text out of bounds
text = text.replace(
    "height: isFocusMode ? 'calc(100vh - 120px)' : 'calc(100vh - 190px)'",
    "height: isFocusMode ? 'calc(100vh - 280px)' : 'calc(100vh - 190px)'"
)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
