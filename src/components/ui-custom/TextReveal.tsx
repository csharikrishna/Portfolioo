import { useEffect, useRef } from 'react';

interface TextRevealProps {
  text: string;
  className?: string;
}

const TextReveal = ({ text, className = '' }: TextRevealProps) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Skip on reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Reveal all words immediately
      const words = containerRef.current?.querySelectorAll('.text-reveal-word');
      words?.forEach((w) => w.classList.add('revealed'));
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.text-reveal-word');
    if (words.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Calculate reveal progress based on scroll position
            const updateReveal = () => {
              const rect = el.getBoundingClientRect();
              const viewH = window.innerHeight;
              // Element enters from bottom, fully visible at middle of screen
              const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH * 0.6)));
              const revealCount = Math.floor(progress * words.length);

              words.forEach((word, i) => {
                if (i < revealCount) {
                  word.classList.add('revealed');
                } else {
                  word.classList.remove('revealed');
                }
              });
            };

            updateReveal();

            const scrollHandler = () => requestAnimationFrame(updateReveal);
            window.addEventListener('scroll', scrollHandler, { passive: true });

            return () => window.removeEventListener('scroll', scrollHandler);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -20% 0px' }
    );

    observer.observe(el);

    // Also handle scroll for progressive reveal
    const updateReveal = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH * 0.6)));
      const revealCount = Math.floor(progress * words.length);

      words.forEach((word, i) => {
        if (i < revealCount) {
          word.classList.add('revealed');
        } else {
          word.classList.remove('revealed');
        }
      });
    };

    window.addEventListener('scroll', updateReveal, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateReveal);
    };
  }, [text]);

  const words = text.split(' ');

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="text-reveal-word inline">
          {word}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
};

export default TextReveal;
