import { useState } from 'react';
import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

const FAQ = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { faq } = portfolioData;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faq.length === 0) return null;

  return (
    <section
      id="faq"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          08 —
        </span>
        <h2
          id="faq-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          FAQ
        </h2>

        <div>
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-border-color stagger-child">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 group"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-text-primary text-[18px] group-hover:text-accent-primary transition-colors">
                    {item.question}
                  </span>
                  <span
                    className="font-mono-label text-text-muted text-lg flex-shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 300ms ease',
                  }}
                >
                  <div
                    className="pb-5 pl-4 font-mono-body text-text-secondary text-[13px] leading-[1.75]"
                    style={{
                      borderLeft: isOpen ? '2px solid hsl(var(--accent-primary))' : '2px solid transparent',
                      transition: 'border-color 300ms ease',
                    }}
                  >
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
