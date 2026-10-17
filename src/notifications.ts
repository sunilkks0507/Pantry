import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GroceryItem } from './types';
import { planReminders } from './reminders';

// Local (on-device) expiry reminders — no server or push token needed.
// Upcoming days are pre-scheduled with their final text, so reminders still
// arrive if the app isn't opened; they're rebuilt whenever the pantry changes.

const CHANNEL_ID = 'expiry';
const supported = Platform.OS === 'android' || Platform.OS === 'ios';

export function setupNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Expiry reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

// Asks once; if the user already answered, returns that answer without prompting.
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function syncExpiryReminders(items: GroceryItem[]): Promise<void> {
  if (!supported) return;
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    // This app schedules nothing else, so replacing everything is safe.
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const r of planReminders(items)) {
      await Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body, data: { screen: 'expiry' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
      });
    }
  } catch {
    // Reminders are best-effort; never break the app over them.
  }
}

export const useLastNotificationResponse = supported
  ? Notifications.useLastNotificationResponse
  : () => null;
