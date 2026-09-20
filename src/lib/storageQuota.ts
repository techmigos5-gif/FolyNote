import { DocumentItem } from '../types';

/**
 * Per-user storage quota: 250 MB of documents, enforced client-side before
 * upload and server-side by a trigger on storage.objects (see migration).
 */
export const QUOTA_BYTES = 250 * 1024 * 1024;

/** Parse a display size label like "1.2 MB", "850 KB", "13 B" into bytes. */
export function parseSizeLabel(label: string | undefined): number {
  if (!label) return 0;
  const m = label.trim().match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
  if (!m) return 0;
  const value = parseFloat(m[1]);
  if (Number.isNaN(value)) return 0;
  const unit = m[2].toUpperCase();
  const mult = unit === 'B' ? 1 : unit === 'KB' ? 1024 : unit === 'MB' ? 1024 ** 2 : 1024 ** 3;
  return Math.round(value * mult);
}

/** Estimate the size of an inline (text) document in bytes. */
export function inlineDocBytes(content: string): number {
  try {
    return new TextEncoder().encode(content).length;
  } catch {
    return content.length;
  }
}

/** Total bytes currently used by the user's documents (binary storage + inline content). */
export function computeUsageBytes(documents: DocumentItem[]): number {
  return documents.reduce((sum, doc) => {
    const known = doc.sizeBytes ?? parseSizeLabel(doc.size);
    if (known > 0) return sum + known;
    return sum + inlineDocBytes(doc.content ?? '');
  }, 0);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(bytes < 10 * 1024 ** 2 ? 1 : 0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export interface QuotaCheck {
  ok: boolean;
  usedBytes: number;
  remainingBytes: number;
  message?: string;
}

/** Check whether uploading `incomingBytes` stays within the user quota. */
export function checkQuota(documents: DocumentItem[], incomingBytes: number): QuotaCheck {
  const usedBytes = computeUsageBytes(documents);
  const remainingBytes = QUOTA_BYTES - usedBytes;
  if (incomingBytes > remainingBytes) {
    return {
      ok: false,
      usedBytes,
      remainingBytes,
      message: `Not enough space: this file needs ${formatBytes(incomingBytes)}, but only ${formatBytes(
        Math.max(0, remainingBytes),
      )} of your 250 MB remains. Remove a document to free space.`,
    };
  }
  return { ok: true, usedBytes, remainingBytes };
}
