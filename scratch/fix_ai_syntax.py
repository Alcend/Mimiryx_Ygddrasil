import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Just strip out backticks on that line completely
text = re.sub(r'syntax `!\[Alt Text\]\(URL\)` and place', r'syntax ![Alt Text](URL) and place', text)

# Just in case they got stripped to !\[Alt Text\]\(URL\)
text = text.replace('syntax ![Alt Text](URL) and place', 'syntax ![Alt Text](URL) and place')

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
