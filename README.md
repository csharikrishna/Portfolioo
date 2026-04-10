# Exact Pixel Perfect

Personal portfolio project built with React, Vite, Tailwind CSS, and TypeScript.

## Setup

1. Install dependencies:

```bash
npm install
```

1. Start development server:

```bash
npm run dev
```

## Environment Variables

Create a .env file at project root when you want direct form submission to an API endpoint.

Example value:

```dotenv
VITE_CONTACT_ENDPOINT=<your contact endpoint>
```

If this value is not provided, the contact form falls back to opening the user mail client.

## Scripts

- npm run dev: Start Vite development server
- npm run build: Build production assets
- npm run preview: Preview production build
- npm run lint: Run ESLint checks
- npm run test: Run Vitest unit tests
- npx playwright test: Run Playwright end-to-end tests

## Production Checklist

- Run lint: npm run lint
- Run unit tests: npm run test
- Run build: npm run build
- Run E2E tests: npx playwright test
