import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import type { FaqItem } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

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
        background: "#f5efe4",
        padding: "96px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "56px" }}
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
            Часті запитання
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
            Все, що ви хотіли знати
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "17px",
              color: "#5a4535",
              lineHeight: 1.6,
            }}
          >
            Якщо не знайшли відповідь — просто зателефонуйте, ми все пояснимо за 2 хвилини.
          </p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="faq-container"
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "8px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              item={faq}
              index={i}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* SEO micro note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontFamily: SANS,
            fontSize: "14px",
            color: "#9a8878",
            textAlign: "center",
            marginTop: "32px",
            lineHeight: 1.6,
          }}
        >
          Залишились питання? Телефонуйте:{" "}
          <a
            href={`tel:${general.phoneRaw}`}
            style={{
              color: "#3a7a57",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {general.phone}
          </a>{" "}
          — працюємо щодня з {general.workingHours}
        </motion.p>
      </div>
    </section>
  );
}

function FAQItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.38, delay: index * 0.07 }}
      style={{
        borderBottom: "1px solid #e8dfd0",
        overflow: "hidden",
      }}
    >
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(58,122,87,0.04)" }}
        transition={{ duration: 0.18 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "24px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderRadius: "8px",
          margin: "0 -12px",
          width: "calc(100% + 24px)",
        }}
      >
        <h3
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(16px, 2vw, 19px)",
            fontWeight: 600,
            color: isOpen ? "#3a7a57" : "#140c07",
            transition: "color 0.2s",
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {item.q}
        </h3>
        <motion.div
          animate={{
            background: isOpen ? "#3a7a57" : "#f0ece4",
            rotate: isOpen ? 0 : 0,
          }}
          transition={{ duration: 0.2 }}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="minus"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Minus size={16} color="#ffffff" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Plus size={16} color="#5a4535" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p
              style={{
                fontFamily: SANS,
                fontSize: "16px",
                color: "#5a4535",
                lineHeight: 1.75,
                paddingBottom: "24px",
                paddingRight: "52px",
                paddingLeft: "0",
              }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}