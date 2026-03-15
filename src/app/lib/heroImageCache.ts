/**
 * heroImageCache.ts — Hero image URL cache (localStorage, synchronous).
 *
 * ── Why localStorage, not IndexedDB? ──────────────────────────────────────────
 * IndexedDB reads are asynchronous — we cannot use them in critical.ts, which
 * executes at module-parse time (before React, before any async code runs).
 * localStorage reads are SYNCHRONOUS, so critical.ts can inject a
 * <link rel="preload"> for the hero image BEFORE React even initialises.
 * The stored value is a small URL string (~80–120 chars), well within
 * the localStorage 5MB limit.
 *
 * ── TTL ───────────────────────────────────────────────────────────────────────
 * 7 days. The hero image URL is a 10-year Supabase signed URL — it doesn't
 * change unless the admin uploads a new photo. If the admin uploads a new
 * photo the UI fetches the new URL from Supabase, updates the cache, and
 * the next page load picks up the new URL immediately.
 *
 * ── Cache invalidation ────────────────────────────────────────────────────────
 * • New URL from Supabase → setCachedHeroUrl(newUrl) → overwrites old entry.
 * • Expired TTL (>7 days) → getCachedHeroUrl() removes the entry, returns null.
 * • Image fails to load   → Hero.tsx calls clearCachedHeroUrl() to bust the cache.
 */

/** localStorage key — must match the literal used in critical.ts */
export const HERO_CACHE_KEY = 'cz_hero_v1' as const;

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface HeroEntry {
  url: string;
  ts:  number; // Date.now() at time of caching
}

/**
 * Synchronously read the cached hero image URL.
 * Returns null if the cache is empty, malformed, or expired.
 */
export function getCachedHeroUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HERO_CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw) as HeroEntry;
    if (!entry?.url || typeof entry.url !== 'string') {
      localStorage.removeItem(HERO_CACHE_KEY);
      return null;
    }
    if (Date.now() - (entry.ts ?? 0) > TTL_MS) {
      localStorage.removeItem(HERO_CACHE_KEY);
      return null;
    }
    return entry.url;
  } catch {
    return null;
  }
}

/**
 * Persist the hero image URL.
 * Call this every time a URL arrives from Supabase — it refreshes the TTL.
 */
export function setCachedHeroUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  try {
    const entry: HeroEntry = { url, ts: Date.now() };
    localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // QuotaExceededError or restricted storage (private browsing) — non-fatal
  }
}

/**
 * Remove the cached URL.
 * Call on image load error so a stale/expired Supabase URL doesn't block
 * the next page load from fetching a fresh URL.
 */
export function clearCachedHeroUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HERO_CACHE_KEY);
  } catch { /* non-fatal */ }
}
