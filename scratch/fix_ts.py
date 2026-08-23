import os

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('className="prose prose-invert max-w-none font-mono"', '')

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
