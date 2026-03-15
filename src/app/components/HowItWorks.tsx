import { motion } from "motion/react";
import { MessageSquare, ClipboardList, Truck, CreditCard } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

// Icon map by step index
const STEP_ICONS = [MessageSquare, ClipboardList, Truck, CreditCard];

const stepCardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" },
  }),
  hover: {
    y: -6,
    background: "rgba(255,255,255,0.055)",
    borderColor: "rgba(143,232,180,0.22)",
    boxShadow: "0 16px 56px rgba(0,0,0,0.30), 0 0 0 1px rgba(143,232,180,0.10)",
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

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
      style={{
        background: "#140c07",
        padding: "96px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background: solid dark colour — no external HTTP request */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#140c07",
          opacity: 0.06,
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "72px" }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: "12px",
              fontWeight: 600,
              color: "#8fe8b4",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Всього 4 прості кроки
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            Як це працює
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "17px",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Від дзвінка до готової ділянки — швидко, чітко, без зайвих питань
          </p>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            position: "relative",
          }}
        >
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? MessageSquare;
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={stepCardVariants}
                style={{
                  padding: "36px 28px 32px",
                  position: "relative",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  cursor: "default",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="hidden md:block"
                    style={{
                      position: "absolute",
                      top: "48px",
                      right: "-13px",
                      width: "26px",
                      height: "1px",
                      background: "rgba(143,232,180,0.18)",
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Top row: step number + icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "28px",
                  }}
                >
                  {/* Step number — primary anchor */}
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: "38px",
                      fontWeight: 800,
                      color: "#3FAE6C",
                      lineHeight: 1,
                      letterSpacing: "-1px",
                    }}
                  >
                    {step.num}
                  </div>

                  {/* Icon — secondary, no box */}
                  <Icon
                    size={22}
                    color="rgba(143,232,180,0.45)"
                    strokeWidth={1.5}
                  />
                </div>

                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: "12px",
                    lineHeight: 1.25,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.7,
                    marginBottom: "24px",
                    flex: 1,
                  }}
                >
                  {step.desc}
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(58, 122, 87, 0.15)",
                    borderRadius: "100px",
                    padding: "5px 12px",
                    alignSelf: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#8fe8b4",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: "12px",
                      color: "#8fe8b4",
                      fontWeight: 500,
                    }}
                  >
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
          style={{
            textAlign: "center",
            marginTop: "60px",
            paddingTop: "48px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              fontFamily: SANS,
              fontSize: "17px",
              color: "rgba(255,255,255,0.65)",
              marginBottom: "24px",
            }}
          >
            Все просто. Залиште заявку прямо зараз — і ґрунт буде вже завтра.
          </p>
          <motion.button
            onClick={onOrder}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="howitworks-cta-btn"
            style={{
              fontFamily: SANS,
              fontSize: "16px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #3FAE6C 0%, #2d7a50 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "16px 48px",
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(58,122,87,0.45)",
              letterSpacing: "0.2px",
            }}
          >
            Розпочати замовлення
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}