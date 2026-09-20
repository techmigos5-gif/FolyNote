import { supabase } from '../lib/supabase';
import { ReminderItem } from '../types';

interface ReminderRow {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  remind_at: string;
  repeat: string;
  sound_enabled: boolean;
  completed: boolean;
}

function rowToReminder(r: ReminderRow): ReminderItem {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    remindAt: r.remind_at,
    repeat: (r.repeat as ReminderItem['repeat']) || 'none',
    soundEnabled: r.sound_enabled,
    completed: r.completed,
  };
}

function reminderToRow(rem: ReminderItem, userId: string) {
  return {
    id: rem.id,
    user_id: userId,
    title: rem.title,
    notes: rem.notes,
    remind_at: rem.remindAt,
    repeat: rem.repeat,
    sound_enabled: rem.soundEnabled,
    completed: rem.completed,
  };
}

export const remindersApi = {
  async listAll(): Promise<ReminderItem[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });
    if (error) throw new Error(`Load reminders failed: ${error.message}`);
    return (data ?? []).map(rowToReminder);
  },

  async upsert(reminder: ReminderItem, userId: string): Promise<boolean> {
    const { error } = await supabase.from('reminders').upsert(reminderToRow(reminder, userId));
    if (error) {
      console.warn('reminders.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) {
      console.warn('reminders.remove failed:', error.message);
      return false;
    }
    return true;
  },
};
