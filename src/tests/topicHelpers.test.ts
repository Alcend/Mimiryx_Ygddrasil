import { describe, it, expect } from 'vitest';
import { resolveNoteTopic } from '../utils/topicHelpers';
import { Topic, Note } from '../types';
import * as aiConfig from '../utils/aiConfig';

const mockTopics: Topic[] = [
  {
    id: 'topic-networking',
    name: 'Networking Fundamentals',
    category: 'Infrastructure',
    code: 'NET101',
    description: 'Core TCP/IP and routing concepts',
    color: '#00f0ff',
    icon: 'Network',
    order: 1
  },
  {
    id: 'topic-linux',
    name: 'Linux Kernel & System Administration',
    category: 'Operating Systems',
    code: 'LNX201',
    description: 'Linux systems, eBPF, and bash',
    color: '#00ff88',
    icon: 'Terminal',
    order: 2
  },
  {
    id: 'topic-cloud',
    name: 'Cloud Computing',
    category: 'Cloud',
    code: 'CLD301',
    description: 'AWS and GCP architecture',
    color: '#9d00ff',
    icon: 'Cloud',
    order: 3
  }
];

describe('resolveNoteTopic', () => {
  it('should return undefined if note is undefined or null', () => {
    expect(resolveNoteTopic(undefined as any, mockTopics)).toBeUndefined();
    expect(resolveNoteTopic(null as any, mockTopics)).toBeUndefined();
  });

  it('should match directly by topic ID', () => {
    const note: Partial<Note> = { topicId: 'topic-linux', title: 'Kernel Modules' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-linux');
  });

  it('should match directly by topic name (case-insensitive)', () => {
    const note: Partial<Note> = { topicId: 'networking fundamentals', title: 'OSI Model' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-networking');
  });

  it('should match directly by topic code', () => {
    const note: Partial<Note> = { topicId: 'CLD301', title: 'S3 Storage' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-cloud');
  });

  it('should match directly by topic category', () => {
    const note: Partial<Note> = { topicId: 'Operating Systems', title: 'Process Scheduling' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-linux');
  });

  it('should match by fuzzy slug without prefix (e.g. "networking" vs "topic-networking")', () => {
    const note: Partial<Note> = { topicId: 'networking', title: 'Subnetting Guide' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-networking');
  });

  it('should fallback to tag-based match when topicId does not match (matching topic name or category)', () => {
    const note: Partial<Note> = { topicId: 'unknown-id-123', tags: ['Infrastructure', 'routing'], title: 'BGP Peering' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('topic-networking');
  });

  it('should fallback to topics[0] when no ID, name, slug, or tag matches', () => {
    const note: Partial<Note> = { topicId: 'completely-random', tags: ['unrelated'], title: 'Random Musings' };
    const resolved = resolveNoteTopic(note, mockTopics);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe(mockTopics[0].id);
  });
});

describe('aiConfig import safety', () => {
  it('should export GEMINI_MODELS and configuration helpers without startup side-effects', () => {
    expect(aiConfig.GEMINI_MODELS).toBeDefined();
    expect(aiConfig.GEMINI_API_VERSION).toBe('v1beta');
    expect(typeof aiConfig.checkGeminiConfiguration).toBe('function');
    expect(typeof aiConfig.validateGeminiModel).toBe('function');
  });
});
