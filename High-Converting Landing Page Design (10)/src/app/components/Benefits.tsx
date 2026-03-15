import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import {
  Factory, MapPin, ShieldCheck, Clock, Leaf, Zap, Truck, Package,
} from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const BENEFIT_CONFIG = [
  { icon: Factory,     accent: "#2d6a48" },
  { icon: MapPin,      accent: "#3a6e55" },
  { icon: ShieldCheck, accent: "#4a7a5e" },
  { icon: Clock,       accent: "#7a6232" },
  { icon: Leaf,        accent: "#4a7a40" },
  { icon: Zap,         accent: "#2a7060" },
  { icon: Truck,       accent: "#3a603a" },
  { icon: Package,     accent: "#7a5e2a" },
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

        {/* ── Editorial header — 2 col ── */}
        <div
          className="benefits-header"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px", marginBottom: "80px", alignItems: "end" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px",
            }}>
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
              lineHeight: 1.72, marginBottom: "0",
              paddingBottom: "4px",
            }}
          >
            Ми не перепродаємо — ми виробляємо. Спеціалізуємося лише на чорноземі, працюємо з 2015 року. Перевірте нас особисто — склад у Києві відкритий для огляду.
          </motion.p>
        </div>

        {/* ── Benefits grid ── */}
        <div
          className="benefits-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px" }}
        >
          {benefits.map((b, i) => {
            const cfg = BENEFIT_CONFIG[i % BENEFIT_CONFIG.length];
            const Icon = cfg.icon;
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={b.title}
                custom={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
                className="benefit-card"
                style={{
                  background: "#ffffff",
                  padding: "36px 28px 32px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                  transition: "all 0.3s cubic-bezier(0.25,0.8,0.25,1)",
                  borderLeft: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#fafaf8";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = cfg.accent;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)";
                  const numEl = (e.currentTarget as HTMLDivElement).querySelector(".benefit-num") as HTMLElement;
                  if (numEl) numEl.style.opacity = "0.08";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#ffffff";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = "transparent";
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  const numEl = (e.currentTarget as HTMLDivElement).querySelector(".benefit-num") as HTMLElement;
                  if (numEl) numEl.style.opacity = "0.04";
                }}
              >
                {/* Decorative number watermark */}
                <div
                  className="benefit-num"
                  style={{
                    position: "absolute", top: "-8px", right: "-4px",
                    fontFamily: SERIF, fontSize: "80px", fontWeight: 800,
                    color: "#140c07", opacity: 0.04, lineHeight: 1,
                    userSelect: "none", pointerEvents: "none",
                    transition: "opacity 0.3s",
                  }}
                >
                  {num}
                </div>

                {/* Icon */}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  background: "#f0f7f3",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px",
                  transition: "background 0.25s",
                }}>
                  <Icon size={22} color={cfg.accent} strokeWidth={1.7} />
                </div>

                <h3 style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 700, color: "#140c07", marginBottom: "10px", lineHeight: 1.25 }}>
                  {b.title}
                </h3>
                <p style={{ fontFamily: SANS, fontSize: "13.5px", color: "#7a6658", lineHeight: 1.7, margin: 0 }}>
                  {b.desc}
                </p>
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
        @media (max-width: 1024px) {
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .benefits-section { padding: 72px 20px 80px !important; }
          .benefits-header { grid-template-columns: 1fr !important; gap: 16px !important; margin-bottom: 48px !important; }
          .benefits-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .benefit-card { padding: 28px 20px 24px !important; border-radius: 0 !important; border-left: none !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; }
          .benefit-card:first-child { border-radius: 16px 16px 0 0 !important; }
          .benefit-card:last-child { border-radius: 0 0 16px 16px !important; border-bottom: none !important; }
          .benefits-stats { grid-template-columns: repeat(2, 1fr) !important; padding: 28px 24px !important; row-gap: 28px !important; border-radius: 16px !important; }
          .benefits-stats > div { padding: 0 12px !important; }
          .benefits-stats > div:nth-child(3),
          .benefits-stats > div:nth-child(4) { border-top: 1px solid rgba(255,255,255,0.07) !important; padding-top: 28px !important; }
        }
        @media (max-width: 480px) {
          .benefits-section { padding: 60px 16px 80px !important; }
        }
      `}</style>
    </section>
  );
}