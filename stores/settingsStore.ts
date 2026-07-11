import { create } from "zustand";
import type { UserSettings } from "../types";

type SettingsState = UserSettings & {
  setSettings: (patch: Partial<UserSettings>) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationTime: "22:00",
  notificationsEnabled: true,
  googleCalendarConnected: false,
  historyRetentionDays: 30,
  setSettings: (patch) => set((s) => ({ ...s, ...patch })),
}));
