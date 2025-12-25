# PlayerPoints

Lightweight PWA to track points across rounds in analog card games. Add players, record per-round scores (including negatives), edit or delete rounds, and see live standings and winners.

## Hosted

The app is hosted at: https://tamirperek.github.io/PlayerPoints/

## Features
- Create and rename players; remove players as needed
- Add rounds with numeric inputs optimized for mobile (numeric keyboard, negative numbers allowed)
- Edit or delete individual rounds; clear all rounds without losing players
- Live cumulative standings after each round and winner calculation (lowest score wins)
- Offline-capable PWA with installable manifest and service worker
- Dark mode support and mobile-friendly layout

## Tech Stack
- Angular standalone components
- Angular Router
- PWA (service worker, manifest)
- CSS for responsive and dark-mode styling

## Getting Started

### Prerequisites
- Node.js 22.x LTS (recommended over odd-numbered versions)
- npm 10+

### Install
```bash
npm install
```

### Development server
```bash
npm start
```
Then open http://localhost:4200/. The app reloads on changes.

### Run tests
```bash
npm test
```

### Build for production
```bash
npm run build
```
Output is written to `dist/`.

### PWA notes
- `ng build` includes the service worker when `production` configuration is used.
- Manifest icons are located in `public/`. Adjust `public/manifest.webmanifest` if you change branding.

## Usage Tips
- To start a fresh game but keep players, use "Runden löschen" on the rounds page.
- You can edit scores per round and rename players after creation.
- Lowest total score wins (per your game’s rule).

## Troubleshooting
- If `ng test`/`ng build` hang on Node 25, use Node 22 LTS instead.
- For browser-based Vitest warnings about Playwright, ensure required browser packages are installed or switch to chromium in config.

