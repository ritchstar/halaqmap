/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مزاد علني حي — حقول عرض ومزايدة فقط، بلا تحصيل أو وساطة من المنصة.
 */
export type AuctionBid = {
  id: string;
  name: string;
  phone: string;
  amount: number;
  at: string;
};

export type AuctionLotStatus = 'draft' | 'open' | 'closed' | 'cancelled';

export type AuctionLot = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  photoSrcs: string[];
  videoUrl: string;
  startingPrice: number;
  minIncrement: number;
  status: AuctionLotStatus;
  currentBid: number;
  bids: AuctionBid[];
  winnerName: string;
  winnerPhone: string;
  createdAt: string;
  openedAt: string;
  closedAt: string;
};

export const DEFAULT_AUCTION_LOT: AuctionLot = {
  id: '',
  titleAr: '',
  descriptionAr: '',
  photoSrcs: [],
  videoUrl: '',
  startingPrice: 0,
  minIncrement: 10,
  status: 'draft',
  currentBid: 0,
  bids: [],
  winnerName: '',
  winnerPhone: '',
  createdAt: '',
  openedAt: '',
  closedAt: '',
};

export const SHOP_AUCTION_DISCLAIMER_AR =
  'صفحة المزاد أداة عرض ومزايدة فقط يوفرها متجر خريطة الحل. الاتفاق على إتمام البيع والتسليم والدفع بين ' +
  'النشاط والفائز بالمزاد مباشرة، دون أي وساطة أو مسؤولية من منصة خريطة الحل على تنفيذ الصفقة.';

const MAX_PHOTOS = 6;
const MAX_BIDS = 200;

export function clipAuctionVideoUrl(raw: unknown): string {
  const value = String(raw ?? '').trim().slice(0, 500);
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') return '';
    return value;
  } catch {
    return '';
  }
}

export function maskAuctionBidderName(name: string): string {
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return 'مزايد';
  const first = trimmed.split(/\s+/)[0] || trimmed;
  if (first.length <= 1) return `${first}***`;
  return `${first.slice(0, Math.min(4, first.length))} ***`;
}

export function auctionMinNextBid(lot: Pick<AuctionLot, 'currentBid' | 'startingPrice' | 'minIncrement'>): number {
  const base = lot.currentBid > 0 ? lot.currentBid : Math.max(0, lot.startingPrice);
  const step = Math.max(1, Math.floor(lot.minIncrement) || 1);
  return lot.currentBid > 0 ? base + step : Math.max(base, step > 0 ? base : step);
}

export function parseAuctionBid(raw: unknown): AuctionBid | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const amount = Number(row.amount);
  const name = String(row.name || '').trim().slice(0, 40);
  const phone = String(row.phone || '').trim().slice(0, 20);
  if (!Number.isFinite(amount) || amount <= 0 || name.length < 2 || phone.length < 9) return null;
  return {
    id: String(row.id || '').trim().slice(0, 40) || `b${Date.now().toString(36)}`,
    name,
    phone,
    amount: Math.floor(amount),
    at: String(row.at || new Date().toISOString()).slice(0, 40),
  };
}

function parseStatus(raw: unknown): AuctionLotStatus {
  const value = String(raw || '').trim();
  if (value === 'open' || value === 'closed' || value === 'cancelled' || value === 'draft') return value;
  return 'draft';
}

export function parseAuctionLot(
  raw: Record<string, unknown> | null | undefined,
  fallback: AuctionLot = DEFAULT_AUCTION_LOT,
): AuctionLot {
  const row = raw && typeof raw === 'object' ? raw : {};
  const startingPrice = Math.max(0, Math.floor(Number(row.startingPrice ?? fallback.startingPrice) || 0));
  const minIncrement = Math.max(1, Math.floor(Number(row.minIncrement ?? fallback.minIncrement) || 1));
  const bidsRaw = Array.isArray(row.bids) ? row.bids : fallback.bids;
  const bids = bidsRaw.map((item) => parseAuctionBid(item)).filter(Boolean).slice(0, MAX_BIDS) as AuctionBid[];
  const photos = Array.isArray(row.photoSrcs)
    ? row.photoSrcs.map((src) => String(src || '').trim().slice(0, 2_000_000)).filter(Boolean).slice(0, MAX_PHOTOS)
    : fallback.photoSrcs;
  let currentBid = Math.max(0, Math.floor(Number(row.currentBid ?? fallback.currentBid) || 0));
  if (bids.length && bids[0] && bids[0].amount > currentBid) currentBid = bids[0].amount;
  return {
    id: String(row.id || fallback.id || '').trim().slice(0, 40),
    titleAr: String(row.titleAr ?? fallback.titleAr ?? '').trim().slice(0, 80),
    descriptionAr: String(row.descriptionAr ?? fallback.descriptionAr ?? '').trim().slice(0, 600),
    photoSrcs: photos,
    videoUrl: clipAuctionVideoUrl(row.videoUrl ?? fallback.videoUrl),
    startingPrice,
    minIncrement,
    status: parseStatus(row.status ?? fallback.status),
    currentBid,
    bids,
    winnerName: String(row.winnerName ?? fallback.winnerName ?? '').trim().slice(0, 40),
    winnerPhone: String(row.winnerPhone ?? fallback.winnerPhone ?? '').trim().slice(0, 20),
    createdAt: String(row.createdAt || fallback.createdAt || '').slice(0, 40),
    openedAt: String(row.openedAt || fallback.openedAt || '').slice(0, 40),
    closedAt: String(row.closedAt || fallback.closedAt || '').slice(0, 40),
  };
}

export function publicAuctionLotView(lot: AuctionLot, viewerPhone = ''): Record<string, unknown> {
  const phoneNorm = viewerPhone.trim();
  const isWinner =
    lot.status === 'closed'
    && phoneNorm.length >= 9
    && lot.winnerPhone.trim() === phoneNorm;
  return {
    id: lot.id,
    titleAr: lot.titleAr,
    descriptionAr: lot.descriptionAr,
    photoSrcs: lot.photoSrcs,
    videoUrl: lot.videoUrl,
    startingPrice: lot.startingPrice,
    minIncrement: lot.minIncrement,
    status: lot.status,
    currentBid: lot.currentBid,
    bids: lot.bids.map((bid) => ({
      id: bid.id,
      name: maskAuctionBidderName(bid.name),
      amount: bid.amount,
      at: bid.at,
    })),
    winnerName: lot.status === 'closed' ? maskAuctionBidderName(lot.winnerName || '') : '',
    closedAt: lot.closedAt,
    openedAt: lot.openedAt,
    createdAt: lot.createdAt,
    isViewerWinner: isWinner,
    disclaimerAr: SHOP_AUCTION_DISCLAIMER_AR,
  };
}

export function deskAuctionLotView(lot: AuctionLot): AuctionLot {
  return { ...lot, bids: lot.bids.slice(0, MAX_BIDS) };
}

export function newAuctionLotId(): string {
  return `lot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newAuctionBidId(): string {
  return `bid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const STORE_DATES_AUCTION_TABLE = 'store_dates_auction_lots' as const;
