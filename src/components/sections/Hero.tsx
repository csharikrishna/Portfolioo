import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import useMagneticEffect from '@/hooks/useMagneticEffect';
import useParallax from '@/hooks/useParallax';
import ParticleConstellation from '@/components/ui-custom/ParticleConstellation';
import AnimatedCounter from '@/components/ui-custom/AnimatedCounter';
import HeroTextureBlob from '@/components/ui-custom/HeroTextureBlob';
import { portfolio as portfolioData } from '@/data/portfolio';

const ROLES = ['AI Systems Engineer', 'Backend Developer', 'Full-Stack Builder'];

// ── ProfileAvatar ──────────────────────────────────────────────────────────
// memo() prevents re-renders on every typewriter tick since `name` never changes
const ProfileAvatar = memo(({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary to-accent-alt
                 flex items-center justify-center text-bg-base font-display text-2xl font-bold
                 border-2 border-accent-primary shadow-lg"
      style={{ animation: 'slideInRight 800ms cubic-bezier(0.22, 1, 0.36, 1) 300ms both' }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
});
ProfileAvatar.displayName = 'ProfileAvatar';

// ── Availability Badge ─────────────────────────────────────────────────────
const AvailabilityBadge = memo(() => (
  <div
    className="inline-flex w-fit items-center gap-2 font-mono-label text-[11px] uppercase tracking-[0.1em] text-text-secondary
               bg-bg-surface border border-border-color px-4 py-2 mb-6"
    style={{ animation: 'fadeInUp 600ms cubic-bezier(0.22, 1, 0.36, 1) 800ms both' }}
  >
    <span
      className="w-2 h-2 rounded-full bg-green-500 availability-dot"
      aria-hidden="true"
    />
    Available for opportunities
  </div>
));
AvailabilityBadge.displayName = 'AvailabilityBadge';

// ── Hero ───────────────────────────────────────────────────────────────────
const Hero = () => {
  const { meta } = portfolioData;
  const primaryRef   = useRef<HTMLButtonElement>(null);
  const secondaryRef = useRef<HTMLAnchorElement>(null);
  const parallaxOffset = useParallax(0.15);

  // Read once on mount — stored in ref to avoid re-renders
  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useMagneticEffect(primaryRef as React.RefObject<HTMLElement>, 0.3);
  useMagneticEffect(secondaryRef as React.RefObject<HTMLElement>, 0.3);

  // ── Typewriter state ────────────────────────────────────────────────────
  const [displayText, setDisplayText] = useState('');
  const [roleIndex,   setRoleIndex]   = useState(0);
  const [charIndex,   setCharIndex]   = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);

  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dedicated unmount cleanup for the pause timer
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Respect reduced motion — show first role statically, skip animation
    if (prefersReduced.current) {
      setDisplayText(ROLES[0]);
      return;
    }

    const role  = ROLES[roleIndex];
    const speed = isDeleting ? 30 : 50 + Math.random() * 40;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const next = charIndex + 1;
        setDisplayText(role.slice(0, next));

        if (next >= role.length) {
          pauseTimerRef.current = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          setCharIndex(next);
        }
      } else {
        const prev = charIndex - 1;
        setDisplayText(role.slice(0, prev));
        if (prev <= 0) {
          setIsDeleting(false);
          setRoleIndex((r) => (r + 1) % ROLES.length);
          setCharIndex(0);
        } else {
          setCharIndex(prev);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex]);

  // ── Name entrance animation ─────────────────────────────────────────────
  const [nameVisible, setNameVisible] = useState(false);
  useEffect(() => {
    if (prefersReduced.current) {
      setNameVisible(true);
      return;
    }
    const t = setTimeout(() => setNameVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll helper ───────────────────────────────────────────────────────
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden grain-overlay"
      style={{ minHeight: '100vh', marginTop: 0 }}
      role="region"
      aria-labelledby="hero-heading"
    >
      {/* Interactive particle constellation — desktop only */}
      <ParticleConstellation />

      {/* Decorative 01 — parallax disabled for reduced motion */}
      <div
        className="hidden md:block absolute right-0 top-0 font-display text-border-color select-none pointer-events-none"
        aria-hidden="true"
        style={{
          fontSize: '25vw',
          lineHeight: 1,
          opacity: 0.3,
          transform: prefersReduced.current ? undefined : `translateY(${parallaxOffset}px)`,
        }}
      >
        01
      </div>

      <div
        className="hidden xl:block absolute right-[clamp(30px,3vw,64px)] top-[56%] -translate-y-1/2 z-[1]"
        style={{ width: 'clamp(220px, 20vw, 310px)', height: 'clamp(250px, 28vw, 360px)' }}
        aria-hidden="true"
      >
        <HeroTextureBlob />
      </div>

      <div
        className="max-w-[1200px] mx-auto relative w-full flex flex-col justify-end hero-orchestrated"
        style={{
          padding: '0 clamp(16px, 4vw, 80px)',
          minHeight: '100vh',
          paddingBottom: 'clamp(100px, 12vw, 120px)',
          paddingTop: 'clamp(60px, 10vw, 100px)',
          zIndex: 1,
        }}
      >
        <div className="mb-6">
          <ProfileAvatar name={meta.name} />
        </div>

        <AvailabilityBadge />

        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted mb-4">
          01 —
        </span>

        {/* Name with per-character entrance */}
        <h1
          id="hero-heading"
          className="font-display text-text-primary overflow-hidden whitespace-normal md:whitespace-nowrap"
          style={{ fontSize: 'clamp(32px, 7vw, 84px)', lineHeight: 'clamp(1.1, 1.2, 1.3)' }}
        >
          {meta.name.split('').map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                transform: nameVisible ? 'translateY(0)' : 'translateY(100%)',
                opacity:   nameVisible ? 1 : 0,
                transition: prefersReduced.current
                  ? 'none'
                  : `transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 30}ms,
                     opacity   600ms ease                             ${i * 30}ms`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Typewriter */}
        <div className="mt-3 md:mt-4 min-h-[28px] text-left">
          <span
            className="font-mono-body text-accent-primary inline-block"
            style={{ fontSize: 'clamp(14px, 2vw, 22px)', lineHeight: 1.4 }}
            aria-label={ROLES[roleIndex]}
            aria-live="off"
          >
            <span aria-hidden="true">{displayText}</span>
            <span className="cursor-blink" aria-hidden="true">|</span>
          </span>
        </div>

        <p
          className="font-mono-body text-text-muted mt-3 max-w-[600px]"
          style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', lineHeight: 1.5 }}
        >
          {meta.tagline}
        </p>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-6 md:mt-8">
          <button
            ref={primaryRef}
            onClick={() => scrollTo('projects')}
            className="relative font-mono-label text-xs uppercase tracking-[0.12em]
                       bg-accent-primary text-bg-base px-6 md:px-8 transition-all hover:opacity-95
                       flex items-center justify-center md:justify-start gap-2"
            style={{ height: 'clamp(44px, 10vw, 52px)', boxShadow: '0 8px 26px hsl(var(--accent-primary) / 0.28)' }}
          >
            Explore Projects
            <ArrowRight size={14} aria-hidden="true" />
          </button>
          <a
            ref={secondaryRef}
            href={meta.resumeURL}
            download
            className="relative font-mono-label text-xs uppercase tracking-[0.12em]
                       border border-border-strong text-text-secondary px-6 md:px-8
                       flex items-center justify-center md:justify-start gap-2 transition-colors
                       hover:text-text-primary hover:border-text-primary group"
            style={{ height: 'clamp(44px, 10vw, 52px)' }}
          >
            <Download size={14} className="group-hover:animate-bounce" aria-hidden="true" />
            Download Resume
          </a>
        </div>
        <p className="font-mono-label text-[11px] uppercase tracking-[0.1em] text-text-muted mt-4">
          Open to internships and full-time roles. Typical response within 24 hours.
        </p>

        {/* Stats bar — animated counters */}
        <div
          className="flex flex-wrap gap-8 md:gap-12 mt-10 pt-8 border-t border-border-color"
          style={{ animation: 'fadeInUp 600ms cubic-bezier(0.22, 1, 0.36, 1) 1200ms both' }}
        >
          <AnimatedCounter end={4} suffix="+" label="Projects Built" />
          <AnimatedCounter end={99} suffix="%" label="Best Accuracy" />
          <AnimatedCounter end={300} suffix="ms" prefix="<" label="RAG Latency" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block" aria-hidden="true">
          <span
            className="font-mono-label text-text-muted text-sm inline-block"
            style={{
              animation: prefersReduced.current
                ? 'none'
                : 'scrollBounce 2s ease-in-out infinite',
            }}
          >
            ↓
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;