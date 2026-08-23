import re

with open('src/components/BookReader.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
if 'import remarkMath from' not in text:
    text = text.replace("import remarkGfm from 'remark-gfm';", "import remarkGfm from 'remark-gfm';\nimport remarkMath from 'remark-math';\nimport rehypeKatex from 'rehype-katex';")

# 2. Add Code Block Continuity Engine & replace simple split
old_split = r"const pages = note\.content\.split\(\/\\n\\n---\\n\\n\|\\\[PAGE_BREAK\\\]\/\);\n\s*const pagesCount = pages\.length;"

new_split = """  // --- CODE BLOCK CONTINUITY ENGINE ---
  const rawPages = note.content.split(/\\n\\n---\\n\\n|\\[PAGE_BREAK\\]/);
  let inCodeBlock = false;
  let currentLanguage = '';

  const pages = rawPages.map(page => {
    let newPage = page;
    if (inCodeBlock) {
      newPage = '```' + currentLanguage + '\\n' + newPage;
    }
    
    const lines = newPage.split('\\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) {
          currentLanguage = trimmed.slice(3).trim();
        }
      }
    }

    if (inCodeBlock) {
      newPage = newPage + '\\n```';
    }
    return newPage;
  });
  
  const pagesCount = pages.length;
  // ------------------------------------"""
text = re.sub(old_split, new_split, text)

# 3. Add Plugins
text = text.replace("remarkPlugins={[remarkGfm]}", "remarkPlugins={[remarkGfm, remarkMath]}\n                  rehypePlugins={[rehypeKatex]}")

# 4. Component updates
text = text.replace(
    'p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap" {...props} />',
    'p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap break-words" {...props} />'
)

# Insert the <a> tag mapping and input override right after 'blockquote'
new_mappings = """blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                    input: ({node, type, ...props}: any) => type === 'checkbox' ? <input type="checkbox" className="accent-primary mr-2" {...props} /> : <input {...props} />,"""
text = re.sub(r'blockquote: \(\{node, \.\.\.props\}\) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground bg-primary/5 py-1 pr-2 rounded-r" \{\.\.\.props\} />,', new_mappings, text)

# Update `code` blocks to ensure wrapping if needed
text = text.replace(
    ": <code className={`block p-3 rounded-xl border text-[11px] overflow-x-auto shadow-inner my-4 transition-all duration-300",
    ": <code className={`block p-3 rounded-xl border text-[11px] overflow-x-auto whitespace-pre break-words shadow-inner my-4 transition-all duration-300"
)
text = text.replace(
    "? <code className={`px-1.5 py-0.5 rounded text-[0.9em] transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30' : 'bg-primary/10 text-primary'}`} {...props} />",
    "? <code className={`px-1.5 py-0.5 rounded text-[0.9em] break-all transition-all duration-300 ${activeRecallMode ? 'bg-black text-transparent select-none hover:text-rose-400 hover:select-auto hover:bg-black/50 cursor-crosshair border border-rose-500/30' : 'bg-primary/10 text-primary'}`} {...props} />"
)

with open('src/components/BookReader.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
