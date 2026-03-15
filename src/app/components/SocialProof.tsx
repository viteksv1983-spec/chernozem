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
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
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
            Довіра клієнтів
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
            Нам довіряють понад {general.clientsCount} клієнтів
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "16px" }}>
            <Stars count={5} />
          </div>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: "#8a7565" }}>
            Середня оцінка: 4.9 / 5 на основі 847 відгуків
          </p>
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
              loading="lazy"
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
              loading="lazy"
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
              loading="lazy"
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

        {/* Reviews — whileHover lift + shadow */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
          }}
        >
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, boxShadow: "0 20px 56px rgba(0,0,0,0.10)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: "#f5efe4",
                borderRadius: "16px",
                padding: "32px",
                position: "relative",
                border: "1px solid #ede5d8",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                cursor: "default",
              }}
            >
              {/* Quote icon */}
              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  opacity: 0.12,
                }}
              >
                <Quote size={40} color="#140c07" fill="#140c07" />
              </div>

              {/* Rating */}
              <div style={{ marginBottom: "18px" }}>
                <Stars count={r.rating} />
              </div>

              {/* Text */}
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: "15px",
                  color: "#3a2a1a",
                  lineHeight: 1.75,
                  marginBottom: "28px",
                  fontStyle: "italic",
                }}
              >
                "{r.text}"
              </p>

              {/* Separator */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginBottom: "20px" }} />

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar: photo if uploaded, else initials */}
                {r.photoOverride ? (
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e8dfd4" }}>
                    <img src={r.photoOverride} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #3a7a57, #2d6045)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 700, color: "#fff" }}>{r.initials}</span>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 600, color: "#140c07", marginBottom: "2px" }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: "13px", color: "#8a7565" }}>
                    {r.role}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", fontFamily: SANS, fontSize: "12px", color: "#b0a090" }}>
                  {r.date}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges — staggered entrance */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {[
            "✅ Паспорт якості на ґрунт",
            "✅ Офіційна накладна",
            "✅ Працюємо з юридичними особами",
            "✅ Оплата після вивантаження",
            "✅ ПДВ та без ПДВ",
          ].map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              style={{
                background: "#f0ece4",
                border: "1px solid #e0d8c8",
                borderRadius: "100px",
                padding: "8px 18px",
                fontFamily: SANS,
                fontSize: "13px",
                color: "#4a3a2a",
                fontWeight: 500,
                cursor: "default",
              }}
            >
              {badge}
            </motion.div>
          ))}
        </div>

        {/* Conversion CTA — after social proof = highest trust moment */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="sp-cta-block"
          style={{
            marginTop: "56px",
            background: "linear-gradient(135deg, #1e3d2a 0%, #162e1f 100%)",
            borderRadius: "20px",
            padding: "40px 48px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "28px",
            boxShadow: "0 12px 48px rgba(30,61,42,0.22)",
          }}
        >
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Leaf size={16} color="#8fe8b4" />
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#8fe8b4",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                {general.clientsCount}+ задоволених клієнтів
              </span>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: "8px",
              }}
            >
              Приєднуйтесь до тих, хто вже обрав якість
            </div>
            <p style={{ fontFamily: SANS, fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              Замовте чорнозем сьогодні — доставимо завтра або в зручний для вас день.
            </p>
          </div>
          <div className="sp-cta-actions" style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            <motion.button
              onClick={onOrder}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: SANS,
                fontSize: "16px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #3FAE6C 0%, #2a9158 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "16px 36px",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(63,174,108,0.40)",
                whiteSpace: "nowrap",
              }}
            >
              Замовити чорнозем
              <ArrowRight size={17} />
            </motion.button>
            <a
              href={`tel:${general.phoneRaw}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: SANS,
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.60)",
                textDecoration: "none",
                textAlign: "center",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.60)")}
            >
              або зателефонуйте: {general.phone}
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sp-photo-grid {
            grid-template-columns: 1fr !important;
            height: 220px !important;
          }
          .sp-photo-grid > div:nth-child(2),
          .sp-photo-grid > div:nth-child(3) {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .sp-photo-grid {
            grid-template-columns: 1fr 1fr !important;
            height: 240px !important;
          }
          .sp-photo-grid > div:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}