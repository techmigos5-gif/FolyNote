import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types';

interface ThemeToggleProps {
  user: UserProfile;
  onThemeChange: (theme: 'light' | 'dark') => void;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ user, onThemeChange, compact = true }) => {
  const isDark = user.theme === 'dark';

  const toggle = () => {
    onThemeChange(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition ${
        compact ? 'w-9 h-9' : 'px-3 py-2 gap-2 text-sm font-medium'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
};
