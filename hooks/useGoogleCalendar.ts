import { useCallback } from "react";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCalendarStore } from "../stores/calendarStore";
import type { Birthday } from "../types";

const TOKEN_KEY = "google_calendar_token";
const BIRTHDAYS_KEY = "birthdays_cache";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export const useGoogleCalendar = () => {
  const { setBirthdays } = useCalendarStore();

  const connect = useCallback(async () => {
    console.log("[GoogleCalendar] connect() called, currentUser:", GoogleSignin.getCurrentUser());
    try {
      const response = await GoogleSignin.addScopes({ scopes: [SCOPE] });
      console.log("[GoogleCalendar] addScopes response:", JSON.stringify(response));
      if (!response || !isSuccessResponse(response)) return false;
      const { accessToken } = await GoogleSignin.getTokens();
      console.log("[GoogleCalendar] got accessToken, length:", accessToken?.length);
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      return true;
    } catch (e: any) {
      console.log("[GoogleCalendar] connect() error:", e?.code, e?.message);
      return false;
    }
  }, []);

  const syncBirthdays = useCallback(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return;
    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?eventTypes=birthday&maxResults=250&singleEvents=true";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.warn("birthdays fetch failed", res.status);
      return;
    }
    const json = (await res.json()) as { items?: Array<{ id: string; summary?: string; start?: { date?: string } }> };
    const birthdays: Birthday[] = (json.items ?? [])
      .filter((e) => e.start?.date)
      .map((e) => ({
        id: e.id,
        name: e.summary ?? "Birthday",
        date: e.start!.date!,
        isRecurring: true,
      }));
    await AsyncStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(birthdays));
    setBirthdays(birthdays);
  }, [setBirthdays]);

  const loadCached = useCallback(async () => {
    const raw = await AsyncStorage.getItem(BIRTHDAYS_KEY);
    if (raw) setBirthdays(JSON.parse(raw) as Birthday[]);
  }, [setBirthdays]);

  return { connect, syncBirthdays, loadCached, googleCalendarRequestReady: true };
};
