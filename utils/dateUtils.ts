import {
  format,
  addDays,
  eachDayOfInterval,
  parseISO,
  isToday as dfIsToday,
  isAfter,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";

export const ISO_DATE = "yyyy-MM-dd";

export const toISO = (d: Date): string => format(d, ISO_DATE);

export const fromISO = (s: string): Date => parseISO(s);

export const todayISO = (): string => toISO(new Date());

export const addDaysISO = (s: string, days: number): string =>
  toISO(addDays(parseISO(s), days));

export const getDateRange = (startISO: string, endISO: string): string[] =>
  eachDayOfInterval({ start: parseISO(startISO), end: parseISO(endISO) }).map(toISO);

export const isToday = (s: string): boolean => dfIsToday(parseISO(s));

export const isPast = (s: string): boolean =>
  isBefore(startOfDay(parseISO(s)), startOfDay(new Date()));

export const isFuture = (s: string): boolean =>
  isAfter(startOfDay(parseISO(s)), startOfDay(new Date()));

export const daysBetween = (a: string, b: string): number =>
  differenceInCalendarDays(parseISO(b), parseISO(a));
