# Portfolio Data

This folder holds the portfolio content for the site in smaller modules instead of one large JSON file. That keeps updates isolated and makes the data easier to review.

## Files

- `meta.json` - name, contact details, social links, resume URL
- `about.json` - bio, biography sections, AI focus areas, personal facts
- `education.json` - education history and coursework
- `experience.json` - roles, organizations, periods, and achievements
- `projects.json` - project details, metrics, tech stack, challenges, achievements
- `skills.json` - languages, frameworks, tools, databases, AI/ML, soft skills
- `certifications.json` - certifications with issuer, date, and credential links
- `achievements.json` - notable wins, leadership, and credential links
- `articles.json` - blog/article entries with tags and optional URLs
- `faq.json` - frequently asked questions and answers
- `index.ts` - barrel export for the whole portfolio object and named exports
- `types.ts` - TypeScript interfaces for the data shape

## How To Use

Import the full portfolio object when a component needs several sections:

```ts
import { portfolio } from '@/data/portfolio';

const { meta, projects, skills } = portfolio;
```

Import individual sections when you only need one part:

```ts
import { projects, meta } from '@/data/portfolio';
```

Use the compatibility alias if a file already expects `portfolioData`:

```ts
import { portfolio as portfolioData } from '@/data/portfolio';
```

## Editing Guidelines

- Keep each entry small and focused on one section.
- Preserve the existing object shape so the UI components do not break.
- Add or update links only when a valid URL is available.
- Put project-level results in `projects.json`, not in `achievements.json`.

## Type Safety

The data shape is defined in `types.ts`. If you add a new field, update the matching interface so the rest of the app stays in sync.

## Notes

- The site imports from `src/data/portfolio/index.ts`.
- This structure is meant to keep diffs smaller and maintenance simpler.
