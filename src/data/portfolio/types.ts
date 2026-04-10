// Type definitions for portfolio modules

export interface Meta {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resumeURL: string;
}

export interface Biography {
  intro: string;
  fullstack: string;
  aiml: string;
  aiFocus: Array<{
    title: string;
    description: string;
  }>;
  leadership: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface About {
  bio: string;
  biography: Biography;
  facts: Fact[];
}

export interface Education {
  institution: string;
  degree: string;
  cgpa: string;
  duration: string;
  coursework: string[];
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  type: string;
  description: string;
  achievements: string[];
}

export interface Challenge {
  problem: string;
  solution: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  techStack: string[];
  metrics: string;
  githubURL: string;
  liveURL: string;
  featured: boolean;
  date: string;
  challenges?: Challenge[];
  achievements?: string[];
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
  aiMl: string[];
  softSkills: string[];
  other: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  validity: string | null;
  description: string;
  type: string;
  credentialURL: string;
}

export interface Achievement {
  title: string;
  description: string;
  year: string;
  link: string;
}

export interface Article {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Portfolio {
  meta: Meta;
  about: About;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  achievements: Achievement[];
  articles: Article[];
  faq: FAQ[];
}
