# Implementation Plan – PR Document Helper (Web)

Fast, client-side web app (loads from the web; no offline guarantee) to build Travel and Address history tables with validation, gap fixes, and export-ready CSV/PDF. Scope is web only (no macOS build) with aggressive performance targets (2k+ rows, <3s exports).

## Scope Decisions
- App is free; donation-only banner/link (no paywall). Advanced features can be introduced later behind optional “supporter” toggles without blocking core workflows.
- Deliver Travel + Address modules only in v1; Personal History reserved for 1.1.
- Client-side data only (no backend); users load the app online, but their entries stay in-browser (IndexedDB) with optional encrypted local storage.

## Guiding Principles for Fast/Snappy
- Keep everything client-side and cache aggressively; avoid server round-trips after initial load.
- Virtualize tables; avoid heavy DOM trees; debounce expensive validation.
- Push validation and PDF generation into a Web Worker to keep UI responsive.
- Keep bundle lean: minimal UI kit, tree-shakeable libs, lazy-load PDF/export modules.

## Tech Stack (Web)
- Build: Next.js (App Router) + React + TypeScript; static-first pages (no required SSR) so it loads fast from Vercel; offline use is not a goal.
- UI: shadcn/ui (Tailwind-based) for primitives; define app-wide CSS variables for theming.
- State: Zustand (lightweight store with actions); React Query optional only for worker messaging if needed.
- Storage: IndexedDB via Dexie (schema versioning, migrations); optional AES encryption layer (crypto.subtle) for stored blobs.
- Tables: TanStack Table + @tanstack/react-virtual for virtualization; clipboard paste handlers.
- Dates: date-fns (parse/format/diff); keep ISO strings internally.
- CSV: PapaParse for import; custom CSV export (simple join) to avoid heavy deps.
- PDF: pdf-lib for client-side PDF generation (headers, repeated table headers, page breaks).
- Styling: Tailwind (shadcn/ui) with CSS variables for spacing/color/typography tokens.
- Styling: Tailwind (shadcn/ui) with CSS variables for spacing/color/typography tokens.
- QA: Vitest + React Testing Library for core logic and components.
- Linter: ESLint + Prettier + `eslint-plugin-check-file` to enforce conventions.

## Project Structure & Standards

### Directory Layout
```text
web/
├── app/                 # Next.js App Router (pages only)
├── components/
│   ├── ui/              # Shadcn primitives (Button, Input)
│   └── shared/          # App-wide shared UI (Header, Footer)
├── features/            # Feature-based modules (Vertical Slices)
│   ├── travel/          # Travel history logic & UI
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   └── types.ts     # Feature domain types
│   ├── address/         # Address history logic & UI
│   └── validation/      # Validation UI logic
├── services/            # Pure business logic (Worker-compatible)
│   ├── validator/       # Core validation engine
│   └── exporter/        # PDF/CSV generation logic
├── store/               # Global state (Zustand)
├── db/                  # IndexedDB config
├── worker/              # Web Worker entry points
└── lib/                 # Generic utilities (cn, date formats)
```

### Naming Conventions
- **Directories**: `kebab-case` (e.g., `features/travel-history`)
- **Components**: `PascalCase.tsx` (e.g., `TravelTable.tsx`)
- **Hooks**: `camelCase.ts` (start with `use`, e.g., `useTravelData.ts`)
- **Utilities**: `camelCase.ts` (e.g., `dateUtils.ts`)
- **Types/Constants**: `PascalCase.ts` or `camelCase.ts` as appropriate

## Architecture Overview
- UI shell: segmented control (Travel | Address), table editor pane, validation/fix pane, footer actions (Import, Export CSV/PDF).
- Data flow: Zustand store holds Profile + Entries; Dexie persists snapshots; autosave on mutation with throttling.
- Validator service: pure functions invoked via worker; returns Issue objects (error/warning, range, affected rows, suggestedFix).
- Export service: runs in worker to generate CSV/PDF; streams blob back to UI.

## Data Model (TypeScript shapes)
- Profile: { id, name?, uci?, timeframeRule: Last10Years | SinceAge18 | CustomStartDate, createdAt, updatedAt }
- BaseEntry: { id, startDate, endDate|null, estimatedDates?: boolean, notes?, createdAt, updatedAt }
- TravelEntry: BaseEntry & { destinationCountry, destinationCity?, purposeCode, purposeText? }
- AddressEntry: BaseEntry & { country, province?, city?, line1?, postal?, stillLivingHere?: boolean }
- Issue: { id, severity: "error"|"warning", type: "overlap"|"gap"|"invalidDate"|"missingField"|"microGap", range: { start, end }, rows: string[], suggestedFix?: FixAction }
- FixAction: { label, kind: "addGapRow"|"clonePrev"|"markNoTravel"|"markUnknown", payload }

## Validation Engine
- Input: entries[], timeframeRule.
- Steps: (1) normalize dates; (2) invalid date / end<start check; (3) sort by startDate asc; (4) detect overlaps by walking sorted list; (5) detect gaps by comparing current.start to previous.end+1 day within timeframe; (6) micro-gap rule (<=1 day); (7) missing required fields per table; (8) out-of-range vs timeframe rule.
- Performance: O(n log n) sort; all checks linear pass; run in worker; debounce on edits; cache last result per dataset version.

## Core Features
- Profile setup: quick timeframe selector; derived min start date displayed.
- Table editing: add row, duplicate row, inline edits, keyboard-first UX, bulk select + bulk purpose edit, paste multi-row (CSV/TSV) parser.
- Sorting: toggle newest↔oldest; maintain stable IDs.
- "Still living here": sets endDate=null; export resolves to generation date; validator treats open range.
- Gap fix suggestions: per gap row add button; auto-create filler row (no travel / same as previous / unknown with note) using FixAction payload.

## Import (CSV)
- Column mapper UI: auto-map common names (From, Start Date, Date From, To Date, Country, Destination, Purpose, City, Province, Postal, Notes).
- Preview first 20 rows; user confirms types; highlight rows with parse errors; allow cancel.
- Deduplicate IDs; attach estimatedDates flag if source columns contain ~ markers or "approx" keyword.

## Export
- CSV: deterministic column order; localized date format optional; honor open-ended entries as today.
- PDF: header (Profile name, generated date, timeframe), repeated table headers per page, footnote region for explanations, page breaks between tables when exporting both.
- Export flow: run validation first; block on errors unless user overrides with acknowledgement.

## UI Layout
- Top bar: app title, Profile selector, timeframe display, segmented control.
- Left pane: virtualized data grid with inline inputs, row toolbar (duplicate/delete), paste area overlay.
- Right pane: Validation panel grouped by Errors/Warnings, quick actions; expandable details showing affected rows and ranges.
- Footer: Import, Export CSV, Export PDF buttons; last saved timestamp; privacy/disclaimer link; donation link.

## Performance Plan
- Virtualized rows/columns; memoize cell renderers; lightweight inputs.
- Worker offloading for validation + PDF export; idle-time pre-computation of timeframe boundaries.
- Autosave throttle (e.g., 500ms) and coalesced Dexie writes; snapshot pruning to fixed depth (e.g., last 20).
- Benchmark dataset generator (2k rows) in dev to test render/validate/export budget.

## Milestones (Web)
- M1: Table Editor + CSV Export
  - Profile + timeframe selector; Travel/Address tables with add/duplicate/paste; Dexie persistence; basic validation (date order, overlaps, gaps); CSV export; initial tests.
- M2: PDF Export + Fix Suggestions
  - Workerized validator; gap/overlap UI with "Add filler" actions; PDF export with pagination and headers; micro-gap warnings; Today handling for open end dates; import mapper UI.
- M3: Polish + Reliability
  - Undo/redo via snapshot stack; keyboard shortcuts; versioned local backups; optional encryption; onboarding helper; performance hardening (2k row benchmarks); refined warnings copy and disclaimers.

## Risks & Mitigations (Web)
- Trust/privacy: clear "data stored locally, no account" copy; no analytics by default.
- Browser storage limits: compress backups; warn when nearing quota; allow manual export/import of backup file.
- Date ambiguity: configurable date format display; store ISO internally; show timezone note (dates treated as local, no time component).

## Next Steps
- Confirm shadcn/ui theme tokens (spacing, radius, font) and Tailwind config.
- Stand up Next.js + Dexie skeleton with Zustand store and worker scaffold; configure static rendering for core routes (online load, client-side data).
- Build dataset generator + perf harness early to keep snappy UX honest.
