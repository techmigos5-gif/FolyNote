/**
 * FolyNote accent themes. Each accent remaps the `accent-*` Tailwind color
 * scale at runtime via CSS variables (see index.css), so every screen,
 * button, ring and gradient follows the chosen palette in light and dark mode.
 */

export type AccentId = 'violet' | 'ocean' | 'sunset' | 'rose' | 'forest' | 'midnight';

export interface AccentTheme {
  id: AccentId;
  name: string;
  /** Two-stop CSS gradient preview for the Settings picker. */
  swatch: string;
}

export const ACCENTS: AccentTheme[] = [
  { id: 'violet', name: 'Lotus Violet', swatch: 'linear-gradient(135deg,#a78bfa,#6d28d9)' },
  { id: 'ocean', name: 'Ocean Calm', swatch: 'linear-gradient(135deg,#38bdf8,#0369a1)' },
  { id: 'sunset', name: 'Ridge Sunset', swatch: 'linear-gradient(135deg,#fdba74,#c2410c)' },
  { id: 'rose', name: 'Lotus Rose', swatch: 'linear-gradient(135deg,#fda4af,#be123c)' },
  { id: 'forest', name: 'Deep Forest', swatch: 'linear-gradient(135deg,#34d399,#047857)' },
  { id: 'midnight', name: 'Midnight Indigo', swatch: 'linear-gradient(135deg,#818cf8,#3730a3)' },
];

export const DEFAULT_ACCENT: AccentId = 'violet';

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && ACCENTS.some((a) => a.id === value);
}

/** Apply the accent palette to the document root. */
export function applyAccent(accent: AccentId): void {
  document.documentElement.setAttribute('data-accent', accent);
}
