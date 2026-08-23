import os

filepath = 'src/pages/TopicsPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Topic import
if "import { Topic } from '../types';" not in content:
    content = content.replace("import { resolveNoteTopic } from './NotesPage';", "import { resolveNoteTopic } from './NotesPage';\nimport { Topic } from '../types';")

# 2. Add updateTopic to useApp
if "addTopic, notes, labs" in content:
    content = content.replace("addTopic, notes, labs", "addTopic, updateTopic, notes, labs")

# 3. Add lucide imports
if "Search," in content:
    content = content.replace("Search,", "Search,\n  Edit3,\n  FolderTree,")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
