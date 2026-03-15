import { motion } from "motion/react";
import { Phone, ArrowRight, Clock, Leaf, ShieldCheck, Zap, FileText } from "lucide-react";
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
        background: "linear-gradient(160deg, #0d2218 0%, #1a3828 35%, #1e3d2a 60%, #0f2218 100%)",
        padding: "112px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Layered radial lighting — premium focal glow ── */}
      {/* Center headline focal glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "900px", height: "600px",
        background: "radial-gradient(ellipse at 50% 40%, rgba(63,174,108,0.11) 0%, rgba(47,140,80,0.05) 35%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Top light leak */}
      <div style={{
        position: "absolute", top: "-100px", left: "50%",
        transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(79,186,128,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Bottom ambient */}
      <div style={{
        position: "absolute", bottom: "-80px", left: "50%",
        transform: "translateX(-50%)",
        width: "500px", height: "300px",
        background: "radial-gradient(ellipse at 50% 100%, rgba(20,12,7,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Edge vignettes */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(5,14,9,0.55) 100%)",
        pointerEvents: "none",
      }} />
      {/* Subtle noise texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "160px", opacity: 0.025, mixBlendMode: "overlay",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "860px", margin: "0 auto",
        position: "relative", textAlign: "center",
      }}>

        {/* ── Urgency badge ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(232,196,100,0.12)",
            border: "1px solid rgba(232,196,100,0.28)",
            borderRadius: "100px", padding: "8px 20px",
            marginBottom: "36px",
            boxShadow: "0 4px 24px rgba(232,196,100,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Clock size={13} color="#e8c47a" strokeWidth={2} />
          <span style={{ fontFamily: SANS, fontSize: "12.5px", fontWeight: 600, color: "#e8c47a", letterSpacing: "0.4px" }}>
            {finalCta.urgencyBadge}
          </span>
        </motion.div>

        {/* ── Main headline ── */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(32px, 5.5vw, 62px)",
            fontWeight: 800, color: "#ffffff",
            letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: "24px",
            textShadow: "0 2px 16px rgba(0,0,0,0.40)",
          }}
        >
          {finalCta.headline1}
          <br />
          <em style={{
            color: "#8fe8b4", fontStyle: "italic",
            textShadow: "0 0 48px rgba(143,232,180,0.30), 0 2px 8px rgba(0,0,0,0.30)",
          }}>
            {finalCta.headlineAccent}
          </em>
        </motion.h2>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontFamily: SANS, fontSize: "18px",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "520px", margin: "0 auto 52px",
            lineHeight: 1.68,
          }}
        >
          {finalCta.subtext}
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="finalcta-buttons"
          style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", marginBottom: "64px" }}
        >
          {/* Primary — white with glow */}
          <motion.button
            onClick={onOrder}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="finalcta-btn-primary"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              fontFamily: SANS, fontSize: "17px", fontWeight: 700,
              background: "#ffffff",
              color: "#1a3828",
              border: "none", borderRadius: "13px",
              padding: "19px 48px",
              cursor: "pointer",
              letterSpacing: "0.1px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)",
              transition: "box-shadow 0.25s ease",
            }}
          >
            <Leaf size={18} color="#3a7a57" strokeWidth={1.8} />
            Замовити чорнозем
            <ArrowRight size={17} strokeWidth={2} />
          </motion.button>

          {/* Phone */}
          <motion.a
            href={`tel:${general.phoneRaw}`}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              fontFamily: SANS, fontSize: "16px", fontWeight: 600,
              background: "rgba(255,255,255,0.09)",
              color: "#ffffff",
              border: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: "13px", padding: "17px 34px",
              cursor: "pointer", textDecoration: "none",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.38)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.22)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)";
            }}
          >
            <Phone size={17} strokeWidth={1.8} />
            {general.phone}
          </motion.a>

          {/* Telegram */}
          <motion.a
            href={`https://t.me/${general.phoneRaw.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: SANS, fontSize: "15px", fontWeight: 600,
              background: "rgba(36,161,222,0.12)",
              color: "rgba(140,215,255,0.90)",
              border: "1.5px solid rgba(36,161,222,0.28)",
              borderRadius: "13px", padding: "16px 24px",
              cursor: "pointer", textDecoration: "none",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(36,161,222,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "background 0.22s, border-color 0.22s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,161,222,0.22)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(36,161,222,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,161,222,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(36,161,222,0.28)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.6l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.96z"/>
            </svg>
            Telegram
          </motion.a>
        </motion.div>

        {/* ── Trust micro-elements — icon-based ── */}
        <div className="finalcta-trust-row" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0" }}>
          {[
            { icon: ShieldCheck, text: "Без передоплати" },
            { icon: Zap,         text: "Відповідь за 5 хвилин" },
            { icon: FileText,    text: "Офіційні документи" },
            { icon: Leaf,        text: "Справжній чорнозем" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 20px" }}
              >
                {/* Separator dot */}
                {i > 0 && (
                  <div style={{
                    width: "1px", height: "20px",
                    background: "rgba(255,255,255,0.1)",
                    marginRight: "20px", flexShrink: 0,
                  }} />
                )}
                <Icon size={14} color="rgba(143,232,180,0.55)" strokeWidth={1.6} />
                <span style={{
                  fontFamily: SANS, fontSize: "13px",
                  color: "rgba(255,255,255,0.50)",
                  letterSpacing: "0.1px",
                }}>
                  {item.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .finalcta-section { padding: 80px 20px 88px !important; }
          .finalcta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .finalcta-btn-primary { justify-content: center !important; }
          .finalcta-trust-row { gap: 14px !important; flex-direction: column !important; align-items: center !important; }
          .finalcta-trust-row > div { padding: 0 !important; }
          .finalcta-trust-row > div > div:first-child { display: none !important; }
        }
        @media (max-width: 480px) {
          .finalcta-section { padding: 64px 16px 72px !important; }
          .finalcta-btn-primary { font-size: 16px !important; padding: 17px 32px !important; }
        }
      `}</style>
    </section>
  );
}
