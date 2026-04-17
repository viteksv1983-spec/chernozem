import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle, Phone, User, Package,
  ChevronDown, Truck, Weight, AlertCircle,
} from "lucide-react";
import { sendTelegramOrder, trackEvent } from "../lib/integrations";
import { getUtm, utmToString } from "../lib/utm";
import { useContent } from "../contexts/ContentContext";
import { getRecommendedTruck } from "../lib/siteContent";

// ─── Ukrainian Phone Validation ────────────────────────────────
// Comprehensive validation for Ukrainian mobile + landline numbers
// with operator code whitelist and input auto-formatting.
// ────────────────────────────────────────────────────────────────

/** Valid Ukrainian mobile operator codes (2-digit after leading 0) */
const UA_MOBILE_CODES = new Set([
  // Kyivstar
  "67", "68", "96", "97", "98",
  // Vodafone (ex-MTS)
  "50", "66", "95", "99",
  // lifecell
  "63", "73", "93",
  // 3Mob (ex-Utel/Trimob)
  "91",
  // PEOPLEnet
  "92",
  // Intertelecom
  "94",
  // Lycamobile
  "78",
  // Additional virtual/MVNO
  "70", "71", "72", "74", "75", "76", "77",
]);

/** Valid Kyiv landline code */
const UA_LANDLINE_CODES = new Set(["44"]);

/** All valid operator/area codes */
const ALL_UA_CODES = new Set([...UA_MOBILE_CODES, ...UA_LANDLINE_CODES]);

/**
 * Extract pure digits from any phone input.
 * Strips all non-digit characters, normalizes leading +38/38/8 to standard form.
 */
function extractDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Normalize to 10-digit national format: 0XXXXXXXXX
 * Accepts: +380971234567, 380971234567, 0971234567, 971234567
 */
function toNationalDigits(raw: string): string {
  const d = extractDigits(raw);
  if (d.startsWith("380")) return "0" + d.slice(3);
  if (d.startsWith("80"))  return "0" + d.slice(2);
  if (d.length === 10 && d.startsWith("0"))   return d;
  if (d.length === 9)                         return "0" + d;
  return d;
}

/**
 * Format phone digits into readable mask: +38 (0XX) XXX-XX-XX
 * Formats progressively as user types.
 */
function formatPhoneDisplay(raw: string): string {
  const nat = toNationalDigits(raw);
  if (!nat || nat.length === 0) return "";
  
  const d = nat.replace(/^0/, ""); // Remove leading 0 for formatting
  
  if (d.length === 0) return "+38 (0";
  if (d.length <= 2)  return `+38 (0${d}`;
  if (d.length <= 5)  return `+38 (0${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7)  return `+38 (0${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5)}`;
  return `+38 (0${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
}

interface PhoneValidation {
  isValid: boolean;
  isComplete: boolean;
  error: string;
  operatorName: string;
}

/**
 * Validate Ukrainian phone number with operator identification.
 * Returns validation state + friendly operator name.
 */
function validateUAPhone(raw: string): PhoneValidation {
  const digits = extractDigits(raw);
  
  // Empty — not an error yet (user hasn't started typing)
  if (digits.length === 0) {
    return { isValid: false, isComplete: false, error: "", operatorName: "" };
  }
  
  const national = toNationalDigits(raw);
  
  // Too short — still typing
  if (national.length < 10) {
    return { isValid: false, isComplete: false, error: "", operatorName: "" };
  }
  
  // Exactly 10 digits — check format
  if (national.length !== 10 || !national.startsWith("0")) {
    return { isValid: false, isComplete: true, error: "Невірний формат номера", operatorName: "" };
  }
  
  // Extract operator code (2 digits after leading 0)
  const opCode = national.slice(1, 3);
  
  // Check if operator code is valid
  if (!ALL_UA_CODES.has(opCode)) {
    return {
      isValid: false,
      isComplete: true,
      error: `Невідомий код оператора: 0${opCode}. Перевірте номер.`,
      operatorName: "",
    };
  }

  // Identify operator for UX feedback
  let operatorName = "";
  if (["67", "68", "96", "97", "98"].includes(opCode)) operatorName = "Київстар";
  else if (["50", "66", "95", "99"].includes(opCode)) operatorName = "Vodafone";
  else if (["63", "73", "93"].includes(opCode))        operatorName = "lifecell";
  else if (opCode === "91")                            operatorName = "3Mob";
  else if (opCode === "92")                            operatorName = "PEOPLEnet";
  else if (opCode === "94")                            operatorName = "Intertelecom";
  else if (opCode === "78")                            operatorName = "Lycamobile";
  else if (opCode === "44")                            operatorName = "Київ (стаціонарний)";
  else                                                 operatorName = "Мобільний";
  
  return { isValid: true, isComplete: true, error: "", operatorName };
}

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
  const [phoneMeta,  setPhoneMeta]  = useState<PhoneValidation>({ isValid: false, isComplete: false, error: "", operatorName: "" });
  const [volume,     setVolume]     = useState(prefillTons ? String(prefillTons) : "10");
  const [soilType,   setSoilType]   = useState("bulk");
  const [submitted,  setSubmitted]  = useState(false);
  const [sending,    setSending]    = useState(false);

  // ── Phone input handler with auto-formatting ──────────────────────────────
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = extractDigits(rawValue);
    
    // Limit to max 12 digits (380 + 9 digits) to prevent overflow
    if (digits.length > 12) return;
    
    // Auto-format the display value
    const formatted = digits.length > 0 ? formatPhoneDisplay(rawValue) : "";
    setPhone(formatted);
    
    // Real-time validation (non-blocking — errors only shown on complete input)
    const validation = validateUAPhone(formatted);
    setPhoneMeta(validation);
    
    // Clear error when user edits after a submit-triggered error
    if (phoneError && !validation.isComplete) {
      setPhoneError("");
    }
    // Show error only if number looks complete but invalid
    if (validation.isComplete && !validation.isValid) {
      setPhoneError(validation.error);
    } else if (validation.isValid) {
      setPhoneError("");
    }
  }, [phoneError]);

  // ── Smart paste: handle pasted phone numbers ──────────────────────────────
  const handlePhonePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = extractDigits(pasted);
    if (digits.length === 0) return;
    
    // Format pasted digits
    const formatted = formatPhoneDisplay(pasted);
    setPhone(formatted);
    
    // Validate immediately
    const validation = validateUAPhone(formatted);
    setPhoneMeta(validation);
    if (validation.isComplete && !validation.isValid) {
      setPhoneError(validation.error);
    } else {
      setPhoneError("");
    }
  }, []);

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

    // Final phone validation (with operator code check)
    const validation = validateUAPhone(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || "Введіть коректний номер телефону");
      return;
    }
    
    setPhoneError("");
    setSending(true);

    // Normalize phone for server submission: 0XXXXXXXXX → +380XXXXXXXXX
    const nationalPhone = toNationalDigits(phone);
    const formattedPhone = `+38${nationalPhone.slice(1)}`;

    const utmInfo = utmToString(getUtm()) || undefined;

    // Fire-and-forget to Telegram (retry queue handles failures)
    sendTelegramOrder({
      name: name.trim(),
      phone: formattedPhone,
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
                width: "100%", maxWidth: "560px", maxHeight: "92dvh",
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
                        <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>
                            <Phone size={13} style={{ display: "inline", marginRight: "6px" }} />
                            Номер телефону
                          </span>
                          {/* Operator badge — shows when phone is valid */}
                          {phoneMeta.isValid && phoneMeta.operatorName && (
                            <span style={{
                              fontFamily: SANS, fontSize: "11px", fontWeight: 600,
                              color: "#3a7a57", background: "#e8f5ee",
                              padding: "2px 8px", borderRadius: "6px",
                              display: "inline-flex", alignItems: "center", gap: "4px",
                            }}>
                              {phoneMeta.operatorName} ✓
                            </span>
                          )}
                        </label>
                        <input
                          type="tel" value={phone}
                          onChange={handlePhoneChange}
                          onPaste={handlePhonePaste}
                          placeholder="+38 (0XX) XXX-XX-XX" required
                          autoComplete="tel"
                          inputMode="tel"
                          style={{
                            ...inputStyle,
                            border: `1.5px solid ${phoneError ? "#dc2626" : phoneMeta.isValid ? "#3a7a57" : "#e0d8c8"}`,
                            background: phoneError ? "#fef2f2" : phoneMeta.isValid ? "#f0faf5" : "#faf7f2",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = phoneError ? "#dc2626" : "#3a7a57")}
                          onBlur={(e) => (e.target.style.borderColor = phoneError ? "#dc2626" : phoneMeta.isValid ? "#3a7a57" : "#e0d8c8")}
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
                max-height: 94dvh !important;
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