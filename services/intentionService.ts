import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Intention } from "../types";
import { addDaysISO, daysBetween, todayISO } from "../utils/dateUtils";

const intentionsCol = (userId: string) => collection(db, "users", userId, "intentions");

export const createIntention = async (
  userId: string,
  text: string,
  durationDays: number,
): Promise<Intention> => {
  const startDate = todayISO();
  const currentEndDate = addDaysISO(startDate, durationDays - 1);
  const ref = doc(intentionsCol(userId));
  const intention: Intention = {
    id: ref.id,
    userId,
    text,
    startDate,
    durationDays,
    currentEndDate,
    active: true,
    savedToHistory: false,
    createdAt: Date.now(),
  };
  await setDoc(ref, intention);
  return intention;
};

export const updateIntention = async (
  userId: string,
  intentionId: string,
  patch: Partial<Intention>,
): Promise<void> => {
  await updateDoc(doc(intentionsCol(userId), intentionId), patch);
};

export const deleteIntention = async (userId: string, intentionId: string): Promise<void> => {
  await deleteDoc(doc(intentionsCol(userId), intentionId));
};

export const extendIntentionByOneDay = async (
  userId: string,
  intention: Intention,
): Promise<void> => {
  const nextEnd = addDaysISO(intention.currentEndDate, 1);
  await updateIntention(userId, intention.id, { currentEndDate: nextEnd });
};

const computeExtendedEnd = (intention: Intention): string => {
  const today = todayISO();
  const yesterday = addDaysISO(today, -1);
  if (yesterday < intention.startDate) return intention.currentEndDate;
  const totalDaysPassed = daysBetween(intention.startDate, yesterday) + 1;
  const prayedSet = new Set(intention.prayedDates ?? []);
  let prayedInRange = 0;
  for (const d of prayedSet) {
    if (d >= intention.startDate && d <= yesterday) prayedInRange += 1;
  }
  const missed = Math.max(0, totalDaysPassed - prayedInRange);
  const originalEnd = addDaysISO(intention.startDate, intention.durationDays - 1);
  return addDaysISO(originalEnd, missed);
};

export const catchUpMissedDays = async (userId: string): Promise<void> => {
  const active = await listActiveIntentions(userId);
  for (const it of active) {
    const newEnd = computeExtendedEnd(it);
    if (newEnd !== it.currentEndDate) {
      await updateIntention(userId, it.id, { currentEndDate: newEnd });
    }
  }
};

export const getIntention = async (
  userId: string,
  intentionId: string,
): Promise<Intention | null> => {
  const snap = await getDoc(doc(intentionsCol(userId), intentionId));
  return snap.exists() ? (snap.data() as Intention) : null;
};

export const listActiveIntentions = async (userId: string): Promise<Intention[]> => {
  const q = query(intentionsCol(userId), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Intention);
};

export const subscribeIntentions = (
  userId: string,
  onChange: (intentions: Intention[]) => void,
): Unsubscribe =>
  onSnapshot(intentionsCol(userId), (snap) => {
    onChange(snap.docs.map((d) => d.data() as Intention));
  });
