import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AMBIENT_CONTROL_LABELS,
  PLATFORM_AMBIENT_STORAGE_KEY,
  type AmbientControlMode,
  type AmbientPhaseId,
} from '@/config/platformAmbientPhases';
import {
  formatRiyadhTime,
  getAmbientPhaseDefinition,
  resolveAmbientPhaseFromRiyadhTime,
} from '@/lib/riyadhAmbientPhase';

type PlatformAmbientContextValue = {
  control: AmbientControlMode;
  autoPhase: AmbientPhaseId;
  effectivePhase: AmbientPhaseId;
  phaseLabelAr: string;
  phaseDescriptionAr: string;
  riyadhTimeLabel: string;
  controlLabelAr: string;
  controlHintAr: string;
  setControl: (mode: AmbientControlMode) => void;
  cycleControl: () => void;
};

const PlatformAmbientContext = createContext<PlatformAmbientContextValue | null>(null);

function readStoredControl(): AmbientControlMode {
  if (typeof window === 'undefined') return 'auto';
  const raw = window.localStorage.getItem(PLATFORM_AMBIENT_STORAGE_KEY);
  if (raw === 'bright' || raw === 'night' || raw === 'auto') return raw;
  return 'auto';
}

function resolveEffectivePhase(control: AmbientControlMode, autoPhase: AmbientPhaseId): AmbientPhaseId {
  if (control === 'bright') return 'dhuhr';
  if (control === 'night') return 'layl';
  return autoPhase;
}

const CONTROL_CYCLE: AmbientControlMode[] = ['auto', 'bright', 'night'];

export function PlatformAmbientProvider({ children }: { children: ReactNode }) {
  const [control, setControlState] = useState<AmbientControlMode>(() => readStoredControl());
  const [autoPhase, setAutoPhase] = useState<AmbientPhaseId>(() =>
    resolveAmbientPhaseFromRiyadhTime(),
  );
  const [riyadhTimeLabel, setRiyadhTimeLabel] = useState(() => formatRiyadhTime());

  useEffect(() => {
    const tick = () => {
      setAutoPhase(resolveAmbientPhaseFromRiyadhTime());
      setRiyadhTimeLabel(formatRiyadhTime());
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const setControl = useCallback((mode: AmbientControlMode) => {
    setControlState(mode);
    window.localStorage.setItem(PLATFORM_AMBIENT_STORAGE_KEY, mode);
  }, []);

  const cycleControl = useCallback(() => {
    setControlState((prev) => {
      const idx = CONTROL_CYCLE.indexOf(prev);
      const next = CONTROL_CYCLE[(idx + 1) % CONTROL_CYCLE.length];
      window.localStorage.setItem(PLATFORM_AMBIENT_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const effectivePhase = resolveEffectivePhase(control, autoPhase);
  const phaseDef = getAmbientPhaseDefinition(effectivePhase);
  const controlMeta = AMBIENT_CONTROL_LABELS[control];

  const value = useMemo<PlatformAmbientContextValue>(
    () => ({
      control,
      autoPhase,
      effectivePhase,
      phaseLabelAr: phaseDef.labelAr,
      phaseDescriptionAr: phaseDef.descriptionAr,
      riyadhTimeLabel,
      controlLabelAr: controlMeta.labelAr,
      controlHintAr: controlMeta.hintAr,
      setControl,
      cycleControl,
    }),
    [
      control,
      autoPhase,
      effectivePhase,
      phaseDef.labelAr,
      phaseDef.descriptionAr,
      riyadhTimeLabel,
      controlMeta.labelAr,
      controlMeta.hintAr,
      setControl,
      cycleControl,
    ],
  );

  return (
    <PlatformAmbientContext.Provider value={value}>{children}</PlatformAmbientContext.Provider>
  );
}

export function usePlatformAmbient(): PlatformAmbientContextValue {
  const ctx = useContext(PlatformAmbientContext);
  if (!ctx) {
    throw new Error('usePlatformAmbient must be used within PlatformAmbientProvider');
  }
  return ctx;
}

/** للصفحات خارج المزوّد — لا ترمي خطأ */
export function usePlatformAmbientOptional(): PlatformAmbientContextValue | null {
  return useContext(PlatformAmbientContext);
}

export function useAmbientShellAttrs() {
  const ctx = usePlatformAmbientOptional();
  if (!ctx) return {};
  return {
    'data-ambient-phase': ctx.effectivePhase,
    'data-ambient-control': ctx.control,
  } as const;
}
