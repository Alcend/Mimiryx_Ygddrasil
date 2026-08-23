import os

filepath = 'src/pages/TopicDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{topic.code} // {topic.category}", "{topic.code} // {topic.category.toUpperCase()} REALM")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
