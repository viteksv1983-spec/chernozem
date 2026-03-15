import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Ruler, Layers, ChevronRight, Info, Truck } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { getRecommendedTruck } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const DENSITY = 1.8; // т/м³

// ── sessionStorage persistence ──
const SESSION_KEY = "kc_calc_v1";
function readSession(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
}

interface CalculatorProps {
  onOrder: (tons: number) => void;
}

export function Calculator({ onOrder }: CalculatorProps) {
  const s = readSession();
  const [mode, setMode] = useState<"area" | "tons">(s.mode === "tons" ? "tons" : "area");
  const [length, setLength] = useState(s.length || "10");
  const [width, setWidth] = useState(s.width || "8");
  const [depth, setDepth] = useState(s.depth || "0.3");
  const [directTons, setDirectTons] = useState(s.directTons || "10");

  const { content } = useContent();
  const pricePerTon = content.pricing.bulkPricePerTon;
  const minTons     = content.pricing.minTons;

  const { volumeM3, tons, soilCost, truck, totalMin, totalMax } = useMemo(() => {
    let tons = 0;
    let volumeM3 = 0;

    if (mode === "area") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      const d = parseFloat(depth) || 0;
      volumeM3 = l * w * d;
      tons = volumeM3 * DENSITY;
    } else {
      tons = parseFloat(directTons) || 0;
      volumeM3 = tons / DENSITY;
    }

    tons = Math.max(minTons, tons);
    const soilCost = Math.round(tons * pricePerTon);
    // ✅ Reads prices from admin panel — never hardcoded
    const truck = getRecommendedTruck(tons, content.pricing.delivery);

    return { volumeM3, tons, soilCost, truck, totalMin: soilCost + truck.priceMin, totalMax: soilCost + truck.priceMax };
  }, [mode, length, width, depth, directTons, pricePerTon, content.pricing.delivery]);

  // ── Persist inputs across navigation ──
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ mode, length, width, depth, directTons }));
    } catch { /* noop */ }
  }, [mode, length, width, depth, directTons]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #d8cfc4",
    background: "#ffffff",
    fontFamily: SANS,
    fontSize: "16px",
    fontWeight: 600,
    color: "#140c07",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: "12px",
    fontWeight: 600,
    color: "#7a6555",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "7px",
    display: "block",
  };

  return (
    <section
      id="calculator"
      style={{
        background: "#eee8df",
        padding: "88px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-80px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "rgba(58,122,87,0.07)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "48px" }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: "12px",
              fontWeight: 600,
              color: "#3a7a57",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Калькулятор вартості
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 700,
              color: "#140c07",
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
              maxWidth: "480px",
            }}
          >
            Розрахуйте точну вартість за хвилину
          </h2>
        </motion.div>

        {/* ── Main grid: inputs left, result right ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
            alignItems: "start",
          }}
          className="calc-grid"
        >
          {/* ── LEFT: Input panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Mode toggle */}
            <div
              style={{
                display: "flex",
                background: "#f0ece4",
                borderRadius: "12px",
                padding: "4px",
                marginBottom: "28px",
                gap: "4px",
              }}
            >
              {[
                { key: "area", label: "За площею", icon: Ruler },
                { key: "tons", label: "Знаю тоннаж", icon: Layers },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key as "area" | "tons")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "9px",
                    border: "none",
                    fontFamily: SANS,
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "all 0.2s",
                    background: mode === key ? "#1e3d2a" : "transparent",
                    color: mode === key ? "#8fe8b4" : "#7a6555",
                    boxShadow: mode === key ? "0 2px 8px rgba(30,61,42,0.25)" : "none",
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            {mode === "area" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>📐 Довжина ділянки (м)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3a7a57")}
                    onBlur={(e) => (e.target.style.borderColor = "#d8cfc4")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>📐 Ширина ділянки (м)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3a7a57")}
                    onBlur={(e) => (e.target.style.borderColor = "#d8cfc4")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>📏 Висота шару (м)</label>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#3a7a57")}
                    onBlur={(e) => (e.target.style.borderColor = "#d8cfc4")}
                  />
                  {/* Quick depth presets */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    {[
                      { label: "10 см", val: "0.1" },
                      { label: "20 см", val: "0.2" },
                      { label: "30 см", val: "0.3" },
                      { label: "40 см", val: "0.4" },
                      { label: "50 см", val: "0.5" },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setDepth(p.val)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "100px",
                          border: `1.5px solid ${depth === p.val ? "#3a7a57" : "#ddd6ca"}`,
                          background: depth === p.val ? "#eef7f2" : "transparent",
                          color: depth === p.val ? "#3a7a57" : "#8a7565",
                          fontFamily: SANS,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={labelStyle}>🚛 Кількість тонн</label>
                <input
                  type="number"
                  min={String(minTons)}
                  max="500"
                  step="1"
                  value={directTons}
                  onChange={(e) => setDirectTons(e.target.value)}
                  style={{ ...inputStyle, fontSize: "22px", padding: "16px 18px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3a7a57")}
                  onBlur={(e) => (e.target.style.borderColor = "#d8cfc4")}
                />
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: "12px",
                    color: "#9a8878",
                    marginTop: "10px",
                  }}
                >
                  Мінімальне замовлення — від {minTons} тонн насипом
                </div>
                {/* Quick ton presets */}
                <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                  {[
                    { label: "5 т", val: "5" },
                    { label: "10 т", val: "10" },
                    { label: "15 т", val: "15" },
                    { label: "20 т", val: "20" },
                    { label: "35 т", val: "35" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setDirectTons(p.val)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "100px",
                        border: `1.5px solid ${directTons === p.val ? "#3a7a57" : "#ddd6ca"}`,
                        background: directTons === p.val ? "#eef7f2" : "transparent",
                        color: directTons === p.val ? "#3a7a57" : "#8a7565",
                        fontFamily: SANS,
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Formula hint bar ── */}
            <div
              style={{
                marginTop: "28px",
                background: "#f5faf7",
                border: "1.5px solid #b8dcc8",
                borderRadius: "12px",
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <Zap size={13} color="#3a7a57" />
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2d6045",
                  }}
                >
                  Як розрахувати потрібний об'єм?
                </span>
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: "12px",
                  color: "#5a7a65",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Об'єм = Довжина × Ширина × Висота шару · 1.8{" "}
                <span style={{ color: "#8aaa95" }}>
                  (коефіцієнт щільності чорнозему: 1 м³ = 1.7–1.9 т)
                </span>
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Result panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Volume summary */}
            <div
              style={{
                background: "#1e3d2a",
                borderRadius: "20px",
                padding: "28px 28px 24px",
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#4fba80",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Результат розрахунку
              </div>

              {/* Vol + Tons row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>
                    Об'єм
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={volumeM3.toFixed(1)}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: SERIF,
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1,
                      }}
                    >
                      {volumeM3 > 0 ? volumeM3.toFixed(1) : "–"}
                      <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: "4px" }}>
                        м³
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div
                  style={{
                    background: "rgba(79,186,128,0.12)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    border: "1px solid rgba(79,186,128,0.2)",
                  }}
                >
                  <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(143,232,180,0.6)", marginBottom: "6px" }}>
                    Тонн
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tons.toFixed(1)}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: SERIF,
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#8fe8b4",
                        lineHeight: 1,
                      }}
                    >
                      {tons.toFixed(1)}
                      <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 400, color: "rgba(143,232,180,0.55)", marginLeft: "4px" }}>
                        т
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                    Чорнозем ({tons.toFixed(1)} т × {pricePerTon} грн)
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={soilCost}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: "#8fe8b4" }}
                    >
                      {soilCost.toLocaleString()} грн
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                    Доставка ({truck.name})
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${truck.priceMin}-${truck.priceMax}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: "#8fe8b4" }}
                    >
                      {truck.priceMin.toLocaleString()}–{truck.priceMax.toLocaleString()} грн
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.10)",
                    margin: "4px 0",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                    Разом орієнтовно
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${totalMin}-${totalMax}`}
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 4 }}
                      transition={{ duration: 0.22, type: "spring", stiffness: 300, damping: 22 }}
                      style={{
                        fontFamily: SERIF,
                        fontSize: "24px",
                        fontWeight: 800,
                        color: "#ffffff",
                        display: "inline-block",
                      }}
                    >
                      {totalMin.toLocaleString()}–{totalMax.toLocaleString()}
                      <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: "4px" }}>
                        грн
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Truck recommendation */}
            <motion.div
              layout
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                border: "1px solid #ede5d8",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#1e3d2a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Truck size={22} color="#8fe8b4" strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#3a7a57",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  Рекомендований самоскид
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={truck.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontFamily: SERIF,
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#140c07",
                    }}
                  >
                    {truck.name}
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#8a7565",
                        marginLeft: "8px",
                      }}
                    >
                      {truck.capacity}
                    </span>
                  </motion.div>
                </AnimatePresence>
                {truck.trips > 1 && (
                  <div style={{ fontFamily: SANS, fontSize: "12px", color: "#9a8878", marginTop: "2px" }}>
                    {truck.trips} рейси
                  </div>
                )}
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: "11px",
                  color: "#b0a090",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Info size={11} />
                авто підібрано автоматично
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p
              style={{
                fontFamily: SANS,
                fontSize: "12px",
                color: "#9a8878",
                lineHeight: 1.5,
                margin: "0 4px",
              }}
            >
              * Вартість доставки залежить від адреси. Точна ціна уточнюється менеджером при дзвінку.
            </p>

            {/* CTA */}
            <motion.button
              onClick={() => onOrder(Math.round(tons))}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "18px 24px",
                background: "linear-gradient(135deg, #2d6045 0%, #1e4a32 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                fontFamily: SANS,
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 28px rgba(45,96,69,0.42)",
                letterSpacing: "0.2px",
              }}
            >
              Розрахувати та замовити
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}