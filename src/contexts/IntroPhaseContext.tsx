import { createContext, useContext } from 'react';

type IntroPhase = 'idle' | 'intro' | 'transition' | 'done';

interface IntroPhaseContextType {
  phase: IntroPhase;
}

const IntroPhaseContext = createContext<IntroPhaseContextType | undefined>(undefined);

export function useIntroPhase() {
  const context = useContext(IntroPhaseContext);
  if (!context) {
    throw new Error('useIntroPhase must be used within IntroAnimationGate');
  }
  return context;
}

export function IntroPhaseProvider({ phase, children }: { phase: IntroPhase; children: React.ReactNode }) {
  return (
    <IntroPhaseContext.Provider value={{ phase }}>
      {children}
    </IntroPhaseContext.Provider>
  );
}
