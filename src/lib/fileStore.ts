/**
 * Local persistence for original uploaded file binaries.
 *
 * localStorage cannot hold files, so the original file (PDF, DOCX, ...)
 * is stored in IndexedDB under key = document id. Upload flow writes the
 * blob here first, then tries Supabase Storage; the original file is thus
 * never lost even when the cloud is unreachable.
 */

const DB_NAME = 'folynote-files';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    });
  }
  return dbPromise;
}

function runTx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = fn(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
      }),
  );
}

export const fileStore = {
  /** Persist the original file binary under the document id. */
  async put(id: string, file: Blob): Promise<boolean> {
    try {
      await runTx('readwrite', (store) => store.put(file, id));
      return true;
    } catch (err) {
      console.warn('fileStore.put failed:', err);
      return false;
    }
  },

  /** Load the original binary for a document, if stored. */
  async get(id: string): Promise<Blob | null> {
    try {
      const blob = await runTx<Blob | undefined>('readonly', (store) => store.get(id));
      return blob ?? null;
    } catch (err) {
      console.warn('fileStore.get failed:', err);
      return null;
    }
  },

  /** Remove the stored binary (document deleted). */
  async remove(id: string): Promise<void> {
    try {
      await runTx('readwrite', (store) => store.delete(id));
    } catch (err) {
      console.warn('fileStore.remove failed:', err);
    }
  },
};
