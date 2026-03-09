# MediTask Pro

Production-ready React Native task management app built for medical professionals with offline resilience, priority workflows, analytics, and reliable backend synchronization.

## Assessment Alignment

This repository implements the **Software Engineer (Mobile Frontend) practical exam** scope for Delivergate.

Delivered core requirements:
- Task CRUD (`GET/POST/PUT/DELETE`) with MockAPI backend
- Priority and status management (`Low/Medium/High`, `Pending/Completed`)
- Search, status filter, pull-to-refresh, swipe-to-delete
- Daily dashboard summary and progress indicators
- Analytics view for completion and workload distribution
- Offline-safe queue with auto-sync and manual sync trigger
- Network/error states with retry and toast feedback
- Centralized light/dark/system theming from Profile settings
- TypeScript strict mode + lint + tests + CI Android artifact pipeline

## Tech Stack

- React Native CLI + TypeScript (strict mode)
- Redux Toolkit for global state and async flows
- Axios for API layer
- React Navigation (native stack + bottom tabs)
- React Hook Form + Yup for task validation
- AsyncStorage for local persistence (session, cache, sync queue, theme)

## API

Base URL:

`https://60a21a08745cd70017576014.mockapi.io/api/v1`

Endpoints used:
- `GET /todo`
- `GET /todo/:id`
- `POST /todo`
- `PUT /todo/:id`
- `DELETE /todo/:id`

## Project Structure

```text
src/
├── api/
├── components/
├── constants/
├── hooks/
├── navigation/
├── screens/
├── store/
├── theme/
├── types/
└── utils/
```

## Setup and Run

### Prerequisites

- Node.js `>= 22.11.0`
- Java 17 (Android builds)
- Android Studio + SDK
- Xcode + CocoaPods (for iOS)

### Install

```bash
npm install
```

### Start Metro

```bash
npm start
```

### Run Android

```bash
npm run android
```

### Run iOS

```bash
bundle install
bundle exec pod install
npm run ios
```

## Scripts

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build:android:debug
```

## Theme Settings

Theme is configurable from `Profile > Appearance`:
- `System`
- `Light`
- `Dark`

Preference is persisted locally and applied immediately without app restart.

## Offline and Sync Behavior

- Create/update/delete operations are queued when network is unavailable.
- Cached tasks are displayed in offline mode.
- Queue is flushed on refresh/reconnect.
- Sync metadata is shown in Profile and Analytics.

## CI/CD

Workflow file:

`.github/workflows/mobile-ci.yml`

Pipeline steps:
- Install dependencies
- Run lint
- Run TypeScript type check
- Run tests
- Build Android debug APK
- Upload artifact (`app-debug.apk`)

## Build and Release Notes

### Android (implemented now)

Debug artifact:

```bash
npm run build:android:debug
```

Output:

`android/app/build/outputs/apk/debug/app-debug.apk`

Signed release process can be added with keystore secrets for Play Internal Testing or Firebase App Distribution.

### iOS (optional in this assessment)

Build and archive with Xcode, then distribute via TestFlight.

## Versioning

Semantic versioning is used.

Current version: `v1.0.0`

## Branch Strategy

Recommended:
- `main` for stable releases
- `develop` for integration
- `feature/*` for isolated work

## Documentation

- Design document: [`docs/DESIGN_DOCUMENT.md`](docs/DESIGN_DOCUMENT.md)
- Low-fidelity wireframes: [`docs/LOW_FIDELITY_WIREFRAMES.md`](docs/LOW_FIDELITY_WIREFRAMES.md)
- Demo checklist: [`docs/DEMO_CHECKLIST.md`](docs/DEMO_CHECKLIST.md)
- Screen plan: [`docs/SCREEN_PLAN.md`](docs/SCREEN_PLAN.md)

High-fidelity Figma/board link:

- [MediTask Pro Screen Wireframe Flow](https://www.figma.com/online-whiteboard/create-diagram/6d339ba3-79fa-4904-9810-7df4211289e5?utm_source=other&utm_content=edit_in_figjam&oai_id=&request_id=bfc70d8b-d214-48e9-8b15-ae8c47d9cd2d)

## Notes for Final Submission Package

For submission email, include:
- GitHub repository link
- Figma link
- APK file
- Demo video
- Design document PDF export (from `docs/DESIGN_DOCUMENT.md`)
- CV
