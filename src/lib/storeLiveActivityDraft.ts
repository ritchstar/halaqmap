/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسودة واجهة النشاط على جهاز الزبون — بلا حفظ لدى المنصة.
 */
import { liveActivityCopy, type LiveActivityKind } from '@/config/storeLiveActivity';

export type LiveActivityDraft = {
  occasion: string;
};

function draftKey(kind: LiveActivityKind, token: string): string {
  return `live-activity-draft:${kind}:${token.trim()}`;
}

export function emptyLiveActivityDraft(): LiveActivityDraft {
  return { occasion: 'all' };
}

export function loadLiveActivityDraft(kind: LiveActivityKind, token: string): LiveActivityDraft {
  if (typeof sessionStorage === 'undefined') return emptyLiveActivityDraft();
  try {
    const raw = sessionStorage.getItem(draftKey(kind, token));
    if (!raw) return emptyLiveActivityDraft();
    const parsed = JSON.parse(raw) as Partial<LiveActivityDraft>;
    return { ...emptyLiveActivityDraft(), ...parsed, occasion: String(parsed.occasion || 'all') };
  } catch {
    return emptyLiveActivityDraft();
  }
}

export function saveLiveActivityDraft(kind: LiveActivityKind, token: string, patch: Partial<LiveActivityDraft>): LiveActivityDraft {
  const next = { ...loadLiveActivityDraft(kind, token), ...patch };
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(draftKey(kind, token), JSON.stringify(next));
  }
  return next;
}

export function matchesLiveActivityOccasion(kind: LiveActivityKind, text: string, occasionId: string): boolean {
  if (occasionId === 'all') return true;
  const meta = liveActivityCopy(kind).occasions.find((row) => row.id === occasionId);
  if (!meta || meta.keywords.length === 0) return true;
  const hay = text.toLowerCase();
  return meta.keywords.some((word) => hay.includes(word));
}
