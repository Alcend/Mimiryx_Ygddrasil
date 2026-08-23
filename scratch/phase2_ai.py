import re

with open('src/utils/aiOrganizer.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the automatic "isNewTopic" pushing to newTopicsMap
# In `organizeImportedFiles`, look for:
old_map_block = r"""      if \(parsed\.isNewTopic && parsed\.suggestedTopicName\) \{
        if \(!newTopicsMap\.has\(parsed\.suggestedTopicName\)\) \{
          newTopicsMap\.set\(parsed\.suggestedTopicName, \{
            name: parsed\.suggestedTopicName,
            category: parsed\.suggestedCategory \|\| 'General Knowledge',
            color: parsed\.suggestedColor \|\| '#00e0ff',
            description: `Neural cluster synthesized for \$\{parsed\.suggestedTopicName\} knowledge records\.`,
            code: parsed\.suggestedTopicName\.slice\(0, 4\)\.toUpperCase\(\),
          \}\);
          logs\.push\(`\[NEW BRANCH\] Discovered new domain -> Created Topic "\$\{parsed\.suggestedTopicName\}" \[\$\{parsed\.suggestedCategory\}\]`\);
        \}
      \} else \{
        logs\.push\(`\[TOPIC MATCH\] "\$\{parsed\.title\}" -> Assigned to "\$\{parsed\.suggestedTopicName\}" \(\$\{parsed\.confidence\}% confidence\)`\);
      \}"""

new_map_block = """      if (parsed.matchedTopicId) {
        logs.push(`[TOPIC MATCH] "${parsed.title}" -> Assigned to "${parsed.suggestedTopicName}" (${parsed.confidence}% confidence)`);
      } else {
        logs.push(`[NEEDS REVIEW] "${parsed.title}" scored below threshold. Added to Review Queue.`);
      }"""

text = re.sub(old_map_block, new_map_block, text)

# For JSON ingestion inside organizeImportedFiles:
old_json_map_block = r"""              if \(classified\.isNewTopic && classified\.suggestedTopicName\) \{
                if \(!newTopicsMap\.has\(classified\.suggestedTopicName\)\) \{
                  newTopicsMap\.set\(classified\.suggestedTopicName, \{
                    name: classified\.suggestedTopicName,
                    category: classified\.suggestedCategory \|\| 'General Knowledge',
                    color: classified\.suggestedColor \|\| '#00e0ff',
                    description: `Neural cluster synthesized for \$\{classified\.suggestedTopicName\} knowledge records\.`,
                    code: classified\.suggestedTopicName\.slice\(0, 4\)\.toUpperCase\(\),
                  \}\);
                  logs\.push\(`\[NEW BRANCH\] Discovered domain -> Created Topic "\$\{classified\.suggestedTopicName\}" \[\$\{classified\.suggestedCategory\}\]`\);
                \}
              \}"""

new_json_map_block = """              if (!classified.matchedTopicId) {
                logs.push(`[NEEDS REVIEW] "${classified.title}" scored below threshold. Added to Review Queue.`);
              }"""

text = re.sub(old_json_map_block, new_json_map_block, text)

# Change classifyDocument to return null for matchedTopicId when score < 25
old_classify_end = r"""  // 2\. No solid existing topic match -> Check taxonomy for creating a NEW topic branch
  let bestTaxonomyName = 'General Engineering';
  let bestTaxonomyData = \{ category: 'General Knowledge', color: '#00e0ff', code: 'GEN' \};
  let bestTaxScore = 0;

  Object\.entries\(DOMAIN_TAXONOMY\)\.forEach\(\(\[domName, data\]\) => \{
    let score = 0;
    data\.keywords\.forEach\(\(kw\) => \{
      if \(textLower\.includes\(kw\.toLowerCase\(\)\)\) score \+= 10;
    \}\);
    if \(score > bestTaxScore\) \{
      bestTaxScore = score;
      bestTaxonomyName = domName;
      bestTaxonomyData = data;
    \}
  \}\);

  // If filename or title is strong, use it as new topic name
  let newTopicName = bestTaxScore >= 10 \? bestTaxonomyName : doc\.title;
  if \(newTopicName\.length > 35\) newTopicName = newTopicName\.slice\(0, 35\);

  return \{
    filename: doc\.filename,
    title: doc\.title,
    summary,
    content: doc\.content,
    tags: extractedTags\.slice\(0, 5\),
    difficulty,
    suggestedTopicName: newTopicName,
    suggestedCategory: bestTaxonomyData\.category,
    suggestedColor: bestTaxonomyData\.color,
    isNewTopic: true,
    confidence: bestTaxScore >= 10 \? 92 : 75,
  \};
\}"""

new_classify_end = """  // 2. No solid existing topic match -> Return as "Needs Review"
  // We do NOT auto-create a topic here. The UI Review Queue will handle it.
  let bestTaxonomyName = 'General Engineering';
  let bestTaxScore = 0;

  Object.entries(DOMAIN_TAXONOMY).forEach(([domName, data]) => {
    let score = 0;
    data.keywords.forEach((kw) => {
      if (textLower.includes(kw.toLowerCase())) score += 10;
    });
    if (score > bestTaxScore) {
      bestTaxScore = score;
      bestTaxonomyName = domName;
    }
  });

  return {
    filename: doc.filename,
    title: doc.title,
    summary,
    content: doc.content,
    tags: extractedTags.slice(0, 5),
    difficulty,
    suggestedTopicName: bestTaxScore >= 10 ? bestTaxonomyName : doc.title,
    isNewTopic: true,
    matchedTopicId: undefined, // Explicitly undefined to trigger Review Queue
    confidence: bestTaxScore >= 10 ? 40 : 10, // Very low confidence
  };
}"""

text = re.sub(old_classify_end, new_classify_end, text)

with open('src/utils/aiOrganizer.ts', 'w', encoding='utf-8') as f:
    f.write(text)
