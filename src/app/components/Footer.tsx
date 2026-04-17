import { motion } from "motion/react";
import { Leaf, Phone, MapPin, Clock, FileText, Shield } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

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
        padding: "52px 32px 28px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

        {/* ── Main 4-col grid ──────────────────────────────────────────────
            Desktop:  Brand(1.8fr) | Nav(1fr) | Products(1fr) | Contacts(1.5fr)
            Tablet:   Brand+Nav  /  Products+Contacts  (2×2)
            Mobile:   Brand full · Nav|Contacts · Products under nav
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr 1fr 1.5fr",
            gap: "28px 40px",
            marginBottom: "36px",
            alignItems: "start",
          }}
        >

          {/* ── Brand ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="footer-brand-col"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: "#2d6045", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <Leaf size={17} color="#8fe8b4" />
              </motion.div>
              <div style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                КиївЧорнозем
              </div>
            </div>
            <p style={{
              fontFamily: SANS, fontSize: "13px",
              color: "rgba(255,255,255,0.40)", lineHeight: 1.7,
            }}>
              {general.fopName}. Поставки екологічно чистого чорнозему по Києву та Київській
              області. Працюємо з {general.foundedYear}&nbsp;року.
            </p>
          </motion.div>

          {/* ── Navigation ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="footer-nav-col"
          >
            <div style={{
              fontFamily: SANS, fontSize: "10px", fontWeight: 700,
              color: "rgba(255,255,255,0.26)", letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>
              Навігація
            </div>
            {[
              { label: "Переваги",    id: "benefits"     },
              { label: "Ціни",        id: "pricing"       },
              { label: "Для кого",    id: "who-is-it-for" },
              { label: "Як працюємо", id: "how-it-works"  },
              { label: "Відгуки",     id: "reviews"       },
              { label: "Питання",     id: "faq"           },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: "block", fontFamily: SANS, fontSize: "13.5px",
                  color: "rgba(255,255,255,0.62)", background: "none",
                  border: "none", cursor: "pointer", padding: "3.5px 0",
                  textAlign: "left", transition: "color 0.2s, transform 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#8fe8b4";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.62)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* ── Products ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.13 }}
            className="footer-product-col"
          >
            <div style={{
              fontFamily: SANS, fontSize: "10px", fontWeight: 700,
              color: "rgba(255,255,255,0.26)", letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>
              Продукція
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              {[
                { label: "Чорнозем насипом", id: "pricing" },
                { label: "Чорнозем у мішках",  id: "pricing" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.id)}
                  style={{
                    display: "block", fontFamily: SANS, fontSize: "13.5px",
                    color: "rgba(255,255,255,0.62)", background: "none",
                    border: "none", cursor: "pointer", padding: "3.5px 0",
                    textAlign: "left", transition: "color 0.2s, transform 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#8fe8b4";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.62)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Contacts ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.19 }}
            className="footer-contact-col"
          >
            <div style={{
              fontFamily: SANS, fontSize: "10px", fontWeight: 700,
              color: "rgba(255,255,255,0.26)", letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>
              Контакти
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>

              {/* Phone */}
              <motion.a
                href={`tel:${general.phoneRaw}`}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#7ee8b2" }}
              >
                <Phone size={14} color="#5ac88a" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 600, letterSpacing: "0.3px" }}>
                  {general.phone}
                </span>
              </motion.a>

              {/* Address */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                <MapPin size={14} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>
                  {general.address}
                </span>
              </div>

              {/* Hours */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                <Clock size={14} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>
                  {general.workingHours}, щодня
                </span>
              </div>

              {/* IBAN — hidden on mobile */}
              <div className="footer-iban" style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                <FileText size={14} color="#4a9a6a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(255,255,255,0.28)", lineHeight: 1.6, letterSpacing: "0.2px" }}>
                  IBAN: {general.iban}<br />{general.bankName}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "20px" }} />

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="footer-bottom"
          style={{
            display: "flex", flexWrap: "wrap",
            justifyContent: "space-between", alignItems: "center", gap: "10px",
          }}
        >
          <p style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.24)" }}>
            © {general.foundedYear}–2026 {general.companyName} · {general.fopName.split(" ").slice(0, 2).join(" ")} С. О.
          </p>

          <button
            onClick={onPrivacy}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.30)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, transition: "color 0.2s",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.12)",
              textUnderlineOffset: "3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#8fe8b4";
              e.currentTarget.style.textDecorationColor = "rgba(143,232,180,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.30)";
              e.currentTarget.style.textDecorationColor = "rgba(255,255,255,0.12)";
            }}
          >
            <Shield size={11} />
            Політика конфіденційності
          </button>

          <p style={{ fontFamily: SANS, fontSize: "12px", color: "rgba(255,255,255,0.20)" }}>
            Доставка чорнозему по Києву та Київській області
          </p>
        </motion.div>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           TABLET  ≤ 860px  →  2×2 grid
        ══════════════════════════════════════ */
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px 24px !important;
          }
          .footer-brand-col  { grid-column: 1 / -1 !important; }
          .footer-contact-col { grid-column: 2 !important; grid-row: 2 / span 2 !important; }
          .footer-nav-col    { grid-column: 1 !important; grid-row: 2 !important; }
          .footer-product-col { grid-column: 1 !important; grid-row: 3 !important; }
        }

        /* ══════════════════════════════════════
           MOBILE  ≤ 600px
        ══════════════════════════════════════ */
        @media (max-width: 600px) {
          .footer-root { padding: 32px 16px 18px !important; }

          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 22px 14px !important;
            margin-bottom: 22px !important;
          }

          /* Brand spans full width */
          .footer-brand-col {
            grid-column: 1 / -1 !important;
            grid-row: 1 !important;
          }
          .footer-brand-col p { font-size: 12px !important; }

          /* Nav: left col, row 2 */
          .footer-nav-col { grid-column: 1 !important; grid-row: 2 !important; }

          /* Products: left col, row 3 */
          .footer-product-col { grid-column: 1 !important; grid-row: 3 !important; }

          /* Contacts: right col, rows 2–3 */
          .footer-contact-col {
            grid-column: 2 !important;
            grid-row: 2 / span 2 !important;
          }

          /* Hide IBAN */
          .footer-iban { display: none !important; }

          /* Bottom bar: stacked */
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 5px !important;
          }
        }
      `}</style>
    </footer>
  );
}