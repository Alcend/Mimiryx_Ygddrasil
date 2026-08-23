import os

filepath = 'src/index.css'
with open(filepath, 'rb') as f:
    content = f.read()

# Try to decode as utf-16 if it got corrupted, otherwise utf-8
try:
    if content.startswith(b'\xff\xfe'):
        # It's UTF-16 LE from Powershell
        text = content.decode('utf-16-le')
    else:
        text = content.decode('utf-8')
except:
    text = content.decode('utf-8', errors='ignore')

# Remove the broken echo output
text = text.replace(".book-flow { column-width: calc(100% - 2rem); column-gap: 3rem; height: calc(100vh - 350px); overflow-x: auto; overflow-y: hidden; word-break: break-word; }", "")
text = text.replace(".book-flow { column-width: calc(100% - 2rem); column-gap: 3rem; height: calc(100vh - 350px); overflow-x: auto; overflow-y: hidden; word-break: break-word; }\r\n", "")
text = text.replace("\x00", "") # Remove null bytes if any

book_flow_css = """
.book-flow {
  column-width: calc(100% - 1rem); /* Dynamic width of one full 'page' minus gap */
  column-gap: 3rem;
  height: calc(100vh - 360px);
  min-height: 400px;
  overflow-x: auto;
  overflow-y: hidden;
  word-break: break-word;
  padding-bottom: 1rem;
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text.strip() + "\n" + book_flow_css)
