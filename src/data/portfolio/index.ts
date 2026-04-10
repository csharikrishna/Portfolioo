import meta from './meta.json';
import about from './about.json';
import education from './education.json';
import experience from './experience.json';
import projects from './projects.json';
import skills from './skills.json';
import certifications from './certifications.json';
import achievements from './achievements.json';
import articles from './articles.json';
import faq from './faq.json';

export const portfolio = {
  meta,
  about,
  education,
  experience,
  projects,
  skills,
  certifications,
  achievements,
  articles,
  faq,
};

export type Portfolio = typeof portfolio;

// Export individual sections for granular imports
export {
  meta,
  about,
  education,
  experience,
  projects,
  skills,
  certifications,
  achievements,
  articles,
  faq,
};
