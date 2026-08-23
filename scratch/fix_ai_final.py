import re

with open('src/utils/ai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Completely wipe out all backticks in the prompt section except the main ones
def clean_prompt(match):
    inner = match.group(1).replace('`', '')
    return 'return `\n' + inner + '`.trim();'

text = re.sub(r'return `\n(.*?)`\.trim\(\);', clean_prompt, text, flags=re.DOTALL)

with open('src/utils/ai.ts', 'w', encoding='utf-8') as f:
    f.write(text)
