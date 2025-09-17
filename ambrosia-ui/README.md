# Ambrosia UI

Modern React + TypeScript + Vite interface with Tailwind v4. Dark mode is default via `html.dark` class with a user toggle.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – typecheck and build for production
- `npm run preview` – preview the production build

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Then open the printed local URL.

## Theming

- Default theme is dark. The early script in `index.html` sets `html.dark`.
- Toggle in the header switches between light/dark and persists to localStorage.

