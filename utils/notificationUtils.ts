import type { Intention } from "../types";
import { daysBetween, todayISO } from "./dateUtils";

export const buildNotificationTitle = (): string => "Evening Reflection";

export const buildNotificationBody = (intention: Intention): string => {
  const dayNumber = daysBetween(intention.startDate, todayISO()) + 1;
  const daysRemaining = Math.max(0, intention.durationDays - dayNumber + 1);
  return `Your intentions for today are waiting for your grace.\n${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining for "${intention.text}".`;
};

export const parseNotificationTime = (hhmm: string): { hour: number; minute: number } => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return { hour: h ?? 22, minute: m ?? 0 };
};
