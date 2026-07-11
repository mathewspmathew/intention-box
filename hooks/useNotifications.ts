import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  setupNotificationCategory,
  requestPermissions,
  cancelAll,
  scheduleDailyNotifications,
} from "../services/notificationService";
import { useIntentionStore } from "../stores/intentionStore";
import { useSettingsStore } from "../stores/settingsStore";import {
  catchUpMissedDays,
  extendIntentionByOneDay,
  listActiveIntentions,
  updateIntention,
} from "../services/intentionService";
import { todayISO } from "../utils/dateUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId: string | undefined) => {
  const { intentions } = useIntentionStore();
  const { notificationTime, notificationsEnabled } = useSettingsStore();

  useEffect(() => {
    (async () => {
      await setupNotificationCategory();
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

  useEffect(() => {
    if (!userId) return;
    const sub = Notifications.addNotificationResponseReceivedListener(async (resp) => {
      const action = resp.actionIdentifier;
      const today = todayISO();

      try {
        if (action === "PRAYED") {
          const active = await listActiveIntentions(userId);
          const todays = active.filter((i) => i.startDate <= today && today <= i.currentEndDate);
          for (const it of todays) {
            const prayed = it.prayedDates ?? [];
            if (prayed.includes(today)) continue;
            await updateIntention(userId, it.id, { prayedDates: [...prayed, today] });
          }
          await Notifications.dismissAllNotificationsAsync().catch(() => undefined);
          return;
        }

        if (action === "NOT_PRAYED") {
          const active = await listActiveIntentions(userId);
          const todays = active.filter((i) => i.startDate <= today && today <= i.currentEndDate);
          for (const it of todays) {
            const prayed = it.prayedDates ?? [];
            if (prayed.includes(today)) continue;
            await extendIntentionByOneDay(userId, it);
          }
          await cancelAll();
          if (notificationsEnabled) {
            const updated = await listActiveIntentions(userId);
            await scheduleDailyNotifications(updated, notificationTime);
          }
          return;
        }
      } catch (e: any) {
        console.warn("notification action failed", e?.message ?? e);
      }
    });
    return () => sub.remove();
  }, [userId, notificationTime, notificationsEnabled]);

  const rescheduleAll = async () => {
    await cancelAll();
    if (!notificationsEnabled) return;
    const active = intentions.filter((it) => it.active);
    await scheduleDailyNotifications(active, notificationTime);
  };

  return { rescheduleAll };
};