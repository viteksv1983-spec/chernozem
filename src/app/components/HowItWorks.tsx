import { motion } from "motion/react";
import { MessageSquare, ClipboardList, Truck, CreditCard } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const STEP_ICONS = [MessageSquare, ClipboardList, Truck, CreditCard];

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
      style={{ background: "#0f1a11", padding: "120px 32px", position: "relative", overflow: "hidden" }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "400px", background: "radial-gradient(ellipse, rgba(47,140,80,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: "88px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "1px", background: "rgba(143,232,180,0.4)" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "rgba(143,232,180,0.7)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Всього 4 прості кроки
            </span>
            <div style={{ width: "28px", height: "1px", background: "rgba(143,232,180,0.4)" }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(30px, 4.5vw, 48px)",
            fontWeight: 800, color: "#ffffff",
            letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "18px",
          }}>
            Як це працює
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "rgba(255,255,255,0.52)", maxWidth: "460px", margin: "0 auto", lineHeight: 1.65 }}>
            Від дзвінка до готової ділянки — швидко, чітко, без зайвих питань
          </p>
        </motion.div>

        {/* Steps */}
        <div
          className="steps-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", position: "relative" }}
        >
          {/* Connector line */}
          <div
            className="steps-connector"
            style={{
              position: "absolute", top: "52px", left: "calc(12.5% + 24px)", right: "calc(12.5% + 24px)",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(63,174,108,0.25) 10%, rgba(63,174,108,0.25) 90%, transparent)",
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? MessageSquare;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                style={{
                  padding: "40px 28px 36px",
                  position: "relative", zIndex: 1,
                  borderRadius: "0",
                  cursor: "default",
                  transition: "background 0.28s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* Step indicator */}
                <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "0" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    border: "1px solid rgba(63,174,108,0.35)",
                    background: "rgba(63,174,108,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    position: "relative", zIndex: 2,
                  }}>
                    <span style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 800, color: "#3FAE6C", lineHeight: 1 }}>
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Icon */}
                <div style={{ marginBottom: "18px" }}>
                  <Icon size={22} color="rgba(143,232,180,0.38)" strokeWidth={1.4} />
                </div>

                <h3 style={{
                  fontFamily: SERIF, fontSize: "19px", fontWeight: 700,
                  color: "#ffffff", marginBottom: "12px", lineHeight: 1.25,
                }}>
                  {step.title}
                </h3>

                <p style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.72, marginBottom: "20px" }}>
                  {step.desc}
                </p>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  paddingTop: "16px",
                  width: "100%",
                }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4fdb8c", flexShrink: 0 }} />
                  <span style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(143,232,180,0.65)", fontWeight: 500 }}>
                    {step.note}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ textAlign: "center", marginTop: "72px", paddingTop: "56px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ fontFamily: SANS, fontSize: "16px", color: "rgba(255,255,255,0.50)", marginBottom: "28px", letterSpacing: "0.1px" }}>
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
        @media (max-width: 900px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-connector { display: none !important; }
        }
        @media (max-width: 768px) {
          .howitworks-section { padding: 72px 20px 100px !important; }
        }
        @media (max-width: 540px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .howitworks-section { padding: 60px 16px 100px !important; }
        }
      `}</style>
    </section>
  );
}