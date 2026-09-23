import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DailyThought, DocumentItem, IdeaItem, NavView, PinnedItem, ReminderItem, TaskItem } from '../types';
import { BellRing, Check, CheckCircle2, ChevronRight, Flame, Heart, ListTodo, Pin, Shuffle, Sparkles, BookOpen, Plus, Folder, Lightbulb, HardDrive, Wind, ArrowRight } from 'lucide-react';
import { ProductivityChart } from '../components/ProductivityChart';
import { formatReminderTime, isDue } from '../lib/reminders';
import { computeUsageBytes, formatBytes, QUOTA_BYTES } from '../lib/storageQuota';
import { affirmationOfDay, nudgeOfDay, quoteOfDay, randomQuote } from '../lib/inspiration';
import { computeStreak } from './TasksView';
import { playChime } from '../lib/sounds';
import { toast } from '../lib/toast';

interface DashboardViewProps {
  pinnedItems: PinnedItem[];
  thoughts: DailyThought[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  reminders: ReminderItem[];
  tasks: TaskItem[];
  /** Move a task to the Shipped lane (celebration handled here). */
  onShipTask: (task: TaskItem) => void;
  onNavigate: (view: NavView) => void;
  onOpenDocument: (docId: string) => void;
  onSelectThought: (date: string) => void;
  onStartCalmBreak: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pinnedItems,
  thoughts,
  documents,
  ideas,
  reminders,
  tasks,
  onShipTask,
  onNavigate,
  onOpenDocument,
  onSelectThought,
  onStartCalmBreak,
}) => {
  // Current local today string (YYYY-MM-DD)
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Check if user wrote a thought today
  const hasThoughtToday = thoughts.some((t) => t.date === todayStr);

  const recentThoughts = thoughts.slice(0, 3);

  // Parse date into "17 SEP" badge format
  const formatBadgeDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[2];
        const monthNum = parseInt(parts[1], 10) - 1;
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return { day, month: months[monthNum] || 'SEP' };
      }
      return { day: '01', month: 'SEP' };
    } catch {
      return { day: '01', month: 'SEP' };
    }
  };

  const handlePinnedCardClick = (pin: PinnedItem) => {
    if (pin.targetView === 'document-viewer' && pin.targetId) {
      onOpenDocument(pin.targetId);
    } else if (pin.targetView === 'daily-thoughts') {
      onSelectThought(todayStr);
    } else {
      onNavigate(pin.targetView);
    }
  };

  // Calm inspiration — one quote per day, shuffleable on demand.
  const [quote, setQuote] = useState(quoteOfDay);

  const handleShuffleQuote = () => {
    setQuote(randomQuote(quote.text));
    playChime(0.12, 660);
  };

  // Tasks at a glance — mini board fed by the real tasks state.
  const activeTasks = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    return tasks
      .filter((t) => t.column !== 'done')
      .sort((a, b) => order[a.priority] - order[b.priority])
      .slice(0, 4);
  }, [tasks]);

  const shippedCount = tasks.filter((t) => t.column === 'done').length;
  const shippedToday = tasks.filter((t) => t.completedAt?.slice(0, 10) === todayStr).length;
  const streak = computeStreak(tasks);
  const nudge = nudgeOfDay();
  const affirmation = affirmationOfDay();
  const taskPct = tasks.length === 0 ? 0 : Math.round((shippedCount / tasks.length) * 100);

  const handleShip = (task: TaskItem) => {
    onShipTask(task);
    playChime(0.3);
    toast(`"${task.title}" shipped 🎉`, 'success');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* 0. Inspiration hero — quote of the day + affirmation + gentle nudge */}
      <div className="relative overflow-hidden rounded-3xl border border-accent-100/70 dark:border-accent-900/50 bg-gradient-to-br from-accent-50 via-white to-amber-50/60 dark:from-[#1E1729] dark:via-[#221a30] dark:to-[#2A2140] p-5 sm:p-7 space-y-3.5">
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent-300/25 dark:bg-accent-700/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-12 w-52 h-52 rounded-full bg-amber-200/40 dark:bg-amber-700/15 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent-700 dark:text-accent-300">
            <Heart className="w-3.5 h-3.5" aria-hidden="true" /> Thought for today
          </span>
          <button
            type="button"
            onClick={handleShuffleQuote}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/20 border border-accent-100 dark:border-accent-900/60 text-[11px] font-semibold text-accent-700 dark:text-accent-300 hover:bg-white dark:hover:bg-black/30 transition cursor-pointer"
          >
            <Shuffle className="w-3 h-3" aria-hidden="true" /> Another
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.blockquote
            key={quote.text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="relative"
          >
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
              “{quote.text}”
            </p>
            <footer className="text-xs font-semibold text-accent-600 dark:text-accent-400 mt-1.5">
              — {quote.author}
            </footer>
          </motion.blockquote>
        </AnimatePresence>

        <p className="relative flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-black/20 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          {affirmation}
        </p>

        <button
          type="button"
          onClick={() => onNavigate(nudge.view)}
          className="relative w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-accent-600/10 hover:bg-accent-600/20 dark:bg-accent-500/15 dark:hover:bg-accent-500/25 border border-accent-200/70 dark:border-accent-800/60 text-xs font-semibold text-accent-800 dark:text-accent-200 transition cursor-pointer text-left"
        >
          <span className="truncate">{nudge.text}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* 0b. Today's tasks — mini board */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-950/50 text-accent-600 dark:text-accent-300 flex items-center justify-center">
              <ListTodo className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                Today&apos;s Tasks
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/60 px-1.5 py-0.5 rounded-full">
                    <Flame className="w-2.5 h-2.5" aria-hidden="true" /> {streak}d
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {shippedToday > 0
                  ? `${shippedToday} shipped today — keep the flame alive`
                  : 'Ship one small thing to start the streak'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-50 hover:bg-accent-100 dark:bg-accent-950/40 dark:hover:bg-accent-900/50 text-accent-700 dark:text-accent-300 text-xs font-bold transition cursor-pointer shrink-0"
          >
            Open board <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>

        {tasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-gray-600 dark:text-gray-300">{shippedCount} of {tasks.length} shipped</span>
              <span className="text-gray-400 tabular-nums">{taskPct}%</span>
            </div>
            <div
              className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={taskPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tasks shipped"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-700"
                animate={{ width: `${taskPct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        )}

        {activeTasks.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center sm:text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tasks.length === 0
                ? 'No tasks yet — the board is your playground.'
                : 'All tasks shipped. Beautiful. 🎊'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="px-3.5 py-1.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              {tasks.length === 0 ? 'Create first task' : 'Plan something new'}
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {activeTasks.map((task) => (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-accent-200 dark:hover:border-accent-900/60 transition"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-500'
                        : task.priority === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-sky-400'
                    }`}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => handleShip(task)}
                    aria-label={`Ship ${task.title}`}
                    className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 text-transparent hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center transition shrink-0 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('tasks')}
                    aria-label="Open tasks board"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-gray-400 hover:text-accent-600 transition cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* 1. Pinned Items Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pinned Items</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 font-semibold border border-accent-100">
              {pinnedItems.length}
            </span>
          </div>
          {pinnedItems.length > 0 && (
            <button
              id="view-all-pinned-btn"
              onClick={() => onNavigate('pinned-items')}
              className="text-xs font-semibold text-accent-600 hover:text-accent-700 hover:underline cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {pinnedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                <Pin className="w-5 h-5 transform rotate-45" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">No pinned items yet</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pin your key thoughts, ideas, or files to access them directly from this board.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pinned-items')}
              className="px-3.5 py-1.5 rounded-xl bg-accent-50 hover:bg-accent-100 text-accent-700 text-xs font-bold transition cursor-pointer shrink-0"
            >
              Manage Pins
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedItems.map((item) => {
              let bgStyle = 'bg-amber-50/80 border-amber-200/70 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100';
              if (item.color === 'pink') bgStyle = 'bg-pink-50/80 border-pink-200/70 text-pink-950 dark:bg-pink-950/30 dark:border-pink-900/60 dark:text-pink-100';
              if (item.color === 'blue') bgStyle = 'bg-sky-50/80 border-sky-200/70 text-sky-950 dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-100';
              if (item.color === 'purple') bgStyle = 'bg-accent-50/80 border-accent-200/70 text-accent-950 dark:bg-accent-950/40 dark:border-accent-900/60 dark:text-accent-100';

              const isPdf = item.type === 'pdf' || item.content.toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={item.id}
                  onClick={() => handlePinnedCardClick(item)}
                  className={`relative p-5 rounded-2xl border transition hover:shadow-md cursor-pointer group flex flex-col justify-between min-h-[140px] ${bgStyle}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-accent-900 transition">
                        {item.title}
                      </h3>
                      <Pin className="w-4 h-4 text-red-500 fill-red-500 shrink-0 transform rotate-45" />
                    </div>

                    <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {item.content}
                    </div>
                  </div>

                  {isPdf && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                        PDF
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Metric Overview Cards Row (Real dynamic counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Thought */}
        <div 
          onClick={() => {
            onSelectThought(todayStr);
            onNavigate('daily-thoughts');
          }}
          className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[120px] transition cursor-pointer hover:shadow-xs ${
            hasThoughtToday 
              ? 'bg-[#F0FDF4] border-green-200/60 dark:bg-green-950/30 dark:border-green-900/60' 
              : 'bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-900/60'
          }`}
        >
          <span className="text-xs font-semibold text-gray-600">Today's Thought</span>
          <div className="flex items-center justify-between mt-2">
            {hasThoughtToday ? (
              <>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug pr-2">
                  Thought written for today. Keep your momentum going!
                </p>
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-green-500/30">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200 leading-snug pr-2">
                  No thought logged today yet. Click to write one!
                </p>
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/30">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Total Thoughts */}
        <div 
          onClick={() => onNavigate('daily-thoughts')}
          className="p-5 rounded-2xl bg-[#FAF5FF] border border-accent-200/60 dark:bg-accent-950/40 dark:border-accent-900/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Total Thoughts</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {thoughts.length}
            </span>
            <span className="block text-xs font-medium text-gray-500 mt-0.5">
              {thoughts.length === 1 ? 'Recorded Reflection' : 'Recorded Reflections'}
            </span>
          </div>
        </div>

        {/* Card 3: Documents */}
        <div 
          onClick={() => onNavigate('documents')}
          className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200/60 dark:bg-orange-950/30 dark:border-orange-900/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Documents</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {documents.length}
            </span>
            <span className="block text-xs font-medium text-gray-500 mt-0.5">
              {documents.length === 1 ? 'File in Vault' : 'Files in Vault'}
            </span>
          </div>
        </div>

        {/* Card 4: Ideas */}
        <div 
          onClick={() => onNavigate('ideas')}
          className="p-5 rounded-2xl bg-[#EFF6FF] border border-blue-200/60 dark:bg-blue-950/30 dark:border-blue-900/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Ideas</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {ideas.length}
            </span>
            <span className="block text-xs font-medium text-gray-500 mt-0.5">
              {ideas.length === 1 ? 'Idea Sparked' : 'Ideas Sparked'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Recharts Productivity Trend Summary Chart */}
      <ProductivityChart
        thoughts={thoughts}
        ideas={ideas}
        onNavigate={onNavigate}
      />

      {/* 4. Recent Thoughts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Thoughts</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
              {thoughts.length}
            </span>
          </div>
          {thoughts.length > 0 && (
            <button
              id="view-all-thoughts-btn"
              onClick={() => onNavigate('daily-thoughts')}
              className="text-xs font-semibold text-accent-600 hover:text-accent-700 hover:underline cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {recentThoughts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">No reflections logged yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Your thoughts page is an intimate space for mindful journaling and review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectThought(todayStr);
                onNavigate('daily-thoughts');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Today's Thought</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentThoughts.map((thought) => {
              const { day, month } = formatBadgeDate(thought.date);
              return (
                <div
                  key={thought.id}
                  onClick={() => onSelectThought(thought.date)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 hover:border-accent-200 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Date badge */}
                    <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50/70 dark:bg-gray-900/40 shrink-0 group-hover:border-accent-300 group-hover:bg-accent-50 transition">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-accent-700">
                        {day}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-accent-600">
                        {month}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-accent-700 transition">
                          {thought.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 max-w-xl">
                        {thought.content.replace(/\n/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Right side: time and chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 font-medium">
                      {thought.time}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-accent-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reminders · Storage · Calm break strip */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(() => {
          const upcoming = [...reminders]
            .filter((r) => !r.completed)
            .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())[0];
          const used = computeUsageBytes(documents);
          const pct = Math.min(100, (used / QUOTA_BYTES) * 100);
          return (
            <>
              {/* Next reminder */}
              <button
                type="button"
                onClick={() => onNavigate('reminders')}
                className="text-left p-5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 hover:border-accent-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <BellRing className="w-3.5 h-3.5 text-accent-500" /> Next reminder
                </div>
                {upcoming ? (
                  <>
                    <p className="mt-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent-700 transition truncate">
                      {upcoming.title}
                    </p>
                    <p className={`text-xs mt-0.5 font-medium ${isDue(upcoming) ? 'text-amber-600' : 'text-gray-500'}`}>
                      {formatReminderTime(upcoming.remindAt)}
                      {upcoming.repeat !== 'none' && ` · ${upcoming.repeat}`}
                    </p>
                  </>
                ) : (
                  <p className="mt-2.5 text-xs text-gray-400">Nothing scheduled — plan something gentle.</p>
                )}
              </button>

              {/* Storage */}
              <button
                type="button"
                onClick={() => onNavigate('documents')}
                className="text-left p-5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 hover:border-accent-200 shadow-2xs hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <HardDrive className="w-3.5 h-3.5 text-accent-500" /> Private storage
                </div>
                <p className="mt-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatBytes(used)} <span className="text-gray-400 font-medium">/ 250 MB</span>
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
                  <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-accent-600'}`} style={{ width: `${pct}%` }} />
                </div>
              </button>

              {/* Calm break */}
              <button
                type="button"
                onClick={onStartCalmBreak}
                className="text-left p-5 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 text-white shadow-md shadow-accent-600/25 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  <Wind className="w-3.5 h-3.5" /> Feeling full?
                </div>
                <p className="mt-2.5 text-sm font-bold">Take a calm break</p>
                <p className="text-xs text-white/70 mt-0.5">Guided breathing · 1 min</p>
              </button>
            </>
          );
        })()}
      </div>

    </div>
  );
};
