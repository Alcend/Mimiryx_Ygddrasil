import re

with open('src/pages/NoteDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update imports
if 'getNoteFormatPrompt' not in text:
    text = text.replace("import { getNoteExpandPrompt, generateGeminiResponse } from '../utils/ai';", "import { getNoteExpandPrompt, getNoteFormatPrompt, generateGeminiResponse } from '../utils/ai';")

# 2. Rewrite handleAutoOrganize
old_organize = r"""  const handleAutoOrganize = async \(\) => \{
    if \(isFormatting\) return;
    sounds\.playClick\(\);
    setIsFormatting\(true\);

    // Simulate AI parsing/organizing delay
    await new Promise\(\(resolve\) => setTimeout\(resolve, 800\)\);

    let formatted = content;
    
    // 1\. Clean up excessive newlines
    formatted = formatted\.replace\(/\\n\{3,\}/g, '\\n\\n'\);
    
    // 2\. Fix headers missing a space \(e\.g\., ##Header -> ## Header\)
    formatted = formatted\.replace\(/^\(#\+\)\(\[\^#\\s\]\)/gm, '\$1 \$2'\);
    
    // 3\. Fix list items missing a space \(e\.g\., -item -> - item\)
    formatted = formatted\.replace\(/^\(\\s\*\[-\*\+\]\)\(\[\^\\s\*-\]\)/gm, '\$1 \$2'\);
    
    // 4\. Ensure space after blockquote
    formatted = formatted\.replace\(/^\(\\s\*>\)\(\[\^\\s>\]\)/gm, '\$1 \$2'\);
    
    // 5\. Auto-space around code blocks
    formatted = formatted\.replace\(/\(\[\^\\n\]\)\\n\(```\[a-z\]\*\)\\n/g, '\$1\\n\\n\$2\\n'\);
    formatted = formatted\.replace\(/\\n\(```\)\\n\(\[\^\\n\]\)/g, '\\n\$1\\n\\n\$2'\);

    // 6\. Trim trailing spaces on each line
    formatted = formatted\.split\('\\n'\)\.map\(line => line\.trimEnd\(\)\)\.join\('\\n'\)\.trim\(\);

    setContent\(formatted\);
    setIsFormatting\(false\);
    sounds\.playSuccess\(\);
  \};"""

new_organize = """  const handleAutoOrganize = async () => {
    if (isFormatting) return;
    sounds.playClick();
    
    if (!geminiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsFormatting(true);
    try {
      const prompt = getNoteFormatPrompt(title, content);
      let formattedText = await generateGeminiResponse(prompt, geminiKey);
      
      // Cleanup any accidental global markdown block wrapping from AI
      formattedText = formattedText.replace(/^```markdown\\n/i, '').replace(/\\n```$/i, '').trim();
      
      setContent(formattedText);
      sounds.playSuccess();
    } catch (error: any) {
      sounds.playError();
      alert(`Auto-Format Failed: ${error.message}`);
    } finally {
      setIsFormatting(false);
    }
  };"""

text = re.sub(old_organize, new_organize, text)

with open('src/pages/NoteDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
