import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(r'\`\`\`', 'three backticks')
text = text.replace('```', 'three backticks')

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
