import React, { useState } from 'react';
import { DailyThought, DocumentItem, IdeaItem, TagItem } from '../types';
import { Tag, Plus, Filter, FileText, Lightbulb, BookOpen, X } from 'lucide-react';

interface TagsViewProps {
  tags: TagItem[];
  thoughts: DailyThought[];
  documents: DocumentItem[];
  ideas: IdeaItem[];
  onOpenDocument: (id: string) => void;
  onAddTag: (name: string, color: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  tags,
  thoughts,
  documents,
  ideas,
  onOpenDocument,
  onAddTag,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('Tech');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('purple');

  const matchingThoughts = thoughts.filter((t) => t.tags?.includes(selectedTag));
  const matchingDocs = documents.filter((d) => d.tags.includes(selectedTag));
  const matchingIdeas = ideas.filter((i) => i.tag.toLowerCase() === selectedTag.toLowerCase());

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onAddTag(newTagName.trim(), newTagColor);
    setSelectedTag(newTagName.trim());
    setNewTagName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Tags &amp; Taxonomy
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse and cross-link thoughts, documents, and ideas across shared topics
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-accent-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Tag</span>
        </button>
      </div>

      {/* Tags Chips Bar */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-[#221a30] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
        {tags.map((tag) => {
          const isSelected = selectedTag.toLowerCase() === tag.name.toLowerCase();
          return (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(tag.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                isSelected
                  ? 'bg-accent-600 text-white shadow-xs shadow-accent-600/20'
                  : 'bg-gray-50 dark:bg-gray-900/40 hover:bg-accent-50 text-gray-700 dark:text-gray-300 hover:text-accent-700 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <span>#{tag.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filtered Content Sections */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>Items tagged with</span>
          <span className="px-2.5 py-0.5 rounded-md bg-accent-100 text-accent-700 font-bold">
            #{selectedTag}
          </span>
        </h2>

        {/* 1. Thoughts */}
        {matchingThoughts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daily Thoughts ({matchingThoughts.length})</span>
            </h3>
            <div className="space-y-2">
              {matchingThoughts.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 mb-1">
                    <span>{t.title}</span>
                    <span className="text-gray-400 font-normal">{t.date} • {t.time}</span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Documents */}
        {matchingDocs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Documents ({matchingDocs.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onOpenDocument(d.id)}
                  className="p-4 rounded-xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 hover:border-accent-200 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{d.name}</h4>
                    <span className="text-[10px] text-gray-400">{d.size} • {d.pageCount} pages</span>
                  </div>
                  <span className="text-xs font-semibold text-accent-600">View &rarr;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Ideas */}
        {matchingIdeas.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Ideas ({matchingIdeas.length})</span>
            </h3>
            <div className="space-y-2">
              {matchingIdeas.map((i) => (
                <div key={i.id} className="p-4 rounded-xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 mb-1">
                    <span>{i.title}</span>
                    <span className="text-gray-400 font-normal">{i.date}</span>
                  </div>
                  <p className="text-gray-600">{i.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {matchingThoughts.length === 0 && matchingDocs.length === 0 && matchingIdeas.length === 0 && (
          <div className="bg-white dark:bg-[#221a30] p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs">
            No items currently tagged with #{selectedTag}. Add this tag to your thoughts or ideas to view them here!
          </div>
        )}
      </div>

      {/* New Tag Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#221a30] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Create Tag</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTagSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Marketing, Personal"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
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
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
