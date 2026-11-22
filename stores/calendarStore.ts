import { create } from "zustand";
import type { DayIntentions } from "../types";

type CalendarState = {
  dayIntentions: DayIntentions;
  setDayIntentions: (d: DayIntentions) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  dayIntentions: {},
  setDayIntentions: (dayIntentions) => set({ dayIntentions }),
}));
