import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

const Education = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { education, certifications } = portfolioData;

  return (
    <section
      id="education"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="education-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          06 —
        </span>
        <h2
          id="education-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Education & Certifications
        </h2>

        {/* Education */}
        <div className="mb-12">
          {education.map((edu, i) => (
            <div key={i} className="project-card-glass p-6 mb-4 stagger-child">
              <h3 className="font-display text-text-primary text-2xl mb-2">
                {edu.institution}
              </h3>
              <p className="font-mono-body text-text-secondary text-[13px] mb-1">
                {edu.degree}
              </p>
              <p className="font-mono-body text-text-secondary text-[13px] mb-1">
                CGPA: {edu.cgpa} &middot; {edu.duration}
              </p>
              {edu.coursework.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {edu.coursework.map((course, j) => (
                    <span
                      key={j}
                      className="font-mono-label text-[10px] bg-bg-inset text-text-muted px-2 py-0.5"
                      style={{ border: '1px solid hsl(var(--border-color))' }}
                    >
                      {course}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="section-divider mb-12" />

        {/* Certifications — responsive table/card layout */}
        <div className="stagger-child">
          {/* Desktop table view */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted py-3 pr-4">Name</th>
                  <th className="text-left font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted py-3 pr-4">Issuer</th>
                  <th className="text-left font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted py-3 pr-4">Date</th>
                  <th className="text-left font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted py-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((cert, i) => (
                    <tr
                    key={i}
                    className="transition-colors hover:bg-bg-inset group"
                    style={{ background: i % 2 === 0 ? 'hsl(var(--bg-base))' : 'hsl(var(--bg-surface))' }}
                  >
                    <td className="py-3 pr-4">
                      <span className="font-mono-body text-text-primary text-[13px] group-hover:text-accent-primary transition-colors block">{cert.name}</span>
                      {(cert as any).type && <span className="font-mono-label text-[10px] text-text-muted opacity-70">{(cert as any).type}</span>}
                    </td>
                    <td className="font-mono-body text-text-secondary text-[13px] py-3 pr-4">
                      {cert.issuer}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono-body text-text-secondary text-[13px] block">{(cert as any).date || '—'}</span>
                      {(cert as any).validity && <span className="font-mono-label text-[10px] text-text-muted opacity-70">{(cert as any).validity}</span>}
                    </td>
                    <td className="py-3">
                      {cert.credentialURL ? (
                        <a href={cert.credentialURL} target="_blank" rel="noopener noreferrer" className="font-mono-body text-accent-alt text-[13px] hover:underline">
                          View ↗
                        </a>
                      ) : (
                        <span className="font-mono-body text-text-muted text-[13px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="project-card-glass p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-mono-body text-text-primary text-[13px] font-semibold">
                    {cert.name}
                  </h4>
                  {(cert as any).type && (
                    <span className="font-mono-label text-[10px] bg-bg-inset text-text-muted px-2 py-0.5 flex-shrink-0" style={{ borderRadius: '3px' }}>
                      {(cert as any).type}
                    </span>
                  )}
                </div>
                <p className="font-mono-label text-[11px] text-text-muted mb-1">{cert.issuer}</p>
                {(cert as any).date && (
                  <p className="font-mono-label text-[10px] text-text-muted mb-2 opacity-70">
                    {(cert as any).date}{(cert as any).validity ? ` · ${(cert as any).validity}` : ''}
                  </p>
                )}
                {cert.credentialURL ? (
                  <a href={cert.credentialURL} target="_blank" rel="noopener noreferrer" className="font-mono-body text-accent-alt text-[12px] hover:underline">
                    View Credential ↗
                  </a>
                ) : (
                  <span className="font-mono-body text-text-muted text-[12px]">No credential link</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
