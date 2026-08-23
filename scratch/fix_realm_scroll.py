import os

filepath = 'src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the scrollable container with a flex-wrap container
old_ui = '          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">'
new_ui = '          <div className="flex flex-wrap items-center gap-2 pb-2">'

if old_ui in content:
    content = content.replace(old_ui, new_ui)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully changed to flex-wrap!")
else:
    print("Could not find the scroll container line.")
