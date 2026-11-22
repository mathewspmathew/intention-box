import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  setupNotificationChannel,
  requestPermissions,
  cancelAll,
  scheduleDailyNotifications,
} from "../services/notificationService";
import { useSettingsStore } from "../stores/settingsStore";
import { catchUpMissedDays, listActiveIntentions } from "../services/intentionService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId: string | undefined) => {
  const { notificationTime, notificationsEnabled } = useSettingsStore();

  useEffect(() => {
    (async () => {
      await setupNotificationChannel();
      await requestPermissions();
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        await catchUpMissedDays(userId);
        await cancelAll();
        if (!notificationsEnabled) return;
        const active = await listActiveIntentions(userId);
        await scheduleDailyNotifications(active, notificationTime);
      } catch (e: any) {
        console.warn("catch-up + reschedule failed", e?.message ?? e);
      }
    })();
  }, [userId, notificationTime, notificationsEnabled]);

};
