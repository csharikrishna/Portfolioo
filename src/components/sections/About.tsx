import { useState, useRef } from 'react';
import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import TextReveal from '@/components/ui-custom/TextReveal';
import EasterEgg, { EasterEggHandle } from '@/components/ui-custom/EasterEgg';
import { portfolio as portfolioData } from '@/data/portfolio';

const SKILL_CATEGORIES = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'tools', label: 'Tools' },
  { key: 'databases', label: 'Databases' },
  { key: 'other', label: 'AI / ML & Other' },
] as const;

const About = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.1);
  const { about, skills } = portfolioData;
  const [openCat, setOpenCat] = useState<string | null>(null);
  const easterEggRef = useRef<EasterEggHandle>(null);

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    easterEggRef.current?.trigger({
      title: '🎉 You found the secret!',
      description: 'The magic of curiosity — keep exploring.',
    });
  };

  return (
    <section
      id="about"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="about-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 md:gap-16">
          {/* Left column */}
          <div>
            <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
              02 —
            </span>
            <h2
              id="about-heading"
              className="font-display text-text-primary mb-8 stagger-child"
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
              }}
            >
              About
            </h2>

            {/* Scroll-driven text reveal for bio */}
            <div className="mb-8 stagger-child">
              <TextReveal
                text={about.bio}
                className="font-mono-body text-text-secondary leading-[1.75]"
              />
              
              {/* Subtle shining trigger */}
              <p className="font-mono-body text-text-muted text-xs mt-4 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                <span>wanna have a </span>
                <button 
                  onClick={handleTrigger}
                  className="shining-text font-bold uppercase tracking-wider cursor-pointer hover:scale-110 transition-transform active:scale-95"
                >
                  surprise
                </button>
                <span>?</span>
              </p>

              <EasterEgg ref={easterEggRef} />
            </div>

            {/* Quick facts grid */}
            <div className="grid grid-cols-2 gap-4 stagger-child">
              {about.facts.map((fact, i) => (
                <div key={i}>
                  <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-1">
                    {fact.label}
                  </span>
                  <span className="font-mono-body text-text-primary text-sm">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Skills categories */}
          <div className="flex flex-col stagger-child">
            {SKILL_CATEGORIES.map((cat) => {
              const items = skills[cat.key as keyof typeof skills];
              if (!items || items.length === 0) return null;
              const isOpen = openCat === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setOpenCat(isOpen ? null : cat.key)}
                  className="text-left border-b border-border-color py-5 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-text-primary text-2xl group-hover:text-accent-primary transition-colors">
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono-label text-[10px] text-text-muted">{items.length}</span>
                      <span
                        className="font-mono-label text-text-muted text-sm transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                      >
                        +
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      maxHeight: isOpen ? '200px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 300ms ease',
                    }}
                  >
                    <div className="flex flex-wrap gap-2 pt-3">
                      {items.map((skill, j) => (
                        <span
                          key={j}
                          className="font-mono-label text-[11px] bg-bg-inset text-text-muted px-3 py-1 skill-pill"
                          style={{ borderRadius: '3px', border: '1px solid transparent' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
