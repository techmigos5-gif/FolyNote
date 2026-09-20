import React, { useState } from 'react';
import { DailyThought } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  Pin, 
  X, 
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';

interface DailyThoughtsViewProps {
  thoughts: DailyThought[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSaveThought: (thought: DailyThought) => void;
  onDeleteThought: (id: string) => void;
  onTogglePinThought: (thought: DailyThought) => void;
}

export const DailyThoughtsView: React.FC<DailyThoughtsViewProps> = ({
  thoughts,
  selectedDate,
  onSelectDate,
  onSaveThought,
  onDeleteThought,
  onTogglePinThought,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<DailyThought | null>(null);

  // Form states for modal
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTime, setFormTime] = useState('10:30 PM');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTags, setFormTags] = useState('Tech, Growth');

  // Compute Sunday of the current visible week and generate 7-day array dynamically
  const parsedSelected = React.useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  const weekDays = React.useMemo(() => {
    const d = new Date(parsedSelected);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      days.push({
        dayName: dayNames[i],
        dateNum: cur.getDate(),
        fullDate: `${y}-${m}-${day}`,
      });
    }
    return days;
  }, [parsedSelected]);

  const monthYearLabel = React.useMemo(() => {
    return parsedSelected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [parsedSelected]);

  const handlePrevWeek = () => {
    const d = new Date(parsedSelected);
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  };

  const handleNextWeek = () => {
    const d = new Date(parsedSelected);
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  };

  // Format full header date: "Wednesday, 13 August 2025"
  const getFullDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Wednesday, 13 August 2025';
    }
  };

  const currentDayThoughts = thoughts.filter((t) => t.date === selectedDate);

  const openNewModal = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setEditingThought(null);
    setFormTitle('');
    setFormContent('');
    setFormTime(formattedTime || '10:30 PM');
    setFormDate(selectedDate);
    setFormTags('Growth');
    setIsModalOpen(true);
  };

  const openEditModal = (thought: DailyThought) => {
    setEditingThought(thought);
    setFormTitle(thought.title);
    setFormContent(thought.content);
    setFormTime(thought.time);
    setFormDate(thought.date);
    setFormTags(thought.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedItem: DailyThought = {
      id: editingThought ? editingThought.id : `thought-${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      time: formTime.trim() || '10:30 PM',
      date: formDate,
      tags: parsedTags,
      isPinned: editingThought ? editingThought.isPinned : false,
    };

    onSaveThought(savedItem);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-200">
      
      {/* 1. Header with Title and + New Thought button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Daily Thoughts
        </h1>
        <button
          id="new-thought-btn"
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-accent-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Thought</span>
        </button>
      </div>

      {/* 2. Calendar Month Bar & Week Day Picker */}
      <div className="bg-white dark:bg-[#221a30] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-5">
        
        {/* Month selector header */}
        <div className="flex items-center justify-between px-2">
          <button 
            type="button"
            onClick={handlePrevWeek}
            aria-label="Previous week"
            className="p-1.5 rounded-lg text-gray-500 hover:text-accent-700 hover:bg-accent-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {monthYearLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                onSelectDate(`${y}-${m}-${d}`);
              }}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent-50 hover:bg-accent-100 text-accent-700 transition cursor-pointer"
            >
              Today
            </button>
          </div>

          <button 
            type="button"
            onClick={handleNextWeek}
            aria-label="Next week"
            className="p-1.5 rounded-lg text-gray-500 hover:text-accent-700 hover:bg-accent-50 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 7-day horizontal bar (Sun 10 to Sat 16) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
          {weekDays.map((item) => {
            const isActive = selectedDate === item.fullDate;
            return (
              <button
                key={item.fullDate}
                id={`day-btn-${item.dateNum}`}
                onClick={() => onSelectDate(item.fullDate)}
                className={`py-2 sm:py-3 px-0.5 sm:px-1 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                  isActive
                    ? 'bg-accent-600 text-white shadow-md shadow-accent-600/25 ring-2 ring-accent-200'
                    : 'bg-gray-50/70 dark:bg-gray-900/40 hover:bg-accent-50 text-gray-700 dark:text-gray-300 hover:text-accent-700 border border-gray-100 dark:border-gray-800'
                }`}
              >
                <span className={`text-[10px] sm:text-[11px] font-medium ${isActive ? 'text-accent-100' : 'text-gray-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-xs sm:text-base font-bold mt-0.5 sm:mt-1">
                  {item.dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Header */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
          {getFullDateDisplay(selectedDate)}
        </h2>
      </div>

      {/* 4. Thoughts List for Selected Day */}
      <div className="space-y-4">
        {currentDayThoughts.length === 0 ? (
          <div className="bg-white dark:bg-[#221a30] p-12 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent-50 text-accent-600 mx-auto flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No thoughts recorded for this day</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Take a mindful moment to reflect on your goals, accomplishments, or learnings.
            </p>
            <button
              onClick={openNewModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Write First Thought
            </button>
          </div>
        ) : (
          currentDayThoughts.map((thought) => (
            <div
              key={thought.id}
              className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-md hover:border-accent-100 transition space-y-4"
            >
              {/* Card Header: Time and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{thought.time}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTogglePinThought(thought)}
                    className={`p-1.5 rounded-lg transition ${
                      thought.isPinned ? 'text-accent-600 bg-accent-50' : 'text-gray-400 hover:text-accent-600 hover:bg-gray-100'
                    }`}
                    title={thought.isPinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
                  >
                    <Pin className={`w-4 h-4 ${thought.isPinned ? 'fill-accent-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => openEditModal(thought)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    title="Edit thought"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this thought?')) {
                        onDeleteThought(thought.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete thought"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {thought.title}
              </h3>

              {/* Content Body */}
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed font-normal">
                {thought.content}
              </p>

              {/* Tags */}
              {thought.tags && thought.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                  {thought.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-700 text-[11px] font-medium border border-accent-100/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for New / Edit Thought */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#221a30] p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {editingThought ? 'Edit Thought' : 'Capture Daily Thought'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. End of the day, Morning Reflections"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-accent-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="10:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-accent-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Thought Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="What was completed today? What are you grateful for? What is next?"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="ECE, Study, Tech, Work"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-accent-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-semibold shadow-xs shadow-accent-600/20"
                >
                  {editingThought ? 'Save Changes' : 'Record Thought'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
