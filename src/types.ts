export type NavView = 
  | 'homepage'
  | 'dashboard'
  | 'daily-thoughts'
  | 'pinned-items'
  | 'documents'
  | 'document-viewer'
  | 'ideas'
  | 'tags'
  | 'settings';

export interface UserProfile {
  name: string;
  mobile: string;
  avatarLetter: string;
  pin: string;
  rememberMe: boolean;
  isLoggedIn: boolean;
  theme?: 'light' | 'dark';
}

export interface DailyThought {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 PM"
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface PinnedItem {
  id: string;
  type: 'note' | 'idea' | 'pdf' | 'doc';
  title: string;
  content: string; // preview or items list
  date: string; // e.g. "13 Aug 2025"
  tagLabel?: string; // e.g. "Note", "Idea", "PDF"
  color: 'yellow' | 'pink' | 'blue' | 'purple';
  targetView: NavView;
  targetId?: string;
}

export type DocumentType = 'pdf' | 'markdown' | 'doc' | 'txt' | 'json';

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  pageCount: number;
  lastModified: string;
  tags: string[];
  isPinned?: boolean;
  content: string; // Markdown text, rich doc content, or plain text
  storagePath?: string; // Supabase Storage path for the original binary (private bucket)
  mimeType?: string; // Original file MIME type
  summary?: string;
  sections?: { title: string; page: number }[];
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  date: string; // e.g. "13 Aug 2025"
  isStarred?: boolean;
  isPinned?: boolean;
}

export interface TagItem {
  name: string;
  color: string;
  count: number;
}
