import { useEffect, useCallback } from "react";
import { useIntentionStore } from "../stores/intentionStore";
import { useSettingsStore } from "../stores/settingsStore";
import {
  createIntention,
  deleteIntention,
  extendIntentionByOneDay,
  listActiveIntentions,
  subscribeIntentions,
  updateIntention,
} from "../services/intentionService";
import { archiveIntention } from "../services/historyService";
import { cancelAll, scheduleIntentionNotifications } from "../services/notificationService";
import type { Intention } from "../types";
import { addDaysISO, isPast, todayISO } from "../utils/dateUtils";

export const useIntentions = (userId: string | undefined) => {
  const { intentions, setIntentions } = useIntentionStore();
  const { historyRetentionDays, notificationTime } = useSettingsStore();

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeIntentions(userId, setIntentions);
    return unsub;
  }, [userId, setIntentions]);

  const add = useCallback(
    async (text: string, durationDays: number) => {
      if (!userId) return;
      const intention = await createIntention(userId, text, durationDays);
      try {
        await scheduleIntentionNotifications(intention, notificationTime);
      } catch (e) {
        console.warn("schedule failed", e);
      }
    },
    [userId, notificationTime],
  );

  const edit = useCallback(
    async (id: string, patch: Partial<Intention>) => {
      if (!userId) return;
      const current = intentions.find((i) => i.id === id);
      const finalPatch: Partial<Intention> = { ...patch };
      if (current && typeof patch.durationDays === "number") {
        const today = todayISO();
        const naturalEnd = addDaysISO(current.startDate, patch.durationDays - 1);
        finalPatch.currentEndDate = naturalEnd < today ? today : naturalEnd;
      }
      await updateIntention(userId, id, finalPatch);
      if (typeof patch.durationDays === "number") {
        try {
          await cancelAll();
          const active = await listActiveIntentions(userId);
          const today = todayISO();
          for (const it of active) {
            if (today >= it.startDate && today <= it.currentEndDate) {
              await scheduleIntentionNotifications(it, notificationTime);
            }
          }
        } catch (e) {
          console.warn("reschedule after edit failed", e);
        }
      }
    },
    [userId, intentions, notificationTime],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteIntention(userId, id);
    },
    [userId],
  );

  const markPrayed = useCallback(
    async (intention: Intention) => {
      if (!userId) return;
      const today = todayISO();
      const prayed = intention.prayedDates ?? [];
      if (prayed.includes(today)) return;
      const updated = { ...intention, prayedDates: [...prayed, today] };
      await updateIntention(userId, intention.id, { prayedDates: updated.prayedDates });
      if (today >= intention.currentEndDate) {
        if (historyRetentionDays !== 0) await archiveIntention(userId, updated);
        await deleteIntention(userId, intention.id);
      }
    },
    [userId, historyRetentionDays],
  );

  const markNotPrayed = useCallback(
    async (intention: Intention) => {
      if (!userId) return;
      await extendIntentionByOneDay(userId, intention);
    },
    [userId],
  );

  const expireOverdue = useCallback(async () => {
    if (!userId) return;
    for (const it of intentions) {
      if (it.active && isPast(it.currentEndDate)) {
        if (historyRetentionDays !== 0) await archiveIntention(userId, it);
        await deleteIntention(userId, it.id);
      }
    }
  }, [userId, intentions, historyRetentionDays]);

  return { intentions, add, edit, remove, markPrayed, markNotPrayed, expireOverdue };
};
