const truckDeliveryImg = "https://images.unsplash.com/photo-1765603955623-e2f57e1c7d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const gardenResultImg = "https://images.unsplash.com/photo-1682187150385-474c7d9eb7ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const homeownerImg = "https://images.unsplash.com/photo-1634316888962-75074307f81c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
import { motion } from "motion/react";
import { Star, Quote, ArrowRight, Leaf } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

const TRUCK_IMG = truckDeliveryImg;

const GARDEN_IMG = gardenResultImg;

const HOMEOWNER_IMG = homeownerImg;

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={15}
          fill="#e8a430"
          color="#e8a430"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

interface SocialProofProps {
  onOrder: () => void;
}

export function SocialProof({ onOrder }: SocialProofProps) {
  const { content } = useContent();
  const reviews = content.reviews;
  const { general } = content;
  // Use image overrides if set, otherwise fall back to figma:asset imports
  const truckImg = content.images.truckDelivery || truckDeliveryImg;
  const gardenImg = content.images.gardenResult || gardenResultImg;
  const homeImg = content.images.homeowner || homeownerImg;
  return (
    <section
      id="reviews"
      className="reviews-section"
      style={{
        background: "#ffffff",
        padding: "112px 32px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
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
              Довіра клієнтів
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 800,
                color: "#140c07",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                marginBottom: "0",
              }}
            >
              Нам довіряють понад {general.clientsCount} клієнтів
            </h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "3px" }}>
                <Stars count={5} />
              </div>
              <p style={{ fontFamily: SANS, fontSize: "13px", color: "#9a8878", whiteSpace: "nowrap" }}>
                4.9 / 5 · на основі 847 відгуків
              </p>
            </div>
          </div>
        </motion.div>

        {/* Photo gallery strip — magazine mosaic layout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="sp-photo-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr 2fr",
            gap: "10px",
            marginBottom: "60px",
            borderRadius: "20px",
            overflow: "hidden",
            height: "300px",
          }}
        >
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={truckImg}
              alt={content.imageAlts.truckDelivery}
              loading="eager"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
                display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(20,12,7,0.80)",
                backdropFilter: "blur(6px)",
                borderRadius: "8px",
                padding: "8px 14px",
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: "13px", color: "#fff", fontWeight: 500 }}>
                Доставка самоскидом
              </span>
            </div>
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={gardenImg}
              alt={content.imageAlts.gardenResult}
              loading="eager"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
                display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={homeImg}
              alt={content.imageAlts.homeowner}
              loading="eager"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
                display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </motion.div>

        {/* Reviews */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "0 24px 64px rgba(0,0,0,0.09)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: "#f8f4ee",
                borderRadius: "20px",
                padding: "36px",
                position: "relative",
                border: "1px solid #ece4d6",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                cursor: "default",
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
              }}
            >
              {/* Quote mark */}
              <div style={{ position: "absolute", top: "24px", right: "28px", opacity: 0.08 }}>
                <Quote size={44} color="#140c07" fill="#140c07" />
              </div>

              {/* Rating */}
              <div style={{ marginBottom: "20px" }}>
                <Stars count={r.rating} />
              </div>

              {/* Text */}
              <p style={{ fontFamily: SANS, fontSize: "15px", color: "#3a2a1a", lineHeight: 1.78, marginBottom: "28px", fontStyle: "italic" }}>
                "{r.text}"
              </p>

              {/* Separator */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", marginBottom: "20px" }} />

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {r.photoOverride ? (
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e8dfd4" }}>
                    <img src={r.photoOverride} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #3a7a57, #2d6045)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 700, color: "#fff" }}>{r.initials}</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 700, color: "#140c07", marginBottom: "2px" }}>{r.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: "12px", color: "#9a8878" }}>{r.role}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: "11px", color: "#c0b0a0", letterSpacing: "0.3px" }}>{r.date}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: "48px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
          {[
            "✅ Паспорт якості на ґрунт",
            "✅ Офіційна накладна",
            "✅ Працюємо з юридичними особами",
            "✅ Оплата після вивантаження",
            "✅ ПДВ та без ПДВ",
          ].map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{
                background: "#f4efe7",
                border: "1px solid #e4dace",
                borderRadius: "100px",
                padding: "9px 20px",
                fontFamily: SANS, fontSize: "13px", color: "#4a3a2a",
                fontWeight: 500, cursor: "default",
              }}
            >
              {badge}
            </motion.div>
          ))}
        </div>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="sp-cta-block"
          style={{
            marginTop: "56px",
            background: "linear-gradient(135deg, #1a3525 0%, #111f18 100%)",
            borderRadius: "24px",
            padding: "48px 56px",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between",
            gap: "32px",
            boxShadow: "0 16px 56px rgba(20,50,35,0.28)",
            border: "1px solid rgba(143,232,180,0.08)",
          }}
        >
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Leaf size={14} color="rgba(143,232,180,0.6)" />
              <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "rgba(143,232,180,0.6)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {general.clientsCount}+ задоволених клієнтів
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.15, marginBottom: "10px" }}>
              Приєднуйтесь до тих, хто вже обрав якість
            </div>
            <p style={{ fontFamily: SANS, fontSize: "15px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65 }}>
              Замовте чорнозем сьогодні — доставимо завтра або в зручний для вас день.
            </p>
          </div>
          <div className="sp-cta-actions" style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
            <motion.button
              onClick={onOrder}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                fontFamily: SANS, fontSize: "15px", fontWeight: 700,
                background: "linear-gradient(135deg, #3FAE6C 0%, #2a9158 100%)",
                color: "#ffffff", border: "none", borderRadius: "12px",
                padding: "16px 36px", cursor: "pointer",
                boxShadow: "0 6px 28px rgba(63,174,108,0.45)",
                whiteSpace: "nowrap",
              }}
            >
              Замовити чорнозем
              <ArrowRight size={16} />
            </motion.button>
            <a
              href={`tel:${general.phoneRaw}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none", textAlign: "center", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              або зателефонуйте: {general.phone}
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sp-photo-grid { grid-template-columns: 1fr !important; height: 220px !important; }
          .sp-photo-grid > div:nth-child(2), .sp-photo-grid > div:nth-child(3) { display: none !important; }
          .sp-cta-block { padding: 32px 24px !important; }
        }
        @media (max-width: 900px) {
          .sp-photo-grid { grid-template-columns: 1fr 1fr !important; height: 240px !important; }
          .sp-photo-grid > div:nth-child(3) { display: none !important; }
        }
      `}</style>
    </section>
  );
}