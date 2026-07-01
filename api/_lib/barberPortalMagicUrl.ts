import { getBarberPortalMagicSecret, mintBarberPortalMagicToken } from './barberPortalMagicToken.js';
import { normalizePartnerTier } from './partnerTierMail.js';

export function buildBarberMagicEnterUrl(
  siteBase: string,
  barberId: string,
  barberEmail: string,
  tier: string,
  next?: 'watch',
): string | null {
  const secret = getBarberPortalMagicSecret();
  const t = normalizePartnerTier(tier);
  if (!secret || (t !== 'gold' && t !== 'diamond')) return null;
  try {
    const token = mintBarberPortalMagicToken(barberId, barberEmail, secret);
    const b = siteBase.replace(/\/+$/, '');
    const nextQ = next === 'watch' ? '&next=watch' : '';
    return `${b}/#/barber/enter?m=${encodeURIComponent(token)}${nextQ}`;
  } catch {
    return null;
  }
}
