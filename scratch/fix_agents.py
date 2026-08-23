import re

with open('AGENTS.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the broken block
text = re.sub(r'## 6\. UI Previews & Card Components.*', '', text, flags=re.DOTALL)

# Add the correct block
clean_rule = """## 6. UI Previews & Card Components
* Flipped Cards / Previews: When displaying a preview of a Note (e.g. flipping a 3D card on a dashboard), ALWAYS use the `note.summary` property. DO NOT attempt to paginate, parse, or display the full `note.content` on a dashboard card. Full content must be strictly reserved for dedicated reader pages (e.g. NoteDetailPage).
"""

text = text.strip() + '\n\n' + clean_rule

with open('AGENTS.md', 'w', encoding='utf-8') as f:
    f.write(text)
