import { create } from "zustand";
import type { Birthday, DayIntentions } from "../types";

type CalendarState = {
  dayIntentions: DayIntentions;
  birthdays: Birthday[];
  setDayIntentions: (d: DayIntentions) => void;
  setBirthdays: (b: Birthday[]) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  dayIntentions: {},
  birthdays: [],
  setDayIntentions: (dayIntentions) => set({ dayIntentions }),
  setBirthdays: (birthdays) => set({ birthdays }),
}));
