/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مخزن محلي لمزاد تمرتنا1 في المختبر (dates-lab) بلا خادم.
 */
import {
  newAuctionLotId,
  parseAuctionLot,
  type AuctionLot,
  auctionMinNextBid,
  newAuctionBidId,
} from '@/lib/storeShopAuction';

function storageKey(token: string): string {
  return `store-dates-auction:v1:${token.trim() || 'dates-lab'}`;
}

export function readDatesAuctionLabLots(token: string): AuctionLot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => parseAuctionLot(item as Record<string, unknown>))
      .filter((lot) => lot.id);
  } catch {
    return [];
  }
}

export function writeDatesAuctionLabLots(token: string, lots: AuctionLot[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(token), JSON.stringify(lots.slice(0, 80)));
}

export function labCreateLot(token: string, partial: Partial<AuctionLot>): AuctionLot {
  const now = new Date().toISOString();
  const lot = parseAuctionLot({
    ...partial,
    id: newAuctionLotId(),
    status: 'draft',
    currentBid: 0,
    bids: [],
    createdAt: now,
  });
  const lots = [lot, ...readDatesAuctionLabLots(token)];
  writeDatesAuctionLabLots(token, lots);
  return lot;
}

export function labOpenLot(token: string, lotId: string): AuctionLot | null {
  const lots = readDatesAuctionLabLots(token);
  const now = new Date().toISOString();
  let found: AuctionLot | null = null;
  const next = lots.map((lot) => {
    if (lot.id !== lotId) return lot;
    found = {
      ...lot,
      status: 'open',
      openedAt: now,
      currentBid: 0,
      bids: [],
      winnerName: '',
      winnerPhone: '',
      closedAt: '',
    };
    return found;
  });
  if (!found) return null;
  writeDatesAuctionLabLots(token, next);
  return found;
}

export function labCloseLot(token: string, lotId: string): AuctionLot | null {
  const lots = readDatesAuctionLabLots(token);
  const now = new Date().toISOString();
  let found: AuctionLot | null = null;
  const next = lots.map((lot) => {
    if (lot.id !== lotId || lot.status !== 'open') return lot;
    const top = lot.bids[0];
    found = {
      ...lot,
      status: 'closed',
      closedAt: now,
      winnerName: top?.name || '',
      winnerPhone: top?.phone || '',
      currentBid: top?.amount || lot.currentBid || lot.startingPrice,
    };
    return found;
  });
  if (!found) return null;
  writeDatesAuctionLabLots(token, next);
  return found;
}

export function labAddBid(
  token: string,
  lotId: string,
  input: { name: string; phone: string; amount: number },
): { ok: true; lot: AuctionLot } | { ok: false; error: string; minNext?: number } {
  const lots = readDatesAuctionLabLots(token);
  const idx = lots.findIndex((lot) => lot.id === lotId);
  if (idx < 0) return { ok: false, error: 'الصندوق غير موجود' };
  const lot = lots[idx];
  if (lot.status !== 'open') return { ok: false, error: 'المزاد مغلق' };
  const minNext = auctionMinNextBid(lot);
  if (input.amount < minNext) return { ok: false, error: `أقل مزايدة مقبولة: ${minNext} ر.س`, minNext };
  const now = new Date().toISOString();
  const bid = {
    id: newAuctionBidId(),
    name: input.name.trim().slice(0, 40),
    phone: input.phone.trim().slice(0, 20),
    amount: Math.floor(input.amount),
    at: now,
  };
  const updated: AuctionLot = {
    ...lot,
    currentBid: bid.amount,
    bids: [bid, ...lot.bids].slice(0, 200),
  };
  const next = [...lots];
  next[idx] = updated;
  writeDatesAuctionLabLots(token, next);
  return { ok: true, lot: updated };
}
