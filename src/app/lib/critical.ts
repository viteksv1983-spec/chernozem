/**
 * critical.ts — runs at module-parse time, BEFORE React renders.
 *
 * Why this matters:
 *  • In a React SPA, <head> tags set by useEffect fire AFTER hydration
 *    (~300-600ms on mobile). That's 300-600ms of lost LCP time.
 *  • By injecting preconnect + preload here, the browser begins
 *    network requests BEFORE React even starts rendering.
 *
 * Preconnect strategy (max 3 — Lighthouse warns at 4+):
 *  1. fonts.googleapis.com  — CSS for Google Fonts (needed for preload trick)
 *  2. fonts.gstatic.com     — actual font files (crossorigin required)
 *  3. Supabase project      — hero image URL + all CMS content come from here
 *
 * Removed: preconnect to images.unsplash.com
 *   → Hero.tsx no longer uses Unsplash fallback (replaced by CSS gradient).
 *   → Unsplash images in other sections load below-the-fold → dns-prefetch is enough.
 *
 * Removed: preload for hero image
 *   → Hero image URL is stored in Supabase (dynamic, unknown at parse time).
 *   → Cannot preload a URL we don't know at build time.
 *   → Supabase preconnect below ensures the TCP/TLS handshake is already open
 *     when React fetches content and starts loading the hero image.
 */

// ── Fonts ──────────────────────────────────────────────────────────────────
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&family=Inter:wght@400;500;600;700&display=swap";

const MARKER = "data-critical-injected";

if (typeof document !== "undefined" && !document.querySelector(`[${MARKER}]`)) {
  const head = document.head;

  /** Create a <link> element and stamp it with the critical marker */
  const mk = (attrs: Record<string, string>): HTMLLinkElement => {
    const el = document.createElement("link");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.setAttribute(MARKER, "1");
    return el;
  };

  // ── 1. Font origins: preconnect ──────────────────────────────────────────
  // Opens TCP+TLS handshake to Google Fonts servers immediately.
  // Saves ~150-300ms on first font request on mobile.
  head.appendChild(mk({ rel: "preconnect", href: "https://fonts.googleapis.com" }));
  head.appendChild(mk({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }));

  // ── 2. Font CSS: preload → then non-blocking stylesheet ──────────────────
  // Preload queues the CSS file at high priority in the browser's fetch queue.
  // The stylesheet is loaded via media="print" trick — avoids render-blocking.
  head.appendChild(mk({ rel: "preload", as: "style", href: FONTS_URL }));
  const sheet = mk({ rel: "stylesheet", href: FONTS_URL, media: "print" });
  sheet.addEventListener("load", () => { sheet.media = "all"; });
  head.appendChild(sheet);

  // ── 3. Supabase origin: preconnect ────────────────────────────────────────
  // Hero image URL + all CMS content (pricing, text, etc.) come from Supabase.
  // Preconnect here opens TCP+TLS BEFORE React fetches content → hero image
  // starts loading sooner → LCP improvement ~100-200ms on mobile.
  head.appendChild(mk({ rel: "preconnect", href: "https://iimoqcdnnehpbqcnasou.supabase.co" }));
}

export {};