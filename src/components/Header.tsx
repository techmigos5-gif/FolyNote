import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Menu, Command, Wind, Music4 } from 'lucide-react';
import { OfflineIndicator } from './OfflineIndicator';
import { ThemeToggle } from './ThemeToggle';
import { SOUNDSCAPES, SoundscapeId } from '../lib/sounds';

interface HeaderProps {
  user: UserProfile;
  onOpenMobileMenu: () => void;
  onProfileClick: () => void;
  onUpdateTheme?: (theme: 'light' | 'dark') => void;
  customTitle?: React.ReactNode;
  onOpenPalette?: () => void;
  onOpenCalmBreak?: () => void;
  onPlaySoundscape?: (id: SoundscapeId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenMobileMenu,
  onProfileClick,
  onUpdateTheme,
  customTitle,
  onOpenPalette,
  onOpenCalmBreak,
  onPlaySoundscape,
}) => {
  const [soundsOpen, setSoundsOpen] = useState(false);
  // Determine greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1E1729] border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: Hamburger on mobile, custom title or brand on desktop */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {customTitle ? (
          <div>{customTitle}</div>
        ) : (
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-600 to-accent-500 flex items-center justify-center">
              <img src="/brand.png" alt="FolyNote" className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">FolyNote</span>
          </div>
        )}
      </div>

      {/* Right side: quick actions, theme toggle, offline status, user greeting & avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command palette (Ctrl/Cmd+K) */}
        {onOpenPalette && (
          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Open command palette"
            title="Command palette (Ctrl+K)"
            className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-accent-600 hover:border-accent-200 dark:hover:border-accent-800 transition cursor-pointer"
          >
            <Command className="w-4 h-4" />
            <kbd className="text-[10px] font-bold">Ctrl K</kbd>
          </button>
        )}

        {/* Calm break (breathing) */}
        {onOpenCalmBreak && (
          <button
            type="button"
            onClick={onOpenCalmBreak}
            aria-label="Start a calm breathing break"
            title="Take a calm break"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-accent-200 dark:border-accent-900/60 bg-accent-50/70 dark:bg-accent-950/40 hover:bg-accent-100 dark:hover:bg-accent-900/50 text-accent-700 dark:text-accent-300 transition cursor-pointer"
          >
            <Wind className="w-4 h-4" />
          </button>
        )}

        {/* Calm soundscape picker */}
        {onPlaySoundscape && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSoundsOpen((s) => !s)}
              aria-label="Play a calm soundscape"
              aria-expanded={soundsOpen}
              title="Calm sounds"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-accent-600 hover:border-accent-200 dark:hover:border-accent-800 transition cursor-pointer"
            >
              <Music4 className="w-4 h-4" />
            </button>
            {soundsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSoundsOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-11 z-50 w-60 p-2 rounded-2xl bg-white dark:bg-[#241b31] shadow-xl border border-gray-100 dark:border-gray-800" role="menu" aria-label="Calm sounds">
                  {SOUNDSCAPES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      onClick={() => { setSoundsOpen(false); onPlaySoundscape(s.id); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-accent-50 dark:hover:bg-accent-950/40 transition cursor-pointer"
                    >
                      <span className="text-base" aria-hidden="true">{s.emoji}</span>
                      <span>
                        <span className="block text-xs font-bold text-gray-800 dark:text-gray-100">{s.name}</span>
                        <span className="block text-[10px] text-gray-400">{s.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Light / dark theme toggle */}
        {onUpdateTheme && <ThemeToggle user={user} onThemeChange={onUpdateTheme} />}

        {/* Offline cache indicator */}
        <OfflineIndicator />

        {/* User greeting and avatar */}
        <button
          id="user-profile-header-btn"
          onClick={onProfileClick}
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-100 dark:border-gray-800 hover:opacity-85 transition cursor-pointer"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
            {getGreeting()}, <span className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
            <span aria-hidden="true"> ✌️</span>
          </span>

          {/* User circular avatar with letter */}
          <div className="w-9 h-9 rounded-full bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shadow-accent-500/30 ring-2 ring-accent-100 dark:ring-accent-900">
            {user.avatarLetter || user.name.charAt(0) || 'V'}
          </div>
        </button>
      </div>
    </header>
  );
};
