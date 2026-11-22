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

export type UserSettings = {
  notificationTime: string;
  notificationsEnabled: boolean;
  // 0 = no history (don't archive). >0 = archive + auto-delete after N days.
  historyRetentionDays: number;
};
