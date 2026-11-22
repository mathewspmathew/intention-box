import { useEffect, useMemo } from "react";
import { useIntentionStore } from "../stores/intentionStore";
import { useCalendarStore } from "../stores/calendarStore";
import { getDateRange } from "../utils/dateUtils";
import type { DayIntentions } from "../types";
import { colors } from "../constants/theme";

export const useCalendarData = () => {
  const { intentions } = useIntentionStore();
  const { setDayIntentions, dayIntentions } = useCalendarStore();

  useEffect(() => {
    const next: DayIntentions = {};
    for (const it of intentions) {
      if (!it.active) continue;
      const prayed = new Set(it.prayedDates ?? []);
      for (const day of getDateRange(it.startDate, it.currentEndDate)) {
        if (prayed.has(day)) continue;
        (next[day] ||= []).push(it);
      }
    }
    setDayIntentions(next);
  }, [intentions, setDayIntentions]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const day of Object.keys(dayIntentions)) {
      marks[day] = { marked: true, dotColor: colors.accent };
    }
    return marks;
  }, [dayIntentions]);

  return { dayIntentions, markedDates };
};
