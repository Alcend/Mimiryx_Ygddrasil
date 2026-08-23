import os

filepath = 'src/index.css'
with open(filepath, 'a', encoding='utf-8') as f:
    f.write("""
.page-break-line {
  break-before: column;
  opacity: 0;
  margin: 0;
  padding: 0;
}
""")
