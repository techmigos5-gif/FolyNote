import { ReminderItem, ReminderRepeat } from '../types';

/** Compute the next occurrence for a repeating reminder (ISO string). */
export function nextOccurrence(remindAt: string, repeat: ReminderRepeat): string | null {
  const d = new Date(remindAt);
  if (Number.isNaN(d.getTime()) || repeat === 'none') return null;
  switch (repeat) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString();
}

/** True when a reminder is due right now (past its time, not completed). */
export function isDue(reminder: ReminderItem, now: Date = new Date()): boolean {
  if (reminder.completed) return false;
  const t = new Date(reminder.remindAt).getTime();
  return !Number.isNaN(t) && t <= now.getTime();
}

export function isOverdue(reminder: ReminderItem, now: Date = new Date()): boolean {
  return isDue(reminder, now) && !reminder.completed;
}

/** "Tomorrow 9:30 AM" style label. */
export function formatReminderTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((that.getTime() - today.getTime()) / 86400000);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return `Today ${time}`;
  if (diffDays === 1) return `Tomorrow ${time}`;
  if (diffDays === -1) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} ${time}`;
}

/** Convert a datetime-local input value + repeat to a ReminderItem draft. */
export function makeReminderId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
