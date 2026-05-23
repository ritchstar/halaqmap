/**
 * Build-sync watchdog — detects when the user's browser is rendering a stale
 * build (different `<meta name="halaqmap-build-commit">` from the live one)
 * and force-refreshes the service worker so the new Tactical UI can load.
 *
 * Triggered on:
 *  - App boot
 *  - `visibilitychange` (returning to tab after a deploy)
 *  - 10-minute polling interval
 */

const META_COMMIT = 'halaqmap-build-commit';
const META_BUILD_TIME = 'halaqmap-build-time';
const BUILD_STAMP_ENDPOINT = '/index.html';
const POLL_MS = 10 * 60 * 1000;

function readMetaContent(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector(`meta[name="${name}"]`);
  return el instanceof HTMLMetaElement ? el.content.trim() || null : null;
}

async function fetchLiveBuildStamp(): Promise<{ commit: string | null; buildTime: string | null }> {
  try {
    const res = await fetch(`${BUILD_STAMP_ENDPOINT}?probe=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!res.ok) return { commit: null, buildTime: null };
    const html = await res.text();
    const commitMatch = html.match(/name="halaqmap-build-commit"\s+content="([^"]+)"/);
    const buildMatch = html.match(/name="halaqmap-build-time"\s+content="([^"]+)"/);
    return {
      commit: commitMatch?.[1]?.trim() || null,
      buildTime: buildMatch?.[1]?.trim() || null,
    };
  } catch {
    return { commit: null, buildTime: null };
  }
}

async function unregisterServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister().catch(() => undefined)));
  } catch {
    /* ignore */
  }
}

async function clearWorkboxCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('workbox-') || n.includes('halaqmap') || n.includes('precache'))
        .map((n) => caches.delete(n).catch(() => false)),
    );
  } catch {
    /* ignore */
  }
}

async function performHardReload(): Promise<void> {
  await unregisterServiceWorkers();
  await clearWorkboxCaches();
  if (typeof window !== 'undefined') {
    const sep = window.location.search ? '&' : '?';
    window.location.replace(`${window.location.pathname}${window.location.search}${sep}_b=${Date.now()}${window.location.hash}`);
  }
}

let lastChecked = 0;
let inFlight: Promise<void> | null = null;

async function checkOnce(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (Date.now() - lastChecked < 30_000) return;
  lastChecked = Date.now();

  const bakedCommit = readMetaContent(META_COMMIT);
  const bakedBuildTime = readMetaContent(META_BUILD_TIME);
  if (!bakedCommit && !bakedBuildTime) return;

  const live = await fetchLiveBuildStamp();
  if (!live.commit && !live.buildTime) return;

  const commitMismatch = bakedCommit && live.commit && bakedCommit !== live.commit;
  const buildTimeMismatch =
    bakedBuildTime && live.buildTime && bakedBuildTime !== live.buildTime;

  if (commitMismatch || buildTimeMismatch) {
    console.info(
      '[halaqmap] Build mismatch detected — reloading to pick up latest UI',
      { baked: { bakedCommit, bakedBuildTime }, live },
    );
    await performHardReload();
  }
}

export function initPlatformBuildSync(): void {
  if (typeof window === 'undefined') return;

  const safeRun = () => {
    if (inFlight) return;
    inFlight = checkOnce().finally(() => {
      inFlight = null;
    });
  };

  // Initial check after the page settles
  window.setTimeout(safeRun, 4_000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') safeRun();
  });

  window.setInterval(safeRun, POLL_MS);
}

/**
 * Manual escape hatch — bound to the founder UI "Hard Refresh" button so a
 * stuck client can be rescued without DevTools.
 */
export async function forceHardRefresh(): Promise<void> {
  await performHardReload();
}
