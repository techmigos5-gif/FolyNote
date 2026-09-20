import React from 'react';
import { DailyThought, DocumentItem, IdeaItem, NavView, PinnedItem } from '../types';
import { CheckCircle2, ChevronRight, Pin, Sparkles, BookOpen, Plus, Folder, Lightbulb } from 'lucide-react';
import { ProductivityChart } from '../components/ProductivityChart';

interface DashboardViewProps {
  pinnedItems: PinnedItem[];
  thoughts: DailyThought[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  onNavigate: (view: NavView) => void;
  onOpenDocument: (docId: string) => void;
  onSelectThought: (date: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pinnedItems,
  thoughts,
  documents,
  ideas,
  onNavigate,
  onOpenDocument,
  onSelectThought,
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
            <h2 className="text-lg font-bold text-gray-900">Pinned Items</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-100">
              {pinnedItems.length}
            </span>
          </div>
          {pinnedItems.length > 0 && (
            <button
              id="view-all-pinned-btn"
              onClick={() => onNavigate('pinned-items')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {pinnedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Pin className="w-5 h-5 transform rotate-45" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">No pinned items yet</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pin your key thoughts, ideas, or files to access them directly from this board.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pinned-items')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer shrink-0"
            >
              Manage Pins
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedItems.map((item) => {
              let bgStyle = 'bg-amber-50/80 border-amber-200/70 text-amber-950';
              if (item.color === 'pink') bgStyle = 'bg-pink-50/80 border-pink-200/70 text-pink-950';
              if (item.color === 'blue') bgStyle = 'bg-sky-50/80 border-sky-200/70 text-sky-950';
              if (item.color === 'purple') bgStyle = 'bg-purple-50/80 border-purple-200/70 text-purple-950';

              const isPdf = item.type === 'pdf' || item.content.toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={item.id}
                  onClick={() => handlePinnedCardClick(item)}
                  className={`relative p-5 rounded-2xl border transition hover:shadow-md cursor-pointer group flex flex-col justify-between min-h-[140px] ${bgStyle}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <h3 className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-purple-900 transition">
                        {item.title}
                      </h3>
                      <Pin className="w-4 h-4 text-red-500 fill-red-500 shrink-0 transform rotate-45" />
                    </div>

                    <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
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
              ? 'bg-[#F0FDF4] border-green-200/60' 
              : 'bg-amber-50/50 border-amber-200/60'
          }`}
        >
          <span className="text-xs font-semibold text-gray-600">Today's Thought</span>
          <div className="flex items-center justify-between mt-2">
            {hasThoughtToday ? (
              <>
                <p className="text-xs font-medium text-gray-800 leading-snug pr-2">
                  Thought written for today. Keep your momentum going!
                </p>
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-green-500/30">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-amber-900 leading-snug pr-2">
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
          className="p-5 rounded-2xl bg-[#FAF5FF] border border-purple-200/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Total Thoughts</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
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
          className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Documents</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
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
          className="p-5 rounded-2xl bg-[#EFF6FF] border border-blue-200/60 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-xs transition"
        >
          <span className="text-xs font-semibold text-gray-600">Ideas</span>
          <div className="mt-1">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
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
            <h2 className="text-lg font-bold text-gray-900">Recent Thoughts</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
              {thoughts.length}
            </span>
          </div>
          {thoughts.length > 0 && (
            <button
              id="view-all-thoughts-btn"
              onClick={() => onNavigate('daily-thoughts')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {recentThoughts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-gray-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No reflections logged yet</h4>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
                  className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Date badge */}
                    <div className="w-12 h-12 rounded-xl border border-gray-200 flex flex-col items-center justify-center bg-gray-50/70 shrink-0 group-hover:border-purple-300 group-hover:bg-purple-50 transition">
                      <span className="text-sm font-bold text-gray-900 leading-tight group-hover:text-purple-700">
                        {day}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-purple-600">
                        {month}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition">
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
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
