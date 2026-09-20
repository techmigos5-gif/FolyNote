import React, { useState } from 'react';
import { DailyThought, DocumentItem, IdeaItem, NavView, PinnedItem } from '../types';
import { Pin, Plus, X, ArrowRight, Trash2 } from 'lucide-react';

interface PinnedItemsViewProps {
  pinnedItems: PinnedItem[];
  thoughts: DailyThought[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  onNavigate: (view: NavView) => void;
  onOpenDocument: (docId: string) => void;
  onSelectThought: (date: string) => void;
  onUnpinItem: (id: string) => void;
  onAddPin: (item: PinnedItem) => void;
}

export const PinnedItemsView: React.FC<PinnedItemsViewProps> = ({
  pinnedItems,
  thoughts,
  documents,
  ideas,
  onNavigate,
  onOpenDocument,
  onSelectThought,
  onUnpinItem,
  onAddPin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinType, setPinType] = useState<'note' | 'idea' | 'pdf'>('note');
  const [pinTitle, setPinTitle] = useState('');
  const [pinContent, setPinContent] = useState('');
  const [pinColor, setPinColor] = useState<'yellow' | 'pink' | 'blue' | 'purple'>('yellow');

  const handleCardClick = (pin: PinnedItem) => {
    if (pin.targetView === 'document-viewer' && pin.targetId) {
      onOpenDocument(pin.targetId);
    } else if (pin.targetView === 'daily-thoughts') {
      onSelectThought('2025-08-13');
    } else {
      onNavigate(pin.targetView);
    }
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTitle.trim() || !pinContent.trim()) return;

    const newPin: PinnedItem = {
      id: `pin-${Date.now()}`,
      type: pinType,
      title: pinTitle.trim(),
      content: pinContent.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      tagLabel: pinType === 'note' ? 'Note' : pinType === 'idea' ? 'Idea' : 'PDF',
      color: pinColor,
      targetView: pinType === 'pdf' ? 'documents' : pinType === 'idea' ? 'ideas' : 'daily-thoughts',
    };

    onAddPin(newPin);
    setIsModalOpen(false);
    setPinTitle('');
    setPinContent('');
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-200">
      
      {/* 1. Header with Title and "+ Pin Item" button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Pinned Items
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quick-access shortcuts to your most critical thoughts, notes, and documents
          </p>
        </div>

        <button
          id="add-pin-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-accent-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Pin Item</span>
        </button>
      </div>

      {/* 2. Pinned Items List (matching Screen 5 in screenshot) */}
      <div className="space-y-4">
        {pinnedItems.map((item) => {
          let cardBg = 'bg-amber-50/90 border-amber-200/80 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100';
          let badgeBg = 'bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200';

          if (item.color === 'pink') {
            cardBg = 'bg-pink-50/90 border-pink-200/80 text-pink-950 dark:bg-pink-950/30 dark:border-pink-900/60 dark:text-pink-100';
            badgeBg = 'bg-pink-200/80 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200';
          } else if (item.color === 'blue') {
            cardBg = 'bg-sky-50/90 border-sky-200/80 text-sky-950 dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-100';
            badgeBg = 'bg-sky-200/80 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200';
          } else if (item.color === 'purple') {
            cardBg = 'bg-accent-50/90 border-accent-200/80 text-accent-950 dark:bg-accent-950/40 dark:border-accent-900/60 dark:text-accent-100';
            badgeBg = 'bg-accent-200/80 text-accent-900 dark:bg-accent-900/60 dark:text-accent-200';
          }

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition hover:shadow-md cursor-pointer relative group ${cardBg}`}
              onClick={() => handleCardClick(item)}
            >
              {/* Top row: Label badge + Date + Pin icon */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${badgeBg}`}>
                    {item.tagLabel || item.type}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-red-500 fill-red-500 shrink-0 transform rotate-45" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpinItem(item.id);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/60 dark:hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                    title="Unpin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent-900 transition mb-1.5">
                {item.title}
              </h3>

              {/* Content body */}
              <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>

              {/* Hover indicator */}
              <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-end text-[11px] font-semibold text-accent-700 opacity-80 group-hover:opacity-100">
                <span className="flex items-center gap-1">
                  Open in {item.targetView === 'document-viewer' ? 'Document Viewer' : item.targetView} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to add custom pin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#221a30] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Pin a New Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'note', label: 'Note', color: 'yellow' },
                    { type: 'idea', label: 'Idea', color: 'pink' },
                    { type: 'pdf', label: 'Doc / PDF', color: 'blue' },
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => {
                        setPinType(t.type as any);
                        setPinColor(t.color as any);
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        pinType === t.type ? 'border-accent-600 bg-accent-50 text-accent-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Card Color</label>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'yellow', bg: 'bg-amber-100 border-amber-300' },
                    { key: 'pink', bg: 'bg-pink-100 border-pink-300' },
                    { key: 'blue', bg: 'bg-sky-100 border-sky-300' },
                    { key: 'purple', bg: 'bg-accent-100 border-accent-300' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setPinColor(c.key as any)}
                      className={`w-7 h-7 rounded-full border-2 transition ${c.bg} ${
                        pinColor === c.key ? 'ring-2 ring-accent-600 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  placeholder="e.g. Daily Targets, Project Ideas"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-accent-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Content / Items</label>
                <textarea
                  required
                  rows={3}
                  value={pinContent}
                  onChange={(e) => setPinContent(e.target.value)}
                  placeholder="Enter details or bullet targets..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-accent-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-semibold"
                >
                  Save Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
