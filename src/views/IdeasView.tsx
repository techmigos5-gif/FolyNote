import React, { useState } from 'react';
import { IdeaItem, TagItem } from '../types';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Star, 
  Trash2, 
  Pin, 
  X, 
  Lightbulb, 
  Pencil,
  Sparkles
} from 'lucide-react';

interface IdeasViewProps {
  ideas: IdeaItem[];
  tags: TagItem[];
  onAddIdea: (idea: IdeaItem) => void;
  onUpdateIdea: (idea: IdeaItem) => void;
  onDeleteIdea: (id: string) => void;
  onTogglePinIdea: (idea: IdeaItem) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  tags,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onTogglePinIdea,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All Tags');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTag, setFormTag] = useState('AI');

  const openNewModal = () => {
    setEditingIdea(null);
    setFormTitle('');
    setFormDescription('');
    setFormTag('AI');
    setIsModalOpen(true);
  };

  const openEditModal = (idea: IdeaItem) => {
    setEditingIdea(idea);
    setFormTitle(idea.title);
    setFormDescription(idea.description);
    setFormTag(idea.tag);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    if (editingIdea) {
      onUpdateIdea({
        ...editingIdea,
        title: formTitle.trim(),
        description: formDescription.trim(),
        tag: formTag.trim(),
      });
    } else {
      const newIdea: IdeaItem = {
        id: `idea-${Date.now()}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        tag: formTag.trim(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        isStarred: true,
      };
      onAddIdea(newIdea);
    }
    setIsModalOpen(false);
  };

  const toggleStar = (idea: IdeaItem) => {
    onUpdateIdea({
      ...idea,
      isStarred: !idea.isStarred,
    });
  };

  // Filter ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All Tags' || idea.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const availableTags = ['All Tags', ...Array.from(new Set(ideas.map((i) => i.tag)))];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-200">
      
      {/* 1. Header with Title and + New Idea button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Ideas
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Capture spontaneous thoughts, product features, and future innovations
          </p>
        </div>

        <button
          id="new-idea-btn"
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Idea</span>
        </button>
      </div>

      {/* 2. Search & Tag Filter Bar (matching Screen 6 in screenshot) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 shadow-2xs"
          />
        </div>

        {/* Tag selector dropdown */}
        <div className="relative w-full sm:w-48">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 shadow-2xs pr-8 cursor-pointer"
          >
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Ideas List */}
      <div className="space-y-3.5">
        {filteredIdeas.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">No ideas found</h3>
            <p className="text-xs text-gray-500">
              Record your next breakthrough project or concept.
            </p>
            <button
              onClick={openNewModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Capture Idea
            </button>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const isAI = idea.tag.toLowerCase() === 'ai';

            return (
              <div
                key={idea.id}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 shadow-2xs hover:shadow-md transition space-y-2.5 group"
              >
                {/* Header row: Star + Title + Tag Pill + Date */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleStar(idea)}
                      className="text-amber-500 hover:scale-110 transition p-0.5"
                      title={idea.isStarred ? 'Starred' : 'Star idea'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          idea.isStarred ? 'fill-amber-400 text-amber-500' : 'text-gray-300'
                        }`}
                      />
                    </button>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition truncate">
                      {idea.title}
                    </h3>

                    {/* Tag pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide shrink-0 ${
                        isAI
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {idea.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 font-medium">
                      {idea.date}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onTogglePinIdea(idea)}
                        className={`p-1.5 rounded-lg transition ${
                          idea.isPinned ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-gray-50'
                        }`}
                        title={idea.isPinned ? 'Unpin' : 'Pin to dashboard'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${idea.isPinned ? 'fill-purple-600' : ''}`} />
                      </button>
                      <button
                        onClick={() => openEditModal(idea)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${idea.title}"?`)) {
                            onDeleteIdea(idea.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed pl-6">
                  {idea.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for New / Edit Idea */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingIdea ? 'Edit Idea' : 'Capture New Idea'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Idea Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. AI Assistant for Teachers"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tag Category
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {['AI', 'App', 'Fintech', 'School', 'Web', 'ECE'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormTag(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        formTag === t
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  placeholder="Or custom tag..."
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What is this idea about? How does it help users?"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  {editingIdea ? 'Save Changes' : 'Save Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
