import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Phone, MessageCircle } from "lucide-react";
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
    <section id="faq" className="faq-section" style={{ background: "#f7f2eb", padding: "112px 32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "64px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "#3a7a57", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Часті запитання
            </span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800, color: "#140c07", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "16px" }}>
            Все, що ви хотіли знати
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "#6a5545", lineHeight: 1.65, maxWidth: "520px" }}>
            Якщо не знайшли відповідь — просто зателефонуйте, ми все пояснимо за 2 хвилини.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="faq-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "64px", alignItems: "start" }}>

          {/* FAQ list */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
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

          {/* Sidebar — contact card */}
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
              borderRadius: "20px",
              padding: "36px 32px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
              marginBottom: "16px",
            }}>
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
                  background: "#140c07", color: "#ffffff",
                  padding: "16px 24px", borderRadius: "12px",
                  textDecoration: "none", marginBottom: "10px",
                  fontFamily: SANS, fontSize: "15px", fontWeight: 700,
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#2a1a0f"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#140c07"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <Phone size={16} color="#8fe8b4" />
                {general.phone}
              </a>
              <a
                href={`viber://chat?number=${general.phoneRaw.replace("+", "%2B")}`}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(125,91,196,0.10)",
                  border: "1.5px solid rgba(125,91,196,0.22)",
                  color: "#7d5bc4",
                  padding: "14px 24px", borderRadius: "12px",
                  textDecoration: "none",
                  fontFamily: SANS, fontSize: "14px", fontWeight: 600,
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(125,91,196,0.16)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(125,91,196,0.10)"; }}
              >
                <MessageCircle size={16} />
                Написати у Viber
              </a>
            </div>

            {/* Work hours card */}
            <div style={{
              background: "#1e3d2a",
              borderRadius: "16px",
              padding: "24px 28px",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4fdb8c", boxShadow: "0 0 10px rgba(79,219,140,0.8)", flexShrink: 0, animation: "faqPulse 2.2s ease-in-out infinite" }} />
              <div>
                <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "rgba(143,232,180,0.7)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                  Час роботи
                </div>
                <div style={{ fontFamily: SANS, fontSize: "15px", color: "#ffffff", fontWeight: 500 }}>
                  {general.workingHours}, щодня
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes faqPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(79,219,140,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(79,219,140,0.3); }
        }
        @media (max-width: 900px) {
          .faq-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
          .faq-sidebar { position: static !important; }
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
      style={{ borderBottom: index < total - 1 ? "1px solid #ece4d6" : "none", overflow: "hidden" }}
    >
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", padding: "24px 0",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left", width: "100%",
          transition: "opacity 0.18s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.78"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
      >
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "clamp(16px, 2vw, 19px)",
          fontWeight: isOpen ? 700 : 600,
          color: isOpen ? "#2a6045" : "#140c07",
          transition: "color 0.2s",
          lineHeight: 1.35, flex: 1,
        }}>
          {item.q}
        </h3>

        <motion.div
          animate={{ background: isOpen ? "#3a7a57" : "#ece4d6" }}
          transition={{ duration: 0.2 }}
          style={{
            width: "34px", height: "34px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
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
              fontFamily: SANS, fontSize: "15.5px", color: "#6a5545",
              lineHeight: 1.78, paddingBottom: "28px", paddingRight: "60px",
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
