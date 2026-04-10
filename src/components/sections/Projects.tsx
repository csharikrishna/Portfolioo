import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCardTilt from '@/hooks/useCardTilt';
import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { portfolio as portfolioData } from '@/data/portfolio';

const TECH_DESCRIPTIONS: Record<string, string> = {
  Python: 'Primary backend & ML language',
  Weaviate: 'Vector database for semantic search',
  'Neo4j': 'Graph database for knowledge graphs',
  TensorFlow: 'Deep learning framework',
  PyTorch: 'ML research & production',
  'Xception': 'Powerful CNN backbone',
  'Grad-CAM': 'Model interpretability tool',
  'DINOv2': 'Vision Transformer for zero-shot learning',
  Supabase: 'PostgreSQL + Auth + Realtime',
  'React.js': 'Modern UI framework',
  PostgreSQL: 'ACID-compliant SQL database',
};

const openExternal = (url: string | undefined, e: { preventDefault: () => void; stopPropagation: () => void }) => {
  e.preventDefault();
  e.stopPropagation();
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

type ProjectCategory = 'All' | 'AI Systems' | 'Backend' | 'Full Stack';

const PROJECT_CATEGORIES: ProjectCategory[] = ['All', 'AI Systems', 'Backend', 'Full Stack'];

const resolveCategory = (techStack: string[]): Exclude<ProjectCategory, 'All'> => {
  const tech = techStack.join(' ').toLowerCase();
  if (tech.includes('pytorch') || tech.includes('tensorflow') || tech.includes('dinov2') || tech.includes('grad-cam') || tech.includes('weaviate') || tech.includes('neo4j')) {
    return 'AI Systems';
  }
  if (tech.includes('node') || tech.includes('express') || tech.includes('postgresql') || tech.includes('supabase')) {
    return 'Backend';
  }
  return 'Full Stack';
};

const ProjectCard = ({ project, index }: { project: typeof portfolioData.projects[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(cardRef as React.RefObject<HTMLElement>, 8);

  return (
    <div
      ref={cardRef}
      className="project-card-glass p-6 relative group h-full flex flex-col"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Gradient placeholder */}
      <div
        className="w-full h-32 mb-6 rounded-lg opacity-60 group-hover:opacity-80 transition-opacity"
        style={{
          background: `linear-gradient(135deg, hsl(var(--accent-primary) / 0.2), hsl(var(--accent-alt) / 0.2))`,
          backdropFilter: 'blur(8px)',
        }}
        aria-hidden="true"
      />

      {/* Project number */}
      <span className="absolute top-4 right-4 font-mono-label text-border-strong text-sm">
        {String(index + 1).padStart(2, '0')}
      </span>

      <h3 className="font-display text-text-primary text-[22px] mb-2 pr-8 group-hover:text-accent-primary transition-colors">
        {project.title}
      </h3>
      <p className="font-mono-body text-text-secondary text-[13px] leading-[1.75] mb-4">
        {project.description}
      </p>

      {project.metrics && (
        <p className="font-display text-accent-primary text-[18px] mb-4">
          — {project.metrics}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <TooltipProvider>
          {project.techStack.map((tech, j) => (
            <Tooltip key={j}>
              <TooltipTrigger asChild>
                <span className="font-mono-label text-[11px] bg-bg-inset text-text-muted px-2 py-0.5 skill-pill cursor-help hover:text-accent-primary transition-colors" style={{ borderRadius: '3px', border: '1px solid transparent' }}>
                  {tech}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-bg-surface border-border-color text-text-primary">
                <p className="font-mono-body text-xs">{TECH_DESCRIPTIONS[tech] ?? `Technology: ${tech}`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <div className="flex gap-4 items-center mt-auto">
        {project.githubURL && (
          <button
            type="button"
            className="font-mono-body text-accent-alt text-[13px] hover:underline"
            onClick={(e) => openExternal(project.githubURL, e)}
          >
            GitHub ↗
          </button>
        )}
        {project.liveURL && (
          <button
            type="button"
            className="font-mono-body text-accent-alt text-[13px] hover:underline"
            onClick={(e) => openExternal(project.liveURL, e)}
          >
            Live ↗
          </button>
        )}
        <span className="font-mono-label text-[11px] text-text-muted ml-auto group-hover:text-accent-primary transition-colors">
          View Details →
        </span>
      </div>
    </div>
  );
};

const Projects = () => {
  const sectionRef = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { projects } = portfolioData;
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  // SSR-safe initialization — default to false, sync on mount
  const [isMobile, setIsMobile] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return rest;
    return rest.filter((project) => resolveCategory(project.techStack) === activeCategory);
  }, [activeCategory, rest]);

  // Compute project counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<ProjectCategory, number> = { 'All': rest.length, 'AI Systems': 0, 'Backend': 0, 'Full Stack': 0 };
    rest.forEach((p) => {
      const cat = resolveCategory(p.techStack);
      counts[cat]++;
    });
    return counts;
  }, [rest]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // sync initial value
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-24 content-section"
      role="region"
      aria-labelledby="projects-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          04 —
        </span>
        <h2
          id="projects-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Projects
        </h2>

        <div className="flex flex-wrap gap-2 mb-10 stagger-child">
          {PROJECT_CATEGORIES.map((category) => {
            const isActive = category === activeCategory;
            const count = categoryCounts[category];
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="font-mono-label text-[11px] uppercase tracking-[0.12em] px-3 py-2 border transition-all relative"
                style={{
                  color: isActive ? 'hsl(var(--bg-base))' : 'hsl(var(--text-muted))',
                  background: isActive ? 'hsl(var(--accent-primary))' : 'hsl(var(--bg-surface))',
                  borderColor: isActive ? 'hsl(var(--accent-primary))' : 'hsl(var(--border-color))',
                }}
                aria-pressed={isActive}
              >
                {category}
                <span
                  className="ml-1.5 font-mono-label text-[9px]"
                  style={{
                    opacity: 0.7,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured project */}
        {featured && (
          <Link
            to={`/project/${featured.id}`}
            className="project-card-glass mb-8 grid grid-cols-1 md:grid-cols-[60%_40%] stagger-child group"
          >
            <div className="p-6 md:p-8">
              <span className="font-mono-label text-[11px] text-accent-primary uppercase tracking-[0.12em] block mb-2">
                Featured
              </span>
              <h3 className="font-display text-text-primary text-[28px] mb-3 group-hover:text-accent-primary transition-colors">
                {featured.title}
              </h3>
              <p className="font-mono-body text-text-secondary text-[13px] leading-[1.75] mb-4">
                {featured.description}
              </p>
              {featured.metrics && (
                <p className="font-display text-accent-primary text-[18px] mb-4">
                  — {featured.metrics}
                </p>
              )}
              <div className="flex gap-4 items-center">
                {featured.githubURL && (
                  <button
                    type="button"
                    className="font-mono-body text-accent-alt text-[13px] hover:underline"
                    onClick={(e) => openExternal(featured.githubURL, e)}
                  >
                    GitHub ↗
                  </button>
                )}
                {featured.liveURL && (
                  <button
                    type="button"
                    className="font-mono-body text-accent-alt text-[13px] hover:underline"
                    onClick={(e) => openExternal(featured.liveURL, e)}
                  >
                    Live ↗
                  </button>
                )}
                <span className="font-mono-label text-[11px] text-text-muted ml-auto group-hover:text-accent-primary transition-colors">
                  View Case Study →
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border-color">
              {featured.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="font-mono-label text-lg text-text-muted hover:text-text-primary transition-colors py-1"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Link>
        )}

        {/* Desktop Grid / Mobile Carousel */}
        {isMobile ? (
          <Carousel className="w-full">
            <CarouselContent>
              {filteredProjects.map((project, i) => (
                <CarouselItem key={project.id} className="md:basis-1/2">
                  <Link to={`/project/${project.id}`} className="block">
                    <ProjectCard project={project} index={i + 1} />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-border-color hover:bg-bg-surface" />
            <CarouselNext className="right-0 border-border-color hover:bg-bg-surface" />
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" style={{ perspective: '1000px' }}>
            {filteredProjects.map((project, i) => (
              <Link key={project.id} to={`/project/${project.id}`} className="stagger-child">
                <ProjectCard project={project} index={i + 1} />
              </Link>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="py-16 text-center stagger-child">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-inset mb-4">
              <span className="text-2xl" aria-hidden="true">🔍</span>
            </div>
            <p className="font-display text-text-primary text-lg mb-2">No projects here yet</p>
            <p className="font-mono-body text-sm text-text-muted">
              Try selecting a different category to explore other work.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
