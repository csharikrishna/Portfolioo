import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface SoundContextType {
  muted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playHover: () => void;
  playToggle: () => void;
}

const SoundContext = createContext<SoundContextType>({
  muted: true,
  toggleMute: () => {},
  playClick: () => {},
  playHover: () => {},
  playToggle: () => {},
});

export const useSound = () => useContext(SoundContext);

const createOscillatorSound = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.08,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [muted, setMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sound-muted');
      return saved === null ? true : saved === 'true'; // muted by default
    }
    return true;
  });

  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playClick = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 800, 0.08, 'sine', 0.06);
  }, [muted, getCtx]);

  const playHover = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 1200, 0.05, 'sine', 0.03);
  }, [muted, getCtx]);

  const playToggle = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 600, 0.1, 'triangle', 0.07);
    setTimeout(() => createOscillatorSound(ctx, 900, 0.1, 'triangle', 0.05), 80);
  }, [muted, getCtx]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('sound-muted', String(next));
      // Play a confirmation sound when unmuting
      if (!next) {
        const ctx = getCtx();
        createOscillatorSound(ctx, 500, 0.12, 'triangle', 0.06);
        setTimeout(() => createOscillatorSound(ctx, 750, 0.12, 'triangle', 0.06), 100);
      }
      return next;
    });
  }, [getCtx]);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playClick, playHover, playToggle }}>
      {children}
    </SoundContext.Provider>
  );
};
