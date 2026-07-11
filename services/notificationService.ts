import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Intention } from "../types";
import { buildNotificationBody, buildNotificationTitle, parseNotificationTime } from "../utils/notificationUtils";
import { getDateRange } from "../utils/dateUtils";
import { colors } from "../constants/theme";

export const NOTIFICATION_CATEGORY = "INTENTION_CATEGORY";
export const NOTIFICATION_CHANNEL = "evening-reflection";

export const setupNotificationCategory = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
      name: "Evening Reflection",
      description: "Daily gentle reminder to close the day.",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: colors.accent,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY, [
    {
      identifier: "PRAYED",
      buttonTitle: "Prayed",
      options: { isDestructive: false, isAuthenticationRequired: false, opensAppToForeground: false },
    },
    {
      identifier: "NOT_PRAYED",
      buttonTitle: "Not Prayed",
      options: { isDestructive: false, isAuthenticationRequired: false, opensAppToForeground: false },
    },
  ]);
};

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleDailyNotifications = async (
  intentions: Intention[],
  hhmm: string,
): Promise<string[]> => {
  const { hour, minute } = parseNotificationTime(hhmm);

  const countsByDay: Record<string, number> = {};
  for (const intention of intentions) {
    if (!intention.active) continue;
    const prayed = new Set(intention.prayedDates ?? []);
    for (const day of getDateRange(intention.startDate, intention.currentEndDate)) {
      if (prayed.has(day)) continue;
      countsByDay[day] = (countsByDay[day] ?? 0) + 1;
    }
  }

  const ids: string[] = [];
  for (const [day, count] of Object.entries(countsByDay)) {
    const fireAt = new Date(`${day}T00:00:00`);
    fireAt.setHours(hour, minute, 0, 0);
    if (fireAt.getTime() < Date.now()) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: buildNotificationTitle(),
        body: buildNotificationBody(count),
        categoryIdentifier: NOTIFICATION_CATEGORY,
        color: colors.accent,
        data: { scheduledFor: day },
      },
      trigger:
        Platform.OS === "android"
          ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt, channelId: NOTIFICATION_CHANNEL }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
    ids.push(id);
  }
  return ids;
};

export const cancelAll = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
