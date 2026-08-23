import os

with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("TOPICS: 'mimiryx:topics',", "TOPICS: 'mimiryx:topics',\n  REALMS: 'mimiryx:realms',")

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
