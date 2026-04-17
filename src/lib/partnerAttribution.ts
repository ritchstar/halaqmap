import type { PartnerAttribution } from '@/lib';

const STORAGE_KEY = 'halaqmap.partnerAttribution.v1';

function readHashQueryParams(hash: string): URLSearchParams {
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return new URLSearchParams();
  return new URLSearchParams(hash.slice(qIndex + 1));
}

function fromParams(
  params: URLSearchParams,
  fallbackPath: string,
  referrer: string
): PartnerAttribution | null {
  const attribution: PartnerAttribution = {
    capturedAtIso: new Date().toISOString(),
    pagePath: fallbackPath,
  };

  if (referrer) attribution.referrer = referrer;

  const mapping: Array<[keyof PartnerAttribution, string]> = [
    ['utmSource', 'utm_source'],
    ['utmMedium', 'utm_medium'],
    ['utmCampaign', 'utm_campaign'],
    ['utmTerm', 'utm_term'],
    ['utmContent', 'utm_content'],
    ['gclid', 'gclid'],
    ['fbclid', 'fbclid'],
    ['ttclid', 'ttclid'],
    ['msclkid', 'msclkid'],
  ];

  let hasSignal = false;
  for (const [targetKey, sourceKey] of mapping) {
    const value = params.get(sourceKey)?.trim();
    if (value) {
      attribution[targetKey] = value;
      hasSignal = true;
    }
  }

  return hasSignal ? attribution : null;
}

function getCurrentRoutePathFromHash(hash: string): string {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const [pathPart = '/'] = clean.split('?');
  return pathPart || '/';
}

export function capturePartnerAttributionFromLocation(): void {
  if (typeof window === 'undefined') return;

  const hashPath = getCurrentRoutePathFromHash(window.location.hash || '');
  const globalParams = new URLSearchParams(window.location.search);
  const hashParams = readHashQueryParams(window.location.hash || '');

  // نفضّل Query داخل hash-router، ثم query العام.
  const attribution =
    fromParams(hashParams, hashPath, document.referrer || '') ||
    fromParams(globalParams, hashPath, document.referrer || '');

  if (!attribution) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function loadPartnerAttribution(): PartnerAttribution | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as PartnerAttribution;
    if (!parsed || typeof parsed !== 'object') return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}
