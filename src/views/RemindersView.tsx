import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BellRing, BellOff, Check, CheckCircle2, Clock, Plus, Repeat as RepeatIcon, Trash2, Volume2,
} from 'lucide-react';
import { ReminderItem, ReminderRepeat } from '../types';
import { formatReminderTime, isDue, makeReminderId } from '../lib/reminders';
import { requestNotificationPermission } from '../lib/notifications';
import { playChime } from '../lib/sounds';

interface RemindersViewProps {
  reminders: ReminderItem[];
  onAdd: (reminder: ReminderItem) => void;
  onUpdate: (reminder: ReminderItem) => void;
  onDelete: (id: string) => void;
}

const REPEAT_OPTIONS: { value: ReminderRepeat; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function defaultDueLocal(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ reminders, onAdd, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('');
  const [dueLocal, setDueLocal] = useState(defaultDueLocal);
  const [repeat, setRepeat] = useState<ReminderRepeat>('none');
  const [sound, setSound] = useState(true);
  const [notes, setNotes] = useState('');
  const [showDone, setShowDone] = useState(false);

  const sorted = useMemo(() => {
    const active = reminders.filter((r) => !r.completed);
    const done = reminders.filter((r) => r.completed);
    active.sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());
    done.sort((a, b) => new Date(b.remindAt).getTime() - new Date(a.remindAt).getTime());
    return { active, done };
  }, [reminders]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    await requestNotificationPermission(); // gentle first-use ask
    const reminder: ReminderItem = {
      id: makeReminderId(),
      title: cleanTitle,
      notes: notes.trim(),
      remindAt: new Date(dueLocal).toISOString(),
      repeat,
      soundEnabled: sound,
      completed: false,
    };
    onAdd(reminder);
    setTitle(''); setNotes(''); setDueLocal(defaultDueLocal()); setRepeat('none');
  };

  const handleToggleComplete = (rem: ReminderItem) => {
    if (!rem.completed) playChime(0.25);
    onUpdate({ ...rem, completed: !rem.completed });
  };

  const ReminderCard: React.FC<{ rem: ReminderItem }> = ({ rem }) => {
    const due = isDue(rem);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className={`group flex items-start gap-3 p-4 rounded-2xl border transition ${
          due
            ? 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60'
            : 'bg-white dark:bg-[#221a30] border-gray-100 dark:border-gray-800'
        }`}
      >
        <button
          type="button"
          onClick={() => handleToggleComplete(rem)}
          aria-label={rem.completed ? 'Mark as not done' : 'Mark as done'}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${
            rem.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 text-transparent hover:text-accent-400'
          }`}
        >
          <Check className="w-3 h-3" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${rem.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {rem.title}
            </span>
            {rem.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/40 px-1.5 py-0.5 rounded-full">
                <RepeatIcon className="w-2.5 h-2.5" /> {rem.repeat}
              </span>
            )}
            {rem.soundEnabled && <Volume2 className="w-3 h-3 text-gray-400" aria-hidden="true" />}
          </div>
          {rem.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{rem.notes}</p>}
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1 ${due && !rem.completed ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {formatReminderTime(rem.remindAt)}
            {due && !rem.completed && ' • due now'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDelete(rem.id)}
          aria-label={`Delete reminder ${rem.title}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-accent-600" aria-hidden="true" />
            Reminders
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gentle nudges with calm chimes — delivered in-app, and as OS notifications when allowed.
          </p>
        </div>
        {sorted.done.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDone((s) => !s)}
            className="text-xs font-semibold text-accent-700 dark:text-accent-300 hover:underline cursor-pointer"
          >
            {showDone ? 'Hide completed' : `Completed (${sorted.done.length})`}
          </button>
        )}
      </div>

      {/* Create form */}
      <form onSubmit={handleAdd} className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What should we remind you about?"
            aria-label="Reminder title"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 dark:focus:ring-accent-900/50 transition"
          />
          <input
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            aria-label="Reminder time"
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 dark:focus:ring-accent-900/50 transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-900/50 rounded-xl p-1">
            {REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRepeat(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  repeat === opt.value
                    ? 'bg-white dark:bg-accent-900/60 text-accent-700 dark:text-accent-200 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="w-4 h-4 rounded accent-accent-600"
            />
            Calm chime
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Note (optional)"
            aria-label="Reminder note"
            className="flex-1 min-w-[140px] px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 transition"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-accent-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reminder
          </motion.button>
        </div>
      </form>

      {/* Active reminders */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {sorted.active.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BellOff className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No upcoming reminders</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add one above and we&apos;ll gently ping you.</p>
            </motion.div>
          ) : (
            sorted.active.map((rem) => <ReminderCard key={rem.id} rem={rem} />)
          )}
        </AnimatePresence>
      </div>

      {/* Completed */}
      <AnimatePresence>
        {showDone && sorted.done.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </h2>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sorted.done.map((rem) => <ReminderCard key={rem.id} rem={rem} />)}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
