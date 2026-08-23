import re
import os

# 1. Clean Dashboard.tsx
dash_file = 'src/pages/Dashboard.tsx'
with open(dash_file, 'r', encoding='utf-8') as f:
    dash_content = f.read()

# Remove duplicate activeSideTab
dash_content = re.sub(
    r"  const \[activeSideTab, setActiveSideTab\] = useState<'all' \| 'telemetry' \| 'analytics' \| 'logs'>\('all'\);\s*const \[activeSideTab, setActiveSideTab\] = useState<'all' \| 'telemetry' \| 'analytics' \| 'logs'>\('all'\);",
    "  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');",
    dash_content, flags=re.MULTILINE
)
# If it's still duplicated due to my bad replacement:
while "  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');\n  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');" in dash_content:
    dash_content = dash_content.replace(
        "  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');\n  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');",
        "  const [activeSideTab, setActiveSideTab] = useState<'all' | 'telemetry' | 'analytics' | 'logs'>('all');"
    )

with open(dash_file, 'w', encoding='utf-8') as f:
    f.write(dash_content)

# 2. Clean NotesPage and TopicDetailPage
def clean_chunk(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r"import\s*\{\s*chunkNoteIntoPages\s*\}\s*from\s*'../components/BookReader';\n?",
        "",
        content
    )
    content = re.sub(
        r"const pages = chunkNoteIntoPages\(note\.content, note\.title\);\s*const pageCount = pages\.length;",
        "const pageCount = Math.max(1, Math.ceil(note.content.split('---').length));",
        content
    )
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

clean_chunk('src/pages/NotesPage.tsx')
clean_chunk('src/pages/TopicDetailPage.tsx')

