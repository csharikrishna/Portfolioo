import { useState } from 'react';
import { Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

const Achievements = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { achievements } = portfolioData;

  if (achievements.length === 0) return null;

  return (
    <section
      id="achievements"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="achievements-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          07 —
        </span>
        <h2
          id="achievements-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Achievements
        </h2>

        <div className="space-y-8">
          {achievements.map((ach, i) => (
            <div key={i} className="flex gap-4 stagger-child group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary to-accent-alt flex items-center justify-center cursor-help transition-all group-hover:shadow-lg group-hover:scale-105">
                      <Award size={18} className="text-bg-base" aria-hidden="true" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-bg-surface border-border-color text-text-primary max-w-xs">
                    <p className="font-mono-body text-xs">{ach.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-text-primary text-[20px] group-hover:text-accent-primary transition-colors">
                    {ach.title}
                  </h3>
                  {ach.year && (
                    <span className="font-mono-label text-[11px] text-text-muted flex-shrink-0">
                      {ach.year}
                    </span>
                  )}
                </div>
                <p className="font-mono-body text-text-secondary text-[13px] mt-1 leading-[1.75]">
                  {ach.description}
                </p>
                {(ach as any).link && (
                  <a href={(ach as any).link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-mono-body text-accent-alt text-[12px] hover:underline">
                    View Certificate ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
