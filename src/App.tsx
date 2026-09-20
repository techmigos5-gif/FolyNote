import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen, Compass, FileText, Folder, Lightbulb, LayoutDashboard, Pin, Settings, Tag, Wind,
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  DailyThought,
  DocumentItem,
  IdeaItem,
  NavView,
  PinnedItem,
  ReminderItem,
  TagItem,
  UserProfile,
} from './types';
import { storage } from './data/storage';
import { useWorkspaceSync } from './hooks/useWorkspaceSync';
import { useReminderScheduler } from './hooks/useReminderScheduler';
import { getAuthUserId, onAuthStateChange, signOut } from './api/auth';
import { isSupabaseConfigured } from './lib/supabase';
import { documentsStorage } from './api/documents';
import { checkQuota } from './lib/storageQuota';
import { toast } from './lib/toast';
import { ACCENTS, applyAccent, isAccentId } from './lib/theme';
import { SoundscapeId, startSoundscape, stopSoundscape, setVolume as setScapeVolume } from './lib/sounds';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastHost } from './components/ToastHost';
import { CommandPalette, CommandItem } from './components/CommandPalette';
import { BreathingOverlay } from './components/BreathingOverlay';
import { SoundscapeBar } from './components/SoundscapeBar';
import { LoginView } from './views/LoginView';
import { HomepageView } from './views/HomepageView';
import { DashboardView } from './views/DashboardView';
import { DailyThoughtsView } from './views/DailyThoughtsView';
import { PinnedItemsView } from './views/PinnedItemsView';
import { DocumentsListView } from './views/DocumentsListView';
import { DocumentViewerView } from './views/DocumentViewerView';
import { IdeasView } from './views/IdeasView';
import { RemindersView } from './views/RemindersView';
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
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storage.getReminders());

  // 2. Navigation & UI state
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'signup'>('login');
  // Signed-out visitors land on the public homepage first, then continue to auth.
  const [showLanding, setShowLanding] = useState(true);
  const [activeDocId, setActiveDocId] = useState<string>('doc-1');
  const [selectedThoughtDate, setSelectedThoughtDate] = useState<string>(getTodayStr());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(isSupabaseConfigured);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [calmBreakOpen, setCalmBreakOpen] = useState(false);
  const [soundscape, setSoundscape] = useState<SoundscapeId | null>(null);
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.55);

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
  useEffect(() => { storage.saveReminders(reminders); }, [reminders]);

  // 5. Theme (dark mode + accent palette) applied at the root with a
  //    short cross-fade so switches feel buttery instead of snapping.
  const themeAnimateTimer = useRef<number | null>(null);
  const animateThemeChange = () => {
    const root = document.documentElement;
    root.classList.add('theme-animating');
    if (themeAnimateTimer.current) window.clearTimeout(themeAnimateTimer.current);
    themeAnimateTimer.current = window.setTimeout(() => root.classList.remove('theme-animating'), 420);
  };

  useEffect(() => {
    const root = document.documentElement;
    animateThemeChange();
    if (user.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [user.theme]);

  useEffect(() => {
    animateThemeChange();
    applyAccent(isAccentId(user.accent) ? user.accent : 'violet');
  }, [user.accent]);

  // 6. Row-level Supabase sync + realtime multi-tab coherence
  const { error: syncError } = useWorkspaceSync({
    userId: authUserId,
    thoughts,
    pinnedItems,
    documents,
    ideas,
    tags,
    reminders,
    onServerData: useCallback(({ thoughts: t, pinnedItems: p, documents: d, ideas: i, tags: g, reminders: r }) => {
      setThoughts(t);
      setPinnedItems(p);
      setDocuments(d);
      setIdeas(i);
      setTags(g);
      setReminders(r);
    }, []),
  });

  // 7. Reminder scheduler: fires due reminders with toasts, chimes, OS notifications
  useReminderScheduler({
    reminders,
    soundEnabled: true,
    onUpdate: useCallback((updated: ReminderItem) => {
      setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }, []),
  });

  // 8. Global Ctrl/Cmd+K command palette shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (updatedUser: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updatedUser, isLoggedIn: true }));
    setShowLanding(false);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await signOut();
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
    setShowLanding(false);
    setCurrentView('dashboard');
  };

  // "Explore the homepage" = the signed-out public landing page.
  const handleOpenHomepage = () => {
    setShowLanding(true);
  };

  const handleOpenAppFromLanding = (tab: 'login' | 'signup') => {
    setAuthDefaultTab(tab);
    setShowLanding(false);
  };

  // Reminders Handlers
  const handleAddReminder = (reminder: ReminderItem) => {
    setReminders((prev) => [reminder, ...prev]);
    toast('Reminder scheduled — we will nudge you gently.', 'success');
  };

  const handleUpdateReminder = (updated: ReminderItem) => {
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Soundscape Handlers
  const handlePlaySoundscape = (id: SoundscapeId) => {
    startSoundscape(id, soundscapeVolume);
    setSoundscape(id);
  };

  const handleStopSoundscape = () => {
    stopSoundscape();
    setSoundscape(null);
  };

  const handleSoundscapeVolume = (v: number) => {
    setSoundscapeVolume(v);
    setScapeVolume(v);
  };

  // Document Handlers
  const handleOpenDocument = (docId: string) => {
    setActiveDocId(docId);
    setCurrentView('document-viewer');
  };

  const handleUploadDocument = async (newDoc: DocumentItem, file?: File) => {
    if (file) {
      const quota = checkQuota(documents, file.size);
      if (!quota.ok) {
        toast(quota.message || 'Storage quota exceeded', 'error');
        return;
      }
    }
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
    setReminders(storage.getReminders());
  };

  // Command palette items (workspace navigation + quick actions)
  const commandItems: CommandItem[] = useMemo(() => [
    { id: 'nav-dashboard', label: 'Dashboard', group: 'Go to', icon: <LayoutDashboard className="w-4 h-4" />, run: () => setCurrentView('dashboard') },
    { id: 'nav-thoughts', label: 'Daily Thoughts', group: 'Go to', icon: <BookOpen className="w-4 h-4" />, run: () => setCurrentView('daily-thoughts') },
    { id: 'nav-ideas', label: 'Ideas', group: 'Go to', icon: <Lightbulb className="w-4 h-4" />, run: () => setCurrentView('ideas') },
    { id: 'nav-documents', label: 'Documents', group: 'Go to', icon: <Folder className="w-4 h-4" />, run: () => setCurrentView('documents') },
    { id: 'nav-pinned', label: 'Pinned Items', group: 'Go to', icon: <Pin className="w-4 h-4" />, run: () => setCurrentView('pinned-items') },
    { id: 'nav-reminders', label: 'Reminders', group: 'Go to', icon: <Tag className="w-4 h-4" />, keywords: 'bell alarm', run: () => setCurrentView('reminders') },
    { id: 'nav-tags', label: 'Tags', group: 'Go to', icon: <Tag className="w-4 h-4" />, run: () => setCurrentView('tags') },
    { id: 'nav-settings', label: 'Settings', group: 'Go to', icon: <Settings className="w-4 h-4" />, run: () => setCurrentView('settings') },
    { id: 'act-calm', label: 'Take a calm breathing break', group: 'Actions', icon: <Wind className="w-4 h-4" />, keywords: 'breathe relax meditate', run: () => setCalmBreakOpen(true) },
    { id: 'act-ocean', label: 'Play Ocean Waves soundscape', group: 'Actions', icon: <Compass className="w-4 h-4" />, keywords: 'sound ambient focus', run: () => handlePlaySoundscape('ocean') },
    { id: 'act-rain', label: 'Play Gentle Rain soundscape', group: 'Actions', icon: <Compass className="w-4 h-4" />, keywords: 'sound ambient focus', run: () => handlePlaySoundscape('rain') },
    { id: 'act-forest', label: 'Play Forest Morning soundscape', group: 'Actions', icon: <Compass className="w-4 h-4" />, keywords: 'sound birds nature', run: () => handlePlaySoundscape('forest') },
    { id: 'act-stop-sound', label: 'Stop ambient soundscape', group: 'Actions', icon: <FileText className="w-4 h-4" />, run: () => handleStopSoundscape() },
    { id: 'act-doc-new', label: 'Open today\'s thought for writing', group: 'Actions', icon: <BookOpen className="w-4 h-4" />, run: () => { setSelectedThoughtDate(getTodayStr()); setCurrentView('daily-thoughts'); } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // Active document for viewer
  const activeDocument = documents.find((d) => d.id === activeDocId) || documents[0];

  // Wait for the Supabase session check before deciding which screen to show
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] dark:bg-[#141118]">
        <div
          className="w-10 h-10 rounded-full border-4 border-accent-200 border-t-accent-600 animate-spin"
          role="status"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  // Signed-out: public landing page or the auth screen
  if (!user.isLoggedIn) {
    if (showLanding) {
      return <HomepageView onOpenApp={handleOpenAppFromLanding} />;
    }
    return (
      <LoginView
        user={user}
        initialTab={authDefaultTab}
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={handleOpenHomepage}
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
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenCalmBreak={() => setCalmBreakOpen(true)}
          onPlaySoundscape={handlePlaySoundscape}
          customTitle={
            currentView === 'document-viewer' ? (
              <button
                onClick={() => setCurrentView('documents')}
                className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-accent-700 dark:hover:text-accent-300 flex items-center gap-1.5 transition cursor-pointer"
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

        {/* View Router with gentle transitions */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {currentView === 'dashboard' && (
                <DashboardView
                  pinnedItems={pinnedItems}
                  thoughts={thoughts}
                  documents={documents}
                  ideas={ideas}
                  reminders={reminders}
                  onNavigate={setCurrentView}
                  onOpenDocument={handleOpenDocument}
                  onSelectThought={(date) => {
                    setSelectedThoughtDate(date);
                    setCurrentView('daily-thoughts');
                  }}
                  onStartCalmBreak={() => setCalmBreakOpen(true)}
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

              {currentView === 'reminders' && (
                <RemindersView
                  reminders={reminders}
                  onAdd={handleAddReminder}
                  onUpdate={handleUpdateReminder}
                  onDelete={handleDeleteReminder}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <ToastHost />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={commandItems} />
      <BreathingOverlay open={calmBreakOpen} onClose={() => setCalmBreakOpen(false)} soundEnabled />

      {/* Ambient soundscape mini player */}
      <AnimatePresence>
        {soundscape && (
          <SoundscapeBar
            current={soundscape}
            volume={soundscapeVolume}
            onSelect={handlePlaySoundscape}
            onVolume={handleSoundscapeVolume}
            onStop={handleStopSoundscape}
          />
        )}
      </AnimatePresence>
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
