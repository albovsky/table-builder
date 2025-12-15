# AGENTS.md

## Purpose

This file defines how coding agents should work in this repository: where code lives, how it is organized, naming conventions, required commands, and project-specific rules.

Codex reads `AGENTS.md` before doing work. Prefer the nearest `AGENTS.md` to the files you are editing.

## Project Summary

PR Document Helper is a client-side web app for building and validating IRCC-style Travel History and Address History tables, then exporting them as CSV and PDF.

Goals:
- Fast UX for large tables (2k+ rows)
- Correct date handling (ISO strings internally)
- Deterministic validation and exports
- Static-first deployment (no required SSR)

Non-goals:
- Offline-first behavior (nice-to-have, not required)
- Backend storage or analytics by default

## Working Root

All web app code lives under:

- `web/`

Run dev, test, lint, and build from `web/`.

## Directory Layout

Follow this structure. Do not create new top-level folders unless there is a strong reason.

```text
web/
├── app/                 # Next.js App Router routes + layout only
├── components/
│   ├── ui/              # shadcn/ui primitives (installed code)
│   └── shared/          # app-wide shared UI (Header, Footer)
├── features/            # feature-based modules (vertical slices)
│   ├── travel/          # travel history logic & UI
│   │   ├── components/  # feature-specific components
│   │   ├── hooks/       # feature-specific hooks
│   │   └── types.ts     # feature domain types
│   ├── address/         # address history logic & UI
│   └── validation/      # validation UI logic
├── services/            # pure business logic (worker-compatible)
│   ├── validator/       # core validation engine
│   └── exporter/        # PDF/CSV generation logic
├── store/               # global state (Zustand)
├── db/                  # Dexie schema + migrations
├── worker/              # Web Worker entry points
└── lib/                 # generic utilities (cn, date formats)
```

Next.js guidance: use the `app/` directory for routing and composition. Keep heavy business logic in non-route modules to stay organized and testable.

### Routing Rules

- `web/app/` is for route files, layouts, and page composition.
- Avoid putting domain logic inside route files. Move it to `web/features/` or `web/services/`.
- Keep `"use client"` boundaries minimal. Prefer server-safe modules by default, and mark leaf UI components as client when needed.

### Feature Rules

- Feature-specific UI and hooks go in `web/features/<feature>/...`
- Cross-feature UI goes in `web/components/shared/`
- Cross-feature pure logic goes in `web/services/` (worker-compatible, no DOM access)

## Naming Conventions

Follow these strictly.

- Directories: `kebab-case` (example: `features/travel-history/`)
- Components: `PascalCase.tsx` (example: `TravelTable.tsx`)
- Hooks: `camelCase.ts` and start with `use` (example: `useTravelData.ts`)
- Utilities: `camelCase.ts` (example: `dateUtils.ts`)
- Types/constants: `PascalCase.ts` or `camelCase.ts` as appropriate

Lint enforcement:
- Keep file names consistent with ESLint and `eslint-plugin-check-file` rules.

## Tech Stack (Web)

- Build: Next.js (App Router) + React + TypeScript
- UI: shadcn/ui (Tailwind-based) for primitives; app-wide CSS variables for theming
- State: Zustand (actions + selectors)
- Storage: IndexedDB via Dexie (schema versioning, migrations); optional AES encryption via `crypto.subtle` for stored blobs
- Tables: TanStack Table + `@tanstack/react-virtual` for virtualization; clipboard paste handlers
- Dates: date-fns; store ISO strings internally
- CSV: PapaParse for import; custom CSV export when possible
- PDF: pdf-lib (client-side headers, repeated table headers, page breaks)
- QA: Vitest + React Testing Library
- Lint/format: ESLint + Prettier + `eslint-plugin-check-file`

Do not add new dependencies unless needed. Prefer the existing stack.

## shadcn/ui Rules

- Treat `web/components/ui/` as installed code.
- Prefer wrappers and composition in `web/components/shared/` rather than editing primitives directly, so updates/regeneration are manageable. citeturn0search12turn0search16

## Zustand Rules

- Prefer slice-based organization for maintainability. citeturn0search25
- In React components, select only what you need from the store to reduce rerenders.
- When selecting objects or multiple fields, use shallow comparison (for example `useShallow`) to avoid unnecessary rerenders. citeturn0search2turn0search4

## Worker And Purity Rules

- Validation and export that can block the UI should run in a Web Worker.
- Code under `web/services/` must be worker-safe:
  - No DOM access
  - No `window` usage
  - No React imports
  - Prefer pure functions and serializable inputs/outputs

## Data And Domain Rules

- Internally represent dates as ISO strings (`YYYY-MM-DD` or full ISO timestamps when needed).
- Parsing/formatting boundaries:
  - Parse user input at UI boundaries
  - Validate and normalize in `services/validator`
  - Format only for display or export

## Exports

- CSV export should be deterministic: stable column order, stable formatting.
- PDF export should handle:
  - Repeated table headers on new pages
  - Page breaks
  - Consistent font sizing

Prefer implementing export formatting logic in `services/exporter`.

## Storage (Dexie)

- All IndexedDB schema and migrations live in `web/db/`.
- Any schema change must include:
  - Migration/version bump
  - A short note in the PR description explaining the change

## Context7 Requirement (Docs-First For New Or Unfamiliar Tech)

When implementing a new feature or using unfamiliar APIs/libraries:

- Use Context7 MCP to pull the latest official docs and recommended patterns before coding.

Always do this for:
- Next.js App Router patterns
- TanStack Table + virtualization
- Dexie schema/migrations
- pdf-lib pagination and table headers
- date-fns parsing/formatting edge cases

## Commands

Use the package manager that matches the repository lockfile:
- `pnpm-lock.yaml` => `pnpm`
- `yarn.lock` => `yarn`
- `package-lock.json` => `npm`

Run commands from `web/`.

Expected scripts (verify in `web/package.json`):
- `dev`
- `build`
- `start`
- `lint`
- `typecheck`
- `test`

Do not invent scripts. If a script is missing, update `package.json` instead of guessing.

## Testing Guidelines

- Use Vitest + Testing Library.
- Name tests `*.test.ts` or `*.test.tsx`.
- Prioritize coverage for:
  - validator rules and edge cases
  - exporter logic (CSV and PDF)
  - store actions/selectors
  - worker message handling

## PR Checklist

Before finishing a change:
- Run `lint`, `typecheck`, and `test` for any code change
- Run `build` for UI or routing changes
- Add tests for core logic changes
- Avoid performance regressions in table rendering and exports

## Safety And Data Handling

- Do not add analytics or network calls by default.
- Never log user table data (travel/address entries) in production code.
- Treat all stored data as sensitive even though it is local-only.