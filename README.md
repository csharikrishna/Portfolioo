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

## Deploy On Vercel

This project is a Vite SPA and can be deployed directly to Vercel.

### Prerequisite

- Ensure [vercel.json](vercel.json) is present (already included in this repository).

### Option 1: Deploy From Vercel Dashboard (recommended)

1. Push this repository to GitHub.
2. Open Vercel and click Add New... then Project.
3. Import your GitHub repository.
4. Keep the detected framework as Vite.
5. Confirm these build settings:
	- Install Command: npm install
	- Build Command: npm run build
	- Output Directory: dist
6. Add environment variable if needed:
	- VITE_CONTACT_ENDPOINT
7. Click Deploy.

### Option 2: Deploy Using Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. For production deployment:

```bash
vercel --prod
```

### SPA Routing Notes

- Client-side routes are handled by rewrite rules in [vercel.json](vercel.json), which route all paths to index.html.
- This is required for React Router deep links to work in production.

### Validate Before Deploy

```bash
npm run build
```

If the build succeeds, your Vercel deployment is ready.

## Deploy On Render

This project is a Vite SPA and is best deployed as a static site on Render.

### Option 1: Blueprint Deploy (recommended)

1. Push this repo to GitHub.
2. In Render, choose New + and select Blueprint.
3. Select this repository.
4. Render will detect `render.yaml` and create the service.

### Option 2: Manual Static Site Setup

1. In Render, create a new Static Site.
2. Set Build Command to `npm ci && npm run build`.
3. Set Publish Directory to `dist`.
4. Add rewrite rule from `/*` to `/index.html` (status `200`) for React Router routes.

### Environment Variables

If you use contact form API posting, add:

- `VITE_CONTACT_ENDPOINT`

## About Inactivity And Cron Jobs

- Static Sites on Render do not sleep from inactivity, so no keep-alive cron is needed.
- Free Web Services can spin down when idle. If you deploy as a Web Service and want no cold starts, use a paid always-on plan.
- If you must stay on free Web Service, an external uptime ping can wake it, but it is not a guaranteed no-cold-start solution.
