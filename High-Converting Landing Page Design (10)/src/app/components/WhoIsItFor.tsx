import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
const agroImage     = "https://images.unsplash.com/photo-1627842822558-c1f15aef9838?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const landscapeImage = "https://images.unsplash.com/photo-1723079637087-1d4aabcd5c63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const gardenImage    = "https://images.unsplash.com/photo-1646598446800-5cd8e4312f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const lawnImage      = "https://images.unsplash.com/photo-1651860282417-50eb7e16f48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
import { useContent } from "../contexts/ContentContext";
import { SiteContent } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

// Fallback images and colors keyed by segment id
const SEG_META: Record<string, { fallback: string; color: string; imgKey: keyof SiteContent["images"] }> = {
  lawn:      { fallback: lawnImage,      color: "#2d6045", imgKey: "lawnPhoto" },
  garden:    { fallback: gardenImage,    color: "#5a6e2a", imgKey: "gardenSegmentPhoto" },
  landscape: { fallback: landscapeImage, color: "#2a4a6e", imgKey: "landscapePhoto" },
  agro:      { fallback: agroImage,      color: "#6e4a2a", imgKey: "agroPhoto" },
};

interface WhoIsItForProps {
  onOrder: () => void;
}

export function WhoIsItFor({ onOrder }: WhoIsItForProps) {
  const { content } = useContent();
  const segments = content.whoIsItFor;

  return (
    <section
      id="who-is-it-for"
      className="whofor-section"
      style={{
        background: "#f5efe4",
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
            Кому підходить
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#140c07",
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
            }}
          >
            Чорнозем для будь-якого завдання
          </h2>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -6,
                boxShadow: "0 18px 48px rgba(0,0,0,0.13)",
                transition: { type: "spring", stiffness: 300, damping: 22 },
              }}
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                cursor: "default",
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  height: "200px",
                  overflow: "hidden",
                }}
              >
                <motion.img
                  src={content.images[SEG_META[seg.id].imgKey] || SEG_META[seg.id].fallback}
                  alt={content.imageAlts[SEG_META[seg.id].imgKey] || seg.label}
                  loading="lazy"
                  whileHover={{ scale: 1.07 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Color accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: SEG_META[seg.id].color,
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: SEG_META[seg.id].color,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  {seg.label}
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#140c07",
                    lineHeight: 1.25,
                    marginBottom: "12px",
                  }}
                >
                  {seg.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "14px",
                    color: "#6a5548",
                    lineHeight: 1.65,
                    marginBottom: "20px",
                    flex: 1,
                  }}
                >
                  {seg.desc}
                </p>

                {/* Points */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {seg.points.map((p) => (
                    <li
                      key={p}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: SANS,
                        fontSize: "13px",
                        color: "#5a4535",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: SEG_META[seg.id].color,
                          flexShrink: 0,
                        }}
                      />
                      {p}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onOrder}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontFamily: SANS,
                    fontSize: "14px",
                    fontWeight: 600,
                    background: "transparent",
                    color: SEG_META[seg.id].color,
                    border: `1.5px solid ${SEG_META[seg.id].color}`,
                    borderRadius: "8px",
                    padding: "11px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = SEG_META[seg.id].color;
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = SEG_META[seg.id].color;
                  }}
                >
                  Замовити
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}