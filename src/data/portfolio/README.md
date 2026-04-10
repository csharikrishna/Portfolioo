# Portfolio Data Structure

This folder contains a modularized portfolio data structure that is easier to maintain and update.

## Structure

The portfolio data has been split into the following files:

### Core Files

- **`meta.json`** - Basic personal information and contact details
  - Name, email, phone, location
  - Links (github, linkedin, portfolio, resume)

- **`about.json`** - Bio and personal facts
  - Short bio
  - Detailed biography sections (intro, fullstack, AI/ML, leadership)
  - AI focus areas
  - Personal facts

- **`education.json`** - Education history
  - Institutions, degrees, CGPA
  - Duration and coursework

- **`experience.json`** - Work experience and roles
  - Role, organization, period
  - Job description and achievements

- **`projects.json`** - Project portfolio
  - Project metadata (title, description, tech stack)
  - Long descriptions and metrics
  - GitHub and live URLs
  - Featured projects flag
  - Challenges and solutions

- **`skills.json`** - Technical and soft skills
  - Programming languages
  - Frameworks and libraries
  - Tools and platforms
  - Databases
  - AI/ML specializations
  - Soft skills

- **`certifications.json`** - Professional certifications
  - Certification name, issuer, date
  - Validity period
  - Credential URLs

- **`achievements.json`** - Notable achievements and awards
  - Achievement titles and descriptions
  - Years and links to credentials

- **`articles.json`** - Blog articles or publications
  - Article metadata (title, excerpt, date)
  - Reading time and tags
  - Article URLs

- **`faq.json`** - Frequently asked questions
  - Question and answer pairs

## Usage

### Import Entire Portfolio
```typescript
import { portfolio } from '@/data/portfolio';

// Access all sections
const { meta, about, projects, skills } = portfolio;
```

### Import Specific Sections
```typescript
// Import just what you need for better tree-shaking
import { meta, projects } from '@/data/portfolio';
```

### Using as Named Export
```typescript
// For compatibility with existing code
import { portfolio as portfolioData } from '@/data/portfolio';
const { meta } = portfolioData;
```

## Maintenance Benefits

1. **Smaller Files** - Each section is in its own file, easier to navigate
2. **Targeted Updates** - Update only the section you need (e.g., add a new project)
3. **Better Organization** - Logical grouping of related data
4. **Type Safety** - Easier to add TypeScript types per section
5. **Version Control** - Cleaner diffs when updating specific sections
6. **Performance** - Potential for lazy loading individual sections if needed

## Adding New Data

### Add a New Project
Simply add a new object to `projects.json` following the existing schema.

### Add a New Article
Add a new entry to `articles.json` with title, excerpt, date, tags, and URL.

### Update Skills
Modify the `skills.json` file to add or remove skills from any category.

## Type Definitions (Optional)

For enhanced TypeScript support, you can create a `types.ts` file:

```typescript
// src/data/portfolio/types.ts
export interface Meta {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  // ... other fields
}

export interface Project {
  id: string;
  title: string;
  // ... other fields
}

// ... etc for other types
```

Then update `index.ts` to include these types.

## Future Enhancements

- Add TypeScript interface definitions for type safety
- Consider using a JSON schema validator
- Implement a build step to validate all JSON files
- Add support for i18n (multi-language) portfolio data
