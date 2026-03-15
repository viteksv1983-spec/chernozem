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
 * Hero image preload (repeat visits only):
 *  On the very first visit the hero URL is unknown at parse time — we can't
 *  preload it. But after the first visit, Hero.tsx caches the URL in
 *  localStorage (key: 'cz_hero_v1'). On every subsequent visit, critical.ts
 *  reads that key synchronously and injects a <link rel="preload"> HERE,
 *  before React initialises. The browser starts downloading the hero image
 *  in parallel with the JS bundle — eliminating the 300-600ms Supabase
 *  fetch delay from the LCP path.
 *
 *  Timeline without preload:
 *    HTML → JS parse → React mount → ContentContext fetch (~400ms) → <img>
 *
 *  Timeline with preload (cached URL):
 *    HTML → critical.ts → <link preload> injected → download starts
 *                          (in parallel) → React mount → Hero reads cache
 *                          → <img> already loading or loaded
 */

// ── Fonts ──────────────────────────────────────────────────────────────────
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&family=Inter:wght@400;500;600;700&display=swap";

const MARKER = "data-critical-injected";

// localStorage key — must stay in sync with heroImageCache.ts
const HERO_KEY = "cz_hero_v1";
const HERO_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  head.appendChild(mk({ rel: "preconnect", href: "https://fonts.googleapis.com" }));
  head.appendChild(mk({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }));

  // ── 2. Font CSS: preload → then non-blocking stylesheet ──────────────────
  head.appendChild(mk({ rel: "preload", as: "style", href: FONTS_URL }));
  const sheet = mk({ rel: "stylesheet", href: FONTS_URL, media: "print" });
  sheet.addEventListener("load", () => { sheet.media = "all"; });
  head.appendChild(sheet);

  // ── 3. Supabase origin: preconnect ────────────────────────────────────────
  head.appendChild(mk({ rel: "preconnect", href: "https://iimoqcdnnehpbqcnasou.supabase.co" }));

  // ── 4. Hero image: preload from localStorage cache ───────────────────────
  // Read the cached hero URL synchronously — zero async cost.
  // If valid, inject <link rel="preload"> so the browser downloads the hero
  // image BEFORE React even initialises (parallel to the JS bundle download).
  // This converts a ~400ms sequential delay into a parallel download → LCP ↓.
  //
  // We duplicate the localStorage read here (instead of importing
  // heroImageCache.ts) because critical.ts is the first module to execute —
  // at this point other modules may not yet be parsed by the JS engine.
  (() => {
    try {
      const raw = localStorage.getItem(HERO_KEY);
      if (!raw) return;
      const entry = JSON.parse(raw) as { url?: string; ts?: number };
      if (
        !entry?.url ||
        typeof entry.url !== "string" ||
        Date.now() - (entry.ts ?? 0) > HERO_TTL
      ) return;
      head.appendChild(mk({
        rel: "preload",
        as: "image",
        href: entry.url,
        fetchpriority: "high",
      }));
    } catch { /* non-fatal */ }
  })();
}

export {};