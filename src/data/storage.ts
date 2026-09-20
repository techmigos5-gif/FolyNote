import {
  initialDocuments,
  initialIdeas,
  initialPinnedItems,
  initialProfile,
  initialTags,
  initialThoughts,
} from './initialData';
import { DailyThought, DocumentItem, IdeaItem, PinnedItem, TagItem, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'myspace_real_profile_v2',
  THOUGHTS: 'myspace_real_thoughts_v2',
  PINNED: 'myspace_real_pinned_v2',
  DOCUMENTS: 'myspace_real_documents_v2',
  IDEAS: 'myspace_real_ideas_v2',
  TAGS: 'myspace_real_tags_v2',
  PURGED_DEMO: 'myspace_demo_purged_v2',
};

// Purge any legacy demo data from earlier sessions
function purgeLegacyDemoData(): void {
  try {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEYS.PURGED_DEMO)) {
      const oldKeys = [
        'myspace_user_profile_v1',
        'myspace_daily_thoughts_v1',
        'myspace_pinned_items_v1',
        'myspace_documents_v1',
        'myspace_ideas_v1',
        'myspace_tags_v1',
      ];
      for (const k of oldKeys) {
        localStorage.removeItem(k);
      }
      localStorage.setItem(STORAGE_KEYS.PURGED_DEMO, 'true');
    }
  } catch {
    // Ignore localStorage errors
  }
}

purgeLegacyDemoData();

export const storage = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },
  saveProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  getThoughts: (): DailyThought[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THOUGHTS);
      return data ? JSON.parse(data) : initialThoughts;
    } catch {
      return initialThoughts;
    }
  },
  saveThoughts: (thoughts: DailyThought[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));
    } catch (e) {
      console.error('Failed to save thoughts to localStorage', e);
    }
  },

  getPinnedItems: (): PinnedItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PINNED);
      return data ? JSON.parse(data) : initialPinnedItems;
    } catch {
      return initialPinnedItems;
    }
  },
  savePinnedItems: (items: PinnedItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PINNED, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save pinned items to localStorage', e);
    }
  },

  getDocuments: (): DocumentItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  },
  saveDocuments: (docs: DocumentItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save documents to localStorage', e);
    }
  },

  getIdeas: (): IdeaItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      return data ? JSON.parse(data) : initialIdeas;
    } catch {
      return initialIdeas;
    }
  },
  saveIdeas: (ideas: IdeaItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    } catch (e) {
      console.error('Failed to save ideas to localStorage', e);
    }
  },

  getTags: (): TagItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      return data ? JSON.parse(data) : initialTags;
    } catch {
      return initialTags;
    }
  },
  saveTags: (tags: TagItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (e) {
      console.error('Failed to save tags to localStorage', e);
    }
  },

  exportAllData: (): string => {
    const backup = {
      profile: storage.getProfile(),
      thoughts: storage.getThoughts(),
      pinned: storage.getPinnedItems(),
      documents: storage.getDocuments(),
      ideas: storage.getIdeas(),
      tags: storage.getTags(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData: (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile) storage.saveProfile(parsed.profile);
      if (parsed.thoughts) storage.saveThoughts(parsed.thoughts);
      if (parsed.pinned) storage.savePinnedItems(parsed.pinned);
      if (parsed.documents) storage.saveDocuments(parsed.documents);
      if (parsed.ideas) storage.saveIdeas(parsed.ideas);
      if (parsed.tags) storage.saveTags(parsed.tags);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  },

  resetToDefaults: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.THOUGHTS);
      localStorage.removeItem(STORAGE_KEYS.PINNED);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.IDEAS);
      localStorage.removeItem(STORAGE_KEYS.TAGS);
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  },

  clearAll: (): void => {
    storage.resetToDefaults();
  },
};
