import { useEffect, useRef } from 'react';
import { ReminderItem } from '../types';
import { isDue, nextOccurrence } from '../lib/reminders';
import { deliverReminder } from '../lib/notifications';
import { playChime } from '../lib/sounds';
import { toast } from '../lib/toast';

interface SchedulerArgs {
  reminders: ReminderItem[];
  soundEnabled: boolean;
  /** Persist an updated reminder (auto-complete fired ones, advance repeats). */
  onUpdate: (reminder: ReminderItem) => void;
  /** Fires when any reminder comes due (for UI highlights). */
  onFired?: (reminder: ReminderItem) => void;
}

const CHECK_INTERVAL_MS = 20_000;

/**
 * Polls for due reminders while the app is open and delivers them:
 * in-app toast + chime, plus an OS notification when permitted/hidden.
 * Non-repeating reminders are auto-completed after firing; repeating ones
 * advance to their next occurrence.
 */
export function useReminderScheduler({ reminders, soundEnabled, onUpdate, onFired }: SchedulerArgs): void {
  const latest = useRef({ reminders, soundEnabled, onUpdate, onFired });
  latest.current = { reminders, soundEnabled, onUpdate, onFired };
  const firedThisSession = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const { reminders: list, soundEnabled: sound, onUpdate: update, onFired: fired } = latest.current;
      const now = new Date();
      for (const rem of list) {
        if (!isDue(rem, now) || firedThisSession.current.has(rem.id)) continue;
        firedThisSession.current.add(rem.id);

        void deliverReminder(`⏰ ${rem.title}`, rem.notes || 'FolyNote reminder', hashId(rem.id));
        toast(rem.notes ? `${rem.title} — ${rem.notes}` : rem.title, 'info');
        if (sound) playChime(0.4);
        fired?.(rem);

        const next = nextOccurrence(rem.remindAt, rem.repeat);
        if (next) {
          update({ ...rem, remindAt: next });
        } else {
          update({ ...rem, completed: true });
        }
      }
    };

    check();
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}

/** Stable positive int for OS notification ids. */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483646;
}
