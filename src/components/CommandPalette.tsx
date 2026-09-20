import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon?: React.ReactNode;
  keywords?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}

/** Cmd/Ctrl+K quick-actions palette. */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q) ||
        (i.keywords ?? '').toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return <AnimatePresence />;

  const runItem = (item?: CommandItem) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const groups = filtered.reduce<Record<string, { item: CommandItem; index: number }[]>>((acc, item, index) => {
    (acc[item.group] ||= []).push({ item, index });
    return acc;
  }, {});

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#221a30] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(0, i - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  runItem(filtered[activeIndex]);
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              placeholder="Jump to a view or run an action…"
              aria-label="Search commands"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Nothing matches “{query}”</p>
            ) : (
              Object.entries(groups).map(([group, entries]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {group}
                  </p>
                  {entries.map(({ item, index }) => (
                    <button
                      key={item.id}
                      type="button"
                      data-active={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runItem(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                        index === activeIndex
                          ? 'bg-accent-50 dark:bg-accent-900/40 text-accent-800 dark:text-accent-200'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="text-gray-400 shrink-0">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
