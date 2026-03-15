import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import {
  Factory,
  MapPin,
  ShieldCheck,
  Clock,
  Leaf,
  Zap,
  Truck,
  Package,
} from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

// Icon and color config stays fixed — maps by index
const BENEFIT_CONFIG = [
  { icon: Factory, color: "#1e4a35", bg: "#eaf4ef" },
  { icon: MapPin, color: "#2d6045", bg: "#eef7f2" },
  { icon: ShieldCheck, color: "#3a7a57", bg: "#f0f8f3" },
  { icon: Clock, color: "#7a5a30", bg: "#f7f2ea" },
  { icon: Leaf, color: "#4a7a3a", bg: "#f0f5ea" },
  { icon: Zap, color: "#2a6a55", bg: "#eaf4f0" },
  { icon: Truck, color: "#3a5a3a", bg: "#ecf4ec" },
  { icon: Package, color: "#7a5a28", bg: "#f7f0e4" },
];

/**
 * Motion variants that propagate from card → icon on hover.
 * The parent defines "hover", children with matching variant keys
 * automatically animate when the parent enters that state.
 */
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: "easeOut" },
  }),
  hover: {
    y: -6,
    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const iconWrapVariants = {
  hover: {
    scale: 1.14,
    rotate: 6,
    transition: { type: "spring", stiffness: 360, damping: 18 },
  },
};

// Animated counter hook
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// Individual stat cell with animated number
function AnimatedStat({ num, label, suffix = "" }: { num: number | null; label: string; suffix?: string; prefix?: string }) {
  const { count, ref } = useCountUp(num ?? 0);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: "34px",
          fontWeight: 800,
          color: "#8fe8b4",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {num !== null ? `${count}${suffix}` : "8–20"}
      </div>
      <div style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.3px" }}>
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
    <section id="benefits" style={{ background: "#f5efe4", padding: "96px 24px" }} className="benefits-section">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "64px", maxWidth: "600px" }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: "12px",
              fontWeight: 600,
              color: "#3a7a57",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            8 причин обрати нас
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#140c07",
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            Чому Київ купує чорнозем у нас
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "#5a4535", lineHeight: 1.65 }}>
            Ми не перепродаємо — ми виробляємо. Спеціалізуємося лише на
            чорноземі, працюємо з 2015 року. Перевірте нас особисто — склад у
            Києві відкритий для огляду.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {benefits.map((b, i) => {
            const cfg = BENEFIT_CONFIG[i % BENEFIT_CONFIG.length];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={b.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={cardVariants}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                  cursor: "default",
                }}
              >
                {/* Icon box animates in sync with parent hover */}
                <motion.div
                  variants={iconWrapVariants}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Icon size={24} color={cfg.color} strokeWidth={1.8} />
                </motion.div>
                <div>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#140c07",
                      marginBottom: "10px",
                      lineHeight: 1.25,
                    }}
                  >
                    {b.title}
                  </h3>
                  <p style={{ fontFamily: SANS, fontSize: "14px", color: "#6a5548", lineHeight: 1.65 }}>
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom stat strip with animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="benefits-stats"
          style={{
            marginTop: "56px",
            background: "linear-gradient(135deg, #1e1208 0%, #142010 100%)",
            borderRadius: "16px",
            padding: "36px 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {[
            { content: <AnimatedStat num={parseInt(general.foundedYear) || 2015} label="рік заснування" suffix="" /> },
            { content: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: "34px", fontWeight: 800, color: "#8fe8b4", lineHeight: 1, marginBottom: "8px" }}>
                  5–35т
                </div>
                <div style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.3px" }}>
                  вантажопідйомність самоскидів
                </div>
              </div>
            )},
            { content: <AnimatedStat num={350} label="доставок щомісяця" suffix="+" /> },
            { content: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: "34px", fontWeight: 800, color: "#8fe8b4", lineHeight: 1, marginBottom: "8px" }}>
                  до 24
                </div>
                <div style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.3px" }}>
                  годин — доставка
                </div>
              </div>
            )},
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "0 24px",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stat.content}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}