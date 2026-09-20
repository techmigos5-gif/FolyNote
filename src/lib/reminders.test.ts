import { describe, it, expect } from 'vitest';
import { nextOccurrence, isDue, formatReminderTime } from './reminders';
import { ReminderItem } from '../types';

function rem(partial: Partial<ReminderItem>): ReminderItem {
  return {
    id: 'r1',
    title: 'Test',
    notes: '',
    remindAt: new Date('2026-09-20T10:00:00Z').toISOString(),
    repeat: 'none',
    soundEnabled: true,
    completed: false,
    ...partial,
  };
}

describe('reminders', () => {
  it('advances repeating reminders by their interval', () => {
    const base = '2026-09-20T10:00:00.000Z';
    expect(nextOccurrence(base, 'none')).toBeNull();
    expect(nextOccurrence(base, 'daily')).toBe('2026-09-21T10:00:00.000Z');
    expect(nextOccurrence(base, 'weekly')).toBe('2026-09-27T10:00:00.000Z');
    expect(nextOccurrence(base, 'monthly')).toBe('2026-10-20T10:00:00.000Z');
  });

  it('detects due reminders', () => {
    const past = rem({ remindAt: '2020-01-01T00:00:00Z' });
    const future = rem({ remindAt: '2999-01-01T00:00:00Z' });
    const done = rem({ remindAt: '2020-01-01T00:00:00Z', completed: true });
    expect(isDue(past)).toBe(true);
    expect(isDue(future)).toBe(false);
    expect(isDue(done)).toBe(false);
  });

  it('formats friendly times', () => {
    const soon = new Date(Date.now() + 60_000);
    expect(formatReminderTime(soon.toISOString())).toContain('Today');
    expect(formatReminderTime('not-a-date')).toBe('not-a-date');
  });
});
