import React from 'react';
import { UserProfile } from '../types';
import { Menu } from 'lucide-react';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  user: UserProfile;
  onOpenMobileMenu: () => void;
  onProfileClick: () => void;
  onUpdateTheme?: (theme: 'light' | 'dark') => void;
  customTitle?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenMobileMenu,
  onProfileClick,
  onUpdateTheme,
  customTitle,
}) => {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <img src="/icon.svg" alt="FolyNote" className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">FolyNote</span>
          </div>
        )}
      </div>

      {/* Right side: Theme toggle, Offline status, PWA install button, user greeting & avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Light / dark theme toggle */}
        {onUpdateTheme && <ThemeToggle user={user} onThemeChange={onUpdateTheme} />}

        {/* Offline cache indicator */}
        <OfflineIndicator />

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* User greeting and avatar */}
        <button
          id="user-profile-header-btn"
          onClick={onProfileClick}
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-100 hover:opacity-85 transition cursor-pointer"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
            {getGreeting()}, <span className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
            <span aria-hidden="true"> ✌️</span>
          </span>

          {/* User circular avatar with letter */}
          <div className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shadow-purple-500/30 ring-2 ring-purple-100 dark:ring-purple-900">
            {user.avatarLetter || user.name.charAt(0) || 'V'}
          </div>
        </button>
      </div>
    </header>
  );
};
