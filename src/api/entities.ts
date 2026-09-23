import { supabase } from '../lib/supabase';
import { DailyThought, DocumentItem, IdeaItem, PinnedItem } from '../types';

// ===============================================================
// Thoughts
// ===============================================================

export interface ThoughtRow {
  id: string;
  entry_date: string;
  entry_time: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
}

function rowToThought(r: ThoughtRow): DailyThought {
  return {
    id: r.id,
    date: r.entry_date,
    time: r.entry_time,
    title: r.title,
    content: r.content,
    tags: r.tags ?? [],
    isPinned: r.is_pinned,
  };
}

function thoughtToRow(t: DailyThought, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    entry_date: t.date,
    entry_time: t.time,
    title: t.title,
    content: t.content,
    tags: t.tags ?? [],
    is_pinned: t.isPinned ?? false,
  };
}

export const thoughtsApi = {
  async listAll(): Promise<DailyThought[]> {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Load thoughts failed: ${error.message}`);
    return (data ?? []).map(rowToThought);
  },

  async upsert(thought: DailyThought, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('thoughts')
      .upsert(thoughtToRow(thought, userId));
    if (error) {
      console.warn('thoughts.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('thoughts').delete().eq('id', id);
    if (error) {
      console.warn('thoughts.remove failed:', error.message);
      return false;
    }
    return true;
  },
};

// ===============================================================
// Ideas
// ===============================================================

export interface IdeaRow {
  id: string;
  title: string;
  description: string;
  tag: string;
  idea_date: string;
  is_starred: boolean;
  is_pinned: boolean;
}

function rowToIdea(r: IdeaRow): IdeaItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    tag: r.tag,
    date: r.idea_date,
    isStarred: r.is_starred,
    isPinned: r.is_pinned,
  };
}

function ideaToRow(idea: IdeaItem, userId: string) {
  return {
    id: idea.id,
    user_id: userId,
    title: idea.title,
    description: idea.description,
    tag: idea.tag,
    idea_date: idea.date,
    is_starred: idea.isStarred ?? false,
    is_pinned: idea.isPinned ?? false,
  };
}

export const ideasApi = {
  async listAll(): Promise<IdeaItem[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Load ideas failed: ${error.message}`);
    return (data ?? []).map(rowToIdea);
  },

  async upsert(idea: IdeaItem, userId: string): Promise<boolean> {
    const { error } = await supabase.from('ideas').upsert(ideaToRow(idea, userId));
    if (error) {
      console.warn('ideas.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (error) {
      console.warn('ideas.remove failed:', error.message);
      return false;
    }
    return true;
  },
};

// ===============================================================
// Documents (metadata only — binary lives in Storage)
// ===============================================================

export interface DocumentRow {
  id: string;
  name: string;
  doc_type: string;
  size_label: string;
  size_bytes: number | null;
  page_count: number;
  last_modified: string;
  tags: string[];
  is_pinned: boolean;
  content: string;
  storage_path: string | null;
  mime_type: string | null;
  summary: string | null;
}

function rowToDocument(r: DocumentRow): DocumentItem {
  return {
    id: r.id,
    name: r.name,
    type: r.doc_type as DocumentItem['type'],
    size: r.size_label,
    sizeBytes: r.size_bytes ?? undefined,
    pageCount: r.page_count,
    lastModified: r.last_modified,
    tags: r.tags ?? [],
    isPinned: r.is_pinned,
    content: r.content,
    storagePath: r.storage_path ?? undefined,
    mimeType: r.mime_type ?? undefined,
    summary: r.summary ?? undefined,
  };
}

function documentToRow(doc: DocumentItem, userId: string) {
  return {
    id: doc.id,
    user_id: userId,
    name: doc.name,
    doc_type: doc.type,
    size_label: doc.size,
    size_bytes: doc.sizeBytes ?? null,
    page_count: doc.pageCount,
    last_modified: doc.lastModified,
    tags: doc.tags ?? [],
    is_pinned: doc.isPinned ?? false,
    content: doc.content,
    storage_path: doc.storagePath ?? null,
    mime_type: doc.mimeType ?? null,
    summary: doc.summary ?? null,
  };
}

export const documentsApi = {
  async listAll(): Promise<DocumentItem[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Load documents failed: ${error.message}`);
    return (data ?? []).map(rowToDocument);
  },

  async upsert(doc: DocumentItem, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .upsert(documentToRow(doc, userId));
    if (error) {
      console.warn('documents.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.warn('documents.remove failed:', error.message);
      return false;
    }
    return true;
  },
};

// ===============================================================
// Pinned items
// ===============================================================

export interface PinnedItemRow {
  id: string;
  type: string;
  title: string;
  content: string;
  pin_date: string;
  tag_label: string;
  color: string;
  target_view: string;
  target_id: string | null;
}

function rowToPin(r: PinnedItemRow): PinnedItem {
  return {
    id: r.id,
    type: r.type as PinnedItem['type'],
    title: r.title,
    content: r.content,
    date: r.pin_date,
    tagLabel: r.tag_label,
    color: r.color as PinnedItem['color'],
    targetView: r.target_view as PinnedItem['targetView'],
    targetId: r.target_id ?? undefined,
  };
}

function pinToRow(pin: PinnedItem, userId: string) {
  return {
    id: pin.id,
    user_id: userId,
    type: pin.type,
    title: pin.title,
    content: pin.content,
    pin_date: pin.date,
    tag_label: pin.tagLabel ?? '',
    color: pin.color,
    target_view: pin.targetView,
    target_id: pin.targetId ?? null,
  };
}

export const pinsApi = {
  async listAll(): Promise<PinnedItem[]> {
    const { data, error } = await supabase
      .from('pinned_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Load pins failed: ${error.message}`);
    return (data ?? []).map(rowToPin);
  },

  async upsert(pin: PinnedItem, userId: string): Promise<boolean> {
    const { error } = await supabase.from('pinned_items').upsert(pinToRow(pin, userId));
    if (error) {
      console.warn('pins.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('pinned_items').delete().eq('id', id);
    if (error) {
      console.warn('pins.remove failed:', error.message);
      return false;
    }
    return true;
  },
};
