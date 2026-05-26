import { useEffect, useCallback } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import {
  ensureSettingsDoc,
  subscribeSettings,
  updateSettings as writeSettings,
} from "../services/settingsService";
import type { UserSettings } from "../types";

export const useSettings = (userId: string | undefined) => {
  const setLocal = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    ensureSettingsDoc(userId)
      .then((s) => {
        if (active) setLocal(s);
      })
      .catch((e) => {
        console.warn("settings: initial fetch failed (likely offline)", e?.message ?? e);
      });

    const unsub = subscribeSettings(userId, (s) => {
      if (active) setLocal(s);
    });

    return () => {
      active = false;
      unsub();
    };
  }, [userId, setLocal]);

  const setSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      setLocal(patch);
      if (!userId) return;
      try {
        await writeSettings(userId, patch);
      } catch (e: any) {
        console.warn("settings: write failed (will sync when online)", e?.message ?? e);
      }
    },
    [userId, setLocal],
  );

  return { setSettings };
};
