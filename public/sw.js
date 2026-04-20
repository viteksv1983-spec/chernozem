/**
 * sw.js — КиївЧорнозем Service Worker
 *
 * Replaces vite-plugin-pwa (which used a private-registry package not available
 * on the public npm used by GitHub Actions CI).
 *
 * Strategy:
 *  • CacheFirst for /chernozem/assets/*.js and *.css
 *    — these files have content hashes in their names (e.g. landingSections-a1b2c3d4.js)
 *    — hash changes when content changes → old cache entry is never stale
 *    — bypasses GitHub Pages Cache-Control: max-age=600 limitation
 *
 *  • CacheFirst (7 days) for Unsplash + Supabase images
 *
 *  • CacheFirst (1 year) for Google Fonts (truly immutable)
 *
 *  • NetworkFirst for HTML navigation → always get fresh index.html,
 *    fallback to cache if offline
 *
 *  • Admin route (/chernozem/admin) → always NetworkFirst, never cached
 *    (keeps admin panel fresh after every deploy)
 */

const ASSETS_CACHE  = 'chernozem-assets-v3';
const FONTS_CACHE   = 'chernozem-fonts-v3';
const IMAGES_CACHE  = 'chernozem-images-v3';
const HTML_CACHE    = 'chernozem-html-v3';

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;
const YEAR   = 365 * DAY;

// ── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', () => {
  // Skip the waiting phase — activate immediately on new deploys
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Evict caches from previous versions
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![ASSETS_CACHE, FONTS_CACHE, IMAGES_CACHE, HTML_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // ── /chernozem/assets/* — hashed JS & CSS (CacheFirst, 1 year) ──────────
  if (url.pathname.startsWith('/chernozem/assets/')) {
    e.respondWith(cacheFirst(request, ASSETS_CACHE, YEAR));
    return;
  }

  // ── Google Fonts — truly immutable (CacheFirst, 1 year) ─────────────────
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url.href)) {
    e.respondWith(cacheFirst(request, FONTS_CACHE, YEAR));
    return;
  }

  // ── Images: Unsplash + Supabase Storage (CacheFirst, 7 days) ────────────
  if (
    /^https:\/\/images\.unsplash\.com\//.test(url.href) ||
    /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\//.test(url.href)
  ) {
    e.respondWith(cacheFirst(request, IMAGES_CACHE, 7 * DAY));
    return;
  }

  // ── Admin route — always fresh from network ──────────────────────────────
  if (url.pathname.startsWith('/chernozem/admin')) return;

  // ── HTML navigation — NetworkFirst with offline fallback ─────────────────
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          // Cache the fresh HTML response for offline fallback
          const copy = res.clone();
          caches.open(HTML_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/chernozem/index.html')
          )
        )
    );
    return;
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * CacheFirst with TTL (seconds).
 * For content-hashed assets (JS/CSS) we never set sw-cached-at — they're
 * effectively immortal (URL changes when content changes).
 * For images/fonts we stamp the response so we can detect stale entries.
 */
async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const stamp = cached.headers.get('sw-cached-at');
    // No stamp = content-hashed asset OR opaque response → always fresh
    if (!stamp) return cached;
    // Stamped CORS entry — check age
    const ageSeconds = (Date.now() - Number(stamp)) / 1000;
    if (ageSeconds < maxAgeSeconds) return cached;
    // Stale — fall through to network
  }

  try {
    const response = await fetch(request);

    if (response.type === 'opaque') {
      // ── Opaque response (cross-origin image without crossorigin attribute) ──
      // response.status === 0 for opaque responses.
      // new Response(body, { status: 0 }) throws RangeError (must be 200–599).
      // Solution: cache the opaque response as-is — NO header stamping.
      // Without the 'sw-cached-at' stamp, subsequent cache hits return early
      // via `if (!stamp) return cached` above → treated as always-fresh.
      // This is safe: Supabase signed URLs are 10-year tokens; Unsplash URLs
      // are stable CDN links. Cache will be cleared only when SW version bumps.
      cache.put(request, response.clone());

    } else if (response.ok) {
      const isHashedAsset = /^\/chernozem\/assets\//.test(new URL(request.url).pathname);
      if (isHashedAsset) {
        // Content-hashed JS/CSS: no stamp needed, URL changes when content changes
        cache.put(request, response.clone());
      } else {
        // CORS images/fonts: stamp with timestamp for TTL-based eviction
        const headers = new Headers(response.headers);
        headers.set('sw-cached-at', String(Date.now()));
        const stamped = new Response(await response.clone().arrayBuffer(), {
          status:     response.status,
          statusText: response.statusText,
          headers,
        });
        cache.put(request, stamped);
      }
    }

    return response;
  } catch {
    // Offline: return stale entry if available
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}