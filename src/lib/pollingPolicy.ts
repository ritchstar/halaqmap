/** Shared polling intervals — keep DB/API load predictable across dashboards. */
export const POLL_MS = {
  RADAR_PULSES: 30_000,
  BARBER_SUPPORT_CHAT: 60_000,
  PRIVATE_CHAT_LIST: 30_000,
  PRIVATE_CHAT_MESSAGES: 30_000,
  PRIVATE_CHAT_INTERCEPT: 30_000,
  MAP_COMMUNITY_FEED: 30_000,
  MAP_COMMUNITY_BADGE: 60_000,
} as const;

/** Skip background-tab polling (mirrors React Query refetchIntervalInBackground: false). */
export function isPollingTabActive(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}
