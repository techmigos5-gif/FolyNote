import { supabase } from '../lib/supabase';
import { DocumentItem } from '../types';

/**
 * Binary document persistence in Supabase Storage.
 * Files live under a private per-user folder: documents/{userId}/{docId}-{name}
 * Storage RLS restricts every object to its owning user.
 */
export const documentsStorage = {
  /**
   * Upload the original file and return the storage path.
   * Throws with the server's message when the upload fails so callers can
   * surface it — failures were previously swallowed and the file silently
   * stayed device-only.
   */
  async upload(file: File, docId: string, userId: string): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${docId}-${safeName}`;
    const { error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });
    if (error) {
      throw new Error(error.message);
    }
    return path;
  },

  /** Download the original binary (e.g. for the native "Open PDF" action). */
  async download(path: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage.from('documents').download(path);
      if (error || !data) {
        console.warn('storage.download failed:', error?.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('storage.download threw:', err);
      return null;
    }
  },

  /** Remove the stored binary. Safe to call when no file was uploaded. */
  async remove(path: string | null | undefined): Promise<boolean> {
    if (!path) return true;
    try {
      const { error } = await supabase.storage.from('documents').remove([path]);
      if (error) {
        console.warn('storage.remove failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('storage.remove threw:', err);
      return false;
    }
  },
};
