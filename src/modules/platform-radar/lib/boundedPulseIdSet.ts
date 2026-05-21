/**
 * BoundedPulseIdSet — memory-safe replacement for `Set<string>` used to dedupe
 * incoming radar pulses. Caps both by entry count and by age, so a 24/7 session
 * cannot leak the heap as pulse IDs accumulate.
 */
export type BoundedPulseIdSetOptions = {
  /** Max distinct IDs retained. Older entries are evicted FIFO. */
  maxEntries?: number;
  /** Max age in milliseconds. Entries older than this are evicted on next touch. */
  maxAgeMs?: number;
};

const DEFAULT_MAX_ENTRIES = 1500;
const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000;

export class BoundedPulseIdSet {
  private readonly maxEntries: number;
  private readonly maxAgeMs: number;
  private readonly store = new Map<string, number>();

  constructor(opts?: BoundedPulseIdSetOptions) {
    this.maxEntries = Math.max(64, opts?.maxEntries ?? DEFAULT_MAX_ENTRIES);
    this.maxAgeMs = Math.max(60_000, opts?.maxAgeMs ?? DEFAULT_MAX_AGE_MS);
  }

  has(id: string): boolean {
    const ts = this.store.get(id);
    if (ts == null) return false;
    if (Date.now() - ts > this.maxAgeMs) {
      this.store.delete(id);
      return false;
    }
    return true;
  }

  add(id: string): void {
    if (this.store.has(id)) {
      this.store.delete(id);
    }
    this.store.set(id, Date.now());

    if (this.store.size > this.maxEntries) {
      const evictCount = this.store.size - this.maxEntries;
      let i = 0;
      for (const key of this.store.keys()) {
        if (i >= evictCount) break;
        this.store.delete(key);
        i += 1;
      }
    }
  }

  /** Manually expire stale entries. Safe to call from a low-frequency interval. */
  sweep(): number {
    const cutoff = Date.now() - this.maxAgeMs;
    let removed = 0;
    for (const [key, ts] of this.store) {
      if (ts < cutoff) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}
