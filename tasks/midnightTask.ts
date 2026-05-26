import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { auth } from "../services/firebase";
import {
  catchUpMissedDays,
  listActiveIntentions,
  deleteIntention,
} from "../services/intentionService";
import { archiveIntention } from "../services/historyService";
import { scheduleIntentionNotifications, cancelAll } from "../services/notificationService";
import { useSettingsStore } from "../stores/settingsStore";
import { isPast, todayISO } from "../utils/dateUtils";

export const MIDNIGHT_TASK = "MIDNIGHT_TASK";

TaskManager.defineTask(MIDNIGHT_TASK, async () => {
  try {
    const user = auth.currentUser;
    if (!user) return BackgroundFetch.BackgroundFetchResult.NoData;
    const { historyRetentionDays, notificationTime } = useSettingsStore.getState();
    const today = todayISO();

    await catchUpMissedDays(user.uid);

    const afterCatchUp = await listActiveIntentions(user.uid);
    for (const it of afterCatchUp) {
      if (isPast(it.currentEndDate)) {
        if (historyRetentionDays !== 0) await archiveIntention(user.uid, it);
        await deleteIntention(user.uid, it.id);
      }
    }

    await cancelAll();
    const remaining = await listActiveIntentions(user.uid);
    for (const it of remaining) {
      if (today >= it.startDate && today <= it.currentEndDate) {
        await scheduleIntentionNotifications(it, notificationTime);
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.warn("MIDNIGHT_TASK failed", e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerMidnightTask = async (): Promise<void> => {
  try {
    await BackgroundFetch.registerTaskAsync(MIDNIGHT_TASK, {
      minimumInterval: 60 * 60, // 1 hour minimum on Android; OS decides actual cadence
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    console.warn("registerMidnightTask failed", e);
  }
};

// Auto-register on import. Safe because TaskManager.defineTask is idempotent at module level.
void registerMidnightTask();
