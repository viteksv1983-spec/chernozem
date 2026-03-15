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
        background: "linear-gradient(180deg, #f2ebe0 0%, #f5efe4 40%, #ede4d6 100%)",
        padding: "112px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial focal point */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(58,122,87,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

        {/* ── Header — consistent with other sections ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "72px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "#3a7a57", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Кому підходить
            </span>
            <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            color: "#140c07", letterSpacing: "-1px", lineHeight: 1.1,
          }}>
            Чорнозем для будь-якого завдання
          </h2>
        </motion.div>

        {/* ── Segment cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {segments.map((seg, i) => {
            const meta = SEG_META[seg.id];
            const accentColor = meta?.color ?? "#2d6045";
            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
                  display: "flex", flexDirection: "column",
                  cursor: "default",
                  transition: "box-shadow 0.32s ease, transform 0.32s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.07), 0 20px 52px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)";
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                }}
              >
                {/* Image with layered overlays */}
                <div style={{ position: "relative", height: "210px", overflow: "hidden" }}>
                  <img
                    src={content.images[meta.imgKey] || meta.fallback}
                    alt={content.imageAlts[meta.imgKey] || seg.label}
                    loading="eager"
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", display: "block",
                      transition: "transform 0.45s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                  {/* Top accent bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "4px",
                    background: accentColor,
                    boxShadow: `0 2px 8px ${accentColor}66`,
                  }} />
                  {/* Bottom gradient — creates depth transition to card body */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "72px",
                    background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)",
                    pointerEvents: "none",
                  }} />
                  {/* Side vignette for depth */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.08) 100%)",
                    pointerEvents: "none",
                  }} />
                </div>

                {/* Content */}
                <div style={{ padding: "24px 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{
                    fontFamily: SANS, fontSize: "10.5px", fontWeight: 700,
                    color: accentColor, letterSpacing: "1.8px",
                    textTransform: "uppercase", marginBottom: "10px",
                    opacity: 0.85,
                  }}>
                    {seg.label}
                  </div>
                  <h3 style={{
                    fontFamily: SERIF, fontSize: "19px", fontWeight: 700,
                    color: "#140c07", lineHeight: 1.25, marginBottom: "12px",
                  }}>
                    {seg.title}
                  </h3>
                  <p style={{
                    fontFamily: SANS, fontSize: "14px", color: "#6a5548",
                    lineHeight: 1.68, marginBottom: "20px", flex: 1,
                  }}>
                    {seg.desc}
                  </p>

                  {/* Points */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {seg.points.map((p) => (
                      <li key={p} style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: SANS, fontSize: "13px", color: "#5a4535" }}>
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: `${accentColor}14`,
                          border: `1px solid ${accentColor}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accentColor }} />
                        </div>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onOrder}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "8px", fontFamily: SANS, fontSize: "13.5px", fontWeight: 600,
                      background: "transparent",
                      color: accentColor,
                      border: `1.5px solid ${accentColor}50`,
                      borderRadius: "10px", padding: "12px 20px",
                      cursor: "pointer",
                      transition: "all 0.22s ease",
                      letterSpacing: "0.1px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = accentColor;
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}38`;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = accentColor;
                      e.currentTarget.style.borderColor = `${accentColor}50`;
                      e.currentTarget.style.boxShadow = "";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    Замовити
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .whofor-section { padding: 72px 20px 80px !important; }
        }
        @media (max-width: 480px) {
          .whofor-section { padding: 60px 16px 72px !important; }
        }
      `}</style>
    </section>
  );
}
