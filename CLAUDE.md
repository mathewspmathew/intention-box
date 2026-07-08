# CLAUDE.md — Intention Box App

> Hand this file to Claude Code at the start of every session.
> It contains the full project context, architecture, data models, and coding rules.

---

## What This App Is

**Intention Box** is a calendar-centric personal prayer intentions tracker.
Users log intentions with a duration (e.g. 10 days). The app shows those intentions
as tags on each day of the calendar for that duration. Each day, a notification at
10 PM asks the user: "Prayed / Not Prayed." If prayed, that day is marked done and
the intention continues normally. If not prayed (or notification ignored), the
intention is extended by one extra day. The app syncs across devices via Firebase.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native, Expo Managed Workflow |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State Management | Zustand (lightweight, two stores) |
| Backend / Auth | Firebase (Firestore + Firebase Auth) |
| Local Storage | AsyncStorage (non-sensitive), expo-secure-store (OAuth tokens) |
| Notifications | expo-notifications + expo-task-manager |
| Calendar UI | react-native-calendars |
| Date Utilities | date-fns |
| Bottom Sheet | react-native-bottom-sheet |
| Google Calendar | expo-auth-session (OAuth2, read-only scope) |

---

## Coding Standards

- Functional components with arrow syntax only: `const MyComponent = () => {}`
- TypeScript `type` only — never `interface`
- All styling via inline `StyleSheet` objects — no styled-components, no Tailwind
- Business logic extracted into custom hooks inside `hooks/`
- No class components anywhere
- All async operations wrapped in try/catch with user-facing error handling
- Use `date-fns` for all date arithmetic — never raw JS Date math

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

- Headings: Playfair Display or Cormorant Garamond
- Body: DM Sans
- Border radius: 12px for cards, 8px for tags/pills, 24px for buttons
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px

---

## Project Folder Structure

```
intention-box/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout, auth gate, notification setup
│   ├── (auth)/
│   │   └── sign-in.tsx           # Google Sign-In screen
│   └── (tabs)/
│       ├── _layout.tsx           # Bottom tab navigator (3 tabs)
│       ├── calendar.tsx          # Screen 1 — Calendar view
│       ├── today.tsx             # Screen 2 — Today's intentions
│       └── profile.tsx           # Screen 3 — Settings & history
│
├── components/
│   ├── AddIntentionSheet.tsx     # Bottom sheet: Intention text + Days inputs
│   ├── IntentionCard.tsx         # Single intention row (text, days left, Prayed btn)
│   ├── IntentionTag.tsx          # Small gold tag shown on calendar days
│   ├── BirthdayTag.tsx           # Read-only birthday tag (cake icon)
│   ├── DayModal.tsx              # Modal shown when tapping a calendar day
│   ├── GlobalAddButton.tsx       # Floating "+" FAB on Calendar screen
│   └── NotificationTimeModal.tsx # Time picker for notification preference
│
├── hooks/
│   ├── useIntentions.ts          # CRUD, expiry logic, prayed/not-prayed actions
│   ├── useCalendarData.ts        # Merges intentions + birthdays into calendar marks
│   ├── useNotifications.ts       # Schedule, cancel, reschedule notifications
│   ├── useGoogleCalendar.ts      # OAuth connect, birthday fetch, sync
│   └── useAuth.ts                # Firebase auth state, sign in, sign out
│
├── stores/
│   ├── intentionStore.ts         # Zustand — active intentions, CRUD
│   ├── calendarStore.ts          # Zustand — merged calendar view data
│   └── settingsStore.ts          # Zustand — notificationTime, historyEnabled
│
├── services/
│   ├── firebase.ts               # Firebase app init, Firestore instance
│   ├── intentionService.ts       # Firestore reads/writes for intentions
│   ├── historyService.ts         # Firestore reads/writes for history
│   └── notificationService.ts    # expo-notifications setup and scheduling
│
├── tasks/
│   └── midnightTask.ts           # expo-task-manager background task
│                                 # Runs at midnight: expires intentions,
│                                 # reschedules next-day notifications
│
├── types/
│   └── index.ts                  # All shared TypeScript types
│
├── constants/
│   └── theme.ts                  # Colors, spacing, font sizes
│
├── utils/
│   ├── dateUtils.ts              # date-fns helpers (getDateRange, isToday, etc.)
│   └── notificationUtils.ts      # Build notification content strings
│
└── assets/
    └── fonts/                    # Playfair Display, DM Sans
```

---

## TypeScript Types

```ts
// types/index.ts

type Intention = {
  id: string;
  userId: string;
  text: string;
  startDate: string;        // ISO date "YYYY-MM-DD"
  durationDays: number;     // original number entered by user
  currentEndDate: string;   // ISO date — can be extended by "Not Prayed"
  active: boolean;
  savedToHistory: boolean;
  createdAt: number;        // Unix timestamp
};

type HistoryEntry = {
  id: string;
  userId: string;
  text: string;
  startDate: string;
  completedDate: string;
  totalDays: number;
};

type DayIntentions = {
  [dateString: string]: Intention[]; // key: "YYYY-MM-DD"
};

type NotificationAction = "prayed" | "not_prayed" | "ignored";

type UserSettings = {
  notificationTime: string;  // "HH:MM" 24hr format, default "22:00"
  historyEnabled: boolean;
  googleCalendarConnected: boolean;
};

type Birthday = {
  id: string;
  name: string;
  date: string;             // "YYYY-MM-DD"
  isRecurring: boolean;
};
```

---

## Firestore Data Structure

```
users/{userId}/
  document: {
    notificationTime: "22:00",
    historyEnabled: false,
    googleCalendarConnected: false
  }

users/{userId}/intentions/{intentionId}/
  document: Intention (see type above)

users/{userId}/history/{intentionId}/
  document: HistoryEntry (see type above)
```

**Rules:**
- All reads/writes scoped to authenticated `userId` only
- Use Firestore real-time listeners (`onSnapshot`) so intentions sync instantly across devices
- Write to Firestore first, then update local Zustand store on success

---

## Core Logic — Intention Lifecycle

### Creating an intention
1. User taps "+" → bottom sheet opens
2. User enters `text` and `durationDays`
3. On save:
   - `startDate` = today (local date)
   - `currentEndDate` = startDate + durationDays - 1
   - Write to Firestore under `users/{userId}/intentions/`
   - Zustand store updates via `onSnapshot` listener
   - Schedule notifications for each day from startDate to currentEndDate

### Daily expiry (runs at midnight via background task)
1. For each active intention, check if yesterday's date < `currentEndDate`
2. If today is past `currentEndDate`:
   - If `historyEnabled`: write to history collection first
   - Set `active: false` in Firestore (or delete document)
3. Reschedule today's notifications for remaining active intentions

### Notification response logic
- **Prayed**: mark today as done for that intention. Intention continues for remaining days normally. If it was the last day, archive/delete per history setting.
- **Not Prayed**: extend `currentEndDate` by +1 day in Firestore. Update calendar marks.
- **Ignored / dismissed** (no tap by midnight): treat as "Not Prayed" — extend `currentEndDate` by +1.

---

## Notifications (Android Action Buttons)

Use `expo-notifications` notification categories:

```ts
// Set up once on app launch
await Notifications.setNotificationCategoryAsync("INTENTION_CATEGORY", [
  {
    identifier: "PRAYED",
    buttonTitle: "🤲 Prayed",
    options: { isDestructive: false, isAuthenticationRequired: false }
  },
  {
    identifier: "NOT_PRAYED",
    buttonTitle: "Not today",
    options: { isDestructive: false, isAuthenticationRequired: false }
  }
]);
```

- **Android only** for action buttons — iOS shows informational notification only
- Schedule one notification per active intention per day
- Notification content: intention text + "Day X of Y"
- Default time: 22:00 (user can change in Settings)
- At midnight, background task checks for ignored notifications and extends accordingly

---

## Screens — Detailed Behaviour

### Screen 1 — Calendar (`app/(tabs)/calendar.tsx`)
- Full monthly calendar using `react-native-calendars`
- Gold dot/tag on each day that has active intentions
- Birthday entries shown with a 🎂 icon (read-only, cannot tap to edit)
- Tapping today → navigate to Today's Intentions tab
- Tapping another day → open `DayModal` showing that day's intentions (read-only view)
- Floating "+" button (`GlobalAddButton`) always visible bottom-right
- Pressing "+" opens `AddIntentionSheet`

### Screen 2 — Today's Intentions (`app/(tabs)/today.tsx`)
- Lists all active intentions where today is between `startDate` and `currentEndDate`
- Each `IntentionCard` shows:
  - Intention text
  - Days remaining (e.g. "Day 3 of 10")
  - **Prayed** button → marks as prayed, removes today from calendar
  - **Edit** icon → opens `AddIntentionSheet` pre-filled (text + remaining days editable)
- Empty state: "No intentions for today. Tap + to add one."

### Screen 3 — Profile / Settings (`app/(tabs)/profile.tsx`)
- Notification time picker (opens `NotificationTimeModal`)
- History toggle (on/off) — if turned on mid-session, future completions are saved
- "Connect Google Calendar" button → triggers OAuth flow
- "Sync Birthdays" button (shown after connect)
- History section (shown only if `historyEnabled: true`) — flat list of `HistoryEntry`
- "Sign Out" button at bottom

---

## Authentication Flow

```
App opens
  └─ Check Firebase auth state (useAuth hook)
       ├─ Not signed in → redirect to (auth)/sign-in.tsx
       │     └─ "Continue with Google" button
       │           └─ expo-auth-session Google OAuth
       │                 └─ Firebase signInWithCredential
       │                       └─ On success → redirect to (tabs)/calendar
       └─ Signed in → proceed to (tabs) directly
```

- First launch after sign-in: show history preference modal ("Save intention history?")
- Store preference in Firestore under `users/{userId}` document

---

## Google Calendar Integration

- Scope: `https://www.googleapis.com/auth/calendar.readonly`
- On connect: fetch events with `eventType: "birthday"` or title containing "birthday"
- Map to local `Birthday[]` array, store in AsyncStorage (not Firestore — read-only reference data)
- Token stored in `expo-secure-store`
- Sync button: re-fetches and overwrites local birthday data
- Birthday tags shown on calendar — not editable, not deletable inside the app

---

## Home-Screen Widget (Android Only)

A read-only Android home-screen widget that displays today's intentions. Tap-to-open only — no in-widget buttons.

### Spec

- **Platform:** Android only (no iOS in v1)
- **Size:** 4×2 medium (single size)
- **Header:** today's date + day of week (e.g. "Tue, May 26")
- **Body:** scrollable list of today's active intentions, **text only** (no "Day X of Y")
- **Empty state:** "No intentions today"
- **Signed-out state:** "Open app to sign in"
- **Tap anywhere on widget:** deep-link to `(tabs)/today`
- **Theme:** matches app — bg `#1A1A1A`, accent `#C9A84C`, primary text `#FFFDF5`, muted `#888880`

### Stack additions

| Concern | Choice |
|---|---|
| Workflow | Switch from Expo Managed → **Expo Prebuild (CNG)**. Keeps JS code unchanged; generates `android/` folder. Lose Expo Go, use dev client. |
| Widget library | **`react-native-android-widget`** — widget UI authored in JSX, no Kotlin/XML needed for the widget body itself. |
| Data bridge | Library's built-in shared storage (writes a JSON blob the widget reads). No direct Firestore / AsyncStorage access from widget process. |
| Deep linking | `intentionbox://today` scheme; route handled in `app/_layout.tsx`. |

### Data flow

```
App (JS) ──writes today's snapshot──▶ Shared storage (file)
                                          │
                                          ▼
                                  Widget process reads
                                          │
                                          ▼
                                  Renders list + date
```

The widget **never** touches Firestore. The app pushes a fresh snapshot whenever today's intentions change.

### Refresh triggers (call `updateWidget()` from these spots)

1. App start (after auth resolves)
2. Intention created / edited / deleted
3. Prayed / Not Prayed action
4. Midnight background task (after expiry + reschedule)
5. Firestore `onSnapshot` listener fires with new data (cross-device sync)
6. Sign-in / sign-out

### Files to add

```
services/widgetService.ts        # updateWidget() — builds snapshot, writes to shared storage,
                                 # calls library's requestWidgetUpdate()
components/widget/
  TodayWidget.tsx                # Widget UI (JSX via react-native-android-widget)
  TodayWidgetTask.tsx            # Widget task handler (registered with library)
app.json                         # Add react-native-android-widget config plugin entry
```

### Files to modify (minimal touches)

| File | Change |
|---|---|
| `app/_layout.tsx` | Register widget task; handle `intentionbox://today` deep link |
| `hooks/useIntentions.ts` | Call `updateWidget()` after each mutation |
| `hooks/useAuth.ts` | Call `updateWidget()` on sign-in / sign-out |
| `tasks/midnightTask.ts` | Call `updateWidget()` at end |
| `services/intentionService.ts` | Call `updateWidget()` inside `onSnapshot` callback |

### Snapshot shape written to shared storage

```ts
type WidgetSnapshot = {
  signedIn: boolean;
  date: string;              // "Tue, May 26"
  intentions: string[];      // text only, ordered by createdAt
  updatedAt: number;         // for debugging
};
```

### Implementation order

1. Run `npx expo prebuild --platform android` (one-time; generates `android/`)
2. `npx expo install react-native-android-widget`; add its config plugin to `app.json`
3. Create `services/widgetService.ts` with `updateWidget()` stub (writes mock data)
4. Build `components/widget/TodayWidget.tsx` — header + scrollable list + empty/signed-out states
5. Register widget task in `app/_layout.tsx`
6. Wire `updateWidget()` into the 6 trigger points above
7. Add `intentionbox://` scheme to `app.json`; handle deep link to `(tabs)/today`
8. Test: install dev client, add widget to home screen, verify all triggers refresh it

### Notes

- Widget runs in a separate Android process — no React context, no Zustand, no Firebase available there. All data comes through the shared-storage snapshot.
- Keep `updateWidget()` cheap; it runs often. Build the snapshot from in-memory Zustand state, not by re-reading Firestore.
- If shared storage is empty (fresh install, never written), the widget should render the signed-out state.

---

## Background Task (Midnight Expiry)

```ts
// tasks/midnightTask.ts
// Registered as "MIDNIGHT_TASK" via expo-task-manager
// Triggered by expo-background-fetch

// What it does:
// 1. Fetch all active intentions for this user from Firestore
// 2. For each intention where currentEndDate < today:
//    - If historyEnabled: write HistoryEntry to Firestore
//    - Delete or mark active:false in Firestore
// 3. Check yesterday's notifications — if any were not responded to:
//    - Extend those intentions' currentEndDate by +1
// 4. Schedule today's notifications for all remaining active intentions
```

**Register this task in `app/_layout.tsx` outside the React component tree.**

---

## Known Gaps to Implement After Stitch

These will likely be incomplete or missing from Stitch output — prioritise these with Claude Code:

1. **Firebase config** — paste your `firebaseConfig` object into `services/firebase.ts`
2. **Notification categories** — Android action buttons (Prayed / Not Prayed) setup
3. **Background task registration** — `midnightTask.ts` must be registered in `_layout.tsx`
4. **Ignored notification detection** — logic to detect no-tap and auto-extend at midnight
5. **Google Calendar OAuth** — full flow with token refresh
6. **Firestore security rules** — lock all reads/writes to `request.auth.uid == userId`
7. **History archival** — ensure history write completes before intention deletion

---

## Environment Variables

Create a `.env` file at project root (never commit to git):

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_ID_ANDROID=
GOOGLE_OAUTH_CLIENT_ID_IOS=
```

Access via `expo-constants` or `process.env` with Expo's built-in env support.

---

## Useful Commands

```bash
npx expo start              # Start dev server
npx expo start --android    # Start on Android
npx tsc                     # TypeScript check
npx expo install <package>  # Install Expo-compatible package
```

---

## How to Work With Claude Code

Start each session by saying:
> "Read CLAUDE.md and then [your task]."

Example prompts:
- "Read CLAUDE.md and implement the midnight background task in tasks/midnightTask.ts"
- "Read CLAUDE.md and wire up Firebase auth in hooks/useAuth.ts"
- "Read CLAUDE.md and build the AddIntentionSheet component"
- "Read CLAUDE.md and implement the Prayed/Not Prayed Android notification actions"
