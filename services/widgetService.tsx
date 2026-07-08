import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { TodayWidget } from "../components/widget/TodayWidget";
import { useIntentionStore } from "../stores/intentionStore";
import { auth } from "./firebase";

export type WidgetSnapshot = {
  signedIn: boolean;
  date: string;
  intentions: string[];
  updatedAt: number;
};

const SNAPSHOT_KEY = "@intentionbox/widget-snapshot";

const todayISO = (): string => format(new Date(), "yyyy-MM-dd");

const buildSnapshot = (): WidgetSnapshot => {
  const signedIn = !!auth.currentUser;
  const dateLabel = format(new Date(), "EEE, MMM d");

  if (!signedIn) {
    return { signedIn: false, date: dateLabel, intentions: [], updatedAt: Date.now() };
  }

  const today = todayISO();
  const todays = useIntentionStore
    .getState()
    .intentions.filter((i) => i.active && i.startDate <= today && today <= i.currentEndDate)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((i) => i.text);

  return { signedIn: true, date: dateLabel, intentions: todays, updatedAt: Date.now() };
};

export const readSnapshot = async (): Promise<WidgetSnapshot> => {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    if (raw) return JSON.parse(raw) as WidgetSnapshot;
  } catch {}
  return {
    signedIn: false,
    date: format(new Date(), "EEE, MMM d"),
    intentions: [],
    updatedAt: 0,
  };
};

export const updateWidget = async (): Promise<void> => {
  if (Platform.OS !== "android") return;
  const snapshot = buildSnapshot();
  try {
    await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn("[widget] failed to persist snapshot", err);
  }
  try {
    await requestWidgetUpdate({
      widgetName: "TodayWidget",
      renderWidget: () => <TodayWidget snapshot={snapshot} />,
      widgetNotFound: () => {
        // No widget added to home screen — nothing to do.
      },
    });
  } catch (err) {
    console.warn("[widget] requestWidgetUpdate failed", err);
  }
};
