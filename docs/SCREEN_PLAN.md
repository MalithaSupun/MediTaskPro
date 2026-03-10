# MediTask Pro Screen Plan (SE Level)

## 1. Entry Flow

1. `Splash`
- Branded cold-start screen with loading indicator.
- Auto-navigates to onboarding after initialization.

2. `Onboarding`
- Value proposition and feature highlights.
- CTA to start authentication.

3. `Auth`
- `Login`
- `Signup`
- Both routes transition into the main application shell.

## 2. Main Application Shell

1. `Dashboard` (Tab)
- Greeting and daily workload summary.
- Progress indicator (completion %).
- Daily task snapshot.
- Fast action to create a task.

2. `Tasks` (Tab + Stack)
- `TaskList`
  - Search by title/description.
  - Filter by status (All/Pending/Completed).
  - Pull-to-refresh.
  - Swipe-to-delete.
  - Offline banner + queue visibility.
- `TaskDetail`
  - Full task details.
  - Status toggle.
  - Edit and delete actions.
- `CreateTask`
  - Validated form (title, description, priority).
- `EditTask`
  - Pre-filled validated form.

3. `Analytics` (Tab)
- Completion ratio and summary metrics.
- Priority distribution visualization.
- Sync metadata (last synced, pending queue count).

4. `Profile` (Tab)
- User snapshot.
- Network/offline state.
- Manual sync trigger.

## 3. State & Data Flow

1. `Redux Toolkit` task slice for global task state.
2. `AsyncStorage` for:
- Task cache
- Offline sync queue
- Last sync timestamp
3. API sync strategy:
- Attempt queued operation flush.
- Fetch latest server tasks.
- Merge with unsynced local tasks.
4. Offline fallback:
- Queue create/update/delete operations.
- Show cached data and pending-sync indicators.

## 4. UX Contracts

1. Large tap targets and high contrast colors.
2. Light/dark mode via centralized theme tokens.
3. Reusable components (task cards, badges, segmented control, progress bar, error/empty states).
4. User feedback:
- Inline validation
- Loaders
- Retry states
- Toast notifications

## 5. Future Expansion

1. Role-based screens (doctor/admin).
2. Push reminders for high-priority pending tasks.
3. Calendar and schedule timeline integration.
4. Crash/error telemetry integration (Sentry/Crashlytics).
