import { DailyThought, DocumentItem, IdeaItem, PinnedItem, TagItem, UserProfile } from '../types';

// Clean, authentic real workspace baseline (all demo data removed)
export const initialProfile: UserProfile = {
  name: '',
  mobile: '',
  avatarLetter: 'U',
  pin: '',
  rememberMe: false,
  isLoggedIn: false,
};

export const initialThoughts: DailyThought[] = [];
export const initialPinnedItems: PinnedItem[] = [];
export const initialDocuments: DocumentItem[] = [];
export const initialIdeas: IdeaItem[] = [];
export const initialTags: TagItem[] = [
  { name: 'Personal', color: 'purple', count: 0 },
  { name: 'Work', color: 'blue', count: 0 },
  { name: 'Idea', color: 'amber', count: 0 },
];
