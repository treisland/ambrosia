## Ambrosia UI — Initial Backlog

This backlog is distilled from `README.md` and `docs/wireframes.md`. It focuses on a feasible MVP with clear follow-ups.

### MVP
- Navigation shell and theming
  - Bottom tabs and header (present)
  - Persisted theme toggle (present)

- Today view
  - Show adherence: streak count and on-time percent
  - Wire dose buttons (Take, Snooze, Skip) to update state and schedule
  - Undo snackbar for recent actions

- Medications
  - Meds list (present, static)
  - Add Medication flow: Entry → Details → Schedule → Save (UI + validation)
  - Medication details page (view/edit)
  - Inventory fields: remaining doses, thresholds

- Calendar (Week/Month)
  - Week view and Month view (present)
  - Click day to open day details with events and actions
  - Status aggregation from events (present)

- Dose Log
  - Filters: All / On-time / Missed
  - Export: CSV and JSON (client-side)

- Reminder/Notifications (client-side mock)
  - Request Notification permission
  - Foreground mock schedule + toasts (no background alarm)

- Assistant (stub → API-ready)
  - Current stubbed responses (present)
  - Pass context from UI (selected medication, dose, timing)
  - Abstraction to swap in backend API later (streaming-ready)

### Technical Tasks
- State and data layer
  - Central store for meds, schedules, and events (e.g., lightweight context or Zustand)
  - Persistence: localStorage for MVP; interface for future backend
  - Deterministic ID helpers and date utilities

- Routing & flows
  - Onboarding gate (first-run) → create profile/timezone
  - Route-level code splitting with `React.lazy`

- Styling and UX
  - Tailwind 4: add base styles (e.g., typography, forms)
  - Focus rings, keyboard navigation, and ARIA labels
  - Responsive tweaks for small screens

- Tooling & quality
  - Add Vitest + @testing-library/react; sample tests for Calendar and Today
  - Pre-commit: format, lint, typecheck (optional)

- Build & deploy
  - Add `preview` script with `--host --port 5173`
  - Optional Dockerfile for static hosting

### Data Model (draft)
- Medication: id, name, form, strength, instructions, inventory
- Schedule: type (fixed, interval, cycle, taper), times, windows, start/end, timezone mode
- DoseEvent: id, medicationId, start, end, status ('scheduled' | 'taken' | 'missed' | 'skipped')
- LogEntry: eventId, takenAt, status, notes

### Next Up (suggested)
1) Introduce a minimal store with sample meds and schedules; persist to localStorage
2) Wire Today actions to update events/log and reflect on Calendar
3) Implement Add Medication stepper UI with validation
4) Add Day Details panel from Calendar (list events; actions)
5) Add CSV export for Log

References:
- Wireframes: `docs/wireframes.md`
- Types: `src/types/schedule.ts`
- Mocks: `src/mocks/schedule.ts`

