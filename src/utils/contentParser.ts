export const stripFrontmatterAndTitle = (content: string, title: string): string => {
  if (!content) return '';

  let cleanedContent = content;

  // 1. Strip YAML Frontmatter if it exists at the start of the document
  const frontmatterRegex = /^\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/;
  cleanedContent = cleanedContent.replace(frontmatterRegex, '');

  // 2. Check if the first remaining heading matches the note's title.
  // We need to trim leading whitespace first.
  cleanedContent = cleanedContent.trimStart();

  // Match a markdown heading (e.g., # Title, ## Title) at the very beginning of the string.
  const headingRegex = /^(#{1,6})\s+([^\r\n]+)(?:\r?\n|$)/;
  
  const match = cleanedContent.match(headingRegex);
  if (match) {
    const headingText = match[2].trim();
    // Use case-insensitive exact match
    if (headingText.toLowerCase() === title.trim().toLowerCase()) {
      // Strip the heading and following newline(s)
      cleanedContent = cleanedContent.substring(match[0].length).trimStart();
    }
  }

  return cleanedContent;
};
