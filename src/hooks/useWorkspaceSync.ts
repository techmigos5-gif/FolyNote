import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  documentsApi,
  ideasApi,
  pinsApi,
  thoughtsApi,
} from '../api/entities';
import { remindersApi } from '../api/reminders';
import { tasksApi } from '../api/tasks';
import { documentsStorage } from '../api/documents';
import { subscribeToWorkspace, RealtimeChange } from '../api/realtime';
import { DailyThought, DocumentItem, IdeaItem, PinnedItem, ReminderItem, TaskItem } from '../types';

interface UseWorkspaceSyncArgs {
  userId: string | null;
  thoughts: DailyThought[];
  pinnedItems: PinnedItem[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  reminders: ReminderItem[];
  tasks: TaskItem[];
  /** Replace local state with server rows (used by hydration + realtime re-pulls). */
  onServerData: (data: {
    thoughts: DailyThought[];
    pinnedItems: PinnedItem[];
    documents: DocumentItem[];
    ideas: IdeaItem[];
    reminders: ReminderItem[];
    tasks: TaskItem[];
  }) => void;
}

export interface WorkspaceSyncResult {
  /** True while the initial Supabase pull is in flight. */
  loading: boolean;
  /** Error message from the initial pull, if any. */
  error: string | null;
}

/** Everything that changed for one entity in this render cycle. */
interface EntityDelta<T> {
  upserts: T[];
  deletes: string[];
}

function diffEntity<T>(
  prev: T[] | null | undefined,
  curr: T[] | null | undefined,
  getKey: (x: T) => string,
): EntityDelta<T> {
  const safePrev = prev ?? [];
  const safeCurr = curr ?? [];
  const prevByKey = new Map(safePrev.map((x) => [getKey(x), x]));
  const currByKey = new Map(safeCurr.map((x) => [getKey(x), x]));

  const upserts = safeCurr.filter((c) => {
    const p = prevByKey.get(getKey(c));
    return !p || JSON.stringify(p) !== JSON.stringify(c);
  });
  const deletes = safePrev.filter((p) => !currByKey.has(getKey(p))).map(getKey);
  return { upserts, deletes };
}

/** Overwrite `target` entries whose server version differs from `incoming`. */
function mergeServerRows<T>(target: T[], incoming: T[], getKey: (x: T) => string): T[] {
  const byKey = new Map(target.map((x) => [getKey(x), x]));
  for (const row of incoming) byKey.set(getKey(row), row);
  return Array.from(byKey.values());
}

/**
 * Bridges local React state and Supabase:
 *  - On sign-in, pulls the user's rows once and merges them over localStorage state.
 *  - On local mutations, diffs against the last synced snapshot and pushes
 *    row-level upserts/deletes (no bulk workspace writes).
 *  - On external realtime events (other tab/device), re-pulls that table so all
 *    tabs stay coherent. Its own echo is ignored via a last-write timestamp guard.
 * Offline/local-only mode is preserved: without Supabase env vars nothing runs.
 */
export function useWorkspaceSync(args: UseWorkspaceSyncArgs): WorkspaceSyncResult {
  const { userId, thoughts, pinnedItems, documents, ideas, reminders, tasks, onServerData } = args;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = Boolean(userId && isSupabaseConfigured);

  // Timestamp of the most recent local write; realtime echoes inside the
  // guard window are recognized as our own and ignored.
  const lastLocalWriteAt = useRef(0);
  const markLocalWrite = () => {
    lastLocalWriteAt.current = Date.now();
  };

  // Last synced snapshot per entity (null = not yet hydrated).
  const syncBaseline = useRef<{
    thoughts: DailyThought[] | null;
    pinnedItems: PinnedItem[] | null;
    documents: DocumentItem[] | null;
    ideas: IdeaItem[] | null;
    reminders: ReminderItem[] | null;
    tasks: TaskItem[] | null;
  }>({ thoughts: null, pinnedItems: null, documents: null, ideas: null, reminders: null, tasks: null });

  // Latest state, readable inside stable realtime/hydration closures.
  const latest = useRef({ thoughts, pinnedItems, documents, ideas, reminders, tasks, onServerData });
  latest.current = { thoughts, pinnedItems, documents, ideas, reminders, tasks, onServerData };

  const pullAll = async () => {
    const [t, p, d, i, r, k] = await Promise.all([
      thoughtsApi.listAll(),
      pinsApi.listAll(),
      documentsApi.listAll(),
      ideasApi.listAll(),
      remindersApi.listAll(),
      tasksApi.listAll(),
    ]);
    return { thoughts: t, pinnedItems: p, documents: d, ideas: i, reminders: r, tasks: k };
  };

  const pullOne = async (table: RealtimeChange['table']) => {
    switch (table) {
      case 'thoughts': return { thoughts: await thoughtsApi.listAll() };
      case 'pinned_items': return { pinnedItems: await pinsApi.listAll() };
      case 'documents': return { documents: await documentsApi.listAll() };
      case 'ideas': return { ideas: await ideasApi.listAll() };
      case 'reminders': return { reminders: await remindersApi.listAll() };
      case 'tasks': return { tasks: await tasksApi.listAll() };
    }
  };

  // -------------------------------------------------------------
  // Hydration on sign-in
  // -------------------------------------------------------------
  useEffect(() => {
    if (!enabled) {
      syncBaseline.current = { thoughts: null, pinnedItems: null, documents: null, ideas: null, reminders: null, tasks: null };
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const server = await pullAll();
        if (cancelled) return;
        markLocalWrite();
        syncBaseline.current = server;
        latest.current.onServerData(server);
      } catch (err) {
        if (!cancelled) {
          console.warn('Workspace hydration failed:', err);
          setError(err instanceof Error ? err.message : 'Workspace sync failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-hydrate only when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, enabled]);

  // -------------------------------------------------------------
  // Push local mutations (diff vs. baseline) — runs after every render
  // in which any entity changed, debounced to batch bursts.
  //
  // Deltas are computed AT FIRE TIME against the baseline, never at
  // schedule time: the earlier approach captured deltas per render and
  // cleared the pending timer on cleanup while having already advanced
  // the baseline, so all but the last change in a burst was silently
  // dropped (uploading 3 files in a row pushed only the 3rd row).
  // -------------------------------------------------------------
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(async () => {
      const base = syncBaseline.current;
      const cur = latest.current;

      const deltas = {
        thoughts: base.thoughts ? diffEntity(base.thoughts, cur.thoughts, (t) => t.id) : null,
        pinnedItems: base.pinnedItems ? diffEntity(base.pinnedItems, cur.pinnedItems, (p) => p.id) : null,
        documents: base.documents ? diffEntity(base.documents, cur.documents, (d) => d.id) : null,
        ideas: base.ideas ? diffEntity(base.ideas, cur.ideas, (i) => i.id) : null,
        reminders: base.reminders ? diffEntity(base.reminders, cur.reminders, (r) => r.id) : null,
        tasks: base.tasks ? diffEntity(base.tasks, cur.tasks, (t) => t.id) : null,
      };

      const hasDelta = Object.values(deltas).some(
        (d) => d && (d.upserts.length > 0 || d.deletes.length > 0),
      );
      if (!hasDelta) return;

      // New baseline = current state; failures are logged and retried on the
      // next mutation (state remains authoritative locally meanwhile).
      syncBaseline.current = {
        thoughts: cur.thoughts,
        pinnedItems: cur.pinnedItems,
        documents: cur.documents,
        ideas: cur.ideas,
        reminders: cur.reminders,
        tasks: cur.tasks,
      };
      markLocalWrite();

      const uid = userId!;
      if (deltas.thoughts) {
        await Promise.all([
          ...deltas.thoughts.upserts.map((t) => thoughtsApi.upsert(t, uid)),
          ...deltas.thoughts.deletes.map((id) => thoughtsApi.remove(id)),
        ]);
      }
      if (deltas.pinnedItems) {
        await Promise.all([
          ...deltas.pinnedItems.upserts.map((p) => pinsApi.upsert(p, uid)),
          ...deltas.pinnedItems.deletes.map((id) => pinsApi.remove(id)),
        ]);
      }
      if (deltas.ideas) {
        await Promise.all([
          ...deltas.ideas.upserts.map((i) => ideasApi.upsert(i, uid)),
          ...deltas.ideas.deletes.map((id) => ideasApi.remove(id)),
        ]);
      }
      if (deltas.reminders) {
        await Promise.all([
          ...deltas.reminders.upserts.map((r) => remindersApi.upsert(r, uid)),
          ...deltas.reminders.deletes.map((id) => remindersApi.remove(id)),
        ]);
      }
      if (deltas.tasks) {
        await Promise.all([
          ...deltas.tasks.upserts.map((k) => tasksApi.upsert(k, uid)),
          ...deltas.tasks.deletes.map((id) => tasksApi.remove(id)),
        ]);
      }
      if (deltas.documents) {
        await Promise.all([
          ...deltas.documents.upserts.map((doc) => documentsApi.upsert(doc, uid)),
          ...deltas.documents.deletes.map(async (id) => {
            const removed = base.documents?.find((d) => d.id === id);
            if (removed?.storagePath) await documentsStorage.remove(removed.storagePath);
            await documentsApi.remove(id);
          }),
        ]);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thoughts, pinnedItems, documents, ideas, reminders, tasks, enabled, userId]);

  // -------------------------------------------------------------
  // Realtime: re-pull changed table when another tab/device mutates
  // -------------------------------------------------------------
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToWorkspace(async (change) => {
      if (Date.now() - lastLocalWriteAt.current < 1500) return; // our own echo
      try {
        const patch = await pullOne(change.table);
        if (!patch) return;
        markLocalWrite();

        // Merge into current state instead of blind overwrite so in-flight
        // local edits made after the pull snapshot are not clobbered.
        const cur = latest.current;
        const merged = {
          thoughts: patch.thoughts ? mergeServerRows(cur.thoughts, patch.thoughts, (t) => t.id) : cur.thoughts,
          pinnedItems: patch.pinnedItems ? mergeServerRows(cur.pinnedItems, patch.pinnedItems, (p) => p.id) : cur.pinnedItems,
          documents: patch.documents ? mergeServerRows(cur.documents, patch.documents, (d) => d.id) : cur.documents,
          ideas: patch.ideas ? mergeServerRows(cur.ideas, patch.ideas, (i) => i.id) : cur.ideas,
          reminders: patch.reminders ? mergeServerRows(cur.reminders, patch.reminders, (r) => r.id) : cur.reminders,
          tasks: patch.tasks ? mergeServerRows(cur.tasks, patch.tasks, (t) => t.id) : cur.tasks,
        };
        // Keep the push-baseline coherent with what we just applied.
        syncBaseline.current = { ...syncBaseline.current, ...patch };
        cur.onServerData(merged);
      } catch (err) {
        console.warn('Realtime re-pull failed:', err);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, enabled]);

  return { loading, error };
}
