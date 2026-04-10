import useScrollProgress from '@/hooks/useScrollProgress';

const ScrollProgressBar = () => {
  const progress = useScrollProgress();
  return (
    <div
      className="fixed top-0 left-0 w-full z-[60]"
      style={{ height: '4px' }}
    >
      <div
        className="h-full progress-glow"
        style={{
          width: `${progress}%`,
          transition: 'width 50ms linear',
          background: `linear-gradient(90deg, hsl(var(--accent-primary)), hsl(var(--accent-alt)))`,
        }}
      />
      <div
        className="absolute inset-0 bg-border-color"
        style={{ opacity: 0.2, zIndex: -1 }}
      />
    </div>
  );
};

export default ScrollProgressBar;
