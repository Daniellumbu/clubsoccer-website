# How to Run This Project

## Prerequisites

- Node.js 20+ (tested with v24.10.0)
- npm 10+

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

This project connects to Firebase. A `.env.local` file with the following keys is required (an example is in `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

A `.env.local` with these values already exists in this project, so no changes are needed unless you're pointing at a different Firebase project.

## 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Other commands

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Run the production build (run `build` first) |
| `npm run lint` | Lint the codebase |
| `node scripts/seed.mjs` | Seed Firestore with initial data (reads `.env.local`) |

## Notes

- This project pins a pre-release version of Next.js (16.2.4) with breaking changes from the stable docs you may know — see `AGENTS.md` and `node_modules/next/dist/docs/` before making framework-level changes.
