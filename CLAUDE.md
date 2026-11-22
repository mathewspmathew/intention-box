# CLAUDE.md — Intention Box App

> Hand this file to Claude Code at the start of every session.
> It describes the app **as it is implemented today** (verified against the code), plus the coding rules.
> **Keep it current:** whenever a change alters behaviour, structure, settings, dependencies or known gaps,
> update the relevant section of this file in the same change.

---

## What This App Is

**Intention Box** is a calendar-centric personal prayer intentions tracker.
Users log intentions with a duration (e.g. 10 days). The app shows those intentions
as marks on each day of the calendar for that duration. Each evening (default 10 PM) a single
notification says how many prayer requests are still left for the day (a plain reminder — no action
buttons; the user marks prayers in the app). Prayed days are ticked off; days that are not prayed push
the intention's end date out by one day automatically. The app syncs across devices via Firebase.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.81 / Expo SDK 54, **prebuild (CNG)** — `android/` is generated and gitignored; runs as a dev client / native build, not Expo Go |
| Language | TypeScript (`npm run typecheck`) |
| Navigation | Expo Router (file-based) |
| State Management | Zustand (3 stores) |
| Backend / Auth | Firebase JS SDK (Firestore + Auth), signed in via native `@react-native-google-signin/google-signin` → `signInWithCredential` |
| Local Storage | AsyncStorage (Firebase auth persistence, widget snapshot) |
| Notifications | expo-notifications (category + channel) |
| Background | expo-task-manager + **expo-background-task** (not background-fetch) |
| Calendar UI | react-native-calendars |
| Date Utilities | date-fns |
| Bottom Sheet | `@gorhom/bottom-sheet` v5 (needs gesture-handler + reanimated 4 / worklets) |
| Widget | react-native-android-widget (Android only) |

---

## Coding Standards

- Functional components with arrow syntax only: `const MyComponent = () => {}`
  (note: the Expo Router screen files currently use `export default function X()` — that is the existing convention for route files; use arrow syntax everywhere else)
- TypeScript `type` only — never `interface`
- All styling via inline `StyleSheet` objects — no styled-components, no Tailwind
- Business logic extracted into custom hooks inside `hooks/`
- No class components anywhere
- All async operations wrapped in try/catch with user-facing error handling
- Use `date-fns` for all date arithmetic — never raw JS Date math
  (dates are local-time `"YYYY-MM-DD"` strings; helpers live in `utils/dateUtils.ts`)

---

## Design System

```
Background:   #1A1A1A  (deep black)
Surface:      #242424  (cards, modals)
Primary Text: #FFFDF5  (ivory white)
Muted Text:   #888880  (secondary labels)
Accent:       #C9A84C  (muted gold — tags, buttons, highlights)
Danger:       #C0392B  (delete, error states)
Success:      #27AE60  (prayed confirmation)
```

- Headings: Playfair Display (`PlayfairDisplay_600SemiBold` / `_700Bold`). Body: DM Sans (`DMSans_400Regular` / `_500Medium`). Loaded in `app/_layout.tsx`.
- Border radius: 12px for cards, 8px for tags/pills, 24px for buttons
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px
- Tokens live in `constants/theme.ts` (`colors`, `spacing`, `radius`, `fonts`, `fontSize`) — import from there.
- The widget (`components/widget/TodayWidget.tsx`) duplicates the colour values in a local `COLORS` const because it renders outside the normal RN tree.
- Stitch design mockups: `stitch_intention_box_prayer_tracker/` (HTML + PNG, `DESIGN.md`). Reference only.

---

## Project Folder Structure (actual)

```
app/                              # Expo Router
├── _layout.tsx                   # Root: fonts, useAuth, useSettings, useNotifications, auth redirect,
│                                 #   imports tasks/midnightTask + tasks/widgetTask for side effects
├── index.tsx                     # Redirects to /(tabs)/today or /(auth)/sign-in
├── completed.tsx                 # Completed-intentions history (retention picker, clear-all)
├── (auth)/sign-in.tsx            # "Continue with Google"
└── (tabs)/
    ├── _layout.tsx               # Tabs in order: Today, Calendar, Profile
    ├── today.tsx                 # Today's intentions + "Mark all as Prayed"
    ├── calendar.tsx              # Month calendar + DayModal
    └── profile.tsx               # Notification toggle/time, link to Completed, sign out

components/
├── AddIntentionSheet.tsx         # Bottom sheet: add/edit (text, 1/3/7/custom days), Prayed + delete when editing
├── IntentionCard.tsx             # Row: text, "N DAYS REMAINING", prayed state, edit icon
├── BirthdayTag.tsx               # Birthday tag (unused — birthdays feature disabled)
├── DayModal.tsx                  # Tap a non-today calendar day: list + delete (with confirm)
├── GlobalAddButton.tsx           # Full-width bottom "Add Intention" button (not a floating FAB)
├── NotificationTimeModal.tsx     # 12-hour stepper time picker
├── ConfirmModal.tsx              # Themed confirm dialog (used for clear-all history)
├── TopBarSpacer.tsx              # Top spacer used by tab screens
└── widget/
    ├── TodayWidget.tsx           # Widget UI (react-native-android-widget JSX)
    └── TodayWidgetTask.tsx       # Widget task handler: reads snapshot, renders widget

hooks/
├── useAuth.ts                    # Auth state, Google sign-in/out; calls updateWidget on auth change
├── useIntentions.ts              # Subscribes to Firestore; add/edit/remove/markPrayed
├── useNotifications.ts           # Root-level: permissions, category, catch-up, reschedule, action listener
├── useSettings.ts                # Loads/subscribes user settings doc → settingsStore; setSettings
├── useCalendarData.ts            # Intentions → per-day map + calendar dot marks
└── useGoogleCalendar.ts          # Birthday sync — DISABLED (not imported anywhere)

stores/  intentionStore.ts · calendarStore.ts · settingsStore.ts   (Zustand)
services/
├── firebase.ts                   # Firebase init (env-driven), RN auth persistence, Firestore w/ long polling
├── intentionService.ts           # Firestore CRUD, onSnapshot subscribe, catchUpMissedDays
├── historyService.ts             # archive / list / delete / prune history
├── settingsService.ts            # users/{uid} doc: ensure defaults, update, subscribe
├── notificationService.ts        # Channel + category, schedule per-day notifications, cancelAll
└── widgetService.tsx             # Build snapshot, persist to AsyncStorage, requestWidgetUpdate
tasks/  midnightTask.ts (expo-background-task) · widgetTask.ts (registers widget handler, Android)
types/index.ts · constants/theme.ts · utils/dateUtils.ts · utils/notificationUtils.ts
firestore.rules · firebase.json · .firebaserc · .env.example
```

---

## TypeScript Types (`types/index.ts`)

```ts
type Intention = {
  id: string; userId: string; text: string;
  startDate: string;        // "YYYY-MM-DD"
  durationDays: number;     // as entered by user
  currentEndDate: string;   // derived — see "End-date extension" below
  active: boolean;
  savedToHistory: boolean;
  createdAt: number;
  prayedDates?: string[];   // days marked prayed
};

type HistoryEntry = { id; userId; text; startDate; completedDate; totalDays };
type DayIntentions = { [dateString: string]: Intention[] };

type UserSettings = {
  notificationTime: string;       // "HH:MM" 24h, default "22:00"
  notificationsEnabled: boolean;  // default true
  googleCalendarConnected: boolean; // default false (feature disabled)
  historyRetentionDays: number;   // 0 = don't archive; >0 = archive + auto-delete after N days. Default 30. UI offers 7 / 30.
};

type Birthday = { id; name; date; isRecurring };  // unused while birthdays disabled
```

---

## Firestore Data Structure

```
users/{userId}                       → UserSettings (doc is created with defaults by ensureSettingsDoc)
users/{userId}/intentions/{id}       → Intention
users/{userId}/history/{id}          → HistoryEntry
```

- Rules (`firestore.rules`): everything under `users/{userId}` is readable/writable only when `request.auth.uid == userId`.
- `subscribeIntentions` / `subscribeSettings` use `onSnapshot` for cross-device sync.
- Writes go to Firestore; the intention store is refreshed by the snapshot listener (not optimistically). Settings are written optimistically to the store, then Firestore.
- `firebase.ts` forces long-polling (`experimentalForceLongPolling`) for RN reliability.

---

## Core Logic

### Create
`createIntention`: `startDate` = today, `currentEndDate` = start + durationDays − 1, `active: true`. Then notifications are rescheduled.

### Edit
`useIntentions.edit` — changing `durationDays` recomputes `currentEndDate` = `startDate + duration − 1` (never earlier than today) and reschedules notifications. Text-only edits don't touch dates.

### Prayed (in app) — `markPrayed`
Appends today to `prayedDates`. If today ≥ `currentEndDate` (last day): archive to history (unless `historyRetentionDays === 0`) and delete the intention. Today screen has "Mark all as Prayed"; single-intention Prayed is inside the edit sheet.

### End-date extension (important)
`currentEndDate` is **derived, not just incremented**. `catchUpMissedDays` (`intentionService.ts`) sets
`currentEndDate = startDate + durationDays − 1 + (number of past days up to yesterday that are not in prayedDates)`.
It runs on app start / sign-in (in `useNotifications`) and in the midnight task. This is the **only** mechanism that
extends an intention: a day not marked prayed extends it automatically once that day has passed (the notification has no buttons).

### Expiry / history (midnight task)
For each active intention with `currentEndDate` before today: archive to history (if retention ≠ 0) and delete it.
History is pruned (older than `historyRetentionDays`) when the Completed screen is opened. Clear-all deletes every history doc.

---

## Notifications

- **One consolidated notification per day** (not per intention): title "Evening Reflection", body "You have N prayer request(s) left for praying." where N = unprayed intentions covering that day. Built in `utils/notificationUtils.ts`.
- `scheduleDailyNotifications` computes N for every day in each intention's range (skipping prayed days and past times) and schedules DATE triggers at the user's `notificationTime`. Everything is cancelled and re-scheduled (`cancelAll`) on any change.
- Android channel `evening-reflection` (HIGH importance), created by `setupNotificationChannel`. **No action buttons and no response listener** — tapping the notification just opens the app. The old `INTENTION_CATEGORY` (Prayed / Not Prayed buttons) was removed; `setupNotificationChannel` deletes it from devices that had registered it.
- Master toggle `notificationsEnabled` (Profile) cancels everything when off. `SCHEDULE_EXACT_ALARM` permission is declared in `app.json`.
- Permissions requested on launch in `useNotifications`.

---

## Screens

- **Today** (`(tabs)/today`, initial tab): intentions where `startDate ≤ today ≤ currentEndDate`. `IntentionCard` shows text, "N DAYS REMAINING", a Prayed/Completed pill once prayed, and an edit icon (hidden once prayed). "Mark all as Prayed" button; empty state "No intentions for today. Tap + to add one."
- **Calendar** (`(tabs)/calendar`): month view, gold dot on days with remaining (unprayed) intentions; today is outlined. Tap today → Today tab; tap other day → `DayModal` (list with delete + confirm). "Today" button resets month. "Add Intention" button at bottom opens the sheet.
- **Profile** (`(tabs)/profile`): avatar/email, notifications on/off toggle, notification time (modal, disabled when off), link to Completed Intentions, Sign Out. The Google Calendar "Connections" block is commented out.
- **Completed** (`/completed`): history list newest-first, "auto-delete after" picker (7 days / 1 month), broom button → ConfirmModal → clear all.
- **Sign-in** (`(auth)/sign-in`): single "Continue with Google" button, shows error text.
- Auth gate lives in `app/_layout.tsx` (`useSegments` + `router.replace`).

---

## Authentication

```
App opens → useAuth (onAuthStateChanged)
  ├─ no user → (auth)/sign-in → GoogleSignin.signIn() → idToken → signInWithCredential
  └─ user    → (tabs)/today
```

- Needs `EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID` (web client ID) for `GoogleSignin.configure`.
- The old "first-launch history preference modal" was **not** built; history is governed by `historyRetentionDays` (default 30).
- Sign-out: `firebase signOut`; the auth listener triggers a widget refresh.

---

## Android Home-Screen Widget (implemented)

4×2-ish (`minWidth 250dp / minHeight 110dp`, not resizable, `updatePeriodMillis` 30 min). Read-only; tapping anywhere opens `intentionbox://today` (`clickAction="OPEN_URI"`), which Expo Router resolves to `(tabs)/today` — there is no custom deep-link handler.

```
updateWidget() (services/widgetService.tsx)
  → builds WidgetSnapshot from the Zustand intention store + auth.currentUser
  → AsyncStorage["@intentionbox/widget-snapshot"]
  → requestWidgetUpdate({ widgetName: "TodayWidget", renderWidget })
Widget task handler (TodayWidgetTask.tsx) → readSnapshot() → render
```

- Snapshot: `{ signedIn, date: "EEE, MMM d", intentions: string[] (text only, by createdAt), updatedAt }`. Empty states: "No intentions today", "Open app to sign in".
- The snapshot is built from the in-memory store (no Firestore read), so the store must be populated; it is filled by `subscribeIntentions` whenever a screen using `useIntentions` is mounted.
- `updateWidget()` is called from: auth state change (`useAuth`), every intention snapshot (`subscribeIntentions`), and the end of the midnight task. Mutations in `useIntentions` rely on the snapshot listener rather than calling it directly.
- Widget task handler registered in `tasks/widgetTask.ts` (imported by `app/_layout.tsx`).

---

## Background Task

`tasks/midnightTask.ts` defines `MIDNIGHT_TASK` with `expo-task-manager` and registers it with `expo-background-task` (`minimumInterval: 60` min; the OS decides the real cadence — it is **not** exactly midnight). It: waits for `auth.authStateReady()` (headless starts have no restored user yet) → loads the user's settings from Firestore via `getSettings` (the Zustand settings store holds only defaults in a headless run, so never read it here) → `catchUpMissedDays` → archives/deletes expired intentions → `cancelAll` + reschedule notifications → `updateWidget()`. If the settings read fails the task returns `Failed` (OS retries) rather than acting on defaults. It auto-registers on import (imported from `app/_layout.tsx`).

---

## Google Calendar / Birthdays — DISABLED

Commit "Disable Google Calendar connect / birthday sync feature". `hooks/useGoogleCalendar.ts` (Google Sign-In `addScopes` for `calendar.readonly`, token in expo-secure-store, birthdays cached in AsyncStorage) still exists but is not imported; the Profile block and the birthday marks in `useCalendarData` are commented out. `BirthdayTag`, `Birthday` type, `googleCalendarConnected` setting and `calendarStore.birthdays` are leftovers. To restore: uncomment the Profile block/imports and the `useCalendarData` birthday marks.

---

## Environment & Build

`.env` (gitignored; template in `.env.example`) — all `EXPO_PUBLIC_*`, read in `services/firebase.ts` / `hooks/useAuth.ts`:

```
EXPO_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID, _STORAGE_BUCKET, _MESSAGING_SENDER_ID, _APP_ID
EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID      # used by GoogleSignin.configure
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID / _IOS   # listed in .env.example, not read by code
```

```bash
npx expo start                  # dev server (needs a dev client build)
npx expo run:android            # build + run native Android (package com.intentionbox.app)
npm run typecheck               # tsc --noEmit  (currently clean)
npx expo install <package>      # Expo-compatible installs
```

- `app.json`: scheme `intentionbox`, plugins `expo-router`, `expo-secure-store`, `expo-notifications`, `react-native-android-widget` (TodayWidget), `@react-native-google-signin/google-signin`, `expo-build-properties` (arm64-v8a only; minify + shrink resources in release), `newArchEnabled: true`.
- `google-services.json` is gitignored (`app/google-services.json`); it is required for native Google Sign-In on Android, and `app.json` has no `googleServicesFile` entry — it was not present in the working tree when this file was last audited. Re-add/wire it before a fresh native build.
- `*.apk`, `android/`, `ios/` are gitignored.

---

## Known Gaps / Things To Verify

1. **Widget lists intentions already prayed today** (it filters by date range only, not `prayedDates`), unlike the Calendar dots and Today card.
2. **Widget freshness depends on a mounted `useIntentions` listener** (and each of Today and Calendar creates its own `onSnapshot` subscription).
3. Notifications are scheduled for every day of every intention's range up front; large ranges could hit OS scheduled-notification limits (notably iOS's 64).
4. History-preference first-launch modal from the original spec was never implemented.
5. Unused code/deps: `BirthdayTag` and `useGoogleCalendar` (kept on purpose for the disabled Google Calendar feature); packages `expo-auth-session`, `expo-web-browser`, `expo-crypto` have no imports in source.
6. No automated tests.
7. Firestore rules are in the repo (`firestore.rules`); whether they are deployed to the Firebase project hasn't been verified.

---

## How to Work With Claude Code

Start each session by saying:
> "Read CLAUDE.md and then [your task]."

When you finish a change, update this file (structure, behaviour, settings, gaps) in the same commit.
