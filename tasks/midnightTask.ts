import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { auth } from "../services/firebase";
import {
  catchUpMissedDays,
  listActiveIntentions,
  deleteIntention,
} from "../services/intentionService";
import { archiveIntention } from "../services/historyService";
import { scheduleDailyNotifications, cancelAll } from "../services/notificationService";
import { updateWidget } from "../services/widgetService";
import { useSettingsStore } from "../stores/settingsStore";
import { isPast } from "../utils/dateUtils";

export const MIDNIGHT_TASK = "MIDNIGHT_TASK";

TaskManager.defineTask(MIDNIGHT_TASK, async () => {
  try {
    const user = auth.currentUser;
    if (!user) return BackgroundTask.BackgroundTaskResult.Success;
    const { historyRetentionDays, notificationTime, notificationsEnabled } = useSettingsStore.getState();

    await catchUpMissedDays(user.uid);

    const afterCatchUp = await listActiveIntentions(user.uid);
    for (const it of afterCatchUp) {
      if (isPast(it.currentEndDate)) {
        if (historyRetentionDays !== 0) await archiveIntention(user.uid, it);
        await deleteIntention(user.uid, it.id);
      }
    }

    await cancelAll();
    if (notificationsEnabled) {
      const remaining = await listActiveIntentions(user.uid);
      await scheduleDailyNotifications(remaining, notificationTime);
    }

    await updateWidget();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.warn("MIDNIGHT_TASK failed", e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const registerMidnightTask = async (): Promise<void> => {
  try {
    await BackgroundTask.registerTaskAsync(MIDNIGHT_TASK, {
      minimumInterval: 60, // minutes; OS decides actual cadence within this floor
    });
  } catch (e) {
    console.warn("registerMidnightTask failed", e);
  }
};

// Auto-register on import. Safe because TaskManager.defineTask is idempotent at module level.
void registerMidnightTask();
