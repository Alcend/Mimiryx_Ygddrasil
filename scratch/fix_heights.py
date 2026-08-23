import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "height: isFocusMode ? 'calc(100vh - 150px)' : 'calc(100vh - 270px)',",
    "height: isFocusMode ? 'calc(100vh - 120px)' : 'calc(100vh - 190px)',"
)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    nd_text = f.read()

nd_text = nd_text.replace(
    'className="space-y-4 max-w-5xl mx-auto pb-12"',
    'className="space-y-3 max-w-5xl mx-auto pb-4"'
)

with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(nd_text)
