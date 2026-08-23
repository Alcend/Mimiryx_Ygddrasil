/**
 * aiOrganizer.ts
 *
 * Intelligent AI Agent for organizing imported files, notes, and the Yggdrasil World Tree.
 * Analyzes document contents, classifies domain concepts, automatically maps notes
 * to existing topics, or creates new topic branches when new domains are discovered.
 */

import { Topic, Note, NoteDifficulty, NoteStatus } from '../types';

export interface ParsedDocument {
  filename: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  difficulty: NoteDifficulty;
  suggestedTopicName?: string;
  suggestedCategory?: string;
  suggestedColor?: string;
  matchedTopicId?: string;
  isNewTopic: boolean;
  confidence: number;
}

export interface AIOrganizeResult {
  documents: ParsedDocument[];
  newTopicsToCreate: Array<{
    name: string;
    category: string;
    color: string;
    description: string;
    code: string;
  }>;
  logs: string[];
}

// Domain keyword taxonomies for semantic classification
const DOMAIN_TAXONOMY: Record<string, { category: string; color: string; keywords: string[]; code: string }> = {
  'Core Infrastructure': {
    category: 'Core Infrastructure',
    color: '#00e0ff',
    code: 'INFRA',
    keywords: ['kernel', 'linux', 'ebpf', 'syscall', 'cgroup', 'memory', 'cpu', 'posix', 'driver', 'ipc', 'file system', 'virtual memory', 'paging', 'io_uring'],
  },
  'Distributed Systems': {
    category: 'Distributed Systems',
    color: '#a855f7',
    code: 'DIST',
    keywords: ['raft', 'paxos', 'consensus', 'cap theorem', 'grpc', 'rpc', 'replication', 'partition', 'sharding', 'vector clock', 'distributed', 'gossip', 'leader election'],
  },
  'Machine Intelligence': {
    category: 'Machine Intelligence',
    color: '#00ff88',
    code: 'AI',
    keywords: ['neural', 'transformer', 'llm', 'attention', 'backprop', 'gradient', 'model', 'embeddings', 'vector database', 'rag', 'inference', 'pytorch', 'tensor', 'gpu', 'deep learning'],
  },
  'Cloud Engineering': {
    category: 'Cloud Engineering',
    color: '#ffb020',
    code: 'CLOUD',
    keywords: ['kubernetes', 'k8s', 'docker', 'container', 'terraform', 'aws', 'cloud', 'envoy', 'service mesh', 'ingress', 'helm', 'ci/cd', 'devops', 'serverless', 'microservice'],
  },
  'Cyber Defense & Cryptography': {
    category: 'Cyber Defense',
    color: '#ec4899',
    code: 'SEC',
    keywords: ['crypto', 'encryption', 'tls', 'handshake', 'zero trust', 'zero-knowledge', 'snark', 'stark', 'sha', 'aes', 'rsa', 'vulnerability', 'auth', 'oauth', 'jwt', 'security', 'firewall'],
  },
  'Quantum Computing': {
    category: 'Advanced Computing',
    color: '#38bdf8',
    code: 'QUANT',
    keywords: ['qubit', 'quantum', 'superposition', 'entanglement', 'qiskit', 'gate', 'hadamard', 'decoherence', 'quantum circuit', 'shor algorithm'],
  },
  'Database Internals': {
    category: 'Data Architecture',
    color: '#f59e0b',
    code: 'DB',
    keywords: ['b-tree', 'lsm-tree', 'wal', 'write ahead log', 'sql', 'acid', 'transaction', 'isolation level', 'mvcc', 'btree', 'indexing', 'query optimizer', 'postgres', 'redis'],
  },
  'Frontend & UI Engineering': {
    category: 'Client Systems',
    color: '#06b6d4',
    code: 'UI',
    keywords: ['react', 'vue', 'dom', 'css', 'tailwind', 'javascript', 'typescript', 'canvas', 'webgl', 'threejs', 'browser', 'rendering', 'vdom', 'ui/ux'],
  },
  'Embedded & Systems Programming': {
    category: 'Systems Engineering',
    color: '#eab308',
    code: 'SYS',
    keywords: ['rust', 'c++', 'c language', 'pointer', 'allocator', 'assembly', 'arm', 'risc-v', 'embedded', 'bare metal', 'firmware', 'concurrency', 'mutex'],
  },
};

/**
 * Extract clean text and metadata from raw file contents
 */
export async function parseRawFile(file: File): Promise<{ title: string; content: string; filename: string }> {
  const filename = file.name;
  let title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  // Read text content
  let text = '';
  try {
    text = await file.text();
  } catch (err) {
    text = `Imported binary/document file: ${filename}\nSize: ${(file.size / 1024).toFixed(1)} KB`;
  }

  // If text is Markdown or text, try to extract first H1 or title and format subtopic page breaks
  if (text) {
    const h1Match = text.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].trim();
    }

    // If long document with multiple ## subtopics and no pagebreaks, insert pagebreaks between subtopics
    if (text.length > 1000 && !text.includes('\n---\n') && !text.includes('<!-- pagebreak -->')) {
      text = text.replace(/\n(##\s+[^\n]+)/g, '\n\n---\n\n$1');
    }
  }

  return { title, content: text || `Content from ${filename}`, filename };
}

/**
 * AI Document Classifier: analyzes content, tags, and calculates topic affinity
 */
export function classifyDocument(
  doc: { title: string; content: string; filename: string },
  existingTopics: Topic[]
): ParsedDocument {
  const textLower = (doc.title + ' ' + doc.content + ' ' + doc.filename).toLowerCase();

  // Extract tags (words that appear frequently or technical keywords)
  const extractedTags: string[] = [];
  Object.values(DOMAIN_TAXONOMY).forEach((dom) => {
    dom.keywords.forEach((kw) => {
      if (textLower.includes(kw.toLowerCase()) && !extractedTags.includes(kw)) {
        extractedTags.push(kw);
      }
    });
  });

  // Determine difficulty
  let difficulty: NoteDifficulty = 'intermediate';
  if (textLower.includes('introduction') || textLower.includes('basic') || textLower.includes('getting started') || textLower.includes('overview')) {
    difficulty = 'beginner';
  } else if (textLower.includes('advanced') || textLower.includes('internals') || textLower.includes('kernel') || textLower.includes('consensus') || textLower.includes('zero-knowledge') || textLower.includes('expert')) {
    difficulty = 'advanced';
  }

  // Generate concise summary (first 180 chars or first non-header paragraph)
  let summary = '';
  const lines = doc.content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  if (lines.length > 0) {
    summary = lines[0].slice(0, 180).trim();
    if (lines[0].length > 180) summary += '...';
  }
  if (!summary) {
    summary = `Knowledge record analyzing ${doc.title} concepts and implementation details.`;
  }

  // 1. Try matching with existing topics
  let bestExistingTopic: Topic | null = null;
  let bestExistingScore = 0;

  existingTopics.forEach((t) => {
    let score = 0;
    const tNameLower = t.name.toLowerCase();
    const tDescLower = (t.description || '').toLowerCase();
    const tCatLower = (t.category || '').toLowerCase();

    // Check direct topic name match (exact phrase)
    if (textLower.includes(tNameLower)) score += 40;
    
    // Check individual significant words with word boundaries (to avoid "infra" matching "infrastructure")
    const words = tNameLower.split(' ').filter(w => w.length > 4);
    let matchedWords = 0;
    words.forEach(w => {
      if (new RegExp(`\\b${w}\\b`, 'i').test(textLower)) {
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
          if (new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i').test(textLower)) {
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
  if (bestExistingTopic && bestExistingScore >= 25) {
    const conf = Math.min(99, Math.round(50 + bestExistingScore * 1.5));
    return {
      filename: doc.filename,
      title: doc.title,
      summary,
      content: doc.content,
      tags: extractedTags.slice(0, 5),
      difficulty,
      matchedTopicId: (bestExistingTopic as Topic).id,
      suggestedTopicName: (bestExistingTopic as Topic).name,
      suggestedCategory: (bestExistingTopic as Topic).category,
      isNewTopic: false,
      confidence: conf,
    };
  }

  // 2. No solid existing topic match -> Return as "Needs Review"
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
}

/**
 * Universal JSON Knowledge Extractor:
 * Fully extracts EVERY note, topic, chapter, dictionary entry, and nested item
 * from any JSON structure (arrays, objects with notes arrays, topic hierarchies,
 * key-value dictionaries, JSONL, and Mimiryx vaults).
 */
export function extractAllItemsFromJSON(
  json: any,
  sourceFilename: string
): Array<{
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  difficulty?: NoteDifficulty;
  topicHint?: string;
  categoryHint?: string;
  status?: NoteStatus;
}> {
  const extracted: Array<{
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    difficulty?: NoteDifficulty;
    topicHint?: string;
    categoryHint?: string;
    status?: NoteStatus;
  }> = [];

  if (!json) return extracted;

  // Helper to extract clean string content from any object or primitive
  const formatContent = (val: any): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
      if (val.every((item) => typeof item === 'string')) {
        return val.map((s) => `- ${s}`).join('\n');
      }
      return val.map((item, idx) => `### Item ${idx + 1}\n${formatContent(item)}`).join('\n\n');
    }
    if (typeof val === 'object' && val !== null) {
      return Object.entries(val)
        .map(([k, v]) => `**${k.replace(/[-_]/g, ' ')}:** ${typeof v === 'object' ? '\n' + formatContent(v) : v}`)
        .join('\n\n');
    }
    return '';
  };

  // Helper to process a single note-like object
  const processSingleObject = (obj: any, inheritedTopic?: string, inheritedCategory?: string) => {
    if (!obj || typeof obj !== 'object') return;

    // Check if this object is a Topic with child notes/subtopics
    const subNotes =
      obj.notes ||
      obj.items ||
      obj.subtopics ||
      obj.children ||
      obj.records ||
      obj.cards ||
      obj.entries ||
      obj.pages;

    const currentTopicHint =
      obj.topic ||
      obj.topicName ||
      obj.topicTitle ||
      obj.category ||
      inheritedTopic ||
      (Array.isArray(subNotes) && (obj.title || obj.name) ? (obj.title || obj.name) : undefined);

    const currentCategoryHint =
      obj.category ||
      obj.group ||
      obj.domain ||
      inheritedCategory;

    // If it has children array, recurse on children first
    if (Array.isArray(subNotes) && subNotes.length > 0) {
      subNotes.forEach((child: any) => {
        if (typeof child === 'string') {
          extracted.push({
            title: child.slice(0, 45),
            content: child,
            summary: child.slice(0, 160),
            topicHint: currentTopicHint,
            categoryHint: currentCategoryHint,
          });
        } else {
          processSingleObject(child, currentTopicHint, currentCategoryHint);
        }
      });

      // If the parent object itself has distinct content beyond just being a container, also save it
      if (obj.content || obj.body || obj.text || obj.description) {
        const title = obj.title || obj.name || obj.heading || `${sourceFilename.replace(/\.json$/i, '')} Overview`;
        const content = formatContent(obj.content || obj.body || obj.text || obj.description);
        const tags = Array.isArray(obj.tags) ? obj.tags : Array.isArray(obj.keywords) ? obj.keywords : [];
        extracted.push({
          title: String(title).trim(),
          content,
          summary: obj.summary ? String(obj.summary) : content.slice(0, 160),
          tags,
          difficulty: obj.difficulty === 'beginner' || obj.difficulty === 'advanced' ? obj.difficulty : 'intermediate',
          topicHint: currentTopicHint,
          categoryHint: currentCategoryHint,
          status: obj.status === 'mastered' || obj.status === 'reviewing' ? obj.status : 'learning',
        });
      }
      return;
    }

    // Standard note object extraction
    const rawTitle =
      obj.title ||
      obj.name ||
      obj.heading ||
      obj.subject ||
      obj.concept ||
      obj.question ||
      obj.term ||
      obj.id;

    const rawContent =
      obj.content ||
      obj.body ||
      obj.text ||
      obj.description ||
      obj.markdown ||
      obj.notes ||
      obj.details ||
      obj.answer ||
      obj.summary ||
      formatContent(obj);

    if (rawTitle || rawContent) {
      const title = rawTitle ? String(rawTitle).trim() : `${sourceFilename.replace(/\.json$/i, '')} Note ${extracted.length + 1}`;
      const content = formatContent(rawContent || title);
      const summary = obj.summary ? String(obj.summary) : content.slice(0, 160);
      const tags = Array.isArray(obj.tags) ? obj.tags : Array.isArray(obj.keywords) ? obj.keywords : [];

      extracted.push({
        title,
        content,
        summary,
        tags,
        difficulty: obj.difficulty === 'beginner' || obj.difficulty === 'advanced' ? obj.difficulty : 'intermediate',
        topicHint: currentTopicHint,
        categoryHint: currentCategoryHint,
        status: obj.status === 'mastered' || obj.status === 'reviewing' ? obj.status : 'learning',
      });
    }
  };

  // Case A: Root is an Array
  if (Array.isArray(json)) {
    json.forEach((item) => {
      if (typeof item === 'string') {
        extracted.push({
          title: item.slice(0, 45),
          content: item,
          summary: item.slice(0, 160),
        });
      } else if (typeof item === 'object') {
        processSingleObject(item);
      }
    });
    return extracted;
  }

  // Case B: Root is an Object
  if (typeof json === 'object' && json !== null) {
    // 1. Check for standard container arrays
    const containerKeys = [
      'notes',
      'items',
      'data',
      'records',
      'documents',
      'topics',
      'entries',
      'cards',
      'results',
      'articles',
      'posts',
      'pages',
      'subtopics',
      'chapters',
    ];

    let foundContainer = false;
    for (const key of containerKeys) {
      if (Array.isArray(json[key]) && json[key].length > 0) {
        foundContainer = true;
        json[key].forEach((child: any) => processSingleObject(child, json.topic || json.category || json.name));
      }
    }

    if (foundContainer) return extracted;

    // 2. Check if object keys represent topics or note titles (Key-Value map)
    const entries = Object.entries(json);
    if (entries.length > 0) {
      entries.forEach(([key, val]) => {
        if (Array.isArray(val)) {
          // Key is topic name, val is array of notes
          val.forEach((subItem) => processSingleObject(subItem, key));
        } else if (typeof val === 'object' && val !== null) {
          processSingleObject({ title: key, ...val }, key);
        } else {
          // Key is title, val is string content
          extracted.push({
            title: key,
            content: formatContent(val),
            summary: formatContent(val).slice(0, 160),
          });
        }
      });
    }
  }

  return extracted;
}

/**
 * Execute AI Auto-Organization over a list of raw files
 */
export async function organizeImportedFiles(
  files: File[],
  existingTopics: Topic[]
): Promise<AIOrganizeResult> {
  const documents: ParsedDocument[] = [];
  const logs: string[] = [];
  const newTopicsMap = new Map<string, { name: string; category: string; color: string; description: string; code: string }>();

  logs.push(`[AI CORE] Ingesting ${files.length} knowledge source files...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    logs.push(`[SCAN] Parsing "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`);

    // ── Universal JSON Ingestion ──
    if (file.name.endsWith('.json')) {
      try {
        const text = await file.text();
        let parsedJson: any = null;

        // Try standard JSON parse
        try {
          parsedJson = JSON.parse(text);
        } catch {
          // If JSON parse fails, try JSONL (JSON Lines)
          const lines = text.split('\n').filter((l) => l.trim().startsWith('{'));
          if (lines.length > 0) {
            parsedJson = lines.map((l) => {
              try {
                return JSON.parse(l);
              } catch {
                return null;
              }
            }).filter(Boolean);
          }
        }

        if (parsedJson) {
          const rawExtracted = extractAllItemsFromJSON(parsedJson, file.name);

          if (rawExtracted.length > 0) {
            logs.push(`[JSON SUCCESS] Extracted ${rawExtracted.length} total records from "${file.name}"!`);

            rawExtracted.forEach((rawItem) => {
              const classified = classifyDocument(
                {
                  title: rawItem.title,
                  content: rawItem.content,
                  filename: file.name,
                },
                existingTopics
              );

              // If the JSON item already explicitly specified a topic hint, respect it!
              if (rawItem.topicHint) {
                const matchedExisting = existingTopics.find(
                  (t) => t.name.toLowerCase() === rawItem.topicHint!.toLowerCase()
                );
                if (matchedExisting) {
                  classified.matchedTopicId = matchedExisting.id;
                  classified.suggestedTopicName = matchedExisting.name;
                  classified.suggestedCategory = matchedExisting.category;
                  classified.isNewTopic = false;
                  classified.confidence = 100;
                } else {
                  classified.isNewTopic = true;
                  classified.suggestedTopicName = rawItem.topicHint;
                  if (rawItem.categoryHint) classified.suggestedCategory = rawItem.categoryHint;
                  classified.confidence = 95;
                }
              }

              if (rawItem.tags && rawItem.tags.length > 0) {
                classified.tags = Array.from(new Set([...classified.tags, ...rawItem.tags])).slice(0, 6);
              }

              documents.push(classified);

              if (!classified.matchedTopicId) {
                logs.push(`[NEEDS REVIEW] "${classified.title}" scored below threshold. Added to Review Queue.`);
              }
            });

            continue; // Finished processing this JSON file
          }
        }
      } catch (err) {
        logs.push(`[WARN] JSON parsing error in "${file.name}", falling back to text extractor.`);
      }
    }

    // ── Non-JSON Files (Markdown, Text, Documents, Code) ──
    const raw = await parseRawFile(file);
    const parsed = classifyDocument(raw, existingTopics);
    documents.push(parsed);

    if (parsed.isNewTopic && parsed.suggestedTopicName) {
      if (!newTopicsMap.has(parsed.suggestedTopicName)) {
        newTopicsMap.set(parsed.suggestedTopicName, {
          name: parsed.suggestedTopicName,
          category: parsed.suggestedCategory || 'General Knowledge',
          color: parsed.suggestedColor || '#00e0ff',
          description: `Neural cluster synthesized for ${parsed.suggestedTopicName} knowledge records.`,
          code: parsed.suggestedTopicName.slice(0, 4).toUpperCase(),
        });
        logs.push(`[NEW BRANCH] Discovered new domain -> Created Topic "${parsed.suggestedTopicName}" [${parsed.suggestedCategory}]`);
      }
    } else {
      logs.push(`[TOPIC MATCH] "${parsed.title}" -> Assigned to "${parsed.suggestedTopicName}" (${parsed.confidence}% confidence)`);
    }
  }

  logs.push(`[AI SUCCESS] Completed organization: ${documents.length} total records ready, ${newTopicsMap.size} new branches synthesized.`);

  return {
    documents,
    newTopicsToCreate: Array.from(newTopicsMap.values()),
    logs,
  };
}

/**
 * Generate Vault Export File
 */
export function exportVaultJSON(data: {
  topics: Topic[];
  notes: Note[];
  labs: any[];
  boardCards: any[];
}) {
  const exportPayload = {
    mimiryx_vault: true,
    version: '2.0',
    exportedAt: new Date().toISOString(),
    stats: {
      totalTopics: data.topics.length,
      totalNotes: data.notes.length,
      totalLabs: data.labs.length,
    },
    topics: data.topics,
    notes: data.notes,
    labs: data.labs,
    boardCards: data.boardCards,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mimiryx-knowledge-vault-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate Markdown Notes Bundle Export
 */
export function exportNotesMarkdown(notes: Note[], topics: Topic[]) {
  const topicMap = new Map(topics.map((t) => [t.id, t.name]));
  
  let combinedMd = `# MIMIRYX KNOWLEDGE VAULT EXPORT\n`;
  combinedMd += `Export Date: ${new Date().toLocaleString()}\n`;
  combinedMd += `Total Notes: ${notes.length}\n\n---\n\n`;

  notes.forEach((n, idx) => {
    const topicName = topicMap.get(n.topicId) || 'Unassigned Topic';
    combinedMd += `## [${idx + 1}] ${n.title}\n`;
    combinedMd += `**Topic:** ${topicName} | **Difficulty:** ${n.difficulty.toUpperCase()} | **Status:** ${n.status.toUpperCase()}\n`;
    combinedMd += `**Tags:** ${n.tags.join(', ') || 'None'}\n\n`;
    combinedMd += `### Summary\n${n.summary}\n\n`;
    combinedMd += `### Content\n${n.content}\n\n---\n\n`;
  });

  const blob = new Blob([combinedMd], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mimiryx-notes-bundle-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
