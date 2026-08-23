with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Let's fix the broken split regex manually
text = re.sub(
    r'const rawPages = note\.content\.split\(\/.*?\/\);',
    r'const rawPages = note.content.split(/\\n\\n---\\n\\n|\\[PAGE_BREAK\\]/);',
    text,
    flags=re.DOTALL
)

# And fix the broken \n strings
text = text.replace("newPage = '```' + currentLanguage + '\n' + newPage;", "newPage = '```' + currentLanguage + '\\n' + newPage;")
text = text.replace("const lines = newPage.split('\n');", "const lines = newPage.split('\\n');")
text = text.replace("newPage = newPage + '\n```';", "newPage = newPage + '\\n```';")

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
