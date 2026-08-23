with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const pages = note.content.split(/\n\n---\n\n|\\[PAGE_BREAK\\]/);", "const pages = note.content.split(/\\n\\n---\\n\\n|\\[PAGE_BREAK\\]/);")

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
