/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنظيم تذكرة الطلب: جديدة ثم استلام ثم أرشفة على الخادم والجهاز.
 */
import {
  STORE_DESK_ORDER_ARCHIVE_CAP,
  STORE_DESK_ORDER_LIVE_CAP,
  type StoreDeskOrderTicketPhase,
} from '@/config/storeDeskOrderTicket';

export type StoreDeskTicketBase = {
  id: string;
  ticketNo?: number;
  seen?: boolean;
  phase?: StoreDeskOrderTicketPhase | string;
  receivedAt?: string;
  doneAt?: string;
};

export function applyDeskFinish<T extends StoreDeskTicketBase>(
  orders: T[],
  archive: T[],
  id: string,
  filePrefix: string,
): { orders: T[]; orderArchive: T[] } {
  if (archive.length >= STORE_DESK_ORDER_ARCHIVE_CAP) {
    downloadDeskTicketsFile(archive, `${filePrefix}-archive.json`);
  }
  const result = finishDeskTicket(orders, archive, id);
  if (result.finished) {
    downloadDeskTicketsFile([result.finished], `${filePrefix}-ticket-${result.finished.ticketNo || result.finished.id}.json`);
  }
  return { orders: result.orders, orderArchive: result.orderArchive };
}

export function deskOrderPhase(order: StoreDeskTicketBase): StoreDeskOrderTicketPhase {
  if (order.phase === 'received' || order.phase === 'done' || order.phase === 'new') return order.phase;
  return order.seen === true ? 'received' : 'new';
}

export function isLiveDeskTicket(order: StoreDeskTicketBase): boolean {
  return deskOrderPhase(order) !== 'done';
}

export function pickOrderList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export function hydrateDeskTickets<T extends StoreDeskTicketBase>(
  ordersRaw: unknown,
  archiveRaw: unknown,
): { orders: T[]; orderArchive: T[] } {
  const incoming = pickOrderList<T>(ordersRaw);
  const archived = pickOrderList<T>(archiveRaw);
  const archiveIds = new Set(archived.map((item) => item.id).filter(Boolean));
  const live: T[] = [];
  const extraDone: T[] = [];
  for (const item of incoming) {
    if (!item?.id) continue;
    if (deskOrderPhase(item) === 'done' || archiveIds.has(item.id)) {
      extraDone.push({ ...item, phase: 'done', seen: true, doneAt: item.doneAt || new Date().toISOString() });
      continue;
    }
    live.push({ ...item, phase: deskOrderPhase(item) });
  }
  const mergedArchive = [...extraDone, ...archived]
    .filter((item, index, all) => item.id && all.findIndex((row) => row.id === item.id) === index)
    .slice(0, STORE_DESK_ORDER_ARCHIVE_CAP);
  return { orders: live.slice(0, STORE_DESK_ORDER_LIVE_CAP), orderArchive: mergedArchive };
}

export function receiveDeskTicket<T extends StoreDeskTicketBase>(orders: T[], id: string): T[] {
  const at = new Date().toISOString();
  return orders.map((item) =>
    item.id === id ? { ...item, phase: 'received', seen: true, receivedAt: item.receivedAt || at } : item,
  );
}

export function finishDeskTicket<T extends StoreDeskTicketBase>(
  orders: T[],
  archive: T[],
  id: string,
): { orders: T[]; orderArchive: T[]; finished: T | null; trimmed: boolean } {
  const found = orders.find((item) => item.id === id) || archive.find((item) => item.id === id) || null;
  if (!found) return { orders, orderArchive: archive, finished: null, trimmed: false };
  const done = { ...found, phase: 'done' as const, seen: true, doneAt: found.doneAt || new Date().toISOString() };
  const live = orders.filter((item) => item.id !== id);
  const without = archive.filter((item) => item.id !== id);
  const nextArchive = [done, ...without];
  const trimmed = nextArchive.length > STORE_DESK_ORDER_ARCHIVE_CAP;
  return {
    orders: live,
    orderArchive: nextArchive.slice(0, STORE_DESK_ORDER_ARCHIVE_CAP),
    finished: done,
    trimmed,
  };
}

export function downloadDeskTicketsFile(tickets: unknown[], filename: string): void {
  if (typeof window === 'undefined' || tickets.length === 0) return;
  const blob = new Blob([JSON.stringify({ at: new Date().toISOString(), tickets }, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function mergeLiveOrdersOnPoll<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const localIds = new Set(local.map((item) => item.id).filter(Boolean));
  const fresh = remote.filter((item) => item.id && !localIds.has(item.id));
  return [...fresh, ...local].slice(0, STORE_DESK_ORDER_LIVE_CAP);
}
