import { motion } from "motion/react";
import { MessageSquare, ClipboardList, Truck, CreditCard, ArrowRight } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const STEP_ICONS = [MessageSquare, ClipboardList, Truck, CreditCard];

const STEP_ACCENT = [
  "rgba(63,174,108,1)",
  "rgba(63,174,108,0.85)",
  "rgba(63,174,108,0.7)",
  "rgba(63,174,108,0.6)",
];

interface HowItWorksProps {
  onOrder: () => void;
}

export function HowItWorks({ onOrder }: HowItWorksProps) {
  const { content } = useContent();
  const steps = content.howItWorks;

  return (
    <section
      id="how-it-works"
      className="howitworks-section"
      style={{ background: "#0c1810", padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      {/* Ambient top glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "1000px", height: "600px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(47,140,80,0.09) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Ambient bottom glow */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px",
        background: "radial-gradient(ellipse at 50% 100%, rgba(47,140,80,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
            <div style={{ width: "24px", height: "1px", background: "rgba(143,232,180,0.35)" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "rgba(143,232,180,0.6)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Всього 4 прості кроки
            </span>
            <div style={{ width: "24px", height: "1px", background: "rgba(143,232,180,0.35)" }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(30px, 4.5vw, 50px)",
            fontWeight: 800, color: "#ffffff",
            letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: "18px",
          }}>
            Як це працює
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "rgba(255,255,255,0.45)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.65 }}>
            Від дзвінка до готової ділянки — швидко, чітко, без зайвих питань
          </p>
        </motion.div>

        {/* ══════════════════════════════════════
            DESKTOP / TABLET: horizontal 4-col
            ══════════════════════════════════════ */}
        <div className="steps-desktop">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", position: "relative" }}>

            {/* Horizontal connector rail */}
            <div className="steps-connector" style={{
              position: "absolute",
              top: "27px",
              left: "calc(12.5% + 27px)",
              right: "calc(12.5% + 27px)",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(63,174,108,0.2) 8%, rgba(63,174,108,0.2) 92%, transparent)",
              zIndex: 0,
            }} />

            {/* Arrow chevrons between steps */}
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="steps-arrow" style={{
                position: "absolute",
                top: "18px",
                left: `calc(${25 * (idx + 1)}% - 9px)`,
                zIndex: 1,
                pointerEvents: "none",
              }}>
                <ArrowRight size={14} color="rgba(63,174,108,0.32)" strokeWidth={1.5} />
              </div>
            ))}

            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? MessageSquare;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.11, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="step-card"
                  style={{ padding: "0 32px", position: "relative", zIndex: 1, cursor: "default" }}
                >
                  {/* Step number node */}
                  <div
                    className="step-node"
                    style={{
                      width: "54px", height: "54px", borderRadius: "50%",
                      border: `1.5px solid ${STEP_ACCENT[i]}`,
                      background: `rgba(63,174,108,${0.06 + i * 0.015})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "36px",
                      boxShadow: `0 0 0 6px rgba(63,174,108,0.04), 0 0 20px rgba(63,174,108,0.12)`,
                      transition: "box-shadow 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 9px rgba(63,174,108,0.07), 0 0 32px rgba(63,174,108,0.24)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 6px rgba(63,174,108,0.04), 0 0 20px rgba(63,174,108,0.12)`;
                    }}
                  >
                    <span style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 800, color: STEP_ACCENT[i], lineHeight: 1 }}>
                      {step.num}
                    </span>
                  </div>

                  {/* Icon */}
                  <div style={{ marginBottom: "16px" }}>
                    <Icon size={22} color={`rgba(143,232,180,${0.52 - i * 0.06})`} strokeWidth={1.4} />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 700, color: "#ffffff", marginBottom: "12px", lineHeight: 1.22 }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.50)", lineHeight: 1.75, marginBottom: "24px" }}>
                    {step.desc}
                  </p>

                  {/* Note pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    background: "rgba(63,174,108,0.09)",
                    border: "1px solid rgba(63,174,108,0.18)",
                    borderRadius: "100px",
                    padding: "5px 12px 5px 8px",
                  }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: STEP_ACCENT[i], flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: "11.5px", fontWeight: 600, color: `rgba(143,232,180,${0.75 - i * 0.05})`, letterSpacing: "0.2px" }}>
                      {step.note}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE: vertical timeline rail
            ══════════════════════════════════════ */}
        <div className="steps-mobile">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? MessageSquare;
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                style={{ display: "flex", gap: "20px", alignItems: "stretch" }}
              >
                {/* Left: number node + vertical rail */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "40px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: `1.5px solid ${STEP_ACCENT[i]}`,
                    background: "rgba(63,174,108,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 0 0 4px rgba(63,174,108,0.05), 0 0 16px rgba(63,174,108,0.1)`,
                  }}>
                    <span style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 800, color: STEP_ACCENT[i], lineHeight: 1 }}>
                      {step.num}
                    </span>
                  </div>
                  {!isLast && (
                    <div style={{
                      width: "1px", flex: 1, minHeight: "20px",
                      marginTop: "6px", marginBottom: "6px",
                      background: "linear-gradient(180deg, rgba(63,174,108,0.28) 0%, rgba(63,174,108,0.05) 100%)",
                    }} />
                  )}
                </div>

                {/* Right: content */}
                <div style={{ flex: 1, paddingBottom: isLast ? "0" : "40px", paddingTop: "1px" }}>
                  {/* Icon */}
                  <div style={{ marginBottom: "10px" }}>
                    <Icon size={19} color={`rgba(143,232,180,${0.52 - i * 0.05})`} strokeWidth={1.4} />
                  </div>
                  {/* Title */}
                  <h3 style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", lineHeight: 1.25 }}>
                    {step.title}
                  </h3>
                  {/* Description */}
                  <p style={{ fontFamily: SANS, fontSize: "13.5px", color: "rgba(255,255,255,0.50)", lineHeight: 1.72, marginBottom: "14px" }}>
                    {step.desc}
                  </p>
                  {/* Note pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    background: "rgba(63,174,108,0.09)",
                    border: "1px solid rgba(63,174,108,0.18)",
                    borderRadius: "100px",
                    padding: "4px 11px 4px 7px",
                  }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: STEP_ACCENT[i], flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, color: "rgba(143,232,180,0.7)", letterSpacing: "0.2px" }}>
                      {step.note}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            textAlign: "center", marginTop: "80px",
            paddingTop: "56px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p style={{ fontFamily: SANS, fontSize: "16px", color: "rgba(255,255,255,0.42)", marginBottom: "28px" }}>
            Все просто. Залиште заявку прямо зараз — і ґрунт буде вже завтра.
          </p>
          <motion.button
            onClick={onOrder}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            style={{
              fontFamily: SANS, fontSize: "15px", fontWeight: 700,
              background: "linear-gradient(135deg, #3FAE6C 0%, #2d7a50 100%)",
              color: "#ffffff", border: "none", borderRadius: "12px",
              padding: "16px 52px", cursor: "pointer",
              boxShadow: "0 6px 28px rgba(58,122,87,0.50)",
              letterSpacing: "0.2px",
            }}
          >
            Розпочати замовлення
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        /* ── Desktop layout (default) ──────────── */
        .steps-desktop { display: block; }
        .steps-mobile  { display: none;  }

        .step-card:first-child { padding-left: 0 !important; }
        .step-card:last-child  { padding-right: 0 !important; }

        /* ── Tablet: 2×2 grid ──────────────────── */
        @media (max-width: 900px) {
          .howitworks-section { padding: 80px 24px 96px !important; }
          .steps-desktop > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .step-card {
            padding: 0 24px 52px !important;
          }
          .step-card:first-child,
          .step-card:nth-child(3) { padding-left: 0 !important; }
          .step-card:nth-child(2),
          .step-card:last-child   { padding-right: 0 !important; }
          /* Hide horizontal connector on 2-col (misaligned) */
          .steps-connector,
          .steps-arrow { display: none !important; }
        }

        /* ── Mobile: vertical timeline ─────────── */
        @media (max-width: 600px) {
          .howitworks-section { padding: 64px 20px 80px !important; }
          .steps-desktop { display: none !important; }
          .steps-mobile  { display: block !important; }
        }

        @media (max-width: 480px) {
          .howitworks-section { padding: 56px 16px 72px !important; }
        }
      `}</style>
    </section>
  );
}
