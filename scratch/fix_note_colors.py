import os

filepath = 'src/pages/NoteDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace input classNames
content = content.replace(
    'className="w-full text-base font-heading font-bold bg-background border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary"',
    'className="w-full text-base font-heading font-bold bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"'
)

content = content.replace(
    'className="w-full bg-background border border-border rounded-xl p-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary"',
    'className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono text-xs text-white focus:outline-none focus:border-primary"'
)

content = content.replace(
    'className="w-full bg-background border border-border rounded-xl p-4 font-mono text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"',
    'className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-white focus:outline-none focus:border-primary leading-relaxed"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
