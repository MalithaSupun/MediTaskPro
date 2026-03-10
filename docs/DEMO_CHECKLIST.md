# MediTask Pro Demo Checklist

Use this sequence for the practical exam demo recording.

## 1. Cold Start

- Launch app from a closed state.
- Show Splash -> Onboarding/Auth -> Main flow.
- Confirm dashboard loads with task summary.

## 2. Add Task

- Open create task from FAB.
- Enter title, description, priority.
- Save and verify new task appears in list and metrics update.

## 3. Edit Task

- Open task detail.
- Navigate to edit screen.
- Update title or priority and save.
- Confirm updated values in list/detail.

## 4. Complete Task

- Open task detail and toggle status.
- Verify progress indicators on Dashboard and Analytics update.

## 5. Delete Task

- Delete one task from swipe action.
- Delete another from task detail button.
- Confirm tasks are removed.

## 6. Error Handling

- Demonstrate failed fetch/operation state.
- Show retry action on error card.
- Show user feedback toast after retry.

## 7. Offline Mode

- Disable network.
- Create/update/delete tasks offline.
- Show offline banner and pending sync count.
- Re-enable network.
- Trigger refresh/sync and show queue flush success.

## 8. Theme Settings

- Open Profile > Appearance.
- Switch `System` -> `Light` -> `Dark`.
- Confirm UI updates instantly and persists after app restart.

## 9. Code/Architecture Highlights (optional but recommended)

- API layer (`axiosInstance`, `todoService`).
- Redux slices (tasks/session/preferences).
- Offline queue merge/sync logic.
- CI workflow and quality gates.
