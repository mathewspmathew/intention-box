import { useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCalendarStore } from "../stores/calendarStore";
import type { Birthday } from "../types";

const TOKEN_KEY = "google_calendar_token";
const BIRTHDAYS_KEY = "birthdays_cache";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export const useGoogleCalendar = () => {
  const { setBirthdays } = useCalendarStore();

  const connect = useCallback(async () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? "";
    const redirectUri = AuthSession.makeRedirectUri({ scheme: "intentionbox" });
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: [SCOPE],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    });
    const result = await request.promptAsync(discovery);
    if (result.type === "success" && result.authentication?.accessToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, result.authentication.accessToken);
      return true;
    }
    return false;
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

  return { connect, syncBirthdays, loadCached };
};
