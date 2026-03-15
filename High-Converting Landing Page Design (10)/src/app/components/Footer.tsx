import { motion } from "motion/react";
import { Leaf, Phone, MapPin, Clock, FileText, Shield } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

export function Footer({ onPrivacy }: { onPrivacy: () => void }) {
  const { content } = useContent();
  const { general } = content;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="footer-root"
      style={{
        background: "#111c14",
        padding: "56px 24px 32px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top row — staggered columns */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "40px",
            marginBottom: "44px",
          }}
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#2d6045",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Leaf size={18} color="#8fe8b4" />
              </motion.div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                КиївЧорнозем
              </div>
            </div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: "13px",
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.75,
                maxWidth: "240px",
              }}
            >
              {general.fopName}. Поставки екологічно чистого чорнозему по Києву та Київській
              області. Працюємо з {general.foundedYear} року.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Навігація
            </div>
            {[
              { label: "Переваги", id: "benefits" },
              { label: "Ціни", id: "pricing" },
              { label: "Для кого", id: "who-is-it-for" },
              { label: "Як працюємо", id: "how-it-works" },
              { label: "Відгуки", id: "reviews" },
              { label: "Питання", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: "block",
                  fontFamily: SANS,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.68)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 0",
                  textAlign: "left",
                  transition: "color 0.2s, transform 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#8fe8b4";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.68)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Продукція
            </div>
            {[
              { label: "Чорнозем насипом (від 5 тонн)", id: "pricing" },
              { label: "Чорнозем у мішках (50 кг)", id: "pricing" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: "block",
                  fontFamily: SANS,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.68)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 0",
                  textAlign: "left",
                  transition: "color 0.2s, transform 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#8fe8b4";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.68)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Контакти
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Phone — акцент */}
              <motion.a
                href={`tel:${general.phoneRaw}`}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  color: "#7ee8b2",
                }}
              >
                <Phone size={15} color="#5ac88a" />
                <span style={{ fontFamily: SANS, fontSize: "16px", fontWeight: 600, letterSpacing: "0.3px" }}>
                  {general.phone}
                </span>
              </motion.a>

              {/* Address */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <MapPin size={15} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.52)", lineHeight: 1.5 }}>
                  {general.address}
                </span>
              </div>

              {/* Hours */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Clock size={15} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.52)", lineHeight: 1.5 }}>
                  Доставка: {general.workingHours},<br />щодня
                </span>
              </div>

              {/* IBAN */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <FileText size={15} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.30)", lineHeight: 1.6, letterSpacing: "0.3px" }}>
                  IBAN: {general.iban}<br />{general.bankName}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.07)",
            marginBottom: "24px",
          }}
        />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="footer-bottom"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontFamily: SANS,
              fontSize: "13px",
              color: "rgba(255,255,255,0.26)",
            }}
          >
            © {general.foundedYear}–2026 {general.companyName} · {general.fopName.split(" ").slice(0, 2).join(" ")} С. О.
          </p>

          <button
            onClick={onPrivacy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: SANS,
              fontSize: "13px",
              color: "rgba(255,255,255,0.32)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.2s",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.12)",
              textUnderlineOffset: "3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#8fe8b4";
              e.currentTarget.style.textDecorationColor = "rgba(143,232,180,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.32)";
              e.currentTarget.style.textDecorationColor = "rgba(255,255,255,0.12)";
            }}
          >
            <Shield size={12} />
            Політика конфіденційності
          </button>

          <p
            style={{
              fontFamily: SANS,
              fontSize: "13px",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            Доставка чорнозему по Києву та Київській області
          </p>
        </motion.div>
      </div>
    </footer>
  );
}