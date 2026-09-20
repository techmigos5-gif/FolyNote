import { LocalNotifications } from '@capacitor/local-notifications';
import { IS_NATIVE } from './platform';

export interface NotificationPermissionState {
  granted: boolean;
  source: 'native' | 'web' | 'unavailable';
}

/**
 * Request permission to show reminder notifications.
 * Capacitor LocalNotifications on Android/iOS; the Web Notification API elsewhere.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (IS_NATIVE) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        return { granted: req.display === 'granted', source: 'native' };
      }
      return { granted: true, source: 'native' };
    } catch (err) {
      console.warn('native notification permission failed:', err);
      return { granted: false, source: 'native' };
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        return { granted: result === 'granted', source: 'web' };
      }
      return { granted: Notification.permission === 'granted', source: 'web' };
    } catch (err) {
      console.warn('web notification permission failed:', err);
      return { granted: false, source: 'web' };
    }
  }
  return { granted: false, source: 'unavailable' };
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (IS_NATIVE) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return { granted: status.display === 'granted', source: 'native' };
    } catch {
      return { granted: false, source: 'native' };
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return { granted: Notification.permission === 'granted', source: 'web' };
  }
  return { granted: false, source: 'unavailable' };
}

/**
 * Fire a reminder notification. On native this goes through the OS; on web
 * it uses the Notification API when the page is hidden (never spamming the
 * user while they are actively looking at the app — the in-app bell handles that).
 */
export async function deliverReminder(title: string, body: string, id: number): Promise<void> {
  if (IS_NATIVE) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: new Date(Date.now() + 250) },
          smallIcon: 'ic_stat_icon',
          iconColor: '#6C5CE7',
        },
      ],
    });
    return;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return; // in-app toast covers it
  try {
    new Notification(title, { body, icon: '/pwa-192x192.png', tag: `folynote-reminder-${id}` });
  } catch (err) {
    console.warn('web notification failed:', err);
  }
}
