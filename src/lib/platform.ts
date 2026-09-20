/**
 * Platform detection: Capacitor-native (Android/iOS) vs. plain web browser.
 * Native-specific code paths (notifications, status bar, splash) branch here.
 */
export const IS_NATIVE =
  typeof window !== 'undefined' &&
  typeof (window as unknown as Record<string, unknown>).Capacitor !== 'undefined' &&
  !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

export const IS_ANDROID = IS_NATIVE && isAndroid();
export const IS_IOS = IS_NATIVE && isIos();

function isAndroid(): boolean {
  try {
    const cap = (window as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    return cap?.getPlatform?.() === 'android';
  } catch {
    return false;
  }
}

function isIos(): boolean {
  try {
    const cap = (window as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    return cap?.getPlatform?.() === 'ios';
  } catch {
    return false;
  }
}
