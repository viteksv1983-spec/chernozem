import { CheckCircle2, Truck, Package, Warehouse } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
const _base = import.meta.env.BASE_URL;
const zilTruckImage = `${_base}assets/images/truckDelivery.jpg`;
const kamazTruckImage = `${_base}assets/images/kamaz.jpg`;
const mazTruckImage = `${_base}assets/images/maz.jpg`;
const volvoTruckImage = `${_base}assets/images/kamaz.jpg`;
import { TruckImageCanvas } from "./TruckImageCanvas";
import { useContent } from "../contexts/ContentContext";
import { TruckDeliveryItem, SiteContent } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const TRUCK_FALLBACK: Record<string, string> = {
  "ЗІЛ":    zilTruckImage,
  "КАМАЗ":  kamazTruckImage,
  "МАЗ":    mazTruckImage,
  "ВОЛЬВО": volvoTruckImage,
};

const TRUCK_IMG_KEY: Record<string, keyof SiteContent["images"]> = {
  "ЗІЛ":    "truckZil",
  "КАМАЗ":  "truckKamaz",
  "МАЗ":    "truckMaz",
  "ВОЛЬВО": "truckVolvo",
};

const TOTAL_SEGMENTS = 12;

function CapacityBar({ segments, highlight }: { segments: number; highlight: boolean }) {
  const activeColor   = highlight ? "#8fe8b4" : "#3a7a57";
  const inactiveColor = highlight ? "rgba(143,232,180,0.12)" : "rgba(58,122,87,0.10)";
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => (
        <div key={idx} style={{
          flex: 1, height: "7px", borderRadius: "3px",
          background: idx < segments ? activeColor : inactiveColor,
          opacity: idx < segments && idx === segments - 1 ? 0.7 : 1,
        }} />
      ))}
    </div>
  );
}

function TruckCard({ d, i, isSelected, onSelect, onOrder, imgSrc }: {
  d: TruckDeliveryItem; i: number; isSelected: boolean;
  onSelect: () => void; onOrder: () => void; imgSrc: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.08 }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 24 } }}
      style={{
        borderRadius: "16px",
        border: isSelected
          ? d.highlight ? "1.5px solid rgba(143,232,180,0.85)" : "1.5px solid #3FAE6C"
          : hovered
            ? d.highlight ? "1.5px solid rgba(143,232,180,0.55)" : "1.5px solid rgba(63,174,108,0.55)"
            : d.highlight ? "1.5px solid rgba(143,232,180,0.18)" : "1.5px solid #e8e0d0",
        background: d.highlight
          ? "linear-gradient(160deg, #20432e 0%, #1e3d2a 100%)"
          : "#ffffff",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", cursor: "pointer",
        boxShadow: hovered
          ? d.highlight
            ? "0 24px 52px rgba(30,61,42,0.38), 0 4px 16px rgba(30,61,42,0.18)"
            : "0 18px 44px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)"
          : isSelected
            ? d.highlight
              ? "0 0 0 4px rgba(143,232,180,0.14), 0 8px 32px rgba(30,61,42,0.28)"
              : "0 0 0 4px rgba(63,174,108,0.10), 0 8px 24px rgba(0,0,0,0.09)"
            : d.highlight
              ? "0 6px 24px rgba(30,61,42,0.20), 0 1px 4px rgba(30,61,42,0.10)"
              : "0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
        transition: "box-shadow 0.28s ease, border-color 0.22s ease",
      }}
    >
      {/* Inner highlight for light card */}
      {!d.highlight && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "16px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          pointerEvents: "none", zIndex: 2,
        }} />
      )}

      {d.highlight && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: "linear-gradient(135deg, #3FAE6C, #2a9158)",
          color: "#fff", fontFamily: SANS, fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.8px", padding: "4px 12px", borderRadius: "100px",
          boxShadow: "0 2px 12px rgba(63,174,108,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
          zIndex: 3,
        }}>
          ПОПУЛЯРНИЙ
        </div>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div key="check" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            style={{ position: "absolute", top: "10px", left: "10px", zIndex: 4, width: "24px", height: "24px", borderRadius: "50%", background: d.highlight ? "#8fe8b4" : "#3FAE6C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(63,174,108,0.50)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <motion.path d="M2 6l3 3 5-5" stroke={d.highlight ? "#0f2018" : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.26, delay: 0.05 }} />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Truck image */}
      <div style={{
        width: "100%",
        borderBottom: d.highlight ? "1px solid rgba(143,232,180,0.10)" : "1px solid rgba(0,0,0,0.06)",
        flexShrink: 0, overflow: "hidden",
      }}>
        <div style={{ transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)", transformOrigin: "center center" }}>
          <TruckImageCanvas src={imgSrc} alt={`Самоскид ${d.truck}`} height={152} padding={8} whiteThreshold={238} />
        </div>
      </div>

      {/* Capacity bar */}
      <div style={{
        padding: "14px 20px 12px",
        borderBottom: d.highlight ? "1px solid rgba(143,232,180,0.10)" : "1px solid rgba(0,0,0,0.05)",
        background: d.highlight
          ? "rgba(20,50,32,0.6)"
          : "linear-gradient(180deg, #faf7f2 0%, #f5f0ea 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
          <span style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: d.highlight ? "rgba(143,232,180,0.5)" : "rgba(58,122,87,0.5)" }}>Вантажність</span>
          <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: d.highlight ? "#8fe8b4" : "#3a7a57" }}>{d.capacity}&nbsp;&nbsp;{d.volume}</span>
        </div>
        <CapacityBar segments={d.segments} highlight={d.highlight} />
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: d.highlight ? "rgba(143,232,180,0.4)" : "rgba(58,122,87,0.3)", flexShrink: 0 }} />
          <span style={{ fontFamily: SANS, fontSize: "11px", color: d.highlight ? "rgba(255,255,255,0.38)" : "rgba(90,69,53,0.52)", lineHeight: 1.4 }}>{d.usageLabel}</span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontSize: "26px", fontWeight: 800, color: d.highlight ? "#8fe8b4" : "#140c07", marginBottom: "4px", lineHeight: 1 }}>{d.truck}</div>
        <div style={{ fontFamily: SANS, fontSize: "13px", color: d.highlight ? "rgba(255,255,255,0.48)" : "#8a7565", marginBottom: "14px" }}>{d.note}</div>
        <div style={{ fontFamily: SANS, fontSize: "18px", fontWeight: 700, color: d.highlight ? "#ffffff" : "#140c07", marginBottom: "18px", letterSpacing: "-0.3px" }}>{d.price}</div>
        <button
          onClick={(e) => { e.stopPropagation(); onOrder(); }}
          style={{
            display: "block", width: "100%",
            fontFamily: SANS, fontSize: "13px", fontWeight: 700,
            background: d.highlight
              ? "linear-gradient(135deg, #3FAE6C 0%, #2d7a50 100%)"
              : "linear-gradient(135deg, #1e3d2a 0%, #152e1e 100%)",
            color: d.highlight ? "#ffffff" : "#8fe8b4",
            border: "none", borderRadius: "9px", padding: "12px",
            cursor: "pointer",
            boxShadow: d.highlight
              ? "0 4px 16px rgba(63,174,108,0.40), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 3px 12px rgba(30,61,42,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
            marginTop: "auto",
            letterSpacing: "0.2px",
            transition: "opacity 0.18s, box-shadow 0.2s, transform 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.88";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "";
          }}
        >
          Замовити
        </button>
      </div>
    </motion.div>
  );
}

interface PricingProps {
  onOrder: (tons?: number) => void;
}

export function Pricing({ onOrder }: PricingProps) {
  const { content } = useContent();
  const { pricing, images, general } = content;
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

  const getTruckImg = (truckName: string): string => {
    const key = TRUCK_IMG_KEY[truckName];
    return (key && images[key]) ? images[key] : (TRUCK_FALLBACK[truckName] ?? "");
  };

  return (
    <section
      id="pricing"
      className="pricing-section"
      style={{
        background: "linear-gradient(180deg, #fdfaf7 0%, #ffffff 40%, #f9f5ef 100%)",
        padding: "112px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft radial focal lighting — premium SaaS touch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "900px", height: "500px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(58,122,87,0.055) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "400px",
        background: "radial-gradient(ellipse at 50% 100%, rgba(20,12,7,0.03) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

        {/* ── Section header — consistent with Benefits/FAQ ── */}
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
              Актуальні ціни
            </span>
            <div style={{ width: "28px", height: "2px", background: "#3a7a57" }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            color: "#140c07", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "18px",
          }}>
            Прозора вартість чорнозему
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "#6a5545", maxWidth: "520px", margin: "0 auto", lineHeight: 1.65 }}>
            Ціна на ґрунт фіксована. Вартість доставки залежить від типу самоскида та відстані — уточнюємо при дзвінку.
          </p>
        </motion.div>

        {/* ── Purchase format cards ── */}
        <div className="pricing-format-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "56px" }}>

          {/* Bulk card — dark green, premium */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: "linear-gradient(160deg, #20432e 0%, #1c3826 50%, #162e20 100%)",
              borderRadius: "20px",
              padding: "40px 36px",
              position: "relative",
              border: "1px solid rgba(143,232,180,0.12)",
              boxShadow: "0 20px 56px rgba(30,61,42,0.28), 0 4px 16px rgba(30,61,42,0.14), inset 0 1px 0 rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            {/* Inner radial glow */}
            <div style={{
              position: "absolute", top: "-60px", right: "-40px",
              width: "300px", height: "300px",
              background: "radial-gradient(ellipse, rgba(79,186,128,0.10) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />

            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4fba80", boxShadow: "0 0 8px rgba(79,186,128,0.8), 0 0 20px rgba(79,186,128,0.3)" }} />
              <span style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "rgba(143,232,180,0.75)", letterSpacing: "0.3px" }}>В наявності</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(58,122,87,0.22)",
                border: "1px solid rgba(143,232,180,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
                <Truck size={22} color="#8fe8b4" strokeWidth={1.6} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Чорнозем насипом</h3>
            </div>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.68 }}>
              Доставка самоскидом прямо на ділянку. Розвантаження автоматичне. Підходить для об'ємів від {pricing.minTons} тонн і вище.
            </p>
            <div style={{ paddingTop: "36px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{
                  fontFamily: SERIF, fontSize: "82px", fontWeight: 800,
                  color: "#8fe8b4", letterSpacing: "-3px", lineHeight: 1,
                  textShadow: "0 0 40px rgba(143,232,180,0.25)",
                }}>
                  {pricing.bulkPricePerTon}
                </span>
                <span style={{ fontFamily: SANS, fontSize: "22px", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>грн</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: "17px", fontWeight: 500, color: "rgba(255,255,255,0.65)", marginTop: "8px" }}>за 1 тонну</div>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "rgba(79,186,128,0.10)",
              border: "1px solid rgba(79,186,128,0.22)",
              borderRadius: "8px", padding: "7px 14px",
              marginTop: "18px", marginBottom: "24px",
            }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4fba80", boxShadow: "0 0 6px rgba(79,186,128,0.9)", flexShrink: 0 }} />
              <span style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, color: "rgba(143,232,180,0.8)" }}>Склад у Києві&nbsp;•&nbsp;350+ доставок щомісяця</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.32)", marginBottom: "24px" }}>
              З навантаженням зі складу · мінімум від {pricing.minTons} тонн
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {["Без торфу, глини та домішок", "Навантаження на складі включено", "Розвантаження самоскидом на місці", "Можна замовити на сьогодні", "Самовивіз також доступний"].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
                  <CheckCircle2 size={15} color="#8fe8b4" strokeWidth={2} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onOrder()}
              style={{
                width: "100%", fontFamily: SANS, fontSize: "15px", fontWeight: 700,
                background: "linear-gradient(135deg, #4fba80 0%, #3a9163 100%)",
                color: "#0f2018", border: "none", borderRadius: "11px",
                padding: "17px 24px", cursor: "pointer",
                boxShadow: "0 6px 24px rgba(79,186,128,0.40), inset 0 1px 0 rgba(255,255,255,0.20)",
                transition: "all 0.22s ease",
                letterSpacing: "0.1px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #6dd4a0 0%, #4fba80 100%)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 32px rgba(79,186,128,0.50), inset 0 1px 0 rgba(255,255,255,0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #4fba80 0%, #3a9163 100%)";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(79,186,128,0.40), inset 0 1px 0 rgba(255,255,255,0.20)";
              }}
            >
              Замовити насипом
            </button>
          </motion.div>

          {/* Bags + self-pickup */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                background: "#ffffff",
                borderRadius: "18px", padding: "28px 30px",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                flex: 1, position: "relative", overflow: "hidden",
              }}
            >
              {/* Soft top glow */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "60px",
                background: "linear-gradient(180deg, rgba(240,247,238,0.6) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", position: "relative" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "11px",
                  background: "linear-gradient(135deg, #eef5e8 0%, #e8f2e0 100%)",
                  border: "1px solid rgba(90,110,58,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(90,110,58,0.08)",
                }}>
                  <Package size={20} color="#5a6e3a" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 700, color: "#140c07", marginBottom: "5px" }}>Чорнозем у мішках</h3>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "#f0faf5", border: "1px solid #b8e0c8",
                    borderRadius: "100px", padding: "2px 10px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}>
                    <span style={{ fontFamily: SANS, fontSize: "11.5px", fontWeight: 600, color: "#3a7a57" }}>🌿 Для клумб та городу</span>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: SANS, fontSize: "14px", color: "#7a6555", lineHeight: 1.65, marginBottom: "20px" }}>
                Ідеально для балконів, клумб, горщиків та невеликих робіт. Можна купити від 1 мішка з доставкою або самовивозом.
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                <span style={{
                  fontFamily: SERIF, fontSize: "44px", fontWeight: 800,
                  color: "#140c07", letterSpacing: "-1.5px", lineHeight: 1,
                }}>
                  {pricing.bagPrice}
                </span>
                <span style={{ fontFamily: SANS, fontSize: "15px", color: "#8a7565", marginLeft: "4px" }}>грн / мішок</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: "13px", color: "#a09080", marginBottom: "22px" }}>
                Вага мішка — {pricing.bagWeightKg} кг · від 1 мішка
              </div>
              <button
                onClick={onOrder}
                style={{
                  width: "100%", fontFamily: SANS, fontSize: "14px", fontWeight: 700,
                  background: "linear-gradient(135deg, #140c07 0%, #1e1209 100%)",
                  color: "#ffffff", border: "none", borderRadius: "9px", padding: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(20,12,7,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #2a1a0f 0%, #3a2415 100%)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(20,12,7,0.35), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #140c07 0%, #1e1209 100%)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(20,12,7,0.28), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
              >
                Замовити мішки
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                background: "linear-gradient(135deg, #f7f0e4 0%, #f2ebe0 100%)",
                borderRadius: "18px", padding: "24px 30px",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", gap: "18px",
              }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "11px",
                background: "linear-gradient(135deg, #ede5d8 0%, #e4d9c8 100%)",
                border: "1px solid rgba(0,0,0,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
                <Warehouse size={20} color="#7a6555" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 700, color: "#140c07", marginBottom: "5px" }}>Самовивіз зі складу</div>
                <div style={{ fontFamily: SANS, fontSize: "13px", color: "#7a6555", lineHeight: 1.55 }}>{general.address} · можна приїхати та оглянути</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Truck delivery cards ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "24px", width: "100%", justifyContent: "center",
          }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(58,122,87,0.2))" }} />
            <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 700, color: "#3a7a57", letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Вартість доставки за типом самоскида
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(58,122,87,0.2), transparent)" }} />
          </div>
          <div className="truck-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "stretch", paddingBottom: "8px" }}>
            {pricing.delivery.map((d, i) => (
              <TruckCard key={d.truck} d={d} i={i}
                imgSrc={getTruckImg(d.truck)}
                isSelected={selectedTruck === d.truck}
                onSelect={() => setSelectedTruck((prev) => (prev === d.truck ? null : d.truck))}
                onOrder={() => onOrder(d.maxTons)}
              />
            ))}
          </div>

          {/* Summary bar */}
          <AnimatePresence>
            {selectedTruck && (() => {
              const sel = pricing.delivery.find((d) => d.truck === selectedTruck);
              if (!sel) return null;
              return (
                <motion.div key="summary-bar"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                  <div style={{
                    background: "linear-gradient(135deg, #1e3d2a, #142d1e)",
                    borderRadius: "14px", padding: "20px 28px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "20px", flexWrap: "wrap",
                    border: "1px solid rgba(143,232,180,0.14)",
                    boxShadow: "0 12px 40px rgba(30,61,42,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: "rgba(143,232,180,0.10)",
                        border: "1px solid rgba(143,232,180,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#8fe8b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(143,232,180,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>Обрано самоскид</div>
                        <div style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 800, color: "#8fe8b4" }}>
                          {sel.truck}
                          <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.40)", marginLeft: "10px" }}>{sel.capacity}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                      {([["Об'єм", sel.volume], ["Доставка", sel.price], ["Призначення", sel.usageLabel]] as [string, string][]).map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "3px" }}>{lbl}</div>
                          <div style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onOrder(sel.maxTons)}
                      style={{
                        fontFamily: SANS, fontSize: "14px", fontWeight: 700,
                        background: "linear-gradient(135deg, #3FAE6C, #2d7a50)",
                        color: "#fff", border: "none", borderRadius: "10px",
                        padding: "12px 28px", cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(63,174,108,0.40), inset 0 1px 0 rgba(255,255,255,0.12)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(63,174,108,0.50), inset 0 1px 0 rgba(255,255,255,0.12)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(63,174,108,0.40), inset 0 1px 0 rgba(255,255,255,0.12)"; }}
                    >
                      Замовити {sel.truck}
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-section { padding: 72px 20px 100px !important; }
          .truck-cards-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .pricing-format-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .pricing-section { padding: 60px 16px 100px !important; }
          .truck-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
