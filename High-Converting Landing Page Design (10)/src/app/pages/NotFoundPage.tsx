import { useEffect } from "react";
import { useNavigate } from "react-router";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Сторінку не знайдено | КиївЧорнозем";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    return () => {
      if (meta) meta.setAttribute("content", "index, follow");
    };
  }, []);

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0d1a0f 0%, #111c14 50%, #0a1209 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(126,232,178,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(126,232,178,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ textAlign: "center", maxWidth: "480px", position: "relative", zIndex: 1 }}>
          {/* 404 number */}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(80px, 20vw, 140px)",
              fontWeight: 800,
              color: "transparent",
              WebkitTextStroke: "2px rgba(126,232,178,0.25)",
              lineHeight: 1,
              marginBottom: "8px",
              letterSpacing: "-4px",
              userSelect: "none",
            }}
          >
            404
          </div>

          {/* Soil icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(126,232,178,0.08)",
              border: "1px solid rgba(126,232,178,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "28px",
            }}
          >
            🌱
          </div>

          <h1
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(22px, 5vw, 30px)",
              fontWeight: 700,
              color: "#f5f0e8",
              marginBottom: "14px",
              lineHeight: 1.3,
            }}
          >
            Сторінку не знайдено
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.48)",
              lineHeight: 1.7,
              marginBottom: "36px",
            }}
          >
            Можливо, посилання застаріло або адресу введено з помилкою.
            <br />
            Поверніться на сайт — ми допоможемо з доставкою чорнозему.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/site")}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #3a7a57, #2d6045)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: SANS,
                boxShadow: "0 4px 20px rgba(58,122,87,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(58,122,87,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(58,122,87,0.35)"; }}
            >
              На головну сторінку
            </button>

            <a
              href="tel:+380981116059"
              style={{
                padding: "14px 28px",
                background: "rgba(255,255,255,0.06)",
                color: "#7ee8b2",
                border: "1px solid rgba(126,232,178,0.2)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: SANS,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(126,232,178,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            >
              📞 Зателефонувати
            </a>
          </div>

          {/* Footer note */}
          <p style={{ marginTop: "40px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            КиївЧорнозем · chernozem.com.ua
          </p>
        </div>
      </div>
    </>
  );
}
