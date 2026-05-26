import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  setupNotificationCategory,
  requestPermissions,
  cancelAll,
  scheduleIntentionNotifications,
} from "../services/notificationService";
import { useIntentionStore } from "../stores/intentionStore";
import { useSettingsStore } from "../stores/settingsStore";import {
  catchUpMissedDays,
  extendIntentionByOneDay,
  getIntention,
  listActiveIntentions,
  updateIntention,
} from "../services/intentionService";
import { todayISO } from "../utils/dateUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId: string | undefined) => {
  const { intentions } = useIntentionStore();
  const { notificationTime } = useSettingsStore();

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
        const active = await listActiveIntentions(userId);
        await cancelAll();
        const today = todayISO();
        for (const it of active) {
          if (today >= it.startDate && today <= it.currentEndDate) {
            await scheduleIntentionNotifications(it, notificationTime);
          }
        }
      } catch (e: any) {
        console.warn("catch-up + reschedule failed", e?.message ?? e);
      }
    })();
  }, [userId, notificationTime]);

  useEffect(() => {
    if (!userId) return;
    const sub = Notifications.addNotificationResponseReceivedListener(async (resp) => {
      const action = resp.actionIdentifier;
      const intentionId = (resp.notification.request.content.data as { intentionId?: string })
        ?.intentionId;
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
          if (!intentionId) return;
          const intention = await getIntention(userId, intentionId);
          if (!intention) return;
          await extendIntentionByOneDay(userId, intention);
          return;
        }
      } catch (e: any) {
        console.warn("notification action failed", e?.message ?? e);
      }
    });
    return () => sub.remove();
  }, [userId]);

  const rescheduleAll = async () => {
    await cancelAll();
    for (const it of intentions) {
      if (!it.active) continue;
      await scheduleIntentionNotifications(it, notificationTime);
    }
  };

  return { rescheduleAll };
};