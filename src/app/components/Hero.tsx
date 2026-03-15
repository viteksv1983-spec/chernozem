import { ArrowDown, Phone, Calculator, Truck, MapPin, CreditCard, Factory } from "lucide-react";
const soilImg = "https://images.unsplash.com/photo-1665933642170-74eda3608318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
import { useEffect, useRef } from "react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

interface HeroProps {
  onOrder: () => void;
  onCalc:  () => void;
}

export function Hero({ onOrder, onCalc }: HeroProps) {
  const { content } = useContent();
  const { hero, general } = content;
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!bgRef.current) return;
        const offset = window.scrollY * 0.28;
        bgRef.current.style.transform = `scale(1.35) translateY(${offset}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToNext = () => {
    const el = document.getElementById("benefits");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const trustCards = [
    { icon: Factory,   title: "Виробник",     desc: "прямі поставки" },
    { icon: Truck,     title: "Доставка",     desc: "сьогодні або завтра" },
    { icon: CreditCard,title: "Оплата",       desc: "після вивантаження" },
    { icon: MapPin,    title: "Склад у Києві",desc: "можна приїхати" },
  ];

  const bgImage = (hero.imageOverride || content.images.heroPhoto) || soilImg;

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* ─── LAYER 1 — Background photo with parallax ────────────────────── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          ref={bgRef}
          style={{
            position: "absolute",
            inset: "-18%",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            transform: "scale(1.35)",
            filter: "contrast(1.05) saturate(1.04) brightness(0.92)",
            willChange: "transform",
          }}
        />
      </div>

      {/* ─── LAYER 2 — Film grain overlay ───────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.028,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* ─── LAYER 3 — Top-to-mid readability gradient ───────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,18,10,0.62) 0%, rgba(5,18,10,0.38) 45%, rgba(5,18,10,0.08) 100%)",
        }}
      />

      {/* ─── LAYER 4 — Left anchor vignette ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(5,18,10,0.68) 0%, rgba(5,18,10,0.28) 48%, rgba(5,18,10,0.00) 75%)",
        }}
      />

      {/* ─── LAYER 5 — Corner vignette (cinematic depth) ─────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 42%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ─── LAYER 6 — Bottom fade into next section ─────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to top, rgba(5,18,10,0.55) 0%, transparent 100%)",
        }}
      />

      {/* ─── CONTENT ─────────────────────────────────────────────────────── */}
      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "128px 24px 96px",
          width: "100%",
        }}
      >
        {/* ── Badge ── */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            background: "rgba(20, 65, 42, 0.45)",
            border: "1px solid rgba(143, 232, 180, 0.42)",
            borderRadius: "100px",
            padding: "7px 18px",
            marginBottom: "32px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.20)",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#5fd68f",
              boxShadow: "0 0 10px rgba(95,214,143,0.90), 0 0 20px rgba(95,214,143,0.40)",
              flexShrink: 0,
              animation: "livePulse 2.2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: SANS,
              fontSize: "13px",
              fontWeight: 500,
              color: "#b0f0cc",
              letterSpacing: "0.5px",
            }}
          >
            {hero.badge}
          </span>
        </div>

        {/* ── Headline ── */}
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(40px, 7.5vw, 80px)",
            fontWeight: 800,
            color: "#fff8f0",
            lineHeight: 1.07,
            letterSpacing: "-1.8px",
            maxWidth: "840px",
            marginBottom: "24px",
            textShadow:
              "0 2px 6px rgba(0,0,0,0.80), 0 6px 40px rgba(0,0,0,0.50), 0 0 120px rgba(30,90,55,0.20)",
          }}
        >
          {hero.headlineLine1}
          <br />
          <em
            style={{
              fontStyle: "italic",
              color: "#72db98",
              textShadow:
                "0 2px 8px rgba(0,0,0,0.70), 0 0 40px rgba(63,174,108,0.35)",
            }}
          >
            {hero.headlineAccent}
          </em>
          <br />
          {hero.headlineLine2}
        </h1>

        {/* ── Subheadline ── */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: "clamp(16px, 2.2vw, 19px)",
            color: "rgba(255, 248, 240, 0.92)",
            maxWidth: "520px",
            lineHeight: 1.72,
            marginBottom: "44px",
            textShadow: "0 1px 8px rgba(0,0,0,0.60), 0 2px 24px rgba(0,0,0,0.30)",
          }}
        >
          {hero.subheadline}
        </p>

        {/* ── CTA Buttons ── */}
        <div
          className="hero-cta-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "52px",
            alignItems: "center",
          }}
        >
          {/* PRIMARY CTA */}
          <button
            onClick={onOrder}
            className="hero-cta-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              fontFamily: SANS,
              fontSize: "16px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #3FAE6C 0%, #2a9158 100%)",
              color: "#fff",
              border: "1px solid rgba(143,232,180,0.22)",
              borderRadius: "12px",
              padding: "18px 40px",
              cursor: "pointer",
              transition: "all 0.22s ease",
              letterSpacing: "0.15px",
              boxShadow:
                "0 6px 24px rgba(63,174,108,0.42), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #50c87e 0%, #3FAE6C 100%)";
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 12px 36px rgba(47,155,90,0.55), inset 0 1px 0 rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #3FAE6C 0%, #2a9158 100%)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(63,174,108,0.42), inset 0 1px 0 rgba(255,255,255,0.18)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(-1px) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            }}
          >
            <Phone size={17} strokeWidth={2.2} />
            {hero.ctaPrimary}
          </button>

          {/* SECONDARY CTA */}
          <button
            onClick={onCalc}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontFamily: SANS,
              fontSize: "15px",
              fontWeight: 500,
              background: "rgba(255,248,240,0.09)",
              color: "rgba(255,248,240,0.90)",
              border: "1.5px solid rgba(255,248,240,0.26)",
              borderRadius: "12px",
              padding: "17px 26px",
              cursor: "pointer",
              transition: "all 0.22s ease",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,248,240,0.18)";
              e.currentTarget.style.borderColor = "rgba(255,248,240,0.50)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,248,240,0.09)";
              e.currentTarget.style.borderColor = "rgba(255,248,240,0.26)";
              e.currentTarget.style.color = "rgba(255,248,240,0.90)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
            }}
          >
            <Calculator size={16} />
            {hero.ctaSecondary}
          </button>

          {/* PHONE */}
          <a
            href={`tel:${general.phoneRaw}`}
            className="hero-phone-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: SANS,
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(255,248,240,0.72)",
              textDecoration: "none",
              background: "transparent",
              border: "1.5px solid rgba(255,248,240,0.16)",
              borderRadius: "12px",
              padding: "17px 22px",
              cursor: "pointer",
              transition: "all 0.22s ease",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,248,240,0.10)";
              e.currentTarget.style.borderColor = "rgba(255,248,240,0.35)";
              e.currentTarget.style.color = "rgba(255,248,240,0.95)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255,248,240,0.16)";
              e.currentTarget.style.color = "rgba(255,248,240,0.72)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Phone size={14} color="#5fd68f" strokeWidth={2.2} />
            {general.phone}
          </a>
        </div>

        {/* ── Trust cards ── */}
        <div
          className="hero-trust-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            maxWidth: "680px",
          }}
        >
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                style={{
                  background: "rgba(3,14,8,0.75)",
                  border: "1px solid rgba(143,232,180,0.28)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.38), inset 0 1px 0 rgba(143,232,180,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  cursor: "default",
                  transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05) translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.52)";
                  e.currentTarget.style.borderColor = "rgba(143,232,180,0.50)";
                  e.currentTarget.style.background = "rgba(8,26,15,0.92)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.38)";
                  e.currentTarget.style.borderColor = "rgba(143,232,180,0.28)";
                  e.currentTarget.style.background = "rgba(3,14,8,0.75)";
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(63,174,108,0.22)",
                    border: "1px solid rgba(95,214,143,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color="#8fe8b4" strokeWidth={1.9} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.2,
                      marginBottom: "4px",
                      textShadow: "0 1px 4px rgba(0,0,0,0.60)",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: "11px",
                      color: "rgba(200,240,218,0.72)",
                      lineHeight: 1.35,
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Scroll indicator ─────────────────────────────────────────────── */}
      <button
        onClick={scrollToNext}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          zIndex: 2,
          animation: "heroBounce 2.6s ease-in-out infinite",
          opacity: 1,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: "10px",
            color: "rgba(255,248,240,0.50)",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Дізнатися більше
        </span>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,248,240,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,248,240,0.05)",
            backdropFilter: "blur(6px)",
          }}
        >
          <ArrowDown size={16} color="rgba(255,248,240,0.60)" />
        </div>
      </button>

      <style>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateX(-50%) translateY(0px);  opacity: 1;    }
          50%       { transform: translateX(-50%) translateY(9px);  opacity: 0.75; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(95,214,143,0.90), 0 0 20px rgba(95,214,143,0.40); }
          50%       { opacity: 0.65; box-shadow: 0 0 6px rgba(95,214,143,0.50), 0 0 14px rgba(95,214,143,0.20); }
        }
        @media (max-width: 640px) {
          .hero-content { padding: 100px 20px 72px !important; }
          .hero-trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-cta-primary { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .hero-content { padding: 88px 16px 64px !important; }
          .hero-trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}