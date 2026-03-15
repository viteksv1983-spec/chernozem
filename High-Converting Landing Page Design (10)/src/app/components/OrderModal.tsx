import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle, Phone, User, Package,
  ChevronDown, Truck, Weight, AlertCircle,
} from "lucide-react";
import { sendTelegramOrder, trackEvent } from "../lib/integrations";
import { getUtm, utmToString } from "../lib/utm";
import { useContent } from "../contexts/ContentContext";
import { getRecommendedTruck } from "../lib/siteContent";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

interface OrderModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  isCalc?:      boolean;
  prefillTons?: number;
}

const KG_PER_BAG = 50; // default; overridden by content.pricing.bagWeightKg

/** Format kg: below 1000 → "250 кг", above → "2.5 т (2 500 кг)" */
function formatWeight(kg: number): string {
  if (kg < 1000) return `${kg.toLocaleString()} кг`;
  const t = (kg / 1000).toFixed(1).replace(".0", "");
  return `${t} т (${kg.toLocaleString()} кг)`;
}

export function OrderModal({ isOpen, onClose, isCalc, prefillTons }: OrderModalProps) {
  const { content } = useContent();

  // ── ✅ All prices come from admin panel — never hardcoded ────────────────
  const pricePerTon = content.pricing.bulkPricePerTon;   // e.g. 350
  const pricePerBag = content.pricing.bagPrice;          // e.g. 100
  const kgPerBag    = content.pricing.bagWeightKg || KG_PER_BAG; // e.g. 50
  const minTons     = content.pricing.minTons;           // e.g. 5

  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [volume,     setVolume]     = useState(prefillTons ? String(prefillTons) : "10");
  const [soilType,   setSoilType]   = useState("bulk");
  const [submitted,  setSubmitted]  = useState(false);
  const [sending,    setSending]    = useState(false);

  // Sync prefillTons → volume every time the modal re-opens with a new value
  useEffect(() => {
    if (isOpen && prefillTons !== undefined) {
      setSoilType("bulk");
      setVolume(String(Math.min(100, Math.max(minTons, Math.round(prefillTons)))));
    }
  }, [isOpen, prefillTons, minTons]);

  const isBulk = soilType === "bulk";

  // ── Calculations ──────────────────────────────────────────────────────────
  const numericVolume  = Number(volume);
  const bagCount       = isBulk ? 0 : numericVolume;
  const bagWeightKg    = bagCount * kgPerBag;
  const bagWeightTons  = bagWeightKg / 1000;
  const tonsForTruck   = isBulk ? numericVolume : bagWeightTons;

  const soilCost = isBulk
    ? Math.round(numericVolume * pricePerTon)
    : Math.round(bagCount * pricePerBag);

  const volumeLabel = isBulk ? `${volume} т` : `${bagCount} мішків`;
  const weightLabel  = isBulk ? null : formatWeight(bagWeightKg);

  // ✅ Reads priceMin/priceMax from admin delivery table — never hardcoded
  const truck = useMemo(
    () => getRecommendedTruck(tonsForTruck, content.pricing.delivery),
    [tonsForTruck, content.pricing.delivery],
  );

  const totalMin = soilCost + truck.priceMin;
  const totalMax = soilCost + truck.priceMax;

  // ── Dynamic labels for select options and price breakdown ─────────────────
  const bulkLabel = `Насипом · ${pricePerTon} грн/тонна (від ${minTons} т)`;
  const bagsLabel = `У мішках · ${pricePerBag} грн/мішок (${kgPerBag} кг)`;
  const soilLineLabel = isBulk
    ? `Чорнозем (${volume} т × ${pricePerTon} грн)`
    : `Мішки (${bagCount} шт × ${pricePerBag} грн)`;
  const formatLabel = isBulk
    ? `Насипом · ${pricePerTon} грн/тонна`
    : `У мішках · ${pricePerBag} грн/мішок (${kgPerBag} кг)`;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Ukrainian phone validation (+380XXXXXXXXX or 0XXXXXXXXX)
    const cleaned = phone.replace(/[\s\-().+]/g, "");
    if (!/^(380|0)\d{9}$/.test(cleaned)) {
      setPhoneError("Введіть коректний номер (+380XXXXXXXXX або 0XXXXXXXXX)");
      return;
    }
    setPhoneError("");
    setSending(true);

    const utmInfo = utmToString(getUtm()) || undefined;

    // Fire-and-forget to Telegram (retry queue handles failures)
    sendTelegramOrder({
      name: name.trim(),
      phone: phone.trim(),
      volumeLabel: isBulk ? `${volume} т` : `${volume} мішків`,
      soilType: soilType as "bulk" | "bags",
      truckName: truck.name,
      truckCapacity: truck.capacity,
      soilCost,
      totalMin,
      totalMax,
      utmInfo,
    }).finally(() => setSending(false));

    setSubmitted(true);

    // ✅ GA4 generate_lead — critical for Google Ads optimisation
    trackEvent("generate_lead", {
      value:    totalMin,
      currency: "UAH",
      items:    [{ item_name: isBulk ? "Чорнозем насипом" : "Чорнозем у мішках" }],
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setVolume("10");
      setSoilType("bulk");
    }, 400);
  };

  // ── Shared input / label styles ───────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: "10px",
    border: "1.5px solid #e0d8c8", background: "#faf7f2",
    fontFamily: SANS, fontSize: "15px", color: "#140c07",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: SANS, fontSize: "13px",
    fontWeight: 600, color: "#5a4535", marginBottom: "8px",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(14, 8, 4, 0.78)", backdropFilter: "blur(5px)",
            }}
          />

          {/* ── Centering wrapper: desktop = centered, mobile = bottom sheet ── */}
          <div className="modal-outer" style={{
            position: "fixed", inset: 0, zIndex: 301,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", pointerEvents: "none",
          }}>
            <motion.div
              className="modal-sheet"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{
                width: "100%", maxWidth: "560px", maxHeight: "92vh",
                overflowY: "auto", background: "#ffffff", borderRadius: "24px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                pointerEvents: "all", position: "relative",
              }}
            >
              {/* Close btn */}
              <button
                onClick={handleClose}
                className="modal-close-btn"
                style={{
                  position: "absolute", top: "16px", right: "16px",
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#f0ece4", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                  flexShrink: 0,
                }}
              >
                <X size={16} color="#5a4535" />
              </button>

              {/* Drag handle — mobile only */}
              <div className="modal-drag-handle" style={{
                display: "none", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px",
              }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "#e0d8c8" }} />
              </div>

              <div className="modal-body" style={{ padding: "40px 40px 36px" }}>
                {!submitted ? (
                  <>
                    {/* ── Header ── */}
                    <div style={{ marginBottom: "26px", paddingRight: "28px" }}>
                      <div style={{
                        fontFamily: SANS, fontSize: "12px", fontWeight: 600,
                        color: "#3a7a57", letterSpacing: "2px", textTransform: "uppercase",
                        marginBottom: "10px",
                      }}>
                        {isCalc ? "Калькулятор вартості" : "Оформити замовлення"}
                      </div>
                      <h2 style={{
                        fontFamily: SERIF, fontSize: "28px", fontWeight: 700,
                        color: "#140c07", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: "6px",
                      }}>
                        {isCalc ? "Розрахуйте вартість доставки" : "Замовити чорнозем"}
                      </h2>
                      <p style={{ fontFamily: SANS, fontSize: "14px", color: "#8a7565", lineHeight: 1.6 }}>
                        Менеджер передзвонить протягом 5 хвилин та уточнить деталі.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* ── Soil type ── */}
                      <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>
                          <Package size={13} style={{ display: "inline", marginRight: "6px" }} />
                          Тип чорнозему
                        </label>
                        <div style={{ position: "relative" }}>
                          <select
                            value={soilType}
                            onChange={(e) => {
                              setSoilType(e.target.value);
                              setVolume(e.target.value === "bulk" ? "10" : "50");
                            }}
                            style={{
                              width: "100%", padding: "14px 40px 14px 16px",
                              borderRadius: "10px", border: "1.5px solid #e0d8c8",
                              background: "#faf7f2", fontFamily: SANS, fontSize: "15px",
                              color: "#140c07", outline: "none", appearance: "none", cursor: "pointer",
                              boxSizing: "border-box",
                            }}
                          >
                            <option value="bulk">{bulkLabel}</option>
                            <option value="bags">{bagsLabel}</option>
                          </select>
                          <ChevronDown size={16} color="#8a7565" style={{
                            position: "absolute", right: "14px", top: "50%",
                            transform: "translateY(-50%)", pointerEvents: "none",
                          }} />
                        </div>
                      </div>

                      {/* ── Volume slider ── */}
                      <div style={{ marginBottom: "20px" }}>
                        <label style={{
                          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                          fontFamily: SANS, fontSize: "13px", fontWeight: 600,
                          color: "#5a4535", marginBottom: "8px",
                        }}>
                          <span>{isBulk ? "Об'єм (тонн)" : "Кількість мішків"}</span>
                          <span style={{ textAlign: "right" }}>
                            <span style={{ color: "#3a7a57", fontWeight: 700 }}>{volumeLabel}</span>
                            {!isBulk && weightLabel && (
                              <span style={{
                                display: "flex", alignItems: "center", justifyContent: "flex-end",
                                gap: "4px", fontFamily: SANS, fontSize: "12px",
                                fontWeight: 500, color: "#8a9a8a", marginTop: "2px",
                              }}>
                                <Weight size={11} />
                                {weightLabel}
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          type="range"
                          min={isBulk ? minTons.toString() : "50"}
                          max={isBulk ? "100" : "2000"}
                          step={isBulk ? "1" : "10"}
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          style={{ width: "100%", height: "5px", accentColor: "#3a7a57", cursor: "pointer" }}
                        />
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontFamily: SANS, fontSize: "12px", color: "#b0a090", marginTop: "6px",
                        }}>
                          {isBulk
                            ? <><span>{minTons} т</span><span>100 т</span></>
                            : <><span>50 мішків</span><span>2 000 мішків</span></>}
                        </div>
                      </div>

                      {/* ── Truck recommendation (mobile-optimised) ── */}
                      <div className="truck-card" style={{
                        background: "#f0faf5", border: "1.5px solid #b0ddc8",
                        borderRadius: "12px", padding: "14px 16px", marginBottom: "12px",
                        display: "flex", alignItems: "center", gap: "12px",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: "44px", height: "44px", borderRadius: "10px",
                          background: "#1e3d2a", display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          <Truck size={20} color="#8fe8b4" strokeWidth={1.6} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: SANS, fontSize: "10px", fontWeight: 600,
                            color: "#5a9a75", letterSpacing: "1px",
                            textTransform: "uppercase", marginBottom: "2px",
                          }}>
                            Рекомендований самоскид
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: "#1e3d2a" }}>
                              {truck.name}
                            </span>
                            <span style={{ fontFamily: SANS, fontSize: "12px", color: "#5a9a75" }}>
                              {truck.capacity}
                            </span>
                          </div>
                          {truck.trips > 1 && (
                            <div style={{ fontFamily: SANS, fontSize: "11px", color: "#7aaa8a", marginTop: "1px" }}>
                              {truck.trips} рейси
                            </div>
                          )}
                        </div>
                        {/* Delivery price — wraps on narrow screens */}
                        <div className="truck-price" style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: "10px", color: "#5a9a75", marginBottom: "2px" }}>
                            Доставка
                          </div>
                          <div style={{
                            fontFamily: SERIF, fontSize: "15px", fontWeight: 700,
                            color: "#1e3d2a", whiteSpace: "nowrap",
                          }}>
                            {truck.priceMin.toLocaleString()}–{truck.priceMax.toLocaleString()} грн
                          </div>
                        </div>
                      </div>

                      {/* ── Price breakdown ── */}
                      <div style={{
                        background: "#1e3d2a", borderRadius: "12px",
                        padding: "16px 18px", marginBottom: "24px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "8px" }}>
                          <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.6)", minWidth: 0 }}>
                            {soilLineLabel}
                          </span>
                          <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: "#8fe8b4", flexShrink: 0 }}>
                            {soilCost.toLocaleString()} грн
                          </span>
                        </div>
                        {!isBulk && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "8px" }}>
                            <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                              Загальна вага мішків
                            </span>
                            <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                              {formatWeight(bagWeightKg)}
                            </span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", gap: "8px" }}>
                          <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.6)", minWidth: 0 }}>
                            Доставка ({truck.name}{truck.trips > 1 ? `, ${truck.trips} рейси` : ""})
                          </span>
                          <span style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: "#8fe8b4", flexShrink: 0 }}>
                            {truck.priceMin.toLocaleString()}–{truck.priceMax.toLocaleString()} грн
                          </span>
                        </div>
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.12)", marginBottom: "12px" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "8px" }}>
                          <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
                            Разом орієнтовно
                          </span>
                          <div style={{ textAlign: "right" }}>
                            <div className="modal-total-price" style={{
                              fontFamily: SERIF, fontWeight: 800,
                              color: "#ffffff", lineHeight: 1.1,
                            }}>
                              {totalMin.toLocaleString()}–{totalMax.toLocaleString()}
                              <span style={{
                                fontFamily: SANS, fontSize: "14px", fontWeight: 400,
                                marginLeft: "4px", color: "rgba(255,255,255,0.7)",
                              }}>
                                грн
                              </span>
                            </div>
                            <div style={{
                              fontFamily: SANS, fontSize: "11px",
                              color: "rgba(255,255,255,0.35)", marginTop: "4px",
                            }}>
                              точна вартість — при дзвінку
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Name ── */}
                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>
                          <User size={13} style={{ display: "inline", marginRight: "6px" }} />
                          Ваше ім'я
                        </label>
                        <input
                          type="text" value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Іван Іванович" required
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#3a7a57")}
                          onBlur={(e) => (e.target.style.borderColor = "#e0d8c8")}
                        />
                      </div>

                      {/* ── Phone ── */}
                      <div style={{ marginBottom: "28px" }}>
                        <label style={labelStyle}>
                          <Phone size={13} style={{ display: "inline", marginRight: "6px" }} />
                          Номер телефону
                        </label>
                        <input
                          type="tel" value={phone}
                          onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                          placeholder="+38 (097) ___-__-__" required
                          style={{
                            ...inputStyle,
                            border: `1.5px solid ${phoneError ? "#dc2626" : "#e0d8c8"}`,
                            background: phoneError ? "#fef2f2" : "#faf7f2",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = phoneError ? "#dc2626" : "#3a7a57")}
                          onBlur={(e) => (e.target.style.borderColor = phoneError ? "#dc2626" : "#e0d8c8")}
                        />
                        {phoneError && (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px" }}>
                            <AlertCircle size={13} color="#dc2626" />
                            <p style={{ fontFamily: SANS, fontSize: "12px", color: "#dc2626", margin: 0 }}>
                              {phoneError}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ── Submit ── */}
                      <button
                        type="submit" disabled={sending}
                        style={{
                          width: "100%", padding: "18px",
                          background: sending ? "#6aaa85" : "linear-gradient(135deg, #3cb96e 0%, #24894d 100%)",
                          color: "#ffffff", border: "none", borderRadius: "14px",
                          fontFamily: SANS, fontSize: "17px", fontWeight: 700,
                          cursor: sending ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                          boxShadow: sending ? "none" : "0 6px 24px rgba(36,137,77,0.42)",
                          letterSpacing: "0.1px",
                        }}
                        onMouseEnter={(e) => {
                          if (!sending) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 10px 32px rgba(36,137,77,0.52)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sending) {
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "0 6px 24px rgba(36,137,77,0.42)";
                          }
                        }}
                      >
                        {sending ? "Відправляємо..." : "Надіслати заявку"}
                      </button>
                      <p style={{
                        fontFamily: SANS, fontSize: "12px", color: "#b0a090",
                        textAlign: "center", marginTop: "14px", lineHeight: 1.5,
                      }}>
                        Натискаючи кнопку, ви погоджуєтесь з умовами обробки даних.
                        <br />Ми не передаємо контакти третім особам.
                      </p>
                    </form>
                  </>
                ) : (
                  /* ── Success / Thank You screen ── */
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: "#f0faf5", display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 28px",
                      }}
                    >
                      <CheckCircle size={40} color="#3a7a57" />
                    </motion.div>

                    <h2 style={{
                      fontFamily: SERIF, fontSize: "28px", fontWeight: 700,
                      color: "#140c07", marginBottom: "16px", letterSpacing: "-0.5px",
                    }}>
                      Заявку прийнято!
                    </h2>
                    <p style={{
                      fontFamily: SANS, fontSize: "16px", color: "#5a4535",
                      lineHeight: 1.65, marginBottom: "32px",
                    }}>
                      Дякуємо, <strong>{name}</strong>! Наш менеджер зв'яжеться
                      з вами за номером{" "}
                      <strong style={{ color: "#3a7a57" }}>{phone}</strong>{" "}
                      протягом 5 хвилин.
                    </p>

                    {/* Order summary card */}
                    <div style={{
                      background: "#1e3d2a", borderRadius: "14px",
                      padding: "22px 24px", marginBottom: "28px", textAlign: "left",
                    }}>
                      <div style={{
                        fontFamily: SANS, fontSize: "11px", color: "rgba(255,255,255,0.4)",
                        marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px",
                      }}>
                        Ваше замовлення
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>
                          {/* ✅ dynamic format label */}
                          {formatLabel}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>
                          {volumeLabel}
                          {!isBulk && weightLabel && (
                            <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: "8px" }}>
                              ({weightLabel})
                            </span>
                          )}
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: "#8fe8b4" }}>
                          {soilCost.toLocaleString()} грн
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontFamily: SANS, fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>
                          Доставка {truck.name}{truck.trips > 1 ? ` (${truck.trips} рейси)` : ""}
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: "#8fe8b4" }}>
                          {truck.priceMin.toLocaleString()}–{truck.priceMax.toLocaleString()} грн
                        </span>
                      </div>

                      <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: SANS, fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                          Разом орієнтовно
                        </span>
                        <div style={{
                          fontFamily: SERIF, fontSize: "30px", fontWeight: 800,
                          color: "#ffffff", lineHeight: 1,
                        }}>
                          {totalMin.toLocaleString()}–{totalMax.toLocaleString()}{" "}
                          <span style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 400 }}>грн</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      style={{
                        width: "100%", padding: "15px", background: "#140c07",
                        color: "#ffffff", border: "none", borderRadius: "12px",
                        fontFamily: SANS, fontSize: "15px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Закрити
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <style>{`
            /* ── Mobile: bottom sheet ── */
            @media (max-width: 640px) {
              .modal-outer {
                align-items: flex-end !important;
                padding: 0 !important;
              }
              .modal-sheet {
                max-width: 100% !important;
                border-radius: 24px 24px 0 0 !important;
                max-height: 94vh !important;
                /* Slide up from bottom */
              }
              .modal-drag-handle { display: flex !important; }
              .modal-body { padding: 16px 20px 32px !important; }
              .modal-close-btn { top: 14px !important; right: 14px !important; }
              .modal-total-price { font-size: 22px !important; }
              .truck-price { max-width: 110px; }
            }
            @media (max-width: 400px) {
              .modal-body { padding: 12px 16px 28px !important; }
              .truck-price { max-width: 90px; }
              .truck-price div:last-child { font-size: 13px !important; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}