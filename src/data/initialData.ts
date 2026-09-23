import { DailyThought, DocumentItem, IdeaItem, PinnedItem, UserProfile } from '../types';

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
