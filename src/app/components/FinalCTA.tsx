import { motion } from "motion/react";
import { Phone, ArrowRight, Clock, Leaf, MessageCircle } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

interface FinalCTAProps {
  onOrder: () => void;
}

export function FinalCTA({ onOrder }: FinalCTAProps) {
  const { content } = useContent();
  const { general, finalCta } = content;

  return (
    <section
      id="order"
      className="finalcta-section"
      style={{
        background: "#1e3d2a",
        padding: "96px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-80px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(58, 122, 87, 0.15)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(20, 12, 7, 0.25)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Seasonal urgency badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(232, 164, 48, 0.2)",
            border: "1px solid rgba(232, 164, 48, 0.4)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <Clock size={14} color="#e8c47a" />
          <span
            style={{
              fontFamily: SANS,
              fontSize: "13px",
              fontWeight: 600,
              color: "#e8c47a",
              letterSpacing: "0.3px",
            }}
          >
            {finalCta.urgencyBadge}
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(32px, 5.5vw, 60px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          {finalCta.headline1}
          <br />
          <em style={{ color: "#8fe8b4", fontStyle: "italic" }}>
            {finalCta.headlineAccent}
          </em>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontFamily: SANS,
            fontSize: "18px",
            color: "rgba(255,255,255,0.65)",
            maxWidth: "560px",
            margin: "0 auto 48px",
            lineHeight: 1.65,
          }}
        >
          {finalCta.subtext}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="finalcta-buttons"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            marginBottom: "56px",
          }}
        >
          <motion.button
            onClick={onOrder}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="finalcta-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: SANS,
              fontSize: "18px",
              fontWeight: 700,
              background: "#ffffff",
              color: "#1e3d2a",
              border: "none",
              borderRadius: "12px",
              padding: "20px 48px",
              cursor: "pointer",
              boxShadow: "0 8px 40px rgba(0,0,0,0.30), 0 2px 0 rgba(255,255,255,0.15) inset",
            }}
          >
            <Leaf size={20} color="#3a7a57" />
            Замовити чорнозем
            <ArrowRight size={18} />
          </motion.button>
          <motion.a
            href={`tel:${general.phoneRaw}`}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: SANS,
              fontSize: "17px",
              fontWeight: 600,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "18px 36px",
              cursor: "pointer",
              textDecoration: "none",
              backdropFilter: "blur(8px)",
            }}
          >
            <Phone size={18} />
            {general.phone}
          </motion.a>
          {/* Viber */}
          <motion.a
            href={`viber://chat?number=${general.phoneRaw.replace('+', '%2B')}`}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: SANS,
              fontSize: "15px",
              fontWeight: 500,
              background: "rgba(125,91,196,0.18)",
              color: "rgba(200,180,255,0.92)",
              border: "1.5px solid rgba(125,91,196,0.38)",
              borderRadius: "12px",
              padding: "16px 22px",
              cursor: "pointer",
              textDecoration: "none",
              backdropFilter: "blur(6px)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 0C5.5.2.4 5 .1 10.9c-.2 3.4.9 6.6 3 9L2 23.1c-.1.5.4 1 .9.8l3.4-1.1c1.7.9 3.5 1.4 5.5 1.5 6.1.2 11.2-4.4 11.6-10.4C23.9 7.2 18.5.8 12.4.1c-.3 0-.7 0-1 0v-.1zm.9 4.4c.5.1.9.4 1.2.8.3.4.5.8.5 1.2-.1.5-.3.9-.7 1.2-.4.3-.9.4-1.4.3-.5-.1-.9-.4-1.2-.8-.3-.4-.5-.8-.4-1.2 0-.5.2-.9.6-1.2s.9-.4 1.4-.3zm-3.5 1c.3.1.6.3.8.5.2.3.3.6.3.9-.1.3-.2.6-.5.8-.3.2-.6.3-.9.2-.3 0-.6-.2-.8-.5-.2-.3-.3-.6-.2-.9 0-.3.2-.6.5-.8.2-.1.5-.2.8-.2zm1.8 3.9c.4 0 .7.1 1 .4.3.2.5.5.5.9 0 1.1-.4 2.2-1.1 3.1-.8.9-1.8 1.5-2.9 1.7-.5.1-1 .1-1.4 0-.5-.1-.9-.3-1.3-.5-.4-.3-.7-.6-.9-1-.3-.7-.1-1.5.5-2 .5-.4 1.1-.5 1.7-.3.2.1.4.2.5.3.4.4.4 1 0 1.4-.1.1-.2.2-.3.2.1.1.3.2.5.3.6.2 1.2 0 1.7-.4.5-.5.8-1.1.8-1.8 0-.3-.1-.6-.3-.9-.2-.3-.5-.4-.8-.5-.4 0-.7.1-1 .4-.2.2-.3.5-.2.7.1.3.3.4.6.4.1 0 .2 0 .3-.1-.1.2-.3.3-.5.4-.4.1-.8 0-1.1-.3-.3-.3-.4-.7-.3-1.1.2-.7.8-1.2 1.5-1.3h.3z"/>
            </svg>
            Viber
          </motion.a>
          {/* Telegram */}
          <motion.a
            href={`https://t.me/${general.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: SANS,
              fontSize: "15px",
              fontWeight: 500,
              background: "rgba(36,161,222,0.16)",
              color: "rgba(140,210,255,0.92)",
              border: "1.5px solid rgba(36,161,222,0.32)",
              borderRadius: "12px",
              padding: "16px 22px",
              cursor: "pointer",
              textDecoration: "none",
              backdropFilter: "blur(6px)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.6l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.96z"/>
            </svg>
            Telegram
          </motion.a>
        </motion.div>

        {/* Micro trust elements — staggered */}
        <div
          className="finalcta-trust-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          {[
            { icon: "🛡", text: "Без передоплати" },
            { icon: "⚡", text: "Відповідь за 5 хвилин" },
            { icon: "📋", text: "Офіційні документи" },
            { icon: "🌿", text: "Справжній чорнозем" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}