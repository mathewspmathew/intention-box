export type Intention = {
  id: string;
  userId: string;
  text: string;
  startDate: string;
  durationDays: number;
  currentEndDate: string;
  active: boolean;
  savedToHistory: boolean;
  createdAt: number;
  prayedDates?: string[];
};

export type HistoryEntry = {
  id: string;
  userId: string;
  text: string;
  startDate: string;
  completedDate: string;
  totalDays: number;
};

export type DayIntentions = {
  [dateString: string]: Intention[];
};

export type NotificationAction = "prayed" | "not_prayed" | "ignored";

export type UserSettings = {
  notificationTime: string;
  googleCalendarConnected: boolean;
  // 0 = no history (don't archive). >0 = archive + auto-delete after N days.
  historyRetentionDays: number;
};

export type Birthday = {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
};
