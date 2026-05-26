import { create } from "zustand";
import type { Intention } from "../types";

type IntentionState = {
  intentions: Intention[];
  setIntentions: (next: Intention[]) => void;
  upsert: (i: Intention) => void;
  remove: (id: string) => void;
};

export const useIntentionStore = create<IntentionState>((set) => ({
  intentions: [],
  setIntentions: (next) => set({ intentions: next }),
  upsert: (i) =>
    set((s) => {
      const idx = s.intentions.findIndex((x) => x.id === i.id);
      if (idx === -1) return { intentions: [...s.intentions, i] };
      const copy = s.intentions.slice();
      copy[idx] = i;
      return { intentions: copy };
    }),
  remove: (id) => set((s) => ({ intentions: s.intentions.filter((x) => x.id !== id) })),
}));
