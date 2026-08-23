import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("import { chunkNoteIntoPages } from '../components/BookReader';", "")
    content = content.replace(
        "const pages = chunkNoteIntoPages(note.content, note.title);\n              const pageCount = pages.length;",
        "const pageCount = Math.max(1, Math.ceil(note.content.split('---').length));"
    )
    content = content.replace(
        "const pages = chunkNoteIntoPages(note.content, note.title);\n                    const pageCount = pages.length;",
        "const pageCount = Math.max(1, Math.ceil(note.content.split('---').length));"
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_in_file('src/pages/NotesPage.tsx')
replace_in_file('src/pages/TopicDetailPage.tsx')
