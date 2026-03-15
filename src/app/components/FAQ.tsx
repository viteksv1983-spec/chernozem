import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Phone } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import type { FaqItem } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

export function FAQ() {
  const { content } = useContent();
  const faqs = content.faq;
  const { general } = content;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="faq-section"
      style={{
        background: "linear-gradient(180deg, #f9f4ec 0%, #f7f2eb 50%, #f2ebe0 100%)",
        padding: "112px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial focal lighting */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(58,122,87,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "72px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "#3a7a57", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Часті запитання
            </span>
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(30px, 4.5vw, 48px)",
            fontWeight: 800, color: "#140c07",
            letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "16px",
          }}>
            Все, що ви хотіли знати
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "#6a5545", lineHeight: 1.65, maxWidth: "500px" }}>
            Якщо не знайшли відповідь — просто зателефонуйте, ми все пояснимо за 2 хвилини.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="faq-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "64px", alignItems: "start" }}>

          {/* FAQ accordion */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              overflow: "hidden",
            }}
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                item={faq}
                index={i}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                total={faqs.length}
              />
            ))}
          </motion.div>

          {/* Sidebar — contact + work hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="faq-sidebar"
            style={{ position: "sticky", top: "96px" }}
          >
            {/* Contact card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "20px", padding: "36px 32px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              marginBottom: "16px",
              position: "relative", overflow: "hidden",
            }}>
              {/* Subtle top glow */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "80px",
                background: "linear-gradient(180deg, rgba(58,122,87,0.03) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              <div style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: "#140c07", marginBottom: "12px", lineHeight: 1.2 }}>
                Ще є питання?
              </div>
              <p style={{ fontFamily: SANS, fontSize: "14px", color: "#7a6558", lineHeight: 1.68, marginBottom: "28px" }}>
                Наш менеджер відповість протягом 5 хвилин та допоможе підібрати потрібний об'єм і транспорт.
              </p>
              <a
                href={`tel:${general.phoneRaw}`}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "linear-gradient(135deg, #140c07 0%, #1e1209 100%)",
                  color: "#ffffff",
                  padding: "16px 24px", borderRadius: "12px",
                  textDecoration: "none", marginBottom: "10px",
                  fontFamily: SANS, fontSize: "15px", fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(20,12,7,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #2a1a0f 0%, #3a2415 100%)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(20,12,7,0.35), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #140c07 0%, #1e1209 100%)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(20,12,7,0.28), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
              >
                <Phone size={16} color="#8fe8b4" strokeWidth={1.8} />
                {general.phone}
              </a>
              <a
                href={`https://t.me/${general.phoneRaw.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(36,161,222,0.08)",
                  border: "1.5px solid rgba(36,161,222,0.20)",
                  color: "#24a1de",
                  padding: "13px 24px", borderRadius: "12px",
                  textDecoration: "none",
                  fontFamily: SANS, fontSize: "14px", fontWeight: 600,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,161,222,0.15)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(36,161,222,0.35)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,161,222,0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(36,161,222,0.20)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.6l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.96z"/>
                </svg>
                Написати у Telegram
              </a>
            </div>

            {/* Work hours card */}
            <div style={{
              background: "linear-gradient(160deg, #1e3d2a 0%, #192f22 100%)",
              borderRadius: "16px", padding: "24px 28px",
              border: "1px solid rgba(143,232,180,0.10)",
              boxShadow: "0 8px 32px rgba(30,61,42,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: "16px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "-30px", right: "-20px",
                width: "100px", height: "100px",
                background: "radial-gradient(ellipse, rgba(79,186,128,0.12) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: "#4fdb8c",
                boxShadow: "0 0 12px rgba(79,219,140,0.9), 0 0 24px rgba(79,219,140,0.4)",
                flexShrink: 0,
                animation: "faqPulse 2.2s ease-in-out infinite",
              }} />
              <div>
                <div style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "rgba(143,232,180,0.65)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "5px" }}>
                  Час роботи
                </div>
                <div style={{ fontFamily: SANS, fontSize: "15px", color: "#ffffff", fontWeight: 600 }}>
                  {general.workingHours}, щодня
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes faqPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(79,219,140,0.9), 0 0 24px rgba(79,219,140,0.4); }
          50% { opacity: 0.5; box-shadow: 0 0 5px rgba(79,219,140,0.4), 0 0 10px rgba(79,219,140,0.2); }
        }
        @media (max-width: 900px) {
          .faq-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
          .faq-sidebar { position: static !important; }
        }
        @media (max-width: 768px) {
          .faq-section { padding: 72px 20px 80px !important; }
        }
        @media (max-width: 480px) {
          .faq-section { padding: 60px 16px 72px !important; }
        }
      `}</style>
    </section>
  );
}

function FAQItem({
  item, isOpen, onToggle, index, total,
}: {
  item: FaqItem; isOpen: boolean; onToggle: () => void; index: number; total: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.38, delay: index * 0.06 }}
      style={{
        borderBottom: index < total - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
        overflow: "hidden",
        transition: "background 0.22s ease",
        background: isOpen ? "rgba(58,122,87,0.025)" : "transparent",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", padding: "24px 28px",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left", width: "100%",
          transition: "opacity 0.18s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.78"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
      >
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "clamp(16px, 2vw, 18.5px)",
          fontWeight: isOpen ? 700 : 600,
          color: isOpen ? "#2a6045" : "#140c07",
          transition: "color 0.2s",
          lineHeight: 1.35, flex: 1,
        }}>
          {item.q}
        </h3>

        <motion.div
          animate={{
            background: isOpen ? "#3a7a57" : "rgba(0,0,0,0.06)",
            scale: isOpen ? 1.05 : 1,
          }}
          transition={{ duration: 0.2 }}
          style={{
            width: "34px", height: "34px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: isOpen ? "0 2px 12px rgba(58,122,87,0.30)" : "none",
            border: isOpen ? "none" : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="minus" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}>
                <Minus size={14} color="#fff" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}>
                <Plus size={14} color="#6a5545" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <p style={{
              fontFamily: SANS, fontSize: "15px", color: "#5a4a3a",
              lineHeight: 1.8, paddingBottom: "28px",
              paddingLeft: "28px", paddingRight: "80px",
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
