import React, { useState } from 'react';
import { NavView, UserProfile } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Pin,
  Folder,
  Lightbulb,
  Settings,
  LogOut,
  X,
  Compass,
  Sparkles,
  ShieldCheck,
  BellRing,
  ListTodo
} from 'lucide-react';
import { TrustPrivacyModal } from './TrustPrivacyModal';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  /** Opens the signed-out public homepage (logout modal "explore" action). */
  onNavigateHomepage?: () => void;
  onLogout: () => void;
  user?: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  view: NavView;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const WRITE_ITEMS: NavItem[] = [
  { view: 'daily-thoughts', label: 'Daily Thoughts', icon: BookOpen },
  { view: 'ideas', label: 'Ideas', icon: Lightbulb },
];

const FILE_ITEMS: NavItem[] = [
  { view: 'documents', label: 'Documents', icon: Folder },
  { view: 'pinned-items', label: 'Pinned Items', icon: Pin },
];

const ORGANIZE_ITEMS: NavItem[] = [
  { view: 'tasks', label: 'Tasks', icon: ListTodo },
  { view: 'reminders', label: 'Reminders', icon: BellRing },
];

const SYSTEM_ITEMS: NavItem[] = [
  { view: 'settings', label: 'Settings', icon: Settings },
];

const SECTION_LABELS: Record<string, string> = {
  write: 'Write',
  files: 'Files',
  organize: 'Organize',
  system: 'System',
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNavigateHomepage,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);

  const isActive = (item: NavItem) =>
    currentView === item.view ||
    (item.view === 'documents' && currentView === 'document-viewer');

  const handleItemClick = (view: NavView) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleOpenLogoutConfirm = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
    if (onCloseMobile) onCloseMobile();
  };

  const handleVisitHomepageBeforeLogout = () => {
    setShowLogoutModal(false);
    onNavigateHomepage?.();
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <button
        key={item.view}
        id={`nav-${item.view}`}
        onClick={() => handleItemClick(item.view)}
        aria-current={active ? 'page' : undefined}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
          active
            ? 'bg-accent-50 dark:bg-accent-950/50 text-accent-700 dark:text-accent-300 font-semibold shadow-2xs shadow-accent-100 dark:shadow-none'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <Icon className={`w-4 h-4 ${active ? 'text-accent-600 dark:text-accent-400 stroke-[2.2]' : 'text-gray-400 stroke-[1.8]'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderSection = (key: string, items: NavItem[]) => (
    <div key={key} className="pt-3">
      <p className="px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
        {SECTION_LABELS[key]}
      </p>
      <div className="space-y-1">{items.map(renderNavItem)}</div>
    </div>
  );

  const content = (
    <aside className="w-64 h-full bg-white dark:bg-[#1E1729] border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between select-none">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60">
          <button
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-xs shadow-accent-500/20 group-hover:scale-105 transition">
              <img src="/brand.png" alt="FolyNote" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-accent-700 dark:group-hover:text-accent-300 transition block leading-tight">
                FolyNote
              </span>
              <span className="text-[10px] text-accent-600 dark:text-accent-400 font-medium">
                Your files. Your thoughts. Your space.
              </span>
            </div>
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation: Overview + grouped sections */}
        <nav className="p-4 pt-1 space-y-0.5" aria-label="Primary">
          {renderNavItem({ view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard })}
          {renderSection('write', WRITE_ITEMS)}
          {renderSection('files', FILE_ITEMS)}
          {renderSection('organize', ORGANIZE_ITEMS)}
          {renderSection('system', SYSTEM_ITEMS)}
        </nav>
      </div>

      {/* Bottom Actions: DPDP Trust & Logout */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-800/60 space-y-1.5">
        <button
          id="nav-trust-btn"
          type="button"
          onClick={() => setShowTrustModal(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-900/60 transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Privacy &amp; DPDP Trust</span>
        </button>

        <button
          id="nav-logout-btn"
          onClick={handleOpenLogoutConfirm}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-400 stroke-[1.8]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}

      {/* Before Logout Serene Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#1E1729] p-6 sm:p-7 text-gray-900 dark:text-gray-100 border border-accent-100 dark:border-accent-900/60 shadow-2xl space-y-5">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-accent-700 dark:text-accent-300 font-bold uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Before You Step Away</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-950 dark:text-gray-50">
                  Visit the Public Homepage?
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Before logging out, would you like to explore the public homepage with the
              feature tour, or practice a 60-second mindful breathing break?
            </p>

            <div className="p-3 rounded-2xl bg-accent-50/70 dark:bg-accent-950/30 border border-accent-100 dark:border-accent-900/60 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>All your thoughts, documents, and notes remain saved privately on your device and in your cloud space.</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {onNavigateHomepage && (
                <button
                  id="modal-explore-homepage-btn"
                  type="button"
                  onClick={handleVisitHomepageBeforeLogout}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-xs sm:text-sm font-extrabold transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore the Homepage</span>
                </button>
              )}

              <div className={`grid grid-cols-2 gap-2 ${onNavigateHomepage ? '' : 'pt-1'}`}>
                <button
                  id="modal-confirm-logout-btn"
                  type="button"
                  onClick={handleConfirmLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Confirm Logout</span>
                </button>

                <button
                  id="modal-stay-workspace-btn"
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition cursor-pointer"
                >
                  <span>Stay in Space</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Privacy Center Modal */}
      <TrustPrivacyModal
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
        initialTab="dpdp"
      />
    </>
  );
};
