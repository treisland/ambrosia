# Ambrosia UI

A Vite + React (TypeScript) UI for medication adherence.

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Features

- Calendar (Week view): `/calendar` route shows dose events with Take/Snooze/Skip and an Ask button to open the assistant with context.
- Prescription Assistant: Floating "Ask" button bottom-right opens a panel for prescription Q&A (stubbed with safety disclaimers).

## Notes

- Data is mocked in `src/mocks/schedule.ts`.
- Types in `src/types/schedule.ts`.
- Assistant context/provider in `src/contexts/ChatbotContext.tsx` and UI in `src/components/ChatbotWidget.tsx`.

## Safety

The assistant is for educational purposes only and not medical advice. For urgent issues, contact a clinician or emergency services.

