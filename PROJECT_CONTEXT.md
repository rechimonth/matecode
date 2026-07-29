# MateCode - Project Context

## Overview
Task manager SPA for small businesses. React 19 + TypeScript + Tailwind CSS. Firebase Auth + Firestore. Emails via AWS SES through Vercel Serverless Functions.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router v7
- **Backend**: Firebase (Auth + Firestore), Vercel Functions (`api/send-summary.ts`)
- **Email**: AWS SES v3 (`@aws-sdk/client-ses`)
- **State**: React Context API (`AuthContext`, `TasksContext`)
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Testing**: Vitest + React Testing Library + `@testing-library/user-event`
- **Lint/Format**: ESLint + Prettier
- **Deploy**: Vercel

## Directory Structure
```
src/
  features/
    auth/           # AuthContext, Firebase auth service
    tasks/          # TasksContext, Firestore CRUD, task stats
  components/       # UI components (TodoForm, TodoList, Header, EmailButton, etc.)
  pages/            # Route views (LoginPage, RegisterPage, TasksPage)
  routes/           # ProtectedRoute
  services/         # External service wrappers (auth, tasks)
  hooks/            # Custom hooks
  types/            # TypeScript interfaces
  utils/            # Validators, formatters
  assets/           # Static assets
api/
  send-summary.ts   # Vercel Serverless Function for AWS SES
```

## Key Architecture Decisions
- **Context API** over Redux for global state (auth + tasks).
- **Firestore** with `userId` field for row-level security.
- **Vercel Functions** for email sending to keep AWS credentials server-side.
- **`dnd-kit`** for sortable task lists.
- **`import.meta.env.VITE_*`** for frontend env vars; server-side secrets stay in Vercel dashboard.

## Important Patterns
- Tests use `vi.doMock` + `vi.resetModules()` + dynamic `await import()` for components consuming contexts.
- Firebase Auth mock must export `getAuth`, `GoogleAuthProvider`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup`, `signOut`.
- `reorderTask` uses Option A: no optimistic update, only `refreshTasks(userId)`.
- `.env` is gitignored; `.env.example` contains placeholder keys only.

## Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint with zero-warning policy |
| `npm run test` | Vitest (all tests) |
| `npm run test:watch` | Vitest watch mode |

## Test Accounts
- **Email/Password**: `pruebametacode@gmail.com` / `con12345678` (funciona en local y producción)

## Environment
- `.env` (gitignored): Firebase config + `VITE_API_URL`
- Vercel env vars:
  - Frontend: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_API_URL`
  - Backend (API route): `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL`, `SES_CONFIGURATION_SET`, `ALLOWED_ORIGINS`

## SES Configuration
- Email verificado: `pruebametacode@gmail.com` en región `sa-east-1`.
- La función `api/send-summary.ts` incluye rate limiting por IP y validación de origen.
- Para manejo de bounces/complaints, crear un **Configuration Set** en SES Console y agregar un destino SNS:
  1. SES Console ? `sa-east-1` ? **Configuration Sets** ? **Create configuration set** ? nombre: `matecode-production`.
  2. Agregar un **Event destination** tipo **SNS** para eventos `BOUNCE` y `COMPLAINT`.
  3. Crear un topic SNS (ej: `ses-bounces`) y suscribir un endpoint (email o Lambda).
  4. Copiar el nombre del configuration set a la variable de entorno `SES_CONFIGURATION_SET` en Vercel.

## Firestore Rules
- Reglas actuales en `firestore.rules`:
  - Solo usuarios autenticados pueden leer/escribir tareas.
  - `userId` del documento debe coincidir con `request.auth.uid`.

## Current Status
- Build and lint pass.
- All 57 tests pass (14 test files).
- `vercel.json` configured with SPA fallback (`/(.*) -> /index.html`).
- `AuthContext` handlers no longer throw errors; they set error state only.
- `ProtectedRoute.test.tsx` fixed with `vi.doMock` + dynamic import pattern.
- Rate limiting and origin validation added to `api/send-summary.ts`.
