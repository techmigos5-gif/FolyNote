import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  DailyThought,
  DocumentItem,
  IdeaItem,
  NavView,
  PinnedItem,
  TagItem,
  UserProfile,
} from './types';
import { storage } from './data/storage';
import { useWorkspaceSync } from './hooks/useWorkspaceSync';
import { getAuthUserId, onAuthStateChange, signOut } from './api/auth';
import { isSupabaseConfigured } from './lib/supabase';
import { documentsStorage } from './api/documents';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { HomepageView } from './views/HomepageView';
import { DashboardView } from './views/DashboardView';
import { DailyThoughtsView } from './views/DailyThoughtsView';
import { PinnedItemsView } from './views/PinnedItemsView';
import { DocumentsListView } from './views/DocumentsListView';
import { DocumentViewerView } from './views/DocumentViewerView';
import { IdeasView } from './views/IdeasView';
import { TagsView } from './views/TagsView';
import { SettingsView } from './views/SettingsView';

function AppShell() {
  // Current local date string (YYYY-MM-DD)
  const getTodayStr = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // 1. Data state (localStorage is the offline-first cache)
  const [user, setUser] = useState<UserProfile>(() => storage.getProfile());
  const [thoughts, setThoughts] = useState<DailyThought[]>(() => storage.getThoughts());
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => storage.getPinnedItems());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => storage.getDocuments());
  const [ideas, setIdeas] = useState<IdeaItem[]>(() => storage.getIdeas());
  const [tags, setTags] = useState<TagItem[]>(() => storage.getTags());

  // 2. Navigation & UI state
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'signup'>('login');
  const [activeDocId, setActiveDocId] = useState<string>('doc-1');
  const [selectedThoughtDate, setSelectedThoughtDate] = useState<string>(getTodayStr());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(isSupabaseConfigured);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // 3. Supabase session bootstrap + cross-tab auth coherence
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;
    (async () => {
      const id = await getAuthUserId();
      if (!mounted) return;
      if (id) {
        setAuthUserId(id);
        setUser((prev) => ({ ...prev, isLoggedIn: true }));
      }
      setIsLoadingAuth(false);
    })();

    const unsubscribe = onAuthStateChange((id) => {
      if (!mounted) return;
      setAuthUserId(id);
      if (id) {
        setUser((prev) => ({ ...prev, isLoggedIn: true }));
      } else {
        setUser((prev) => ({ ...prev, isLoggedIn: false }));
        setCurrentView('dashboard');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // 4. Persist the workspace offline-first
  useEffect(() => { storage.saveProfile(user); }, [user]);
  useEffect(() => { storage.saveThoughts(thoughts); }, [thoughts]);
  useEffect(() => { storage.savePinnedItems(pinnedItems); }, [pinnedItems]);
  useEffect(() => { storage.saveDocuments(documents); }, [documents]);
  useEffect(() => { storage.saveIdeas(ideas); }, [ideas]);
  useEffect(() => { storage.saveTags(tags); }, [tags]);

  // 5. Theme (dark mode) applied at the root for Tailwind `dark:` variants
  useEffect(() => {
    const root = document.documentElement;
    if (user.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [user.theme]);

  // 6. Row-level Supabase sync + realtime multi-tab coherence
  const { error: syncError } = useWorkspaceSync({
    userId: authUserId,
    thoughts,
    pinnedItems,
    documents,
    ideas,
    tags,
    onServerData: useCallback(({ thoughts: t, pinnedItems: p, documents: d, ideas: i, tags: g }) => {
      setThoughts(t);
      setPinnedItems(p);
      setDocuments(d);
      setIdeas(i);
      setTags(g);
    }, []),
  });

  // Auth Handlers
  const handleLoginSuccess = (updatedUser: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updatedUser, isLoggedIn: true }));
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await signOut();
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
    setCurrentView('dashboard');
  };

  // "Explore the homepage" from the logout modal = a signed-out preview.
  const handleOpenHomepage = () => {
    setAuthDefaultTab('login');
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
  };

  // Document Handlers
  const handleOpenDocument = (docId: string) => {
    setActiveDocId(docId);
    setCurrentView('document-viewer');
  };

  const handleUploadDocument = async (newDoc: DocumentItem, file?: File) => {
    let doc = newDoc;
    if (file && isSupabaseConfigured && authUserId) {
      const storagePath = await documentsStorage.upload(file, newDoc.id, authUserId);
      if (storagePath) {
        doc = { ...newDoc, storagePath, mimeType: file.type || undefined };
      }
    }
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    const removed = documents.find((d) => d.id === docId);
    if (removed?.storagePath && isSupabaseConfigured) {
      void documentsStorage.remove(removed.storagePath);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setPinnedItems((prev) => prev.filter((p) => p.targetId !== docId));
    if (activeDocId === docId) {
      setCurrentView('documents');
    }
  };

  const handleTogglePinDocument = (doc: DocumentItem) => {
    const isAlreadyPinned = pinnedItems.some((p) => p.targetId === doc.id);
    if (isAlreadyPinned) {
      setPinnedItems((prev) => prev.filter((p) => p.targetId !== doc.id));
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isPinned: false } : d)),
      );
    } else {
      const newPin: PinnedItem = {
        id: `pin-${Date.now()}`,
        type: 'pdf',
        title: 'Important Doc',
        content: doc.name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tagLabel: doc.type.toUpperCase(),
        color: 'blue',
        targetView: 'document-viewer',
        targetId: doc.id,
      };
      setPinnedItems((prev) => [newPin, ...prev]);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isPinned: true } : d)),
      );
    }
  };

  // Thoughts Handlers
  const handleSaveThought = (thought: DailyThought) => {
    setThoughts((prev) => {
      const exists = prev.some((t) => t.id === thought.id);
      if (exists) {
        return prev.map((t) => (t.id === thought.id ? thought : t));
      }
      return [thought, ...prev];
    });
  };

  const handleDeleteThought = (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
    setPinnedItems((prev) => prev.filter((p) => p.targetId !== id));
  };

  const handleTogglePinThought = (thought: DailyThought) => {
    const isAlreadyPinned = pinnedItems.some((p) => p.targetId === thought.id);
    if (isAlreadyPinned) {
      setPinnedItems((prev) => prev.filter((p) => p.targetId !== thought.id));
      setThoughts((prev) =>
        prev.map((t) => (t.id === thought.id ? { ...t, isPinned: false } : t)),
      );
    } else {
      const newPin: PinnedItem = {
        id: `pin-${Date.now()}`,
        type: 'note',
        title: thought.title,
        content: thought.content,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tagLabel: 'Note',
        color: 'yellow',
        targetView: 'daily-thoughts',
        targetId: thought.id,
      };
      setPinnedItems((prev) => [newPin, ...prev]);
      setThoughts((prev) =>
        prev.map((t) => (t.id === thought.id ? { ...t, isPinned: true } : t)),
      );
    }
  };

  // Ideas Handlers
  const handleAddIdea = (newIdea: IdeaItem) => {
    setIdeas((prev) => [newIdea, ...prev]);
  };

  const handleUpdateIdea = (updated: IdeaItem) => {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setPinnedItems((prev) => prev.filter((p) => p.targetId !== id));
  };

  const handleTogglePinIdea = (idea: IdeaItem) => {
    const isAlreadyPinned = pinnedItems.some((p) => p.targetId === idea.id);
    if (isAlreadyPinned) {
      setPinnedItems((prev) => prev.filter((p) => p.targetId !== idea.id));
      setIdeas((prev) =>
        prev.map((i) => (i.id === idea.id ? { ...i, isPinned: false } : i)),
      );
    } else {
      const newPin: PinnedItem = {
        id: `pin-${Date.now()}`,
        type: 'idea',
        title: idea.title,
        content: idea.description,
        date: idea.date,
        tagLabel: 'Idea',
        color: 'pink',
        targetView: 'ideas',
        targetId: idea.id,
      };
      setPinnedItems((prev) => [newPin, ...prev]);
      setIdeas((prev) =>
        prev.map((i) => (i.id === idea.id ? { ...i, isPinned: true } : i)),
      );
    }
  };

  // Pinned Items Handlers
  const handleUnpinItem = (pinId: string) => {
    setPinnedItems((prev) => prev.filter((p) => p.id !== pinId));
  };

  const handleAddPin = (pin: PinnedItem) => {
    setPinnedItems((prev) => [pin, ...prev]);
  };

  // Tags Handlers
  const handleAddTag = (name: string, color: string) => {
    setTags((prev) => {
      if (prev.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [...prev, { name, color, count: 1 }];
    });
  };

  const handleReloadAllData = () => {
    setUser(storage.getProfile());
    setThoughts(storage.getThoughts());
    setPinnedItems(storage.getPinnedItems());
    setDocuments(storage.getDocuments());
    setIdeas(storage.getIdeas());
    setTags(storage.getTags());
  };

  // Active document for viewer
  const activeDocument = documents.find((d) => d.id === activeDocId) || documents[0];

  // Wait for the Supabase session check before deciding which screen to show
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] dark:bg-[#141118]">
        <div
          className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"
          role="status"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (!user.isLoggedIn) {
    return (
      <LoginView
        user={user}
        initialTab={authDefaultTab}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFE] dark:bg-[#141118] flex text-gray-900 dark:text-gray-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onNavigateHomepage={handleOpenHomepage}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          user={user}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onProfileClick={() => setCurrentView('settings')}
          onUpdateTheme={(theme) => setUser((prev) => ({ ...prev, theme }))}
          customTitle={
            currentView === 'document-viewer' ? (
              <button
                onClick={() => setCurrentView('documents')}
                className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>&larr;</span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{activeDocument?.name || 'Document'}</span>
              </button>
            ) : undefined
          }
        />

        {/* Cloud sync degradation notice (offline-first: local data is safe) */}
        {syncError && (
          <div
            role="alert"
            className="px-4 sm:px-8 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200"
          >
            Cloud sync issue: {syncError} — your changes remain saved on this device.
          </div>
        )}

        {/* View Router */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              pinnedItems={pinnedItems}
              thoughts={thoughts}
              documents={documents}
              ideas={ideas}
              onNavigate={setCurrentView}
              onOpenDocument={handleOpenDocument}
              onSelectThought={(date) => {
                setSelectedThoughtDate(date);
                setCurrentView('daily-thoughts');
              }}
            />
          )}

          {currentView === 'daily-thoughts' && (
            <DailyThoughtsView
              thoughts={thoughts}
              selectedDate={selectedThoughtDate}
              onSelectDate={setSelectedThoughtDate}
              onSaveThought={handleSaveThought}
              onDeleteThought={handleDeleteThought}
              onTogglePinThought={handleTogglePinThought}
            />
          )}

          {currentView === 'pinned-items' && (
            <PinnedItemsView
              pinnedItems={pinnedItems}
              thoughts={thoughts}
              documents={documents}
              ideas={ideas}
              onNavigate={setCurrentView}
              onOpenDocument={handleOpenDocument}
              onSelectThought={(date) => {
                setSelectedThoughtDate(date);
                setCurrentView('daily-thoughts');
              }}
              onUnpinItem={handleUnpinItem}
              onAddPin={handleAddPin}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsListView
              documents={documents}
              onOpenDocument={handleOpenDocument}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onTogglePinDocument={handleTogglePinDocument}
            />
          )}

          {currentView === 'document-viewer' && activeDocument && (
            <DocumentViewerView
              document={activeDocument}
              onBack={() => setCurrentView('documents')}
              onTogglePin={handleTogglePinDocument}
            />
          )}

          {currentView === 'ideas' && (
            <IdeasView
              ideas={ideas}
              tags={tags}
              onAddIdea={handleAddIdea}
              onUpdateIdea={handleUpdateIdea}
              onDeleteIdea={handleDeleteIdea}
              onTogglePinIdea={handleTogglePinIdea}
            />
          )}

          {currentView === 'tags' && (
            <TagsView
              tags={tags}
              thoughts={thoughts}
              documents={documents}
              ideas={ideas}
              onOpenDocument={handleOpenDocument}
              onAddTag={handleAddTag}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              onUpdateProfile={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
              onReloadAllData={handleReloadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
