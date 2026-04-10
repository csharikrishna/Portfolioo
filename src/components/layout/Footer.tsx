import { useRef } from 'react';
import { portfolio as portfolioData } from '@/data/portfolio';
import EasterEgg, { EasterEggHandle } from '@/components/ui-custom/EasterEgg';

const Footer = () => {
  const { meta } = portfolioData;
  const year = new Date().getFullYear();
  const easterEggRef = useRef<EasterEggHandle>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    easterEggRef.current?.trigger({
      title: 'Thanks for making it to the end!',
      description: 'Hope you enjoyed checking out my portfolio. 🎉',
    });
  };

  return (
    <footer className="relative pb-20 md:pb-0">
      <EasterEgg ref={easterEggRef} />
      {/* Gradient separator */}
      <div className="section-divider" />
      
      <div
        className="glass-effect border-t"
        style={{
          borderColor: 'hsl(var(--glass-border))',
        }}
      >
        <div
          className="max-w-[1200px] mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ padding: '32px clamp(20px, 5vw, 80px)' }}
        >
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-mono-body text-xs text-text-muted">
              &copy; {year} {meta.name}
            </span>
            <span className="font-mono-label text-[10px] text-text-muted opacity-60 flex flex-wrap items-center justify-center md:justify-start gap-1">
              Built with React + TypeScript + Tailwind. And a 
              <button 
                onClick={handleTrigger}
                className="shining-text font-bold uppercase tracking-wider cursor-pointer hover:scale-110 transition-transform active:scale-95 mx-1"
                title="Click me!"
              >
                surprise
              </button>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {['about', 'projects', 'contact'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-mono-body text-xs text-text-muted hover:text-text-primary transition-colors capitalize"
              >
                {id}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href={meta.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-body text-xs text-text-muted hover:text-accent-alt transition-colors"
            >
              GitHub
            </a>
            <a
              href={meta.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-body text-xs text-text-muted hover:text-accent-alt transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
