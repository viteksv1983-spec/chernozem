/**
 * SeoHead — manages all <head> tags via direct DOM manipulation (useEffect).
 * No external provider needed — avoids react-helmet-async dual-instance issues.
 */

import { useEffect } from "react";
import { useContent } from "../contexts/ContentContext";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&family=Inter:wght@400;500;600;700&display=swap";

const FALLBACK_CANONICAL = "https://chernozem.com.ua/";
const GOOGLE_BUSINESS_URL = "https://www.google.com/maps/search/КиівЧорнозем+Перевальна+17+Київ";

// ── helpers ──────────────────────────────────────────────────────────────────

function setMeta(selector: string, attr: string, value: string) {
  if (!value) return;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrVal] = selector.replace("meta[", "").replace("]", "").split("=");
    el.setAttribute(attrName, attrVal.replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, attrs: Record<string, string>, id?: string) {
  const selector = id ? `link[data-seo-id="${id}"]` : `link[rel="${rel}"]`;
  let el = document.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    if (id) el.setAttribute("data-seo-id", id);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-seo-id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 0);
}

// ─────────────────────────────────────────────────────────────────────────────

export function SeoHead() {
  const { content } = useContent();
  const { seo, general } = content;

  const title       = seo.title       || `${general.companyName} — Чорнозем з доставкою по Києву`;
  const description = seo.description || "";
  const ogTitle     = seo.ogTitle     || title;
  const ogDesc      = seo.ogDescription || description;
  const canonical   = seo.canonicalUrl || FALLBACK_CANONICAL;
  const ogUrl       = seo.ogUrl       || canonical;
  const ogImage     = seo.ogImage     || "";

  useEffect(() => {
    // ── lang ──────────────────────────────────────────────────────────────
    document.documentElement.lang = "uk";

    // ── title ─────────────────────────────────────────────────────────────
    document.title = title;

    // ── basic meta ────────────────────────────────────────────────────────
    setMeta('meta[name="viewport"]',   "content", "width=device-width, initial-scale=1.0");
    setMeta('meta[name="theme-color"]',"content", "#111c14");
    setMeta('meta[name="color-scheme"]',"content","light");
    setMeta('meta[name="author"]',     "content", general.fopName || general.companyName);
    if (description) setMeta('meta[name="description"]', "content", description);
    if (seo.keywords) setMeta('meta[name="keywords"]',   "content", seo.keywords);
    setMeta('meta[name="robots"]',     "content", seo.robots || "index, follow");

    // ── fonts ─────────────────────────────────────────────────────────────
    // Font preconnect + stylesheet are injected at module-parse time by
    // /src/app/lib/critical.ts (before React renders).
    // We only add them here as a safety fallback if they weren't injected.
    if (!document.querySelector("[data-critical-injected]")) {
      setLink("preconnect", { rel: "preconnect", href: "https://fonts.googleapis.com" }, "fonts-preconnect");
      setLink("preconnect", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }, "fonts-gstatic");
      setLink("stylesheet", { rel: "stylesheet", href: GOOGLE_FONTS_URL }, "google-fonts");
    }

    // ── DNS prefetch ──────────────────────────────────────────────────────
    setLink("dns-prefetch", { rel: "dns-prefetch", href: "https://www.googletagmanager.com" }, "dns-gtm");
    setLink("dns-prefetch", { rel: "dns-prefetch", href: "https://www.google-analytics.com" }, "dns-ga");
    setLink("dns-prefetch", { rel: "dns-prefetch", href: "https://api.telegram.org" }, "dns-tg");

    // Hero image CDN — preconnect so TCP/TLS is open before first request.
    // critical.ts does this at parse time; this is the safety fallback.
    setLink("preconnect", { rel: "preconnect", href: "https://images.unsplash.com" }, "preconnect-unsplash");
    // Supabase storage — used for uploaded hero/truck images
    setLink("preconnect", { rel: "preconnect", href: "https://iimoqcdnnehpbqcnasou.supabase.co" }, "preconnect-supabase");

    // ── canonical & hreflang ──────────────────────────────────────────────
    setLink("canonical",  { rel: "canonical", href: canonical }, "canonical");
    setLink("alternate",  { rel: "alternate", hreflang: "uk-UA", href: canonical }, "hreflang-uk-ua");
    setLink("alternate",  { rel: "alternate", hreflang: "uk",    href: canonical }, "hreflang-uk");
    setLink("alternate",  { rel: "alternate", hreflang: "x-default", href: canonical }, "hreflang-xd");

    // ── Open Graph ────────────────────────────────────────────────────────
    setMeta('meta[property="og:type"]',      "content", "website");
    setMeta('meta[property="og:locale"]',    "content", "uk_UA");
    setMeta('meta[property="og:site_name"]', "content", general.companyName);
    setMeta('meta[property="og:title"]',     "content", ogTitle);
    if (ogDesc)  setMeta('meta[property="og:description"]', "content", ogDesc);
    if (ogUrl)   setMeta('meta[property="og:url"]',         "content", ogUrl);
    if (ogImage) {
      setMeta('meta[property="og:image"]',        "content", ogImage);
      setMeta('meta[property="og:image:width"]',  "content", "1200");
      setMeta('meta[property="og:image:height"]', "content", "630");
    }

    // ── Twitter Card ──────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        "content", ogImage ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]',       "content", ogTitle);
    if (ogDesc)  setMeta('meta[name="twitter:description"]', "content", ogDesc);
    if (ogImage) setMeta('meta[name="twitter:image"]',       "content", ogImage);

    // ── JSON-LD ───────────────────────────────────────────────────────────
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": canonical + "#business",
      name: general.companyName,
      description: description || "Чорнозем з доставкою по Києву та Київській області від виробника.",
      url: canonical,
      telephone: general.phoneRaw || general.phone,
      priceRange: seo.priceRange || "$$",
      sameAs: [GOOGLE_BUSINESS_URL],
      address: {
        "@type": "PostalAddress",
        streetAddress: general.address,
        addressLocality: "Київ",
        addressRegion: "Київська область",
        addressCountry: "UA",
      },
      ...(seo.geoLat && seo.geoLng
        ? { geo: { "@type": "GeoCoordinates", latitude: seo.geoLat, longitude: seo.geoLng } }
        : {}),
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          opens: "08:00",
          closes: "20:00",
        },
      ],
      areaServed: [
        { "@type": "City", name: "Київ" },
        { "@type": "AdministrativeArea", name: "Київська область" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Чорнозем",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: { "@type": "Product", name: "Чорнозем насипом", description: "Чорнозем без домішок, прямо від виробника" },
            price: String(content.pricing.bulkPricePerTon),
            priceCurrency: "UAH",
            unitCode: "TNE",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Product", name: "Чорнозем у мішках", description: `Мішок ${content.pricing.bagWeightKg} кг` },
            price: String(content.pricing.bagPrice),
            priceCurrency: "UAH",
            unitCode: "HGM",
            availability: "https://schema.org/InStock",
          },
        ],
      },
      ...(ogImage ? { image: ogImage } : {}),
    };

    setJsonLd("local-business", jsonLd);
  }, [title, description, ogTitle, ogDesc, canonical, ogUrl, ogImage,
      general.companyName, general.fopName, general.phone, general.phoneRaw,
      general.address, seo.keywords, seo.robots, seo.priceRange, seo.geoLat, seo.geoLng,
      content.pricing.bulkPricePerTon, content.pricing.bagPrice, content.pricing.bagWeightKg]);

  return null;
}