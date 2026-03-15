import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import {
  Factory, MapPin, ShieldCheck, Clock, Leaf, Zap, Truck, Package,
} from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const BENEFIT_CONFIG = [
  { icon: Factory,     accent: "#2d6a48", bg: "#eaf3ee" },
  { icon: MapPin,      accent: "#3a6e55", bg: "#ecf4f0" },
  { icon: ShieldCheck, accent: "#4a7a5e", bg: "#edf4f1" },
  { icon: Clock,       accent: "#7a6232", bg: "#f5f0e8" },
  { icon: Leaf,        accent: "#4a7a40", bg: "#edf4ea" },
  { icon: Zap,         accent: "#2a7060", bg: "#e8f3f1" },
  { icon: Truck,       accent: "#3a603a", bg: "#ebf2eb" },
  { icon: Package,     accent: "#7a5e2a", bg: "#f4efe6" },
];

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

function AnimatedStat({ num, label, suffix = "" }: { num: number | null; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(num ?? 0);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#8fe8b4", lineHeight: 1, marginBottom: "8px" }}>
        {num !== null ? `${count}${suffix}` : "8–20"}
      </div>
      <div style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

export function Benefits() {
  const { content } = useContent();
  const benefits = content.benefits;
  const { general } = content;

  return (
    <section id="benefits" style={{ background: "#f7f2eb", padding: "112px 32px" }} className="benefits-section">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Editorial header ── */}
        <div
          className="benefits-header"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px", marginBottom: "64px", alignItems: "end" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
              <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "#3a7a57", letterSpacing: "2.5px", textTransform: "uppercase" }}>
                8 причин обрати нас
              </span>
            </div>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: "clamp(30px, 4.5vw, 48px)",
              fontWeight: 800,
              color: "#140c07",
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}>
              Чому Київ купує чорнозем у нас
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            style={{
              fontFamily: SANS, fontSize: "17px", color: "#6a5545",
              lineHeight: 1.72, margin: 0, paddingBottom: "4px",
            }}
          >
            Ми не перепродаємо — ми виробляємо. Спеціалізуємося лише на чорноземі, працюємо з 2015 року. Перевірте нас особисто — склад у Києві відкритий для огляду.
          </motion.p>
        </div>

        {/* ── Benefits grid — border-separator style ── */}
        <div
          className="benefits-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "1px solid rgba(0,0,0,0.08)",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
          }}
        >
          {benefits.map((b, i) => {
            const cfg = BENEFIT_CONFIG[i % BENEFIT_CONFIG.length];
            const Icon = cfg.icon;
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={b.title}
                custom={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="benefit-card"
                style={{
                  padding: "32px 28px 30px",
                  position: "relative",
                  cursor: "default",
                  transition: "background 0.22s ease",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  borderRight: "1px solid rgba(0,0,0,0.08)",
                  background: "#ffffff",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#fafaf8";
                  const iconWrap = (e.currentTarget as HTMLDivElement).querySelector(".b-icon-wrap") as HTMLElement;
                  if (iconWrap) { iconWrap.style.background = cfg.bg; iconWrap.style.transform = "scale(1.07)"; }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#ffffff";
                  const iconWrap = (e.currentTarget as HTMLDivElement).querySelector(".b-icon-wrap") as HTMLElement;
                  if (iconWrap) { iconWrap.style.background = "#f4f6f4"; iconWrap.style.transform = "scale(1)"; }
                }}
              >
                {/* ── Header row: number (left) · icon (right) ── */}
                <div className="b-header">
                  <span className="b-num">{num}</span>
                  <div
                    className="b-icon-wrap benefit-icon-wrap"
                    style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "#f4f6f4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.22s ease, transform 0.22s ease",
                    }}
                  >
                    <Icon size={19} color={cfg.accent} strokeWidth={1.65} />
                  </div>
                </div>

                {/* ── Body: title + desc ── */}
                <div className="b-body">
                  <h3 className="b-title">{b.title}</h3>
                  <p className="b-desc">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Stat strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="benefits-stats"
          style={{
            marginTop: "48px",
            background: "linear-gradient(135deg, #111d13 0%, #0d160e 100%)",
            borderRadius: "20px",
            padding: "40px 56px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            boxShadow: "0 12px 48px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { content: <AnimatedStat num={parseInt(general.foundedYear) || 2015} label="рік заснування" /> },
            { content: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#8fe8b4", lineHeight: 1, marginBottom: "8px" }}>5–35т</div>
                <div style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", textTransform: "uppercase" }}>вантажопідйомність</div>
              </div>
            )},
            { content: <AnimatedStat num={350} label="доставок щомісяця" suffix="+" /> },
            { content: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#8fe8b4", lineHeight: 1, marginBottom: "8px" }}>до 24</div>
                <div style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", textTransform: "uppercase" }}>годин — доставка</div>
              </div>
            )},
          ].map((stat, i) => (
            <div key={i} style={{ padding: "0 32px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stat.content}
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        /* ── Card structure (shared) ────────────────────── */
        .b-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .b-num {
          font-family: ${SANS};
          font-size: 11px;
          font-weight: 700;
          color: #140c07;
          opacity: 0.22;
          letter-spacing: 1px;
        }
        .b-title {
          font-family: ${SERIF};
          font-size: 16.5px;
          font-weight: 700;
          color: #140c07;
          margin-bottom: 10px;
          line-height: 1.25;
        }
        .b-desc {
          font-family: ${SANS};
          font-size: 13px;
          color: #7a6658;
          line-height: 1.72;
          margin: 0;
        }

        /* ── Tablet: 2-column grid ──────────────────────── */
        @media (max-width: 768px) {
          .benefits-section { padding: 72px 20px 80px !important; }
          .benefits-header { grid-template-columns: 1fr !important; gap: 16px !important; margin-bottom: 40px !important; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; border-radius: 14px !important; }
          .benefit-card { padding: 24px 20px 22px !important; }
          .b-title { font-size: 15px !important; margin-bottom: 8px !important; }
          .b-desc  { font-size: 12.5px !important; }
        }

        /* ── Mobile: horizontal card layout ────────────── */
        @media (max-width: 600px) {
          .benefits-section { padding: 60px 16px 72px !important; }
          .benefits-grid {
            grid-template-columns: 1fr !important;
            border-radius: 14px !important;
          }
          /* Card flips to horizontal: icon left, text right */
          .benefit-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 14px !important;
            padding: 20px 18px !important;
          }
          /* Header becomes a standalone icon column */
          .b-header {
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            margin-bottom: 0 !important;
            flex-shrink: 0 !important;
            gap: 0 !important;
            padding-top: 1px;
          }
          /* Number hidden — too tight on horizontal layout */
          .b-num { display: none !important; }
          /* Icon container: same size, just no top margin needed */
          .b-icon-wrap {
            width: 40px !important;
            height: 40px !important;
          }
          /* Text fills remaining width */
          .b-body {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .b-title {
            font-size: 14.5px !important;
            margin-bottom: 6px !important;
            line-height: 1.3 !important;
          }
          .b-desc {
            font-size: 12.5px !important;
            line-height: 1.65 !important;
            color: #8a7468 !important;
          }
        }

        /* ── Stats strip responsive ─────────────────────── */
        @media (max-width: 768px) {
          .benefits-stats { 
            grid-template-columns: repeat(2, 1fr) !important; 
            padding: 28px 20px !important; 
            row-gap: 28px !important; 
            border-radius: 16px !important; 
          }
          .benefits-stats > div { padding: 0 16px !important; }
          .benefits-stats > div:nth-child(3),
          .benefits-stats > div:nth-child(4) { 
            border-top: 1px solid rgba(255,255,255,0.07) !important; 
            border-left: none !important;
            padding-top: 28px !important; 
          }
          .benefits-stats > div:nth-child(2) { border-left: 1px solid rgba(255,255,255,0.07) !important; }
          .benefits-stats > div:nth-child(4) { border-left: 1px solid rgba(255,255,255,0.07) !important; }
        }
        @media (max-width: 480px) {
          .benefits-stats { padding: 24px 16px !important; row-gap: 24px !important; border-radius: 14px !important; }
          .benefits-stats > div { padding: 0 10px !important; }
        }
      `}</style>
    </section>
  );
}
