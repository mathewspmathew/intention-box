import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import type { UserSettings } from "../types";

const DEFAULTS: UserSettings = {
  notificationTime: "22:00",
  notificationsEnabled: true,
  googleCalendarConnected: false,
  historyRetentionDays: 30,
};

const userDoc = (userId: string) => doc(db, "users", userId);

export const ensureSettingsDoc = async (userId: string): Promise<UserSettings> => {
  const ref = userDoc(userId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, DEFAULTS).catch(() => undefined);
      return DEFAULTS;
    }
    return { ...DEFAULTS, ...(snap.data() as Partial<UserSettings>) };
  } catch {
    return DEFAULTS;
  }
};

// Strict read for headless callers (background task): throws if Firestore can't be reached,
// so callers never mistake DEFAULTS for the user's real settings.
export const getSettings = async (userId: string): Promise<UserSettings> => {
  const snap = await getDoc(userDoc(userId));
  return { ...DEFAULTS, ...((snap.data() ?? {}) as Partial<UserSettings>) };
};

export const updateSettings = async (
  userId: string,
  patch: Partial<UserSettings>,
): Promise<void> => {
  await setDoc(userDoc(userId), patch, { merge: true });
};

export const subscribeSettings = (
  userId: string,
  onChange: (settings: UserSettings) => void,
): Unsubscribe =>
  onSnapshot(userDoc(userId), (snap) => {
    const data = (snap.data() ?? {}) as Partial<UserSettings>;
    onChange({ ...DEFAULTS, ...data });
  });
