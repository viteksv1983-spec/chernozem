import { Phone, Calculator, Truck, MapPin, CreditCard, Factory, ChevronDown } from "lucide-react";
// ── soilImg (Unsplash fallback) REMOVED ──
// Was causing a 0.5s flash: Unsplash image rendered before Supabase content loaded.
// Now section has a dark soil-green CSS background → zero flash guarantee.
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useContent } from "../contexts/ContentContext";
import {
  getCachedHeroUrl,
  setCachedHeroUrl,
  clearCachedHeroUrl,
} from "../lib/heroImageCache";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

interface HeroProps {
  onOrder: () => void;
  onCalc:  () => void;
}

export function Hero({ onOrder, onCalc }: HeroProps) {
  const { content } = useContent();
  const { hero, general } = content;
  const bgRef = useRef<HTMLImageElement>(null);

  // ── Hero image URL ─────────────────────────────────────────────────────
  //
  // Hydration-safe: start with "" (matches SSR where no localStorage exists).
  // After hydration, useEffect applies cached URL from localStorage
  // (synchronous read), then content from Supabase when it arrives.
  //
  // critical.ts still injects <link rel="preload"> at module-parse time
  // from the same localStorage key, so the browser starts downloading
  // BEFORE React even renders. The image is already in flight when
  // setBgImage fires.
  const [bgImage, setBgImage] = useState<string>("");

  // After hydration: apply cached URL immediately, then sync with content
  useEffect(() => {
    const fromContent = hero.imageOverride || content.images.heroPhoto || "";
    const url = fromContent || getCachedHeroUrl() || "";
    if (url) {
      setBgImage(url);
      if (fromContent) setCachedHeroUrl(url);
    }
  }, [hero.imageOverride, content.images.heroPhoto]);

  const [imgLoaded, setImgLoaded] = useState(false);

  // ── Viewport detection ────────────────────────────────────────────────
  // Hydration-safe: start with false (matches SSR where window is undefined).
  // useEffect sets real values after hydration, before user can interact.
  const [isMobile, setIsMobile] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmall(window.innerWidth <= 480);
    };
    onResize(); // Apply real values immediately after hydration
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const headlineLine1  = hero.headlineLine1  || "Чорнозем з";
  const headlineAccent = hero.headlineAccent || "доставкою";
  const headlineLine2  = hero.headlineLine2  || "по Києву та області";
  const subheadline    = hero.subheadline    || "Прямо від виробника. Без посередників. ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО — 5 до 35 тонн на ваш об'єкт.";
  const ctaPrimary     = hero.ctaPrimary     || "Замовити чорнозем";
  const ctaSecondary   = hero.ctaSecondary   || "Розрахувати вартість";

  useEffect(() => {
    // Skip parallax on mobile — barely visible and wastes main-thread budget
    if (isMobile) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!bgRef.current) return;
        const offset = window.scrollY * 0.25;
        bgRef.current.style.transform = `scale(1.18) translateY(${offset}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, [isMobile]);

  const scrollToNext = () => {
    const el = document.getElementById("benefits");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        // Dark soil-green background — visible while real image loads.
        // Replaces the Unsplash fallback: no external request, no flash.
        background: "linear-gradient(145deg, #061009 0%, #0e2417 50%, #071410 100%)",
      }}
    >

      {/* ── Background photo — render ONLY when URL is available ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {bgImage && (
          <img
            ref={bgRef}
            src={bgImage}
            alt=""
            width="1080"
            height="720"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              // URL is stale or unreachable — clear the localStorage cache
              // so the next page load fetches a fresh URL from Supabase
              // instead of trying the same broken URL again.
              clearCachedHeroUrl();
              setImgLoaded(false);
            }}
            style={{
              position: "absolute",
              inset: "-10%",
              width: "120%",
              height: "120%",
              objectFit: "cover",
              objectPosition: "center",
              willChange: "transform",
              userSelect: "none",
              pointerEvents: "none",
              // Fade in only after image is decoded + painted → zero Unsplash flash
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.55s ease",
              filter: "brightness(1.08) contrast(1.15) saturate(1.08)",
              imageRendering: "high-quality" as React.CSSProperties["imageRendering"],
            }}
          />
        )}
      </div>

      {/* ── Gradient layers ── */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,12,6,0.75) 0%, rgba(4,12,6,0.10) 40%, transparent 65%)" }} />
      {/* Left-to-right content protection — pure 90deg, cinematic */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,30,15,0.95) 0%, rgba(5,30,15,0.75) 35%, rgba(5,30,15,0.2) 65%, rgba(0,0,0,0) 100%)" }} />
      {/* Depth layer — grass lighter top, soil darker bottom → 3D effect */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,230,0.05) 0%, transparent 28%, transparent 55%, rgba(2,6,3,0.42) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "320px", background: "linear-gradient(to top, rgba(4,12,6,0.90) 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 38%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "160px", opacity: 0.032, mixBlendMode: "overlay", pointerEvents: "none" }} />

      {/* ── Content ── */}
      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile
            ? (isSmall ? "92px 16px 0" : "104px 20px 0")
            : "140px 32px 0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "inline-flex", alignItems: "center",
            gap: isMobile ? "8px" : "10px",
            background: "rgba(14,48,28,0.52)",
            border: "1px solid rgba(143,232,180,0.32)",
            borderRadius: "100px",
            padding: isMobile ? "6px 14px" : "8px 20px",
            marginBottom: isMobile ? "20px" : "32px",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
            maxWidth: "calc(100% - 0px)",
            overflow: "hidden",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4fdb8c", boxShadow: "0 0 12px rgba(79,219,140,0.9), 0 0 24px rgba(79,219,140,0.4)", flexShrink: 0, animation: "livePulse 2.4s ease-in-out infinite", display: "inline-block" }} />
          <span style={{ fontFamily: SANS, fontSize: isMobile ? "11.5px" : "13px", fontWeight: 500, color: "#9ef0c0", letterSpacing: isMobile ? "0.3px" : "0.6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, maxWidth: "calc(100vw - 100px)" }}>
            {hero.badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: SERIF,
            fontSize: isMobile ? (isSmall ? "34px" : "38px") : "clamp(42px, 8vw, 90px)",
            fontWeight: 800,
            color: "#faf6f0",
            lineHeight: 1.06,
            letterSpacing: isMobile ? (isSmall ? "-1px" : "-1.4px") : "-2px",
            maxWidth: "100%",
            marginBottom: isMobile ? "16px" : "22px",
            textShadow: "0 2px 8px rgba(0,0,0,0.70), 0 8px 48px rgba(0,0,0,0.40)",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {headlineLine1}
          <br />
          <em style={{ fontStyle: "italic", color: "#5dd98e", textShadow: "0 0 48px rgba(63,174,108,0.45), 0 2px 8px rgba(0,0,0,0.60)" }}>
            {headlineAccent}
          </em>
          <br />
          {headlineLine2}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          style={{
            fontFamily: SANS,
            fontSize: isMobile ? (isSmall ? "14px" : "15px") : "clamp(15px, 1.9vw, 18px)",
            color: "rgba(250,246,240,0.80)",
            maxWidth: isMobile ? "100%" : "490px",
            lineHeight: 1.72,
            marginBottom: isMobile ? (isSmall ? "16px" : "20px") : "26px",
            textShadow: "0 1px 8px rgba(0,0,0,0.55)",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {subheadline}
        </motion.p>

        {/* ── Trust row ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.30 }}
          style={{
            display: "flex",
            flexWrap: "wrap" as const,
            alignItems: "center",
            gap: isMobile ? "6px 10px" : "6px 14px",
            marginBottom: isMobile ? (isSmall ? "20px" : "24px") : "32px",
          }}
        >
          {/* Stars + rating */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontFamily: SANS,
            fontSize: isMobile ? "13px" : "14px",
            color: "#f5c842",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textShadow: "0 1px 6px rgba(0,0,0,0.55)",
          }}>
            {"★★★★★"}
            <span style={{ color: "#d7e7df", fontWeight: 600 }}>4.9</span>
          </span>

          {/* Separator */}
          <span style={{ color: "rgba(215,231,223,0.30)", fontSize: "13px" }}>•</span>

          {/* Pill items */}
          {[
            "2 000+ клієнтів",
            "Працюємо з 2015",
            "Доставка за 24 години",
          ].map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontSize: isMobile ? "12.5px" : "13.5px",
                color: "#d7e7df",
                opacity: 0.88,
                fontWeight: 500,
                letterSpacing: "0.1px",
                textShadow: "0 1px 6px rgba(0,0,0,0.50)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {i > 0 && (
                <span style={{ color: "rgba(215,231,223,0.30)", marginRight: "2px" }}>•</span>
              )}
              {item}
            </span>
          ))}
        </motion.div>

        {/* CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          style={isMobile ? {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: isSmall ? "8px" : "10px",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: isSmall ? "28px" : "32px",
          } : {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "10px",
            alignItems: "center",
            marginBottom: "64px",
          }}
        >
          {/* Primary — full width on mobile */}
          <button
            onClick={onOrder}
            style={{
              ...(isMobile ? {
                gridColumn: "1 / -1",
                display: "flex",
                fontSize: isSmall ? "16px" : "17px",
                padding: isSmall ? "19px 20px" : "20px 16px",
                borderRadius: isSmall ? "14px" : "16px",
                boxSizing: "border-box" as const,
                width: "100%",
              } : {
                display: "inline-flex",
                fontSize: "16px",
                padding: "18px 36px",
              }),
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontFamily: SANS,
              fontWeight: 700,
              background: "linear-gradient(135deg, #41c784 0%, #27a358 100%)",
              color: "#fff",
              border: "none",
              borderRadius: isMobile ? (isSmall ? "14px" : "16px") : "14px",
              cursor: "pointer",
              transition: "all 0.24s cubic-bezier(0.34,1.56,0.64,1)",
              letterSpacing: "0.1px",
              boxShadow: "0 10px 40px rgba(80,220,140,0.35), 0 4px 16px rgba(36,137,77,0.40), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 18px 52px rgba(80,220,140,0.52), 0 6px 24px rgba(36,137,77,0.45), inset 0 1px 0 rgba(255,255,255,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 10px 40px rgba(80,220,140,0.35), 0 4px 16px rgba(36,137,77,0.40), inset 0 1px 0 rgba(255,255,255,0.22)"; }}
            className="hero-cta-primary"
          >
            <Truck size={16} strokeWidth={2} />
            <span>{ctaPrimary}</span>
            <span className="cta-arrow" style={{ display: "inline-block", willChange: "transform" }}>→</span>
          </button>

          {/* Secondary */}
          <button
            onClick={onCalc}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? "5px" : "10px",
              flexDirection: isMobile ? "column" : "row",
              fontFamily: SANS,
              fontSize: isMobile ? "11px" : "15px",
              fontWeight: 500,
              background: "rgba(255,248,240,0.08)",
              color: "rgba(255,248,240,0.88)",
              border: "1.5px solid rgba(255,248,240,0.22)",
              borderRadius: isMobile ? (isSmall ? "12px" : "13px") : "14px",
              cursor: "pointer",
              transition: "all 0.22s ease",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: isMobile ? "12px 8px" : "14px 28px",
              height: isMobile ? (isSmall ? "60px" : "64px") : "auto",
              boxSizing: "border-box" as const,
              minWidth: 0,
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,248,240,0.16)"; e.currentTarget.style.borderColor = "rgba(255,248,240,0.42)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,248,240,0.08)"; e.currentTarget.style.borderColor = "rgba(255,248,240,0.22)"; e.currentTarget.style.transform = ""; }}
          >
            <Calculator size={16} strokeWidth={1.8} />
            <span style={{
              fontSize: isMobile ? "11px" : "15px",
              lineHeight: isMobile ? "1.25" : "1",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "normal" : "nowrap",
              maxWidth: "100%",
            }}>{ctaSecondary}</span>
          </button>

          {/* Phone */}
          <a
            href={`tel:${general.phoneRaw}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? "5px" : "9px",
              flexDirection: isMobile ? "column" : "row",
              fontFamily: SANS,
              fontSize: isMobile ? "11px" : "15px",
              fontWeight: 500,
              color: "rgba(255,248,240,0.82)",
              textDecoration: "none",
              background: "rgba(255,248,240,0.06)",
              border: "1.5px solid rgba(255,248,240,0.20)",
              borderRadius: isMobile ? (isSmall ? "12px" : "13px") : "14px",
              transition: "all 0.22s ease",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: isMobile ? "12px 8px" : "14px 28px",
              height: isMobile ? (isSmall ? "60px" : "64px") : "auto",
              boxSizing: "border-box" as const,
              minWidth: 0,
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,248,240,0.13)"; e.currentTarget.style.borderColor = "rgba(255,248,240,0.38)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,248,240,0.06)"; e.currentTarget.style.borderColor = "rgba(255,248,240,0.20)"; e.currentTarget.style.transform = ""; }}
          >
            <Phone size={14} color="#4fdb8c" strokeWidth={2} />
            <span style={{
              fontSize: isMobile ? "11px" : "15px",
              lineHeight: isMobile ? "1.25" : "1",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "normal" : "nowrap",
              maxWidth: "100%",
            }}>{general.phone}</span>
          </a>

        </motion.div>
      </div>

      {/* ── Trust Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.5 }}
        style={{ position: "relative", zIndex: 2, width: "100%", marginTop: "auto" }}
      >
        <div className="hero-trust-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(4,12,6,0.72)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
          <div
            className="hero-trust-strip"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", display: "flex" }}
          >
            {[
              { icon: Factory,    title: "Виробник",      desc: "прямі поставки" },
              { icon: Truck,      title: "Доставка",      desc: "сьогодні або завтра" },
              { icon: CreditCard, title: "Оплата",        desc: "після вивантаження" },
              { icon: MapPin,     title: "Склад у Києві", desc: "можна приїхати" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="hero-trust-item"
                  style={{
                    flex: 1, display: "flex", alignItems: "center", gap: "14px",
                    padding: "22px 0", paddingLeft: i === 0 ? 0 : "28px", paddingRight: "28px",
                    borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    transition: "opacity 0.2s", cursor: "default",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <div className="hero-trust-icon" style={{
                    width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                    background: "rgba(63,174,108,0.14)", border: "1px solid rgba(95,214,143,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color="#7ee8ac" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: "4px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(200,240,218,0.58)", lineHeight: 1 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile-only "Learn more" button */}
          <div className="hero-learn-more" style={{ display: "none" }}>
            <button
              onClick={scrollToNext}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontFamily: SANS, fontSize: "13px", fontWeight: 600,
                color: "rgba(200,240,218,0.75)", letterSpacing: "1.8px",
                textTransform: "uppercase", background: "none", border: "none",
                cursor: "pointer", padding: "16px 20px 20px",
                width: "100%", justifyContent: "center",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Дізнатися більше
              <ChevronDown size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator — desktop only */}
      <button
        onClick={scrollToNext}
        className="hero-scroll-indicator"
        aria-label="Прокрутити до наступної секції"
        style={{
          position: "absolute", bottom: "108px", right: "40px",
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          zIndex: 3,
          animation: "heroBounce 2.8s ease-in-out infinite",
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: "9px", color: "rgba(255,248,240,0.38)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
          Далі
        </span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, rgba(255,248,240,0.38), rgba(255,248,240,0))" }} />
      </button>

      <style>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0px); opacity: 0.8; }
          50%       { transform: translateY(8px); opacity: 0.4; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(79,219,140,0.9), 0 0 24px rgba(79,219,140,0.4); }
          50%       { opacity: 0.55; box-shadow: 0 0 6px rgba(79,219,140,0.5), 0 0 12px rgba(79,219,140,0.2); }
        }

        /* ── Desktop default: flex row ── */
        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
        }
        .hero-cta-primary,
        .hero-cta-secondary,
        .hero-cta-phone {
          padding: 17px 24px;
        }
        .hero-cta-primary { padding: 18px 36px; }

        /* ── Arrow animation on primary CTA ── */
        .hero-cta-primary .cta-arrow {
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hero-cta-primary:hover .cta-arrow {
          transform: translateX(5px);
        }

        /* ─────────────────────────────────────────
           MOBILE  ≤ 768px
        ───────────────────────────────────────── */
        @media (max-width: 768px) {

          /* Content padding */
          .hero-content { padding: 104px 20px 0 !important; }

          /* ── Badge: compact pill ── */
          .hero-badge {
            padding: 6px 14px !important;
            margin-bottom: 20px !important;
            max-width: calc(100vw - 40px) !important;
            gap: 8px !important;
          }
          .hero-badge-text {
            font-size: 11.5px !important;
            letter-spacing: 0.3px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: calc(100vw - 96px) !important;
          }

          /* ── Headline ── */
          .hero-headline {
            font-size: 38px !important;
            letter-spacing: -1.4px !important;
            line-height: 1.07 !important;
            margin-bottom: 16px !important;
            max-width: 100% !important;
          }

          /* ── Sub ── */
          .hero-sub {
            font-size: 15px !important;
            max-width: 100% !important;
            line-height: 1.68 !important;
            margin-bottom: 28px !important;
          }

          /* ── CTA Row: CSS Grid (no flex conflicts) ── */
          .hero-cta-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            margin-bottom: 32px !important;
          }
          .hero-cta-primary {
            grid-column: 1 / -1 !important;
            box-sizing: border-box !important;
            justify-content: center !important;
            font-size: 17px !important;
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .hero-cta-secondary,
          .hero-cta-phone {
            box-sizing: border-box !important;
            min-width: 0 !important;
            padding: 12px 8px !important;
            border-radius: 13px !important;
            justify-content: center !important;
            align-items: center !important;
            flex-direction: column !important;
            gap: 5px !important;
            height: 64px !important;
          }
          .hero-cta-secondary .hero-btn-label,
          .hero-cta-phone .hero-btn-label {
            font-size: 11px !important;
            line-height: 1.25 !important;
            text-align: center !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: 100% !important;
          }

          /* Trust strip: 2 × 2 dark cards */
          .hero-trust-wrap {
            background: rgba(4,12,6,0.88) !important;
            border-top: 1px solid rgba(255,255,255,0.07) !important;
          }
          .hero-trust-strip {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 9px !important;
            padding: 14px 16px 0 !important;
            max-width: 100% !important;
          }
          .hero-trust-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
            border-left: none !important;
            padding: 15px 14px !important;
            background: rgba(255,255,255,0.055) !important;
            border: 1px solid rgba(255,255,255,0.09) !important;
            border-radius: 14px !important;
          }
          .hero-trust-icon { width: 36px !important; height: 36px !important; }
          .hero-learn-more { display: block !important; }
          .hero-scroll-indicator { display: none !important; }
        }

        /* ─────────────────────────────────────────
           SMALL PHONE  ≤ 480px
        ───────────────────────────────────────── */
        @media (max-width: 480px) {
          .hero-content { padding: 92px 16px 0 !important; }

          .hero-badge { padding: 5px 13px !important; margin-bottom: 18px !important; }
          .hero-badge-text {
            font-size: 11px !important;
            max-width: calc(100vw - 82px) !important;
          }

          .hero-headline {
            font-size: 34px !important;
            letter-spacing: -1px !important;
            margin-bottom: 14px !important;
          }
          .hero-sub { font-size: 14px !important; margin-bottom: 22px !important; }

          .hero-cta-row { gap: 8px !important; margin-bottom: 28px !important; }
          .hero-cta-primary { font-size: 16px !important; padding: 19px 20px !important; border-radius: 14px !important; }
          .hero-cta-secondary, .hero-cta-phone { height: 60px !important; border-radius: 12px !important; }

          .hero-trust-strip { padding: 12px 14px 0 !important; gap: 8px !important; }
          .hero-trust-item { padding: 13px 12px !important; border-radius: 12px !important; gap: 9px !important; }
          .hero-trust-icon { width: 34px !important; height: 34px !important; }
        }

        /* ─────────────────────────────────────────
           EXTRA SMALL  ≤ 390px  (iPhone SE etc.)
        ───────────────────────────────────────── */
        @media (max-width: 390px) {
          .hero-content { padding: 88px 14px 0 !important; }
          .hero-headline { font-size: 30px !important; letter-spacing: -0.8px !important; }
          .hero-sub { font-size: 13.5px !important; }
          .hero-badge-text { max-width: calc(100vw - 78px) !important; }
        }
      `}</style>
    </section>
  );
}