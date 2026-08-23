import os
import re

filepath = 'src/pages/NotesPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to safely inject className="bg-[#0b101a] text-white" into every <option> tag.
# Let's find `<option ` and `<option>` and replace them.

content = re.sub(r'<option\b([^>]*)>', r'<option className="bg-[#0b101a] text-white"\1>', content)

# But wait, some might already have a className. Let's assume none do based on the output.
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
