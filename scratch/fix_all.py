import re
import os

filepath = 'src/pages/NotesPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{currentBackPage.pageNumber} OF {pages.length}", "{currentBackPageNum} OF {pageCount}")
content = content.replace("{currentBackPage.title}", "{note.title} (Part {currentBackPageNum})")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
