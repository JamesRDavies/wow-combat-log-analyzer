# WoW Combat Log Analyzer

A World of Warcraft combat log analyzer built with TypeScript and Vite.

Currently supports importing and processing combat logs, identifying arena matches and grouping Solo Shuffle rounds.

## Features

- Stream large combat logs without loading the entire file into memory
- Parse combat events and extract basic combatant information
- Detect arena matches and Solo Shuffle rounds
- Display match timestamps and round counts
- Show import progress and basic error handling

## Tech Stack

TypeScript, Vite, Tabler, Vitest and Playwright.

## Getting Started

```bash
cd app
npm install
npm run dev
```

## Tests

Unit tests:

```bash
cd app
npm run test:run
```

Playwright tests (from the repository root):

```bash
npm install
npx playwright install
npx playwright test
```

## Status

Still in development. Currently working on the parsing and match detection functionality, with more detailed combat analysis planned.