/**
 * Calm, motivating content for the dashboard.
 *
 * Everything is curated in-repo and deterministic per day, so the greeting
 * feels alive without network calls and works fully offline (matching the
 * offline-first architecture).
 */

export interface InspirationQuote {
  text: string;
  author: string;
}

/** Hand-picked for quiet focus — no hustle-culture noise. */
export const QUOTES: InspirationQuote[] = [
  { text: 'The quieter you become, the more you can hear.', author: 'Rumi' },
  { text: 'Do not wait to strike till the iron is hot; but make it hot by striking.', author: 'Henry Wadsworth Longfellow' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso' },
  { text: 'What we think, we become.', author: 'Buddha' },
  { text: 'The best way out is always through.', author: 'Robert Frost' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Dream big. Start small. Act now.', author: 'Robin Sharma' },
  { text: 'Your mind is a garden. Your thoughts are the seeds.', author: 'William Wordsworth' },
  { text: 'Slow is smooth, and smooth is fast.', author: 'US Navy SEALs saying' },
  { text: 'Attention is the rarest and purest form of generosity.', author: 'Simone Weil' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Nothing is impossible. The word itself says I am possible.', author: 'Audrey Hepburn' },
  { text: 'Perfection is not attainable, but if we chase perfection we can catch excellence.', author: 'Vince Lombardi' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
];

/** Short affirmations shown on the calm-corner card. */
export const AFFIRMATIONS: string[] = [
  'You are allowed to take it one thing at a time.',
  'Progress, not perfection.',
  'Rest is part of the work.',
  'You have handled hard days before. You will handle this one.',
  'Small steps still move the mountain.',
  'Your pace is valid.',
  'Begin where you are, with what you have.',
  'Calm focus beats frantic effort every time.',
  'You are closer than you were yesterday.',
  'One clear task is enough for this moment.',
  'Kindness toward yourself is productive too.',
  'The space between breaths is yours.',
];

/** Gentle next-step nudges, paired with a navigation target. */
export interface Nudge {
  text: string;
  view: 'daily-thoughts' | 'ideas' | 'documents' | 'tasks' | 'reminders';
}

export const NUDGES: Nudge[] = [
  { text: 'Write one line about today — future you will thank present you.', view: 'daily-thoughts' },
  { text: 'Capture that idea floating in your head before it drifts away.', view: 'ideas' },
  { text: 'File one loose document. Future searches become easier.', view: 'documents' },
  { text: 'Pick the single task that would make today feel like a win.', view: 'tasks' },
  { text: 'Set one gentle nudge for something that matters tonight.', view: 'reminders' },
  { text: 'Pin the thought you keep coming back to.', view: 'daily-thoughts' },
  { text: 'Star an idea worth revisiting this week.', view: 'ideas' },
  { text: 'Clear one card from your backlog — momentum loves company.', view: 'tasks' },
];

/** Stable pseudo-random index that changes once per day (offline-safe). */
function daySeed(epochDay: number, salt: number): number {
  const x = Math.sin(epochDay * 997 + salt * 7919) * 10000;
  return Math.floor((x - Math.floor(x)) * 1e9);
}

function todayEpochDay(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export function quoteOfDay(): InspirationQuote {
  return QUOTES[daySeed(todayEpochDay(), 1) % QUOTES.length];
}

export function affirmationOfDay(): string {
  return AFFIRMATIONS[daySeed(todayEpochDay(), 2) % AFFIRMATIONS.length];
}

export function nudgeOfDay(): Nudge {
  return NUDGES[daySeed(todayEpochDay(), 3) % NUDGES.length];
}

/** Fresh pick for the "Shuffle" button — deliberately NOT the day's pick. */
export function randomQuote(excludeText?: string): InspirationQuote {
  if (QUOTES.length <= 1) return QUOTES[0];
  let pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  while (pick.text === excludeText) {
    pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
  return pick;
}
