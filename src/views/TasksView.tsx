import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  Flame,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Target,
  PartyPopper,
  CalendarDays,
} from 'lucide-react';
import { TaskColumn, TaskItem, TaskPriority } from '../types';
import { toast } from '../lib/toast';

interface TasksViewProps {
  tasks: TaskItem[];
  onAdd: (task: TaskItem) => void;
  onUpdate: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}

interface ColumnDef {
  id: TaskColumn;
  label: string;
  emoji: string;
  accent: string; // tailwind classes for the column header
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', label: 'Backlog', emoji: '🌊', accent: 'text-sky-600 dark:text-sky-400' },
  { id: 'active', label: 'In Motion', emoji: '🚀', accent: 'text-accent-600 dark:text-accent-400' },
  { id: 'done', label: 'Shipped', emoji: '🏆', accent: 'text-emerald-600 dark:text-emerald-400' },
];

const PRIORITY_META: Record<TaskPriority, { label: string; dot: string; chip: string }> = {
  high: { label: 'High', dot: 'bg-rose-500', chip: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60' },
  medium: { label: 'Med', dot: 'bg-amber-500', chip: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60' },
  low: { label: 'Low', dot: 'bg-sky-400', chip: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/60' },
};

function makeTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Consecutive-day streak ending today (or yesterday if today not yet done). */
export function computeStreak(tasks: TaskItem[]): number {
  const days = new Set<string>();
  for (const t of tasks) {
    if (t.completedAt) days.add(new Date(t.completedAt).toISOString().slice(0, 10));
  }
  if (days.size === 0) return 0;
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!days.has(todayStr)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function isOverdue(task: TaskItem): boolean {
  if (!task.dueDate || task.column === 'done') return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}

/** One-shot canvas-free confetti burst rendered as absolutely positioned spans. */
const ConfettiBurst: React.FC<{ burstKey: number }> = ({ burstKey }) => {
  const pieces = useMemo(() => {
    if (burstKey === 0) return [];
    return Array.from({ length: 26 }, (_, i) => ({
      id: `${burstKey}-${i}`,
      x: (Math.random() - 0.5) * 320,
      y: -60 - Math.random() * 160,
      rot: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.12,
      color: ['bg-accent-500', 'bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400'][i % 5],
      round: i % 3 === 0,
    }));
  }, [burstKey]);

  if (burstKey === 0) return null;

  return (
    <div key={burstKey} className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute top-8 h-2.5 w-2 ${p.color} ${p.round ? 'rounded-full' : 'rounded-[2px]'}`}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.rot, scale: 0.7 }}
          transition={{ duration: 1.15, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onAdd, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskColumn | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const byColumn = useMemo(() => {
    const map: Record<TaskColumn, TaskItem[]> = { backlog: [], active: [], done: [] };
    for (const t of tasks) map[t.column]?.push(t);
    for (const key of Object.keys(map) as TaskColumn[]) {
      map[key].sort((a, b) => {
        if (key === 'done') {
          return (b.completedAt || '').localeCompare(a.completedAt || '');
        }
        const pOrder = { high: 0, medium: 1, low: 2 } as const;
        if (a.priority !== b.priority) return pOrder[a.priority] - pOrder[b.priority];
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    }
    return map;
  }, [tasks]);

  const stats = useMemo(() => {
    const done = byColumn.done.length;
    const total = tasks.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const todayStr = new Date().toISOString().slice(0, 10);
    const doneToday = tasks.filter((t) => t.completedAt?.slice(0, 10) === todayStr).length;
    return { done, total, pct, doneToday, streak: computeStreak(tasks) };
  }, [byColumn, tasks]);

  const celebrate = () => {
    setBurstKey((k) => k + 1);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    onAdd({
      id: makeTaskId(),
      title: clean,
      notes: '',
      column: 'backlog',
      priority,
      dueDate: dueDate || undefined,
      completedAt: null,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setDueDate('');
    setPriority('medium');
    inputRef.current?.focus();
  };

  const moveTask = (task: TaskItem, target: TaskColumn) => {
    if (task.column === target) return;
    const nowCompleted = target === 'done' ? new Date().toISOString() : null;
    onUpdate({ ...task, column: target, completedAt: nowCompleted });
    if (target === 'done') {
      celebrate();
      toast(`\"${task.title}\" shipped! 🎉`, 'success');
    }
  };

  const handleDrop = (column: TaskColumn) => {
    setOverColumn(null);
    if (!dragId) return;
    const task = tasks.find((t) => t.id === dragId);
    setDragId(null);
    if (task) moveTask(task, column);
  };

  const step = (task: TaskItem, dir: -1 | 1) => {
    const order: TaskColumn[] = ['backlog', 'active', 'done'];
    const idx = order.indexOf(task.column);
    const next = order[idx + dir];
    if (next) moveTask(task, next);
  };

  const ringCircumference = 2 * Math.PI * 34;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 relative">
      <ConfettiBurst burstKey={burstKey} />

      {/* Header + stats island */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent-600" aria-hidden="true" />
            Tasks
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Drag cards between lanes, or use the arrows. Finish something today — keep the flame alive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-2xs">
            <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} aria-hidden="true" />
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 block">{stats.streak}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">day streak</span>
            </div>
          </div>

          {/* Done today */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-2xs">
            <PartyPopper className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 block">{stats.doneToday}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">today</span>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative w-16 h-16 shrink-0" role="img" aria-label={`${stats.pct}% of tasks shipped`}>
            <svg viewBox="0 0 80 80" className="w-16 h-16 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-gray-100 dark:stroke-gray-800" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className="stroke-accent-500 transition-[stroke-dashoffset] duration-700 ease-out"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - stats.pct / 100)}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-gray-800 dark:text-gray-200 tabular-nums">
              {stats.pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the next move? Press Enter to add to Backlog..."
            aria-label="New task title"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 dark:focus:ring-accent-900/50 transition"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-accent-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </motion.button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-900/50 rounded-xl p-1" role="radiogroup" aria-label="Priority">
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={priority === p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  priority === p
                    ? 'bg-white dark:bg-accent-900/60 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${PRIORITY_META[p].dot}`} aria-hidden="true" />
                {PRIORITY_META[p].label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Due date (optional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent-500"
            />
          </label>
        </div>
      </form>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = byColumn[col.id];
          const isOver = overColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== col.id) setOverColumn(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn((c) => (c === col.id ? null : c));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id);
              }}
              className={`rounded-2xl border p-3 space-y-3 min-h-[220px] transition-colors ${
                isOver
                  ? 'border-accent-400 bg-accent-50/60 dark:bg-accent-950/30'
                  : 'border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-[#1E1729]/60'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${col.accent}`}>
                  <span aria-hidden="true">{col.emoji}</span>
                  {col.label}
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full tabular-nums">
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 px-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <Sparkles className="w-5 h-5 mx-auto text-gray-300 dark:text-gray-600 mb-1.5" aria-hidden="true" />
                    <p className="text-[11px] text-gray-400">
                      {col.id === 'backlog'
                        ? 'Drop ideas here'
                        : col.id === 'active'
                        ? 'Drag a task in to start it'
                        : 'Ship something to celebrate 🎊'}
                    </p>
                  </motion.div>
                ) : (
                  items.map((task) => {
                    const pmeta = PRIORITY_META[task.priority];
                    const overdue = isOverdue(task);
                    const isDragging = dragId === task.id;

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        draggable
                        onDragStart={(e) => {
                          const ev = e as unknown as React.DragEvent;
                          setDragId(task.id);
                          ev.dataTransfer.effectAllowed = 'move';
                          // Firefox requires data to be set for drag to start
                          ev.dataTransfer.setData('text/plain', task.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverColumn(null);
                        }}
                        className={`group relative p-3.5 rounded-xl bg-white dark:bg-[#221a30] border shadow-2xs cursor-grab active:cursor-grabbing transition hover:shadow-md ${
                          overdue
                            ? 'border-rose-200 dark:border-rose-900/60'
                            : 'border-gray-100 dark:border-gray-800 hover:border-accent-200 dark:hover:border-accent-900/60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Priority dot */}
                          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${pmeta.dot}`} title={`${pmeta.label} priority`} aria-hidden="true" />

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold leading-snug break-words ${
                                task.column === 'done'
                                  ? 'text-gray-400 dark:text-gray-500 line-through'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {task.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${pmeta.chip}`}>
                                {pmeta.label}
                              </span>
                              {task.dueDate && (
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                    overdue
                                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60'
                                      : 'text-gray-500 bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'
                                  }`}
                                >
                                  <CalendarDays className="w-2.5 h-2.5" aria-hidden="true" />
                                  {task.dueDate.slice(5)}
                                  {overdue && ' • late'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions: appear on hover/focus, always on touch */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition sm:opacity-0 max-sm:opacity-100">
                            {task.column !== 'backlog' && (
                              <button
                                type="button"
                                onClick={() => step(task, -1)}
                                aria-label={`Move ${task.title} left`}
                                className="p-1 rounded-md text-gray-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/40 transition cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {task.column === 'done' ? (
                              <button
                                type="button"
                                onClick={() => onDelete(task.id)}
                                aria-label={`Delete ${task.title}`}
                                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => moveTask(task, 'done')}
                                  aria-label={`Ship ${task.title}`}
                                  className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(task.id)}
                                  aria-label={`Delete ${task.title}`}
                                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
