import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Github, Globe, Calendar, Tag, Zap, Award, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { portfolio as portfolioData } from '@/data/portfolio';
import { safeJsonLd } from '@/lib/safeJsonLd';

// ── Types ──────────────────────────────────────────────────────────────────
interface Challenge {
  problem: string;
  solution: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubURL?: string;
  liveURL?: string;
  featured?: boolean;
  metrics?: string;
  challenges?: Challenge[];
  achievements?: string[];
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { meta } = portfolioData;
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(0);

  const projectIndex = (portfolioData.projects as Project[]).findIndex((p) => p.id === id);
  const project = projectIndex !== -1 ? portfolioData.projects[projectIndex] as Project : null;

  // Navigation helpers
  const nextProject = projectIndex !== -1 && projectIndex < portfolioData.projects.length - 1
    ? portfolioData.projects[projectIndex + 1]
    : null;
  const prevProject = projectIndex !== -1 && projectIndex > 0
    ? portfolioData.projects[projectIndex - 1]
    : null;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <h1 className="font-display text-text-primary text-4xl mb-4">Project Not Found</h1>
          <Link to="/" className="font-mono-label text-accent-alt text-sm hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.longDescription || project.description,
    url: project.liveURL || project.githubURL,
    codeRepository: project.githubURL,
    datePublished: project.date,
    author: {
      '@type': 'Person',
      name: meta.name,
      url: meta.portfolio,
    },
    programmingLanguage: project.techStack,
    keywords: project.techStack.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: meta.portfolio },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${meta.portfolio}#projects` },
      { '@type': 'ListItem', position: 3, name: project.title, item: `${meta.portfolio}/project/${project.id}` },
    ],
  };

  const projectNumber = String(projectIndex + 1).padStart(2, '0');

  return (
    <>
      <script
        key="project-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(projectSchema) }}
      />
      <script
        key="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <div className="min-h-screen" style={{ background: 'hsl(var(--bg-base))' }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden" style={{ paddingTop: '64px' }}>
          <div
            className="hidden md:block absolute right-0 top-0 font-display select-none pointer-events-none"
            aria-hidden="true"
            style={{ fontSize: '20vw', lineHeight: 1, opacity: 0.06, color: 'hsl(var(--text-primary))' }}
          >
            {projectNumber}
          </div>

          <div style={{ padding: 'clamp(40px, 8vw, 100px) clamp(20px, 5vw, 80px)' }}>
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="font-mono-label text-xs uppercase tracking-[0.12em] text-text-muted hover:text-text-primary transition-colors">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-text-muted">
                  <ChevronRight size={14} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/#projects" className="font-mono-label text-xs uppercase tracking-[0.12em] text-text-muted hover:text-text-primary transition-colors">
                      Projects
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-text-muted">
                  <ChevronRight size={14} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-mono-label text-xs uppercase tracking-[0.12em] text-text-primary">
                    {project.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.featured && (
                <span className="font-mono-label text-[11px] text-accent-primary uppercase tracking-[0.12em] px-3 py-1 rounded" style={{ background: 'hsl(var(--bg-inset))' }}>
                  Featured Project
                </span>
              )}
              <span className="font-mono-label text-[11px] text-accent-alt uppercase tracking-[0.12em] px-3 py-1 rounded flex items-center gap-1" style={{ background: 'hsl(var(--bg-inset))' }}>
                <Tag size={12} /> {project.category}
              </span>
              <span className="font-mono-label text-[11px] text-text-secondary uppercase tracking-[0.12em] px-3 py-1 rounded flex items-center gap-1" style={{ background: 'hsl(var(--bg-inset))' }}>
                <Calendar size={12} /> {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-display text-text-primary mb-4"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1 }}
            >
              {project.title}
            </h1>

            {/* Metrics Highlight */}
            {project.metrics && (
              <div className="flex items-center gap-2 mb-8">
                <Zap size={18} className="text-accent-primary" />
                <p className="font-mono-body text-accent-primary text-base">
                  {project.metrics}
                </p>
              </div>
            )}

            {/* Description */}
            <p
              className="font-mono-body text-text-secondary leading-[1.8] mb-8 max-w-3xl"
              style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
            >
              {project.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              {project.githubURL && (
                <a
                  href={project.githubURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} on GitHub (opens in new tab)`}
                  className="font-mono-label text-xs uppercase tracking-[0.12em] text-bg-base px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ background: 'hsl(var(--accent-primary))' }}
                >
                  <Github size={14} />
                  View Code
                </a>
              )}
              {project.liveURL && (
                <a
                  href={project.liveURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} live demo (opens in new tab)`}
                  className="font-mono-label text-xs uppercase tracking-[0.12em] px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:opacity-80"
                  style={{ 
                    background: 'transparent',
                    border: '1px solid hsl(var(--border-strong))',
                    color: 'hsl(var(--text-secondary))'
                  }}
                >
                  <Globe size={14} />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Details Section */}
        <div style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
          {/* Long Description */}
          {(project.longDescription || project.description) && (
            <div className="mb-16 max-w-3xl">
              <h2 className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4">
                Overview
              </h2>
              <p
                className="font-mono-body text-text-secondary leading-[1.9]"
                style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
              >
                {project.longDescription ?? project.description}
              </p>
            </div>
          )}

          {/* Achievements */}
          {project.achievements && project.achievements.length > 0 && (
            <div className="mb-16">
              <h2 className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 flex items-center gap-2">
                <Award size={14} /> Key Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg transition-all"
                    style={{
                      background: 'hsl(var(--bg-inset))',
                      border: '1px solid hsl(var(--border-color))',
                    }}
                  >
                    <p className="font-mono-body text-text-secondary text-[13px] leading-[1.6]">
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-6">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono-label text-[12px] px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80"
                  style={{
                    background: 'hsl(var(--bg-inset))',
                    border: '1px solid hsl(var(--border-color))',
                    color: 'hsl(var(--text-secondary))',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Challenges & Solutions */}
          {project.challenges && project.challenges.length > 0 && (
            <div className="mb-16">
              <h2 className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-6">
                Challenges & Solutions
              </h2>
              <div className="space-y-4">
                {project.challenges.map((challenge, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden transition-all"
                    style={{ border: '1px solid hsl(var(--border-color))' }}
                  >
                    <button
                      onClick={() => setExpandedChallenge(expandedChallenge === i ? null : i)}
                      className="w-full p-6 flex items-start justify-between hover:bg-accent-primary/5 transition-colors"
                      style={{ background: 'hsl(var(--bg-inset))' }}
                    >
                      <div className="text-left">
                        <h3 className="font-mono-label text-[11px] text-accent-primary uppercase tracking-[0.12em] mb-2">
                          Challenge {i + 1}
                        </h3>
                        <p className="font-mono-body text-text-primary text-[13px] leading-[1.6]">
                          {challenge.problem}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="ml-4 flex-shrink-0 transition-transform"
                        style={{ transform: expandedChallenge === i ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    {expandedChallenge === i && (
                      <div
                        className="px-6 py-4 border-t"
                        style={{ background: 'hsl(var(--bg-base))' }}
                      >
                        <h4 className="font-mono-label text-[11px] text-accent-alt uppercase tracking-[0.12em] mb-2">
                          Solution
                        </h4>
                        <p className="font-mono-body text-text-secondary text-[13px] leading-[1.7]">
                          {challenge.solution}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="section-divider" />

        {/* Navigation Footer */}
        <div style={{ padding: '48px clamp(20px, 5vw, 80px)' }}>
          <div className="max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            {prevProject ? (
              <Link
                to={`/project/${prevProject.id}`}
                className="flex items-center gap-2 font-mono-label text-text-secondary text-xs uppercase tracking-[0.12em] hover:text-accent-primary transition-colors group"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Previous
              </Link>
            ) : (
              <div />
            )}

            <Link
              to="/#projects"
              className="font-mono-label text-text-muted text-xs uppercase tracking-[0.12em] hover:text-text-primary transition-colors"
            >
              All Projects
            </Link>

            {nextProject ? (
              <Link
                to={`/project/${nextProject.id}`}
                className="flex items-center gap-2 font-mono-label text-text-secondary text-xs uppercase tracking-[0.12em] hover:text-accent-primary transition-colors group"
              >
                Next
                <ChevronLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;