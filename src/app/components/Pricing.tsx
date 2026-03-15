import { CheckCircle2, Truck, Package, Warehouse } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
const zilTruckImage = "https://images.unsplash.com/photo-1765603955623-e2f57e1c7d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const kamazTruckImage = "https://images.unsplash.com/photo-1758549756956-68af87f6a55e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const mazTruckImage = "https://images.unsplash.com/photo-1644004482249-cdad1f0da74c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const volvoTruckImage = "https://images.unsplash.com/photo-1765603955623-e2f57e1c7d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
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
        borderRadius: "14px",
        border: "2px solid",
        borderColor: isSelected
          ? d.highlight ? "rgba(143,232,180,0.85)" : "#3FAE6C"
          : hovered
            ? d.highlight ? "rgba(143,232,180,0.55)" : "#3FAE6C"
            : d.highlight ? "rgba(143,232,180,0.15)" : "transparent",
        background: d.highlight ? "#1e3d2a" : "#f5efe4",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", cursor: "pointer",
        boxShadow: hovered
          ? d.highlight ? "0 24px 52px rgba(30,61,42,0.42)" : "0 18px 44px rgba(0,0,0,0.14)"
          : isSelected
            ? d.highlight ? "0 0 0 4px rgba(143,232,180,0.15), 0 8px 24px rgba(30,61,42,0.28)" : "0 0 0 4px rgba(63,174,108,0.12), 0 8px 24px rgba(0,0,0,0.10)"
            : d.highlight ? "0 6px 20px rgba(30,61,42,0.18)" : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.28s ease, border 0.22s ease",
      }}
    >
      {d.highlight && (
        <div style={{ position: "absolute", top: "10px", right: "10px", background: "linear-gradient(135deg, #3FAE6C, #2a9158)", color: "#fff", fontFamily: SANS, fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px", padding: "4px 12px", borderRadius: "100px", boxShadow: "0 2px 10px rgba(63,174,108,0.50)", zIndex: 3 }}>
          ПОПУЛЯРНИЙ
        </div>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div key="check" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            style={{ position: "absolute", top: "10px", left: "10px", zIndex: 4, width: "24px", height: "24px", borderRadius: "50%", background: d.highlight ? "#8fe8b4" : "#3FAE6C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(63,174,108,0.45)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <motion.path d="M2 6l3 3 5-5" stroke={d.highlight ? "#0f2018" : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.26, delay: 0.05 }} />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Truck image */}
      <div style={{ width: "100%", borderBottom: d.highlight ? "1px solid rgba(143,232,180,0.10)" : "1px solid #ede5d5", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)", transformOrigin: "center center" }}>
          <TruckImageCanvas src={imgSrc} alt={`Самоскид ${d.truck}`} height={152} padding={8} whiteThreshold={238} />
        </div>
      </div>

      {/* Capacity bar */}
      <div style={{ padding: "14px 22px 12px", borderBottom: d.highlight ? "1px solid rgba(143,232,180,0.10)" : "1px solid #ede5d5", background: d.highlight ? "rgba(30,61,42,0.85)" : "#faf7f2" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
          <span style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: d.highlight ? "rgba(143,232,180,0.55)" : "rgba(58,122,87,0.55)" }}>Вантажність</span>
          <span style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, color: d.highlight ? "#8fe8b4" : "#3a7a57" }}>{d.capacity}&nbsp;&nbsp;{d.volume}</span>
        </div>
        <CapacityBar segments={d.segments} highlight={d.highlight} />
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: d.highlight ? "rgba(143,232,180,0.45)" : "rgba(58,122,87,0.35)", flexShrink: 0 }} />
          <span style={{ fontFamily: SANS, fontSize: "11px", color: d.highlight ? "rgba(255,255,255,0.42)" : "rgba(90,69,53,0.55)", lineHeight: 1.4 }}>{d.usageLabel}</span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontSize: "26px", fontWeight: 800, color: d.highlight ? "#8fe8b4" : "#140c07", marginBottom: "4px", lineHeight: 1 }}>{d.truck}</div>
        <div style={{ fontFamily: SANS, fontSize: "13px", color: d.highlight ? "rgba(255,255,255,0.55)" : "#8a7565", marginBottom: "14px" }}>{d.note}</div>
        <div style={{ fontFamily: SANS, fontSize: "18px", fontWeight: 600, color: d.highlight ? "#ffffff" : "#140c07", marginBottom: "16px" }}>{d.price}</div>
        <button onClick={(e) => { e.stopPropagation(); onOrder(); }}
          style={{ display: "block", width: "100%", fontFamily: SANS, fontSize: "13px", fontWeight: 700, background: d.highlight ? "linear-gradient(135deg, #3FAE6C 0%, #2d7a50 100%)" : "#1e3d2a", color: d.highlight ? "#ffffff" : "#8fe8b4", border: "none", borderRadius: "8px", padding: "12px", cursor: "pointer", boxShadow: d.highlight ? "0 3px 14px rgba(63,174,108,0.30)" : "0 2px 10px rgba(30,61,42,0.25)", marginTop: "auto", letterSpacing: "0.2px", transition: "opacity 0.18s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
    <section id="pricing" style={{ background: "#ffffff", padding: "96px 24px" }} className="pricing-section">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "#3a7a57", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>Актуальні ціни</div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#140c07", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "16px" }}>Прозора вартість чорнозему</h2>
          <p style={{ fontFamily: SANS, fontSize: "17px", color: "#5a4535", maxWidth: "540px", margin: "0 auto", lineHeight: 1.6 }}>
            Ціна на ґрунт фіксована. Вартість доставки залежить від типу самоскида та відстані — уточнюємо при дзвінку.
          </p>
        </motion.div>

        {/* Purchase format cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>

          {/* Bulk card */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ background: "#1e3d2a", borderRadius: "20px", padding: "40px 36px", position: "relative", boxShadow: "0 16px 48px rgba(30,61,42,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4fba80", boxShadow: "0 0 6px rgba(79,186,128,0.7)" }} />
              <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: "#8fe8b4" }}>В наявності</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(58,122,87,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Truck size={22} color="#8fe8b4" strokeWidth={1.6} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>Чорнозем насипом</h3>
            </div>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              Доставка самоскидом прямо на ділянку. Розвантаження автоматичне. Підходить для об'ємів від {pricing.minTons} тонн і вище.
            </p>
            <div style={{ paddingTop: "36px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: SERIF, fontSize: "82px", fontWeight: 800, color: "#8fe8b4", letterSpacing: "-2px", lineHeight: 1 }}>{pricing.bulkPricePerTon}</span>
                <span style={{ fontFamily: SANS, fontSize: "22px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>грн</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: "18px", fontWeight: 500, color: "rgba(255,255,255,0.75)", marginTop: "8px" }}>за 1 тонну</div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(79,186,128,0.12)", border: "1px solid rgba(79,186,128,0.25)", borderRadius: "8px", padding: "7px 14px", marginTop: "18px", marginBottom: "24px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4fba80", boxShadow: "0 0 6px rgba(79,186,128,0.8)", flexShrink: 0 }} />
              <span style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, color: "#8fe8b4" }}>Склад у Києві&nbsp;•&nbsp;350+ доставок щомісяця</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.38)", marginBottom: "24px" }}>
              З навантаженням зі складу · мінімум від {pricing.minTons} тонн
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {["Без торфу, глини та домішок","Навантаження на складі включено","Розвантаження самоскидом на місці","Можна замовити на сьогодні","Самовивіз також доступний"].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.78)" }}>
                  <CheckCircle2 size={15} color="#8fe8b4" strokeWidth={2} />{f}
                </li>
              ))}
            </ul>
            <button onClick={() => onOrder()}
              style={{ width: "100%", fontFamily: SANS, fontSize: "15px", fontWeight: 700, background: "#4fba80", color: "#0f2018", border: "none", borderRadius: "10px", padding: "16px 24px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 20px rgba(79,186,128,0.35)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#6dd4a0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#4fba80"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Замовити насипом
            </button>
          </motion.div>

          {/* Bags + self-pickup */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              style={{ background: "#ffffff", borderRadius: "18px", padding: "28px 30px", border: "1.5px solid #ede5d8", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f3f7ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color="#5a6e3a" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 700, color: "#140c07", marginBottom: "5px" }}>Чорнозем у мішках</h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#f0faf5", border: "1px solid #b8e0c8", borderRadius: "100px", padding: "2px 10px" }}>
                    <span style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "#3a7a57" }}>🌿 Для клумб та городу</span>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: SANS, fontSize: "14px", color: "#7a6555", lineHeight: 1.6, marginBottom: "20px" }}>
                Ідеально для балконів, клумб, горщиків та невеликих робіт. Можна купити від 1 мішка з доставкою або самовивозом.
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                <span style={{ fontFamily: SERIF, fontSize: "44px", fontWeight: 800, color: "#140c07", letterSpacing: "-1.5px", lineHeight: 1 }}>{pricing.bagPrice}</span>
                <span style={{ fontFamily: SANS, fontSize: "15px", color: "#8a7565", marginLeft: "4px" }}>грн / мішок</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: "13px", color: "#a09080", marginBottom: "22px" }}>
                Вага мішка — {pricing.bagWeightKg} кг · від 1 мішка
              </div>
              <button onClick={onOrder}
                style={{ width: "100%", fontFamily: SANS, fontSize: "14px", fontWeight: 600, background: "#140c07", color: "#ffffff", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2a1a0f"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#140c07"; e.currentTarget.style.transform = "translateY(0)"; }}>
                Замовити мішки
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              style={{ background: "#f5efe4", borderRadius: "18px", padding: "24px 30px", border: "1.5px solid #e0d8c8", display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#ede5d8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Warehouse size={20} color="#7a6555" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: "17px", fontWeight: 700, color: "#140c07", marginBottom: "5px" }}>Самовивіз зі складу</div>
                <div style={{ fontFamily: SANS, fontSize: "13px", color: "#7a6555", lineHeight: 1.5 }}>{general.address} · можна приїхати та оглянути</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Truck delivery cards — from content */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "#3a7a57", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px", textAlign: "center" }}>
            Вартість доставки за типом самоскида
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
                  <div style={{ background: "linear-gradient(135deg, #1e3d2a, #142d1e)", borderRadius: "14px", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", border: "1px solid rgba(143,232,180,0.15)", boxShadow: "0 8px 32px rgba(30,61,42,0.25)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(143,232,180,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#8fe8b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(143,232,180,0.55)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>Обрано самоскид</div>
                        <div style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 800, color: "#8fe8b4" }}>
                          {sel.truck}
                          <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>{sel.capacity}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                      {([["Об'єм", sel.volume], ["Доставка", sel.price], ["Призначення", sel.usageLabel]] as [string,string][]).map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "3px" }}>{lbl}</div>
                          <div style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => onOrder(sel.maxTons)}
                      style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 700, background: "linear-gradient(135deg, #3FAE6C, #2d7a50)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", cursor: "pointer" }}>
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
        }
        @media (max-width: 480px) {
          .pricing-section { padding: 60px 16px 100px !important; }
          .truck-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}