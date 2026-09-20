import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type RealtimeTable = 'thoughts' | 'ideas' | 'documents' | 'pinned_items' | 'tags';

export type RealtimeChange = {
  table: RealtimeTable;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

/**
 * Subscribe to Postgres changes for the signed-in user's rows across all
 * workspace tables. Used to keep multiple tabs/devices coherent: when another
 * tab (or device) mutates data, this fires and the app re-pulls from source.
 */
export function subscribeToWorkspace(
  onExternalChange: (change: RealtimeChange) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('folynote-workspace')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        const table = payload.table as RealtimeTable;
        const eventType = payload.eventType as RealtimeChange['eventType'];
        onExternalChange({ table, eventType });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
