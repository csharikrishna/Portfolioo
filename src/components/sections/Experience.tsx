import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

const Experience = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { experience } = portfolioData;

  if (experience.length === 0) return null;

  return (
    <section
      id="experience"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="experience-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          03 —
        </span>
        <h2
          id="experience-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Experience
        </h2>

        <div className="relative pl-8">
          {/* Timeline line with gradient */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{
              background: `linear-gradient(180deg, hsl(var(--accent-primary) / 0.6), hsl(var(--border-color)), transparent)`,
            }}
          />

          {experience.map((exp, i) => (
            <div key={i} className="relative mb-12 group cursor-default stagger-child">
              {/* Glow dot */}
              <div
                className="absolute -left-8 top-2 w-[6px] h-[6px] rounded-full bg-accent-primary timeline-dot group-hover:timeline-dot-glow"
                style={{ transform: 'translateX(-50%)' }}
              />

              <div
                className="transition-all duration-300 group-hover:translate-x-1"
                style={{
                  borderLeft: '2px solid transparent',
                  paddingLeft: '16px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = 'hsl(var(--accent-primary))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                }}
              >
                <span className="font-mono-label text-[11px] text-text-muted block mb-1">
                  {exp.period}
                </span>
                <h3 className="font-display text-text-primary text-[22px]">
                  {exp.organization} — {exp.role}
                </h3>
                {exp.type && (
                  <span className="inline-block font-mono-label text-[11px] bg-bg-inset text-text-muted px-2 py-0.5 mt-2" style={{ borderRadius: '3px' }}>
                    {exp.type}
                  </span>
                )}
                {exp.description && (
                  <p className="font-mono-body text-text-secondary text-[13px] mt-3 leading-relaxed opacity-80">
                    {exp.description}
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {exp.achievements?.map((ach, j) => (
                    <li key={j} className="font-mono-body text-text-secondary text-[13px] flex gap-2">
                      <span className="text-text-muted flex-shrink-0">—</span>
                      {ach}
                    </li>
                  ))}
                </ul>
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.skills.map((skill, j) => (
                      <span key={j} className="font-mono-label text-[11px] bg-bg-inset text-text-muted px-2 py-0.5 skill-pill" style={{ borderRadius: '3px', border: '1px solid transparent' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
