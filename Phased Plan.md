**Phased Execution Plan**

- **Phase 0 — Foundation**
  - Set up Next.js (app router) + TS + shadcn/Tailwind; configure base theme tokens.
  - Add Zustand store scaffold, Dexie schema v1, and worker wiring.
  - CI with lint/typecheck/unit test; add dataset generator for perf harness.
  - Exit: Empty shell loads on Vercel, Dexie writes/reads a dummy record, tests green.

- **Phase 1 — Editor + CSV**
  - Travel/Address tables with virtualized grid, add/duplicate/delete, paste multi-row.
  - Basic validation (date order, overlaps, gaps) in worker; error/warning panel.
  - CSV import with column mapper + preview; CSV export; autosave with throttle.
  - Exit: Can import/edit/export 2k-row dataset in <3s export, UI responsive; validation flags show correctly; tests for validation, import mapping, store mutations.

- **Phase 2 — PDF + Fix Suggestions**
  - PDF export (headers, repeated table headers, page breaks, footnotes); handle open-ended “still living here” to today.
  - Gap/overlap fix actions (“no travel”, “same as previous”, “unknown”); micro-gap warnings.
  - Donation banner/link; privacy/disclaimer copy.
  - Exit: PDF render under 3s for typical sets; fix buttons create filler rows correctly; tests for PDF generator helpers and fix-action reducers.

- **Phase 3 — Reliability + UX**
  - Undo/redo via snapshot stack; versioned local backups with pruning; optional encryption layer.
  - Keyboard shortcuts; bulk purpose edit; estimated date flag handling.
  - Performance hardening using harness; refine warning copy and date-format display.
  - Exit: Undo/redo works across edits/imports; backups restore; benchmarks hold (2k rows smooth); tests for snapshot/backup/encryption helpers.

- **Phase 4 — Polish + Readiness**
  - Onboarding helper, tooltips, empty states; donation nudge tuning.
  - Accessibility pass (focus order, aria labels), theming tweaks, 404/500 pages.
  - Final content review; light analytics opt-in stub (if desired later, default off).
  - Exit: UX reviewed, a11y checks pass, deployment tagged; smoke test of core flows.

---

### Phase 3 Checklist
- [x] Undo/redo via snapshot stack (completed).
- [x] Keyboard shortcuts (undo/redo, add/delete/duplicate row, switch tabs, open validation panel).
- [x] Backup/restore: versioned local backups with pruning; restore validation; UI for backup/restore (completed).
- [x] Bulk edits: multi-select; bulk delete/duplicate/set purpose/city; single-snapshot undo; confirmations.
- [x] Performance harness + benchmarks (seed 2k rows, measure add/delete/duplicate/render).
- [ ] Refine warning copy and date-format display alignment.
