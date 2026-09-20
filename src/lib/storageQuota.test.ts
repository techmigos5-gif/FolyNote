import { describe, it, expect } from 'vitest';
import {
  parseSizeLabel,
  computeUsageBytes,
  formatBytes,
  checkQuota,
  QUOTA_BYTES,
} from './storageQuota';
import { DocumentItem } from '../types';

function doc(partial: Partial<DocumentItem>): DocumentItem {
  return {
    id: partial.id ?? 'd1',
    name: 'test.pdf',
    type: 'pdf',
    size: '1.0 MB',
    pageCount: 1,
    lastModified: '',
    tags: [],
    content: '',
    ...partial,
  };
}

describe('storageQuota', () => {
  it('parses size labels into bytes', () => {
    expect(parseSizeLabel('1.2 MB')).toBe(Math.round(1.2 * 1024 * 1024));
    expect(parseSizeLabel('850 KB')).toBe(850 * 1024);
    expect(parseSizeLabel('13 B')).toBe(13);
    expect(parseSizeLabel('unknown')).toBe(0);
    expect(parseSizeLabel(undefined)).toBe(0);
  });

  it('computes usage from sizeBytes, falling back to labels and inline content', () => {
    const docs = [
      doc({ id: 'a', sizeBytes: 1024 }),
      doc({ id: 'b', size: '2 KB' }),
      doc({ id: 'c', size: '', content: 'hello' }),
    ];
    const used = computeUsageBytes(docs);
    expect(used).toBe(1024 + 2 * 1024 + 5);
  });

  it('formats bytes readably', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('rejects uploads that exceed the 250 MB quota', () => {
    const almost = QUOTA_BYTES - 1024;
    const docs = [doc({ id: 'big', sizeBytes: almost })];
    expect(checkQuota(docs, 2048).ok).toBe(false);
    expect(checkQuota(docs, 1024).ok).toBe(true);
    expect(checkQuota([], 100).usedBytes).toBe(0);
  });
});
