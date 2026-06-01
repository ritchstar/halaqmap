import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RETRY_PREFIX = 'hm-lazy-retry';

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('chunkloaderror')
  );
}

/**
 * React.lazy wrapper with one-shot auto-reload for stale chunk scenarios.
 * Prevents silent white screens after deploy when browser cache is stale.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>,
  retryKey: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await loader();
    } catch (error) {
      if (typeof window !== 'undefined' && isChunkLoadError(error)) {
        const guardKey = `${RETRY_PREFIX}:${retryKey}`;
        const alreadyRetried = sessionStorage.getItem(guardKey) === '1';
        if (!alreadyRetried) {
          sessionStorage.setItem(guardKey, '1');
          window.location.reload();
        }
      }
      throw error;
    }
  });
}
