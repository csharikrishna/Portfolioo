import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Show button after scrolling past hero section (100vh)
          setIsVisible(window.scrollY > window.innerHeight * 0.5);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-24 md:bottom-20 right-6 md:right-8 z-40 p-3 rounded-full bg-accent-primary text-bg-base shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl group"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
      }}
      title="Scroll to top"
    >
      <ChevronUp
        size={20}
        className="group-active:animate-bounce"
        aria-hidden="true"
      />
    </button>
  );
};

export default BackToTopButton;
