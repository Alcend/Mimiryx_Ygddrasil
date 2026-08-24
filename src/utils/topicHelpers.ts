import { Note, Topic } from '../types';

export function resolveNoteTopic(note: Partial<Note>, topics: Topic[]): Topic | undefined {
  if (!note) return undefined;
  const tid = (note.topicId || '').trim().toLowerCase();

  // 1. Direct match by ID, Name, Code, or Category
  const direct = topics.find(
    (t) =>
      t.id.toLowerCase() === tid ||
      t.name.trim().toLowerCase() === tid ||
      (t.code && t.code.trim().toLowerCase() === tid) ||
      (t.category && t.category.trim().toLowerCase() === tid)
  );
  if (direct) return direct;

  // 2. Fuzzy slug match (e.g. 'topic-bifrost' vs 'bifrost')
  const slugMatch = topics.find((t) => {
    const tSlug = t.id.replace(/^topic-/, '').toLowerCase();
    const tidSlug = tid.replace(/^topic-/, '').toLowerCase();
    return tSlug && tidSlug && (tSlug === tidSlug || tidSlug.includes(tSlug) || tSlug.includes(tidSlug));
  });
  if (slugMatch) return slugMatch;

  // 3. Fallback match via tags
  if (Array.isArray(note.tags) && note.tags.length > 0) {
    for (const tag of note.tags) {
      const tLower = (tag || '').toLowerCase();
      const tagMatch = topics.find(
        (t) =>
          t.name.toLowerCase().includes(tLower) ||
          (t.category && t.category.toLowerCase().includes(tLower))
      );
      if (tagMatch) return tagMatch;
    }
  }

  return topics[0];
}
