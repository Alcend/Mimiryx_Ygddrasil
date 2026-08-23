import os
import re

filepath = 'src/utils/aiOrganizer.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the aggressive single-word matching algorithm
old_algo = """    // Check direct topic name match
    if (textLower.includes(tNameLower)) score += 40;
    if (tNameLower.split(' ').some((w) => w.length > 3 && textLower.includes(w))) score += 20;

    // Check taxonomy matching this topic's name or category
    Object.entries(DOMAIN_TAXONOMY).forEach(([domainName, dom]) => {
      if (
        domainName.toLowerCase().includes(tNameLower) ||
        tNameLower.includes(domainName.toLowerCase()) ||
        dom.category.toLowerCase().includes(tCatLower)
      ) {
        dom.keywords.forEach((kw) => {
          if (textLower.includes(kw.toLowerCase())) score += 8;
        });
      }
    });

    if (score > bestExistingScore) {
      bestExistingScore = score;
      bestExistingTopic = t;
    }
  });

  // If match score is high enough, assign to existing topic
  if (bestExistingTopic && bestExistingScore >= 16) {"""

new_algo = """    // Check direct topic name match (exact phrase)
    if (textLower.includes(tNameLower)) score += 40;
    
    // Check individual significant words with word boundaries (to avoid "infra" matching "infrastructure")
    const words = tNameLower.split(' ').filter(w => w.length > 4);
    let matchedWords = 0;
    words.forEach(w => {
      if (new RegExp(`\\\\b${w}\\\\b`, 'i').test(textLower)) {
        matchedWords++;
      }
    });
    if (matchedWords > 0) {
      score += matchedWords * 10;
    }

    // Check taxonomy matching this topic's name or category
    let taxonomyMatched = false;
    Object.entries(DOMAIN_TAXONOMY).forEach(([domainName, dom]) => {
      if (
        domainName.toLowerCase().includes(tNameLower) ||
        tNameLower.includes(domainName.toLowerCase()) ||
        (tCatLower && dom.category.toLowerCase().includes(tCatLower))
      ) {
        taxonomyMatched = true;
        let keywordHits = 0;
        dom.keywords.forEach((kw) => {
          if (new RegExp(`\\\\b${kw.toLowerCase()}\\\\b`, 'i').test(textLower)) {
            keywordHits++;
          }
        });
        score += (keywordHits * 5); // 5 points per keyword
      }
    });

    if (score > bestExistingScore) {
      bestExistingScore = score;
      bestExistingTopic = t;
    }
  });

  // Threshold increased to 25 to prevent aggressive false positives
  if (bestExistingTopic && bestExistingScore >= 25) {"""

if old_algo in content:
    content = content.replace(old_algo, new_algo)
else:
    print("Could not find algo")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
