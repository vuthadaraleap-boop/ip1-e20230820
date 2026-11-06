# Gym Membership

Internet Programming I, project `ip1-e20230820`. Student: VUTHA DARALEAP (e20230820), group I4-GIC-B, lecturer CHUN Thavorac.

A web app where gym members request a membership, book classes and cancel bookings, and front-desk staff confirm payments and manage classes. Stack: Vue 3 + TypeScript, NestJS, PostgreSQL with Prisma.

## Status

Check 1 setup. The specification and the wireframes are written, and the Vue app is scaffolded with no screens yet. The backend is not started.

| Part | State |
|---|---|
| `docs/SPEC.md` | 10 user stories with acceptance criteria, 3 roles |
| `docs/wireframes/` | 6 screens |
| `frontend/` | Blank Vue 3 app with Router, Pinia, Vitest, ESLint and Prettier |
| `backend/` | Not started |

## Run the frontend

You need Node 22.18 or newer (Node 24 LTS is recommended). An older Node or npm can fail on `npm install` with an `edgesOut` error. If that happens, update Node.

```bash
cd frontend
npm install
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## Test and check

```bash
cd frontend
npx vitest run        # component tests, one run
npm run type-check    # TypeScript
npm run lint          # oxlint and ESLint
npm run build         # type-check and production build
```

## Project map

```
README.md        how to run, features
AI_LOG.md        every meaningful AI use
DECISIONS.md     one line per design choice
CHECK.md         filled before each score check
docs/
  SPEC.md        user stories, acceptance criteria, permissions, data model
  wireframes/    main screens
frontend/        Vue 3 + Vite + TypeScript
backend/         NestJS + Prisma (later checks)
.github/workflows/  CI (from Check 6)
```

## Features and screenshots

Planned features are in `docs/SPEC.md`. Features and screenshots will be added here as the screens are built.
