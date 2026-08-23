import os

filepath = 'src/pages/NotesPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono"',
    'className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono"'
)
content = content.replace(
    'className="w-full bg-background border border-border rounded-xl p-2.5 text-sm font-heading font-bold text-foreground focus:outline-none focus:border-primary"',
    'className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm font-heading font-bold text-white focus:outline-none focus:border-primary"'
)
content = content.replace(
    'className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-primary font-mono leading-relaxed"',
    'className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary font-mono leading-relaxed"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
