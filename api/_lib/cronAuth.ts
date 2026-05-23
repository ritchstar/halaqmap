function bearerFromHeader(h: string | null): string | null {
  const v = h?.trim() || '';
  if (!v.startsWith('Bearer ')) return null;
  const t = v.slice('Bearer '.length).trim();
  return t.length > 0 ? t : null;
}

function cronSecretCandidates(): string[] {
  return [
    process.env.CRON_SECRET,
    process.env.OPS_BILLING_CRON_SECRET,
    process.env.OPS_INTELLIGENCE_CRON_SECRET,
  ]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0);
}

function isCronSecretToken(token: string): boolean {
  const t = token.trim();
  return cronSecretCandidates().some((c) => c === t);
}

/** Cron auth via Authorization: Bearer or X-Ops-Billing-Cron-Authorization (legacy billing header). */
export function isCronAuthorized(request: Request): boolean {
  const fromAuth = bearerFromHeader(request.headers.get('authorization'));
  if (fromAuth && isCronSecretToken(fromAuth)) return true;
  const fromX = bearerFromHeader(request.headers.get('x-ops-billing-cron-authorization'));
  if (fromX && isCronSecretToken(fromX)) return true;
  const fromIntel = bearerFromHeader(request.headers.get('x-ops-intelligence-cron-authorization'));
  if (fromIntel && isCronSecretToken(fromIntel)) return true;
  return false;
}
