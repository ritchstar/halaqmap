import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  isLabClonePath,
  LAB_CLONE_BASE_PATH,
  resolveLabPathOrFallback,
  toCanonicalFromLabPath,
} from '@/lab/labCloneRouting';

type LabCloneContextValue = {
  active: boolean;
  basePath: string;
  canonicalPathname: string;
  toLabPath: (pathname: string) => string;
};

const LabCloneContext = createContext<LabCloneContextValue | null>(null);

export function LabCloneProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const active = isLabClonePath(location.pathname);
  const canonicalPathname = toCanonicalFromLabPath(location.pathname);

  const value = useMemo<LabCloneContextValue>(() => ({
    active,
    basePath: LAB_CLONE_BASE_PATH,
    canonicalPathname,
    toLabPath: resolveLabPathOrFallback,
  }), [active, canonicalPathname]);

  return <LabCloneContext.Provider value={value}>{children}</LabCloneContext.Provider>;
}

export function useLabCloneContext(): LabCloneContextValue {
  const ctx = useContext(LabCloneContext);
  if (!ctx) {
    return {
      active: false,
      basePath: LAB_CLONE_BASE_PATH,
      canonicalPathname: '/',
      toLabPath: resolveLabPathOrFallback,
    };
  }
  return ctx;
}
