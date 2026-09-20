import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------
// Mock @supabase/supabase-js BEFORE importing modules that use it.
// ---------------------------------------------------------------
type ChangeHandler = (payload: { table: string; eventType: string }) => void;

let changeHandlers: ChangeHandler[] = [];
let serverDb: Record<string, any[]> = {};

// createClient() is invoked at module-import time (supabase.ts top level),
// before beforeEach runs — so hand back a proxy that forwards every property
// access to the client configured later in beforeEach.
const { clientRef } = vi.hoisted(() => ({
  clientRef: { current: undefined as any },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () =>
    new Proxy({}, {
      get: (_target, prop) => clientRef.current?.[prop],
      has: (_target, prop) => prop in (clientRef.current ?? {}),
    }),
  RealtimeChannel: class {},
}));

// Tests run without VITE_SUPABASE_* env vars, so force the configured state
// and route the shared client through the same lazy proxy.
vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: new Proxy({}, {
    get: (_target, prop) => clientRef.current?.[prop],
    has: (_target, prop) => prop in (clientRef.current ?? {}),
  }),
}));

const upsertCalls: Array<{ table: string; row: any }> = [];
let mockClient: any;

beforeEach(() => {
  upsertCalls.length = 0;
  changeHandlers = [];
  serverDb = {
    thoughts: [
      {
        id: 'srv-1',
        user_id: 'u1',
        entry_date: '2026-09-20',
        entry_time: '9:00 AM',
        title: 'Server thought',
        content: 'from cloud',
        tags: [],
        is_pinned: false,
      },
    ],
    pinned_items: [],
    documents: [],
    ideas: [],
    tags: [{ id: 1, name: 'Work', color: 'blue', count: 2, user_id: 'u1' }],
  };

  mockClient = {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    removeChannel: vi.fn(),
    channel: vi.fn(() => {
      const chan: any = {
        on: vi.fn((_type: string, _filter: unknown, cb: ChangeHandler) => {
          changeHandlers.push(cb);
          return chan;
        }),
        subscribe: vi.fn(() => chan),
      };
      return chan;
    }),
    from: vi.fn((table: string) => {
      const builder: any = {};
      builder.select = vi.fn(() => builder);
      builder.order = vi.fn(() => ({
        // Resolve with a snapshot of the current table contents
        then: (res: (r: { data: any[]; error: null }) => unknown) =>
          Promise.resolve({ data: serverDb[table] ?? [], error: null }).then(res),
      }));
      builder.upsert = vi.fn((row: any) => {
        upsertCalls.push({ table, row });
        return Promise.resolve({ data: null, error: null });
      });
      builder.delete = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      }));
      return builder;
    }),
  };
  clientRef.current = mockClient;
});

import { useWorkspaceSync } from './useWorkspaceSync';
import { DailyThought } from '../types';

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'u1',
    thoughts: [] as DailyThought[],
    pinnedItems: [],
    documents: [],
    ideas: [],
    tags: [],
    onServerData: vi.fn(),
    ...overrides,
  };
}

describe('useWorkspaceSync', () => {
  it('hydrates local state from Supabase rows on sign-in', async () => {
    const props = makeProps();
    renderHook(() => useWorkspaceSync(props as any));

    await waitFor(() => {
      expect(props.onServerData).toHaveBeenCalledTimes(1);
    });

    const pulled = props.onServerData.mock.calls[0][0];
    expect(pulled.thoughts.some((t: DailyThought) => t.id === 'srv-1')).toBe(true);
    expect(pulled.tags.some((t) => t.name === 'Work')).toBe(true);
  });

  it('ignores realtime echoes arriving right after its own write window', async () => {
    const props = makeProps();
    renderHook(() => useWorkspaceSync(props as any));

    await waitFor(() => {
      expect(props.onServerData).toHaveBeenCalledTimes(1);
    });

    // Fire realtime immediately — inside the 1.5s post-write guard window.
    await act(async () => {
      for (const cb of changeHandlers) {
        cb({ table: 'thoughts', eventType: 'INSERT' });
      }
    });

    expect(props.onServerData).toHaveBeenCalledTimes(1);
  });

  it('re-pulls the changed table on external realtime events', async () => {
    const props = makeProps();
    renderHook(() => useWorkspaceSync(props as any));

    await waitFor(() => {
      expect(props.onServerData).toHaveBeenCalledTimes(1);
    });

    // Give the hydration guard window time to expire.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1600));
    });

    // A second device inserted a row; realtime announces it.
    serverDb.thoughts.unshift({
      id: 'srv-2',
      user_id: 'u1',
      entry_date: '2026-09-20',
      entry_time: '1:00 PM',
      title: 'External edit',
      content: '',
      tags: [],
      is_pinned: false,
    });

    await act(async () => {
      for (const cb of changeHandlers) {
        cb({ table: 'thoughts', eventType: 'INSERT' });
      }
    });

    await waitFor(() => {
      expect(props.onServerData).toHaveBeenCalledTimes(2);
    });

    const second = props.onServerData.mock.calls[1][0];
    expect(second.thoughts.some((t: DailyThought) => t.id === 'srv-2')).toBe(true);
  });

  it('pushes local mutations as row-level upserts', async () => {
    let thoughts: DailyThought[] = [];
    const props = makeProps({
      thoughts, // placeholder; replaced below via getter-style rerender
    });

    const { rerender } = renderHook((p: any) => useWorkspaceSync(p), {
      initialProps: props,
    });

    await waitFor(() => {
      expect(props.onServerData).toHaveBeenCalledTimes(1);
    });

    // Local mutation: add a thought.
    const localThought: DailyThought = {
      id: 'local-1',
      date: '2026-09-20',
      time: '2:00 PM',
      title: 'Local thought',
      content: 'typed offline',
      tags: [],
      isPinned: false,
    };
    const nextProps = makeProps({ thoughts: [localThought] });
    rerender(nextProps);

    await waitFor(
      () => {
        expect(upsertCalls.some((c) => c.table === 'thoughts' && c.row.id === 'local-1')).toBe(true);
      },
      { timeout: 3000 },
    );
  });
});
