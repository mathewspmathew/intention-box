import { collection, doc, setDoc, getDocs, deleteDoc, type Firestore } from "firebase/firestore";
import { db } from "./firebase";
import type { HistoryEntry, Intention } from "../types";
import { todayISO, daysBetween, fromISO } from "../utils/dateUtils";
import { differenceInCalendarDays } from "date-fns";

const historyCol = (userId: string) => collection(db, "users", userId, "history");

export const archiveIntention = async (userId: string, intention: Intention): Promise<void> => {
  const completedDate = todayISO();
  const entry: HistoryEntry = {
    id: intention.id,
    userId,
    text: intention.text,
    startDate: intention.startDate,
    completedDate,
    totalDays: daysBetween(intention.startDate, completedDate) + 1,
  };
  await setDoc(doc(historyCol(userId), entry.id), entry);
};

export const listHistory = async (userId: string): Promise<HistoryEntry[]> => {
  const snap = await getDocs(historyCol(userId));
  return snap.docs.map((d) => d.data() as HistoryEntry);
};

export const deleteHistoryEntry = async (userId: string, id: string): Promise<void> => {
  await deleteDoc(doc(historyCol(userId), id));
};

export const pruneHistoryOlderThan = async (
  userId: string,
  retentionDays: number,
): Promise<void> => {
  const today = fromISO(todayISO());
  const entries = await listHistory(userId);
  for (const entry of entries) {
    const age = differenceInCalendarDays(today, fromISO(entry.completedDate));
    if (age > retentionDays) {
      await deleteHistoryEntry(userId, entry.id);
    }
  }
};

export const _db: Firestore = db;
