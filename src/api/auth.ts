import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

/**
 * Supabase Auth requires an email identifier. FolyNote authenticates with
 * mobile + PIN, so we deterministically map the mobile number onto a synthetic
 * email under an app-owned domain. The same mobile always maps to the same
 * identity — no real email is collected or contacted.
 */
const SYNTHETIC_EMAIL_DOMAIN = 'users.folynote.app';

export function toSupabaseEmail(mobile: string): string {
  const digits = mobile.replace(/[^0-9]/g, '');
  return `${digits}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/**
 * PINs are 4-6 digits. Supabase requires passwords of at least 6 characters,
 * so the PIN is padded to a fixed length. The result is deterministic
 * (same PIN -> same password) and never persisted client-side.
 */
export function pinToPassword(pin: string): string {
  return `fn-${pin.replace(/[^0-9]/g, '').padEnd(12, '0')}`;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

function profileFromSession(
  authUserId: string,
  meta: Record<string, unknown>,
): UserProfile {
  const name = (meta.display_name as string) || `User ${(meta.mobile as string)?.slice(-4) || ''}`;
  return {
    name,
    mobile: (meta.mobile as string) || '',
    avatarLetter: name.charAt(0).toUpperCase() || 'U',
    // The PIN itself is never stored in app state once handed to Supabase Auth.
    pin: '',
    rememberMe: true,
    isLoggedIn: true,
  };
}

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'No account found for this mobile number, or the PIN is incorrect.';
  }
  if (/user already registered/i.test(message)) {
    return 'An account with this mobile number already exists. Please switch to the Sign In tab.';
  }
  if (/email address.*invalid/i.test(message)) {
    return 'Please enter a valid mobile number.';
  }
  if (/password.*should be at least/i.test(message)) {
    return 'PIN must be between 4 and 6 digits.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Email confirmation is enabled on this Supabase project. Disable it (Auth settings) to use mobile + PIN sign-in.';
  }
  return message;
}

/** Create a new FolyNote account (mobile + PIN). */
export async function signUpWithMobilePin(
  name: string,
  mobile: string,
  pin: string,
): Promise<AuthResult> {
  try {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const displayName = name.trim() || `User ${cleanMobile.slice(-4)}`;

    const { data, error } = await supabase.auth.signUp({
      email: toSupabaseEmail(cleanMobile),
      password: pinToPassword(pin),
      options: {
        data: {
          display_name: displayName,
          mobile: cleanMobile,
        },
      },
    });

    if (error) return { success: false, error: friendlyAuthError(error.message) };
    if (!data.session || !data.user) {
      return {
        success: false,
        error: 'Account created but confirmation is required. Disable email confirmation in Supabase Auth settings for mobile + PIN sign-in.',
      };
    }

    return {
      success: true,
      user: profileFromSession(data.user.id, data.user.user_metadata ?? {}),
    };
  } catch (err) {
    console.warn('Supabase signup failed:', err);
    return { success: false, error: 'Could not reach the authentication service. Check your connection.' };
  }
}

/** Sign in with mobile + PIN. */
export async function signInWithMobilePin(
  mobile: string,
  pin: string,
): Promise<AuthResult> {
  try {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toSupabaseEmail(cleanMobile),
      password: pinToPassword(pin),
    });

    if (error) return { success: false, error: friendlyAuthError(error.message) };
    if (!data.user) return { success: false, error: 'Login failed. Please try again.' };

    return {
      success: true,
      user: profileFromSession(data.user.id, data.user.user_metadata ?? {}),
    };
  } catch (err) {
    console.warn('Supabase login failed:', err);
    return { success: false, error: 'Could not reach the authentication service. Check your connection.' };
  }
}

/** End the current session. */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut failed:', err);
  }
}

/** The authenticated user's id, or null when signed out. */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Subscribe to session changes (multi-tab logout/login coherence). */
export function onAuthStateChange(
  callback: (userId: string | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}
