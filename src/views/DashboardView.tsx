import React from 'react';
import { DailyThought, DocumentItem, IdeaItem, NavView, PinnedItem, ReminderItem } from '../types';
import { BellRing, CheckCircle2, ChevronRight, Pin, Sparkles, BookOpen, Plus, Folder, Lightbulb, HardDrive, Wind } from 'lucide-react';
import { ProductivityChart } from '../components/ProductivityChart';
import { formatReminderTime, isDue } from '../lib/reminders';
import { computeUsageBytes, formatBytes, QUOTA_BYTES } from '../lib/storageQuota';

interface DashboardViewProps {
  pinnedItems: PinnedItem[];
  thoughts: DailyThought[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  reminders: ReminderItem[];
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

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
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
