import { useState, useEffect, useRef, useCallback } from "react";
import { useContent } from "../contexts/ContentContext";
import {
  DEFAULT_CONTENT, ADMIN_PASSWORD_KEY,
  SiteContent, BenefitItem, ReviewItem, FaqItem,
  IMAGE_ALT_DEFAULTS, ImageAlts,
} from "../lib/siteContent";
import * as api from "../lib/api";

// ── Session key for stored admin password ──────────────────────
const ADMIN_SESSION_KEY = "kyivchornozem_admin_pass_v1";

// ── Fallback images (Unsplash URLs — no figma:asset in production build) ──
const _soilFallback          = "/chernozem/assets/images/soil.jpg";
const _truckDeliveryFallback = "/chernozem/assets/images/truckDelivery.jpg";
const _gardenResultFallback  = "/chernozem/assets/images/gardenResult.jpg";
const _homeownerFallback     = "/chernozem/assets/images/homeowner.jpg";
const _agroFallback          = "/chernozem/assets/images/agro.jpg";
const _landscapeFallback     = "/chernozem/assets/images/landscape.jpg";
const _gardenSegFallback     = "/chernozem/assets/images/gardenSeg.jpg";
const _lawnFallback          = "/chernozem/assets/images/lawn.jpg";
const _zilFallback           = "/chernozem/assets/images/truckDelivery.jpg";
const _kamazFallback         = "/chernozem/assets/images/kamaz.jpg";
const _mazFallback           = "/chernozem/assets/images/maz.jpg";
const _volvoFallback         = "/chernozem/assets/images/kamaz.jpg";

/** Convert any image URL (data: or http/relative) to base64 data URL */
async function toBase64(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}
import { compressImage, compressDataUrl, base64Size, formatBytes, estimateStorageUsed, type CompressionResult } from "../lib/imageUtils";
import {
  loadIntegrations, saveIntegrations, sendTelegramTest,
  loadPendingOrders, retryPendingOrders, type IntegrationSettings,
} from "../lib/integrations";
import {
  LogOut, Eye, Save, RotateCcw, Settings, Layout, Star, HelpCircle,
  DollarSign, ImageIcon, CheckCircle, ChevronDown, ChevronUp, Plus,
  Trash2, User, Lock, Building2, Upload, X, HardDrive, Users, Menu,
  Zap, Send, BarChart2, AlertCircle,
} from "lucide-react";

const SANS  = "'Inter', system-ui, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

const C = {
  bg:            "#f4f5f7",
  sidebar:       "#111c14",
  sidebarActive: "#1e3d2a",
  sidebarHover:  "rgba(255,255,255,0.06)",
  accent:        "#3FAE6C",
  accentLight:   "#eaf7f0",
  border:        "#e0ddd8",
  white:         "#ffffff",
  text:          "#1a1a1a",
  muted:         "#6b7280",
  danger:        "#dc2626",
  dangerLight:   "#fef2f2",
  success:       "#059669",
};

// ════════════════════════════════════════════
//  HOOK — detect mobile
// ════════════════════════════════════════════
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mobile;
}

// ════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const isMobile = useIsMobile();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const ok = await api.verifyPassword(pass);
      if (ok) {
        api.setAdminPassword(pass);
        sessionStorage.setItem(ADMIN_SESSION_KEY, pass);
        sessionStorage.setItem(ADMIN_PASSWORD_KEY, "true"); // backward compat
        onLogin();
      } else {
        setError(true); setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (e) {
      console.error("Login error:", e);
      setError(true); setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, padding: "16px" }}>
      <div style={{ background: C.white, borderRadius: "20px", padding: isMobile ? "32px 24px" : "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", animation: shake ? "shake 0.4s ease" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: C.sidebarActive, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Lock size={24} color="#8fe8b4" />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>Адмін-панель</h1>
          <p style={{ fontSize: "14px", color: C.muted }}>КиївЧорнозем · Управління сайтом</p>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>Пароль доступу</label>
            <input
              type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }}
              placeholder="Введіть пароль..." autoFocus
              style={{ width: "100%", padding: "14px 16px", border: `1.5px solid ${error ? C.danger : C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: error ? C.dangerLight : C.white, boxSizing: "border-box" }}
            />
            {error && <p style={{ fontSize: "13px", color: C.danger, marginTop: "6px" }}>Неправильний пароль.</p>}
          </div>
          <button type="submit" disabled={checking} style={{ width: "100%", padding: "16px", background: checking ? `${C.accent}80` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: checking ? "wait" : "pointer", fontFamily: SANS, transition: "all 0.2s" }}>
            {checking ? "Перевірка..." : "Увійти"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "12px", color: C.muted, marginTop: "20px" }}>
          Пароль змінюється в адмін-панелі → Загальне → Безпека
        </p>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ════════════════════════════════════════════
//  IMAGE UPLOADER
// ════════════════════════════════════════════
interface ImageUploaderProps {
  label: string;
  hint?: string;
  value: string;
  fallbackSrc?: string;
  onChange: (url: string) => void;
  aspect?: "landscape" | "square" | "portrait";
  /** Storage key для завантаження в Supabase (напр. "heroPhoto") */
  imageKey?: string;
  /** Current alt text value (editable by user) */
  altValue?: string;
  /** Called when user changes the alt text OR when auto-populated on upload */
  onAltChange?: (v: string) => void;
  /** Default alt text to auto-populate when a new image is uploaded and alt is empty */
  defaultAlt?: string;
}

function ImageUploader({ label, hint, value, fallbackSrc, onChange, aspect = "landscape", imageKey, altValue, onAltChange, defaultAlt }: ImageUploaderProps) {
  const [loading, setLoading]       = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [hovered, setHovered]       = useState(false);
  const [lastResult, setLastResult] = useState<CompressionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Larger images for hero/landscape; tighter for squares (avatars)
  const dimMap: Record<string, [number, number, number]> = {
    landscape: [1400, 1050, 160],
    portrait:  [800,  1200, 130],
    square:    [500,  500,  60],
  };
  const [maxW, maxH, targetKB] = dimMap[aspect];

  const heights: Record<string, number> = { landscape: 180, square: 180, portrait: 220 };
  const h = heights[aspect];

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    setLastResult(null);
    try {
      const result = await compressImage(file, maxW, maxH, targetKB);
      setLastResult(result);

      // Завантажити на сервер якщо адмін авторизований і є imageKey
      const adminPass = api.getAdminPassword();
      if (imageKey && adminPass) {
        try {
          const mimeType = `image/${result.format}`;
          const url = await api.uploadImage(imageKey, result.dataUrl, mimeType);
          onChange(url);
        } catch (uploadErr) {
          console.warn("[ImageUploader] Завантаження на сервер не вдалося, використовується base64:", uploadErr);
          onChange(result.dataUrl); // fallback до base64
        }
      } else {
        onChange(result.dataUrl);
      }

      // Auto-populate alt text if empty
      if (onAltChange && !altValue && defaultAlt) {
        onAltChange(defaultAlt);
      }
    } catch (e) {
      alert("Не вдалося обробити зображення.");
      console.error(e);
    } finally { setLoading(false); }
  }, [onChange, onAltChange, altValue, defaultAlt, maxW, maxH, targetKB, imageKey]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isUploaded = !!value;
  const hasFallback = !!fallbackSrc;

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{label}</label>
          {isUploaded && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: "#065f46", background: "#d1fae5", border: "1px solid #6ee7b7", padding: "2px 8px", borderRadius: "20px" }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#065f46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Завантажено
            </span>
          )}
          {!isUploaded && hasFallback && <span style={{ fontSize: "11px", color: "#92400e", background: "#fef3c7", border: "1px solid #fcd34d", padding: "2px 8px", borderRadius: "20px" }}>Оригінал</span>}
          {!isUploaded && !hasFallback && <span style={{ fontSize: "11px", color: C.muted, background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: "20px" }}>Не завантажено</span>}
        </div>
        {isUploaded && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {/* Format badge */}
            {lastResult && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: lastResult.format === "webp" ? "#0369a1" : "#6b7280", background: lastResult.format === "webp" ? "#e0f2fe" : "#f3f4f6", border: `1px solid ${lastResult.format === "webp" ? "#7dd3fc" : "#e5e7eb"}`, padding: "2px 7px", borderRadius: "4px" }}>
                {lastResult.format.toUpperCase()}
              </span>
            )}
            {/* Size — тільки для base64, не для URL */}
            {value.startsWith("data:") && (
              <span style={{ fontSize: "11px", color: C.muted, background: "#f3f4f6", padding: "2px 7px", borderRadius: "4px" }}>
                {base64Size(value)}
              </span>
            )}
            {value.startsWith("http") && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#0369a1", background: "#e0f2fe", border: "1px solid #7dd3fc", padding: "2px 7px", borderRadius: "4px" }}>
                ☁ Supabase
              </span>
            )}
            {/* Compression ratio */}
            {lastResult && lastResult.ratio >= 1.5 && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", background: "#d1fae5", border: "1px solid #6ee7b7", padding: "2px 7px", borderRadius: "4px" }}>
                −{Math.round((1 - 1 / lastResult.ratio) * 100)}% ({formatBytes(lastResult.originalBytes)} → {formatBytes(lastResult.compressedBytes)})
              </span>
            )}
            <button onClick={(e) => { e.stopPropagation(); onChange(""); setLastResult(null); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: C.dangerLight, border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: C.danger, fontSize: "12px", fontWeight: 600, fontFamily: SANS, minHeight: "32px" }}>
              <X size={12} /> Видалити
            </button>
          </div>
        )}
      </div>

      {/* UPLOADED */}
      {isUploaded && (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          style={{ position: "relative", height: `${h}px`, borderRadius: "12px", overflow: "hidden", border: "2.5px solid #34d399", cursor: "pointer", boxShadow: "0 0 0 3px rgba(52,211,153,0.12)" }}>
          <img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", top: "8px", left: "8px", display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(5,150,105,0.9)", backdropFilter: "blur(6px)", borderRadius: "20px", padding: "4px 10px", pointerEvents: "none" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>Завантажено</span>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", opacity: hovered || dragOver ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none" }}>
            <Upload size={24} color="#fff" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>Замінити фото</p>
          </div>
          {loading && <LoadingOverlay message="Конвертація в WebP..." />}
        </div>
      )}

      {/* FALLBACK ORIGINAL */}
      {!isUploaded && hasFallback && (
        <div onClick={() => inputRef.current?.click()}
          onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ position: "relative", height: `${h}px`, borderRadius: "12px", overflow: "hidden", border: "2px dashed #f59e0b", cursor: "pointer" }}>
          <img src={fallbackSrc} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.38) saturate(0.4)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: hovered || dragOver ? "rgba(0,0,0,0.15)" : "transparent", transition: "background 0.2s" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(245,158,11,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(245,158,11,0.5)" }}><Upload size={22} color="#fff" /></div>
            <p style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 700, color: "#fff", margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>Завантажити власне фото</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>Показується оригінал (Figma)</p>
          </div>
          {loading && <LoadingOverlay message="Конвертація в WebP..." />}
        </div>
      )}

      {/* EMPTY */}
      {!isUploaded && !hasFallback && (
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ position: "relative", height: `${h}px`, borderRadius: "12px", border: `2px dashed ${dragOver ? C.accent : hovered ? "#9ca3af" : "#d1d5db"}`, overflow: "hidden", cursor: "pointer", background: dragOver ? C.accentLight : hovered ? "#f9fafb" : "#fafafa", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {loading ? <LoadingOverlay inline message="Конвертація в WebP..." /> : (
            <>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: dragOver ? C.accent : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                <Upload size={22} color={dragOver ? "#fff" : C.accent} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: C.text, margin: 0 }}>Завантажити фото</p>
              <p style={{ fontSize: "11px", color: C.muted, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                {isMobile ? "Натисніть щоб вибрати файл" : "Клікніть або перетягніть · JPG, PNG, WEBP"}
              </p>
              <span style={{ fontSize: "10px", color: C.accent, background: C.accentLight, border: `1px solid ${C.accent}40`, padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>
                Авто-конвертація WebP
              </span>
            </>
          )}
        </div>
      )}

      {hint && <p style={{ fontSize: "12px", color: C.muted, marginTop: "6px", lineHeight: 1.4 }}>{hint}</p>}

      {/* ── Alt text field (shown when slot has alt props) ─────────────────── */}
      {onAltChange !== undefined && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: C.accent, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Alt-текст (SEO)
            </span>
            {altValue && (
              <span style={{ fontSize: "10px", color: "#065f46", background: "#d1fae5", border: "1px solid #6ee7b7", padding: "1px 7px", borderRadius: "20px", fontWeight: 600 }}>
                Заповнено
              </span>
            )}
            {!altValue && defaultAlt && (
              <button
                type="button"
                onClick={() => onAltChange(defaultAlt)}
                style={{ fontSize: "10px", color: C.accent, background: C.accentLight, border: `1px solid ${C.accent}40`, padding: "1px 8px", borderRadius: "20px", cursor: "pointer", fontWeight: 600, fontFamily: SANS }}
              >
                ↺ Авто
              </button>
            )}
          </div>
          <input
            type="text"
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={defaultAlt || "Опис зображення для пошукових систем…"}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1.5px solid ${altValue ? "#6ee7b7" : C.border}`,
              background: altValue ? "#f0fdf8" : C.inputBg,
              fontSize: "13px",
              color: C.text,
              fontFamily: SANS,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.18s, background 0.18s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = "#f0fdf8"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = altValue ? "#6ee7b7" : C.border; }}
          />
          <p style={{ fontSize: "11px", color: C.muted, marginTop: "4px", lineHeight: 1.4 }}>
            Опис фото для Google Images та скрін-рідерів. Рекомендовано: 50–125 символів.
            {defaultAlt && !altValue && (
              <> Буде автозаповнено при завантаженні фото.</>
            )}
          </p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={onFileInput} style={{ display: "none" }} />
    </div>
  );
}

function LoadingOverlay({ inline, message }: { inline?: boolean; message?: string }) {
  const style: React.CSSProperties = inline
    ? { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }
    : { position: "absolute", inset: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" };
  return (
    <div style={style}>
      {/* Animated ring */}
      <div style={{ position: "relative", width: "44px", height: "44px" }}>
        <svg viewBox="0 0 44 44" width="44" height="44" style={{ animation: "spin 0.9s linear infinite", display: "block" }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={C.accent} strokeWidth="3.5"
            strokeDasharray="60 54" strokeLinecap="round" />
        </svg>
      </div>
      <p style={{ fontSize: "12px", fontWeight: 600, color: C.accent, margin: 0, textAlign: "center" }}>
        {message ?? "Обробка..."}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════
//  HELPER COMPONENTS
// ════════════════════════════════════════════
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: "12px", color: C.muted, marginTop: "5px", lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text", multiline = false, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean; rows?: number;
}) {
  // fontSize 16px prevents iOS zoom on focus
  const base: React.CSSProperties = { width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, transition: "border-color 0.2s", WebkitAppearance: "none" };
  if (multiline) return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...base, resize: "vertical", lineHeight: 1.6 }}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
  );
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={base}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
  );
}

function NInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max}
      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, WebkitAppearance: "none" }} />
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: C.white, borderRadius: "14px", border: `1px solid ${C.border}`, marginBottom: "16px", overflow: "hidden" }}>
      <div style={{ padding: isMobile ? "14px 16px" : "15px 22px", borderBottom: `1px solid ${C.border}`, background: "#fafafa" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, fontFamily: SANS, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: isMobile ? "16px" : "22px" }}>{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
      {children}
    </div>
  );
}

function Collapsible({ title, badge, onDelete, children }: { title: string; badge?: string; onDelete: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", marginBottom: "8px", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 12px" : "13px 16px", cursor: "pointer", background: open ? C.accentLight : "#fafafa", transition: "background 0.2s", minHeight: "52px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isMobile ? "nowrap" : "normal" }}>{title}</span>
          {badge && !isMobile && <span style={{ fontSize: "11px", background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}30`, padding: "2px 8px", borderRadius: "20px", flexShrink: 0 }}>{badge}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: C.danger, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", minWidth: "36px", minHeight: "36px" }}>
            <Trash2 size={15} />
          </button>
          {open ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
        </div>
      </div>
      {open && <div style={{ padding: isMobile ? "16px" : "20px", borderTop: `1px solid ${C.border}`, background: C.white }}>{children}</div>}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  const isMobile = useIsMobile();
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: isMobile ? "14px" : "11px 16px", borderRadius: "10px", background: C.accentLight, border: `1.5px dashed ${C.accent}`, color: C.accent, fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: SANS, marginTop: "8px", minHeight: "48px" }}>
      <Plus size={16} />{label}
    </button>
  );
}

function Toast({ message, onHide }: { message: string; onHide: () => void }) {
  const isMobile = useIsMobile();
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
  return (
    <div style={{ position: "fixed", bottom: isMobile ? "80px" : "24px", left: isMobile ? "16px" : "auto", right: isMobile ? "16px" : "24px", background: C.sidebarActive, color: "#fff", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.28)", zIndex: 9999, fontFamily: SANS, fontSize: "14px", fontWeight: 500 }}>
      <CheckCircle size={18} color="#8fe8b4" />
      {message}
    </div>
  );
}

// ════════════════════════════════════════════
//  TABS CONFIG
// ════════════════════════════════════════════
type Tab = "general" | "hero" | "benefits" | "howitworks" | "whofor" | "pricing" | "reviews" | "faq" | "images" | "finalcta" | "integrations" | "seo";

const TABS: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: "general",      label: "Загальне",        shortLabel: "Загальне",   icon: <Settings size={16} /> },
  { id: "hero",         label: "Hero секція",      shortLabel: "Hero",       icon: <Layout size={16} /> },
  { id: "benefits",     label: "Переваги",         shortLabel: "Переваги",   icon: <Star size={16} /> },
  { id: "howitworks",   label: "Як це працює",     shortLabel: "Кроки",      icon: <CheckCircle size={16} /> },
  { id: "whofor",       label: "Кому підходить",   shortLabel: "Кому",       icon: <Users size={16} /> },
  { id: "pricing",      label: "Ціни і самоскиди", shortLabel: "Ціни",       icon: <DollarSign size={16} /> },
  { id: "reviews",      label: "Відгуки",          shortLabel: "Відгуки",    icon: <User size={16} /> },
  { id: "faq",          label: "FAQ",              shortLabel: "FAQ",        icon: <HelpCircle size={16} /> },
  { id: "images",       label: "Зображення",       shortLabel: "Фото",       icon: <ImageIcon size={16} /> },
  { id: "finalcta",     label: "Фінальний CTA",    shortLabel: "CTA",        icon: <CheckCircle size={16} /> },
  { id: "seo",          label: "SEO",              shortLabel: "SEO",        icon: <BarChart2 size={16} /> },
  { id: "integrations", label: "Інтеграції",       shortLabel: "Інтегр.",    icon: <Zap size={16} /> },
];

// ════════════════════════════════════════════
//  MAIN ADMIN PAGE
// ════════════════════════════════════════════
export function AdminPage() {
  const [authed, setAuthed]     = useState(() => {
    const hasNewKey = !!sessionStorage.getItem(ADMIN_SESSION_KEY);
    const hasOldKey = sessionStorage.getItem(ADMIN_PASSWORD_KEY) === "true";
    return hasNewKey || hasOldKey;
  });
  const [tab, setTab]           = useState<Tab>("general");
  const [toast, setToast]       = useState("");
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [drawerOpen, setDrawer] = useState(false);

  // ── Відновити пароль адміна із sessionStorage ──────────────────
  useEffect(() => {
    const storedPass = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (storedPass) api.setAdminPassword(storedPass);
  }, []);
  const [storageInfo, setStorageInfo] = useState("");
  const isMobile = useIsMobile();
  const tabsRef    = useRef<HTMLDivElement>(null);

  const { content, updateContent, resetContent } = useContent();

  // ── Change Password state ──
  const [pwCurrent, setPwCurrent]   = useState("");
  const [pwNew, setPwNew]           = useState("");
  const [pwConfirm, setPwConfirm]   = useState("");
  const [pwError, setPwError]       = useState("");
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwNew.trim()) { setPwError("Введіть новий пароль"); return; }
    if (pwNew.length < 6) { setPwError("Пароль має бути мінімум 6 символів"); return; }
    if (pwNew !== pwConfirm) { setPwError("Паролі не збігаються"); return; }
    setPwSaving(true);
    try {
      const currentOk = await api.verifyPassword(pwCurrent);
      if (!currentOk) { setPwError("Поточний пароль невірний"); return; }
      await api.changePassword(pwNew, pwCurrent);
      // Оновити сесійний пароль
      api.setAdminPassword(pwNew);
      sessionStorage.setItem(ADMIN_SESSION_KEY, pwNew);
      setPwSuccess(true);
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setToast("✓ Пароль змінено успішно!");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(`Помилка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPwSaving(false);
    }
  };

  // ── Integrations state ──
  const [intg, setIntg] = useState<IntegrationSettings>(() => loadIntegrations());
  const [tgTesting, setTgTesting] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [intgSaved, setIntgSaved] = useState(false);

  const handleSaveIntg = () => {
    saveIntegrations(intg);
    setIntgSaved(true);
    setToast("✓ Інтеграції збережено!");
    setTimeout(() => setIntgSaved(false), 2500);
  };

  const handleTgTest = async () => {
    setTgTesting(true);
    setTgTestResult(null);
    const res = await sendTelegramTest(intg.tgBotToken, intg.tgChatId);
    setTgTestResult({ ok: res.ok, msg: res.ok ? "Тестове повідомлення надіслано! ✓" : (res.error ?? "Помилка") });
    setTgTesting(false);
  };

  const safeMerge = (c: SiteContent): SiteContent => ({
    ...DEFAULT_CONTENT,
    ...c,
    benefits:   Array.isArray(c.benefits)   ? c.benefits   : DEFAULT_CONTENT.benefits,
    howItWorks: Array.isArray(c.howItWorks) ? c.howItWorks : DEFAULT_CONTENT.howItWorks,
    whoIsItFor: Array.isArray(c.whoIsItFor) ? c.whoIsItFor : DEFAULT_CONTENT.whoIsItFor,
    reviews:    Array.isArray(c.reviews)    ? c.reviews    : DEFAULT_CONTENT.reviews,
    faq:        Array.isArray(c.faq)        ? c.faq        : DEFAULT_CONTENT.faq,
    pricing: {
      ...DEFAULT_CONTENT.pricing,
      ...(c.pricing ?? {}),
      delivery: Array.isArray(c.pricing?.delivery) ? c.pricing.delivery : DEFAULT_CONTENT.pricing.delivery,
    },
    images: { ...DEFAULT_CONTENT.images, ...(c.images ?? {}) },
    seo: { ...DEFAULT_CONTENT.seo, ...(c.seo ?? {}) },
  });

  const [draft, setDraft] = useState<SiteContent>(() => safeMerge(content));
  useEffect(() => { setDraft(safeMerge(content)); }, [content]);
  useEffect(() => {
    const lsUsed = estimateStorageUsed();
    const imgCount = Object.values(draft.images).filter(Boolean).length;
    setStorageInfo(`${lsUsed} LS · ${imgCount}/12 фото IDB`);
  }, [draft.images, draft.reviews]);

  // ── Autosave: 3 s debounce after any draft change ──
  const mountedRef = useRef(false);
  const draftRef   = useRef(draft);
  draftRef.current = draft;
  const [autoSavedAt, setAutoSavedAt] = useState("");
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const t = setTimeout(() => {
      updateContent(() => draftRef.current);
      const now = new Date();
      setAutoSavedAt(`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`);
    }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // ── Pending orders badge (Telegram failures) ──
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    const check = () => setPendingCount(loadPendingOrders().length);
    check();
    const iv = setInterval(check, 8000);
    window.addEventListener("online", check);
    return () => { clearInterval(iv); window.removeEventListener("online", check); };
  }, []);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (isMobile && tabsRef.current) {
      const active = tabsRef.current.querySelector("[data-active='true']") as HTMLElement;
      if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [tab, isMobile]);

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    const fn = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-drawer]")) setDrawer(false);
    };
    setTimeout(() => document.addEventListener("click", fn), 100);
    return () => document.removeEventListener("click", fn);
  }, [drawerOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateContent(() => draft); // зберегти в localStorage/IDB як резервну копію
      await api.saveContent(draft); // зберегти на сервері (для всіх пристроїв)
      setSaved(true);
      setToast("✓ Зміни збережено на сервері!");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
      setToast(`⚠ Помилка збереження: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };


  const handleReset = async () => {
    if (confirm("Скинути весь контент до початкових налаштувань?")) {
      resetContent();
      setDraft(DEFAULT_CONTENT);
      try {
        await api.saveContent(DEFAULT_CONTENT);
        setToast("Скинуто до початкових налаштувань та збережен�� на сервері");
      } catch (e) {
        setToast("Скинуто локально (помилка збереження на сервері)");
        console.error("Reset server save error:", e);
      }
    }
  };

  const selectTab = (t: Tab) => { setTab(t); setDrawer(false); };

  const setD      = <K extends keyof SiteContent>(key: K, val: SiteContent[K]) => setDraft((d) => ({ ...d, [key]: val }));
  const setImg    = (key: keyof SiteContent["images"], val: string) => setD("images", { ...draft.images, [key]: val });
  const setImgAlt = (key: keyof ImageAlts, val: string) => setDraft((d) => ({ ...d, imageAlts: { ...d.imageAlts, [key]: val } }));

  // Prevent admin page from appearing in search results (noindex via useEffect)
  useEffect(() => {
    document.title = "Адмін-панель | КиївЧорнозем";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    return () => {
      if (meta) meta.setAttribute("content", "index, follow");
    };
  }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const currentTabLabel = TABS.find(t => t.id === tab)?.label ?? "";

  return (
    <>
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, background: C.bg, position: "relative" }}>

      {/* ══════════ MOBILE BACKDROP ══════════ */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 199, backdropFilter: "blur(2px)" }} />
      )}

      {/* ══════════ SIDEBAR / DRAWER ══════════ */}
      <aside data-drawer
        style={{
          width: "260px",
          background: C.sidebar,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          // Desktop: sticky panel
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: drawerOpen ? 0 : "-280px",
            height: "100vh",
            zIndex: 200,
            transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: drawerOpen ? "6px 0 32px rgba(0,0,0,0.35)" : "none",
          } : {
            position: "sticky",
            top: 0,
            height: "100vh",
          }),
        }}
      >
        {/* Brand */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#2d6045", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Building2 size={16} color="#8fe8b4" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", fontFamily: SERIF }}>КиївЧорнозем</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>Адмін-панель</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setDrawer(false)}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", flexShrink: 0 }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => selectTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 12px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", fontFamily: SANS, fontSize: "14px", fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "#8fe8b4" : "rgba(255,255,255,0.65)", background: tab === t.id ? C.sidebarActive : "transparent", marginBottom: "2px", transition: "all 0.15s", minHeight: "44px", position: "relative" }}>
              {t.icon}
              <span style={{ flex: 1 }}>{t.label}</span>
              {/* Pending badge on Integrations tab */}
              {t.id === "integrations" && pendingCount > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: "100px", fontSize: "10px", fontWeight: 700, padding: "1px 6px", lineHeight: "16px", flexShrink: 0 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Storage + Autosave */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {storageInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: autoSavedAt ? "4px" : 0 }}>
              <HardDrive size={12} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Зайнято: {storageInfo}</span>
            </div>
          )}
          {autoSavedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: "11px", color: "rgba(74,222,128,0.7)" }}>Автозбережено о {autoSavedAt}</span>
            </div>
          )}
        </div>


        {/* Footer */}
        <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <a href="/site" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 12px", borderRadius: "8px", color: "rgba(255,255,255,0.55)", fontSize: "13px", textDecoration: "none", marginBottom: "2px", minHeight: "44px" }}>
            <Eye size={14} />Переглянути сайт
          </a>
          <button onClick={() => {
            api.setAdminPassword(null);
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
            setAuthed(false);
          }}
            style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "11px 12px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "13px", fontFamily: SANS, minHeight: "44px" }}>
            <LogOut size={14} />Вийти
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* ── HEADER ── */}
        <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: isMobile ? "0 12px" : "0 24px", height: isMobile ? "56px" : "62px", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
          {/* Hamburger */}
          <button onClick={() => setDrawer(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: C.text, display: "flex", alignItems: "center", borderRadius: "8px", flexShrink: 0, minWidth: "40px", minHeight: "40px", justifyContent: "center" }}>
            <Menu size={20} />
          </button>

          {/* Title */}
          <h1 style={{ fontSize: isMobile ? "15px" : "16px", fontWeight: 700, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentTabLabel}
          </h1>

          {/* Desktop action buttons */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={handleReset}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>
                <RotateCcw size={14} />Скинути
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 20px", borderRadius: "8px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 2px 10px rgba(63,174,108,0.3)" }}>
                <Save size={14} />{saved ? "Збережено ✓" : saving ? "Зберігаємо…" : "Зберегти"}
              </button>
            </div>
          )}

          {/* Mobile: save icon button */}
          {isMobile && (
            <button onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, flexShrink: 0, transition: "background 0.3s" }}>
              <Save size={15} />
              {saved ? "✓" : saving ? "…" : "Зберегти"}
            </button>
          )}
        </header>

        {/* ── MOBILE TABS STRIP ── */}
        {isMobile && (
          <div ref={tabsRef}
            style={{ display: "flex", overflowX: "auto", background: C.white, borderBottom: `1px solid ${C.border}`, scrollbarWidth: "none", flexShrink: 0, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} data-active={active}
                  onClick={() => setTab(t.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", flexShrink: 0, borderBottom: `2.5px solid ${active ? C.accent : "transparent"}`, color: active ? C.accent : C.muted, fontFamily: SANS, fontSize: "11px", fontWeight: active ? 700 : 500, transition: "all 0.15s", minWidth: "64px" }}>
                  {t.icon}
                  {t.shortLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* ── SCROLL CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px 120px" : "24px 28px 48px", maxWidth: isMobile ? "100%" : "940px", width: "100%" }}>

          {/* ═══ GENERAL ═══ */}
          {tab === "general" && (
            <>
              <Card title="🏢 Компанія">
                <Grid2>
                  <Field label="Назва компанії"><TInput value={draft.general.companyName} onChange={(v) => setD("general", { ...draft.general, companyName: v })} /></Field>
                  <Field label="Рік заснування"><TInput value={draft.general.foundedYear} onChange={(v) => setD("general", { ...draft.general, foundedYear: v })} /></Field>
                </Grid2>
                <Field label="ФОП (повна назва)"><TInput value={draft.general.fopName} onChange={(v) => setD("general", { ...draft.general, fopName: v })} /></Field>
                <Field label="Кількість клієнтів"><TInput value={draft.general.clientsCount} onChange={(v) => setD("general", { ...draft.general, clientsCount: v })} placeholder="2 000" /></Field>
              </Card>
              <Card title="📞 Контакти">
                <Grid2>
                  <Field label="Телефон (відображення)"><TInput value={draft.general.phone} onChange={(v) => setD("general", { ...draft.general, phone: v })} /></Field>
                  <Field label="Телефон (raw)" hint="+380981116059"><TInput value={draft.general.phoneRaw} onChange={(v) => setD("general", { ...draft.general, phoneRaw: v })} /></Field>
                </Grid2>
                <Field label="Адреса складу"><TInput value={draft.general.address} onChange={(v) => setD("general", { ...draft.general, address: v })} /></Field>
                <Field label="Графік роботи"><TInput value={draft.general.workingHours} onChange={(v) => setD("general", { ...draft.general, workingHours: v })} /></Field>
              </Card>
              <Card title="🏦 Реквізити">
                <Grid2>
                  <Field label="IBAN"><TInput value={draft.general.iban} onChange={(v) => setD("general", { ...draft.general, iban: v })} /></Field>
                  <Field label="Назва банку"><TInput value={draft.general.bankName} onChange={(v) => setD("general", { ...draft.general, bankName: v })} /></Field>
                </Grid2>
              </Card>

              {/* ── SECURITY: Change Password ── */}
              <Card title="🔐 Безпека — зміна пароля">
                <p style={{ fontSize: "13px", color: C.muted, marginBottom: "16px", lineHeight: 1.5 }}>
                  Пароль за замовчуванням: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>admin2025</code>.
                  Рекомендуємо змінити після першого входу.
                </p>
                <Field label="Поточний пароль">
                  <TInput type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="Поточний пароль" />
                </Field>
                <Grid2>
                  <Field label="Новий пароль">
                    <TInput type="password" value={pwNew} onChange={setPwNew} placeholder="Мінімум 6 символів" />
                  </Field>
                  <Field label="Підтвердити пароль">
                    <TInput type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="Повторіть новий пароль" />
                  </Field>
                </Grid2>
                {pwError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: C.dangerLight, border: `1px solid ${C.danger}30`, borderRadius: "8px", marginBottom: "14px" }}>
                    <AlertCircle size={14} color={C.danger} />
                    <span style={{ fontSize: "13px", color: C.danger }}>{pwError}</span>
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "8px", marginBottom: "14px" }}>
                    <CheckCircle size={14} color={C.success} />
                    <span style={{ fontSize: "13px", color: C.success }}>Пароль успішно змінено!</span>
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", background: pwSaving ? C.accentLight : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, color: pwSaving ? C.accent : "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: pwSaving ? "wait" : "pointer", fontFamily: SANS, minHeight: "48px", transition: "all 0.2s" }}
                >
                  <Lock size={14} />
                  {pwSaving ? "Зберігаємо…" : "Змінити пароль"}
                </button>
              </Card>
            </>
          )}

          {/* ═══ HERO ═��═ */}
          {tab === "hero" && (
            <>
              <Card title="🏷 Бейдж">
                <Field label="Текст над заголовком"><TInput value={draft.hero.badge} onChange={(v) => setD("hero", { ...draft.hero, badge: v })} /></Field>
              </Card>
              <Card title="📝 Заголовок та кнопки">
                <Field label="Рядок 1"><TInput value={draft.hero.headlineLine1} onChange={(v) => setD("hero", { ...draft.hero, headlineLine1: v })} /></Field>
                <Field label="Акцентне слово (зелений)"><TInput value={draft.hero.headlineAccent} onChange={(v) => setD("hero", { ...draft.hero, headlineAccent: v })} /></Field>
                <Field label="Рядок 2"><TInput value={draft.hero.headlineLine2} onChange={(v) => setD("hero", { ...draft.hero, headlineLine2: v })} /></Field>
                <Field label="Підзаголовок"><TInput multiline rows={3} value={draft.hero.subheadline} onChange={(v) => setD("hero", { ...draft.hero, subheadline: v })} /></Field>
                <Grid2>
                  <Field label="Кнопка 1"><TInput value={draft.hero.ctaPrimary} onChange={(v) => setD("hero", { ...draft.hero, ctaPrimary: v })} /></Field>
                  <Field label="Кнопка 2"><TInput value={draft.hero.ctaSecondary} onChange={(v) => setD("hero", { ...draft.hero, ctaSecondary: v })} /></Field>
                </Grid2>
              </Card>
            </>
          )}

          {/* ═══ BENEFITS ═══ */}
          {tab === "benefits" && (
            <Card title="⭐ Картки переваг">
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px" }}>Натисніть на картку щоб розгорнути.</p>
              {draft.benefits.map((b, i) => (
                <Collapsible key={i} title={`${i + 1}. ${b.title}`} onDelete={() => setD("benefits", draft.benefits.filter((_, j) => j !== i))}>
                  <Field label="Заголовок"><TInput value={b.title} onChange={(v) => setD("benefits", draft.benefits.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="Опис"><TInput multiline rows={3} value={b.desc} onChange={(v) => setD("benefits", draft.benefits.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Додати перевагу" onClick={() => setD("benefits", [...draft.benefits, { title: "Нова перевага", desc: "Опис..." } as BenefitItem])} />
            </Card>
          )}

          {/* ═══ HOW IT WORKS ═══ */}
          {tab === "howitworks" && (
            <Card title="🛠 Як це працює — кроки">
              {draft.howItWorks.map((step, i) => (
                <Collapsible key={i} title={`Крок ${step.num}: ${step.title}`} onDelete={() => setD("howItWorks", draft.howItWorks.filter((_, j) => j !== i))}>
                  <Grid2>
                    <Field label="Номер (01, 02...)"><TInput value={step.num} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, num: v } : x))} /></Field>
                    <Field label="Нотатка (бейдж)"><TInput value={step.note} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, note: v } : x))} /></Field>
                  </Grid2>
                  <Field label="Заголовок"><TInput value={step.title} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="Опис"><TInput multiline rows={3} value={step.desc} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Додати крок" onClick={() => setD("howItWorks", [...draft.howItWorks, { num: `0${draft.howItWorks.length + 1}`, title: "Новий крок", desc: "Опис...", note: "Нотатка" }])} />
            </Card>
          )}

          {/* ═══ WHO FOR ═══ */}
          {tab === "whofor" && (
            <Card title="👥 Кому підходить">
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px" }}>Фото — у вкладці «Фото».</p>
              {draft.whoIsItFor.map((seg, i) => (
                <Collapsible key={i} title={seg.label} badge={seg.tag} onDelete={() => setD("whoIsItFor", draft.whoIsItFor.filter((_, j) => j !== i))}>
                  <Grid2>
                    <Field label="Мітка (напр. «Для газону»)"><TInput value={seg.label} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, label: v } : x))} /></Field>
                    <Field label="Теґ"><TInput value={seg.tag} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, tag: v } : x))} /></Field>
                  </Grid2>
                  <Field label="Заголовок картки"><TInput value={seg.title} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="Опис"><TInput multiline rows={3} value={seg.desc} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                  <Field label="Пункти (кожен з нового рядка)" hint="Кожен рядок = окремий пункт">
                    <TInput multiline rows={4} value={seg.points.join("\n")} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, points: v.split("\n").filter(Boolean) } : x))} />
                  </Field>
                </Collapsible>
              ))}
            </Card>
          )}

          {/* ═══ PRICING ═══ */}
          {tab === "pricing" && (
            <>
              <Card title="💰 Ціни на товар">
                <Grid2>
                  <Field label="Ціна насипом (грн/т)"><NInput value={draft.pricing.bulkPricePerTon} onChange={(v) => setD("pricing", { ...draft.pricing, bulkPricePerTon: v })} min={1} /></Field>
                  <Field label="Ціна мішок (грн)"><NInput value={draft.pricing.bagPrice} onChange={(v) => setD("pricing", { ...draft.pricing, bagPrice: v })} min={1} /></Field>
                  <Field label="Вага мішка (кг)"><NInput value={draft.pricing.bagWeightKg} onChange={(v) => setD("pricing", { ...draft.pricing, bagWeightKg: v })} min={1} /></Field>
                  <Field label="Мін. замовлення (т)"><NInput value={draft.pricing.minTons} onChange={(v) => setD("pricing", { ...draft.pricing, minTons: v })} min={1} /></Field>
                </Grid2>
              </Card>
              <Card title="🚛 Самоскиди — текст і ціни">
                {draft.pricing.delivery.map((d, i) => (
                  <Collapsible key={i} title={`${d.truck} — ${d.capacity}`} onDelete={() => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.filter((_, j) => j !== i) })}>
                    <Grid2>
                      <Field label="Назва"><TInput value={d.truck} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, truck: v } : x) })} /></Field>
                      <Field label="Вантажність"><TInput value={d.capacity} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, capacity: v } : x) })} /></Field>
                      <Field label="Об'єм"><TInput value={d.volume} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, volume: v } : x) })} /></Field>
                      <Field label="Діапазон цін"><TInput value={d.price} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, price: v } : x) })} /></Field>
                    </Grid2>
                    <Field label="Нотатка"><TInput value={d.note} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, note: v } : x) })} /></Field>
                    <Field label="Для кого підходить"><TInput value={d.usageLabel} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, usageLabel: v } : x) })} /></Field>
                  </Collapsible>
                ))}
              </Card>
              <Card title="🚛 Фото самоскидів">
                <p style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>Якщо не завантажено — показуються оригінальні Figma-зображення.</p>
                <Grid2>
                  <ImageUploader label="ЗІЛ" hint="Фото на білому тлі" value={draft.images.truckZil} onChange={(v) => setImg("truckZil", v)} aspect="landscape" imageKey="truckZil"
                    altValue={draft.imageAlts.truckZil} onAltChange={(v) => setImgAlt("truckZil", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckZil} />
                  <ImageUploader label="КАМАЗ" value={draft.images.truckKamaz} onChange={(v) => setImg("truckKamaz", v)} aspect="landscape" imageKey="truckKamaz"
                    altValue={draft.imageAlts.truckKamaz} onAltChange={(v) => setImgAlt("truckKamaz", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckKamaz} />
                  <ImageUploader label="МАЗ" value={draft.images.truckMaz} onChange={(v) => setImg("truckMaz", v)} aspect="landscape" imageKey="truckMaz"
                    altValue={draft.imageAlts.truckMaz} onAltChange={(v) => setImgAlt("truckMaz", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckMaz} />
                  <ImageUploader label="ВОЛЬВО" value={draft.images.truckVolvo} onChange={(v) => setImg("truckVolvo", v)} aspect="landscape" imageKey="truckVolvo"
                    altValue={draft.imageAlts.truckVolvo} onAltChange={(v) => setImgAlt("truckVolvo", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckVolvo} />
                </Grid2>
              </Card>
            </>
          )}

          {/* ═══ REVIEWS ═══ */}
          {tab === "reviews" && (
            <Card title="💬 Відгуки клієнтів">
              {draft.reviews.map((r, i) => (
                <Collapsible key={i} title={r.name} badge={r.role} onDelete={() => setD("reviews", draft.reviews.filter((_, j) => j !== i))}>
                  <ImageUploader label="Фото клієнта (аватар)" hint="Квадратне. Якщо немає — ініціали." value={r.photoOverride || ""} aspect="square" onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, photoOverride: v } : x))} />
                  <Grid2>
                    <Field label="Ім'я"><TInput value={r.name} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, name: v } : x))} /></Field>
                    <Field label="Ініціали (2 літери)"><TInput value={r.initials} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, initials: v } : x))} /></Field>
                    <Field label="Роль / місто"><TInput value={r.role} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, role: v } : x))} /></Field>
                    <Field label="Дата"><TInput value={r.date} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, date: v } : x))} /></Field>
                  </Grid2>
                  <Field label="Текст відгуку"><TInput multiline rows={4} value={r.text} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, text: v } : x))} /></Field>
                  <Field label="Рейтинг (1–5)"><NInput value={r.rating} min={1} max={5} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, rating: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Додати відгук" onClick={() => setD("reviews", [...draft.reviews, { name: "Новий клієнт", role: "Місто", initials: "НК", rating: 5, text: "Текст відгуку...", date: "2026", photoOverride: "" } as ReviewItem])} />
            </Card>
          )}

          {/* ═══ FAQ ═══ */}
          {tab === "faq" && (
            <Card title="❓ Питання та відповіді">
              {draft.faq.map((f, i) => (
                <Collapsible key={i} title={f.q} onDelete={() => setD("faq", draft.faq.filter((_, j) => j !== i))}>
                  <Field label="Питання"><TInput value={f.q} onChange={(v) => setD("faq", draft.faq.map((x, j) => j === i ? { ...x, q: v } : x))} /></Field>
                  <Field label="Відповідь"><TInput multiline rows={4} value={f.a} onChange={(v) => setD("faq", draft.faq.map((x, j) => j === i ? { ...x, a: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Додати питання" onClick={() => setD("faq", [...draft.faq, { q: "Нове питання?", a: "Відповідь..." } as FaqItem])} />
            </Card>
          )}

          {/* ═══ IMAGES ═══ */}
          {tab === "images" && (
            <>
              {/* STATUS DASHBOARD */}
              {(() => {
                type ImgKey = keyof SiteContent["images"];
                const imgMap: { key: ImgKey; label: string }[] = [
                  { key: "heroPhoto",          label: "Hero" },
                  { key: "truckDelivery",      label: "Доставка" },
                  { key: "gardenResult",       label: "Результат" },
                  { key: "homeowner",          label: "Клієнт" },
                  { key: "lawnPhoto",          label: "Газон" },
                  { key: "gardenSegmentPhoto", label: "Город" },
                  { key: "landscapePhoto",     label: "Ландшафт" },
                  { key: "agroPhoto",          label: "Агро" },
                  { key: "truckZil",           label: "ЗІЛ" },
                  { key: "truckKamaz",         label: "КАМАЗ" },
                  { key: "truckMaz",           label: "МАЗ" },
                  { key: "truckVolvo",         label: "ВОЛЬВО" },
                ];
                const uploaded = imgMap.filter(x => !!draft.images[x.key]).length;
                const total    = imgMap.length;
                const pct      = Math.round((uploaded / total) * 100);
                return (
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>Статус зображень</h3>
                        <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>{uploaded} з {total} завантажено</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: uploaded === total ? C.success : C.accent, lineHeight: 1 }}>{pct}%</div>
                        <div style={{ fontSize: "11px", color: C.muted }}>готовність</div>
                      </div>
                    </div>
                    <div style={{ height: "6px", borderRadius: "3px", background: "#e5e7eb", marginBottom: "14px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "3px", width: `${pct}%`, background: uploaded === total ? C.success : `linear-gradient(90deg, ${C.accent}, #2d7a50)`, transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px" }}>
                      {imgMap.map(({ key, label }) => {
                        const src = draft.images[key];
                        const ok  = !!src;
                        return (
                          <div key={key} style={{ textAlign: "center" }}>
                            <div style={{ width: "100%", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", border: ok ? "2.5px solid #34d399" : "2px dashed #d1d5db", background: ok ? "transparent" : "#f9fafb", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {ok ? (
                                <>
                                  <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                  <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "15px", height: "15px", borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                </>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              )}
                            </div>
                            <p style={{ fontSize: "10px", color: ok ? C.success : C.muted, margin: "3px 0 0", fontWeight: ok ? 600 : 400, lineHeight: 1.2 }}>{label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Storage info */}
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <HardDrive size={16} color={C.success} style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#14532d", margin: "0 0 2px" }}>Зайнято: {storageInfo} / ~5 МБ</p>
                  <p style={{ fontSize: "12px", color: "#16a34a", margin: 0 }}>Зображення стискаються автоматично до ~100–200 КБ.</p>
                </div>
              </div>

              <Card title="🌅 Hero — фонове фото">
                <ImageUploader label="Фото чорнозему (фон Hero)" hint="Горизонтальне, 1920×1080px+" value={draft.images.heroPhoto} onChange={(v) => setImg("heroPhoto", v)} aspect="landscape" imageKey="heroPhoto"
                  altValue={draft.imageAlts.heroPhoto} onAltChange={(v) => setImgAlt("heroPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.heroPhoto} />
              </Card>

              <Card title="📸 Галерея (SocialProof)">
                <ImageUploader label="Фото 1 — Доставка самоскидом" value={draft.images.truckDelivery} onChange={(v) => setImg("truckDelivery", v)} aspect="landscape" imageKey="truckDelivery"
                  altValue={draft.imageAlts.truckDelivery} onAltChange={(v) => setImgAlt("truckDelivery", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckDelivery} />
                <ImageUploader label="Фото 2 — Результат укладки" value={draft.images.gardenResult} onChange={(v) => setImg("gardenResult", v)} aspect="landscape" imageKey="gardenResult"
                  altValue={draft.imageAlts.gardenResult} onAltChange={(v) => setImgAlt("gardenResult", v)} defaultAlt={IMAGE_ALT_DEFAULTS.gardenResult} />
                <ImageUploader label="Фото 3 — Задоволений клієнт" value={draft.images.homeowner} onChange={(v) => setImg("homeowner", v)} aspect="portrait" imageKey="homeowner"
                  altValue={draft.imageAlts.homeowner} onAltChange={(v) => setImgAlt("homeowner", v)} defaultAlt={IMAGE_ALT_DEFAULTS.homeowner} />
              </Card>

              <Card title="🗂 Категорії «Кому підходить»">
                <ImageUploader label="Газон" value={draft.images.lawnPhoto} onChange={(v) => setImg("lawnPhoto", v)} aspect="landscape" imageKey="lawnPhoto"
                  altValue={draft.imageAlts.lawnPhoto} onAltChange={(v) => setImgAlt("lawnPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.lawnPhoto} />
                <ImageUploader label="Город" value={draft.images.gardenSegmentPhoto} onChange={(v) => setImg("gardenSegmentPhoto", v)} aspect="landscape" imageKey="gardenSegmentPhoto"
                  altValue={draft.imageAlts.gardenSegmentPhoto} onAltChange={(v) => setImgAlt("gardenSegmentPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.gardenSegmentPhoto} />
                <ImageUploader label="Ландшафт" value={draft.images.landscapePhoto} onChange={(v) => setImg("landscapePhoto", v)} aspect="landscape" imageKey="landscapePhoto"
                  altValue={draft.imageAlts.landscapePhoto} onAltChange={(v) => setImgAlt("landscapePhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.landscapePhoto} />
                <ImageUploader label="Сільське господарство" value={draft.images.agroPhoto} onChange={(v) => setImg("agroPhoto", v)} aspect="landscape" imageKey="agroPhoto"
                  altValue={draft.imageAlts.agroPhoto} onAltChange={(v) => setImgAlt("agroPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.agroPhoto} />
              </Card>
            </>
          )}

          {/* ═══ FINAL CTA ═══ */}
          {tab === "finalcta" && (
            <Card title="🎯 Фінальний CTA">
              <Field label="Бейдж терміновості"><TInput value={draft.finalCta.urgencyBadge} onChange={(v) => setD("finalCta", { ...draft.finalCta, urgencyBadge: v })} /></Field>
              <Field label="Заголовок рядок 1"><TInput value={draft.finalCta.headline1} onChange={(v) => setD("finalCta", { ...draft.finalCta, headline1: v })} /></Field>
              <Field label="Заголовок рядок 2 (курсив)"><TInput value={draft.finalCta.headlineAccent} onChange={(v) => setD("finalCta", { ...draft.finalCta, headlineAccent: v })} /></Field>
              <Field label="Підтекст"><TInput multiline rows={3} value={draft.finalCta.subtext} onChange={(v) => setD("finalCta", { ...draft.finalCta, subtext: v })} /></Field>
            </Card>
          )}

          {/* ═══ SEO ═══ */}
          {tab === "seo" && (() => {
            const s = draft.seo ?? {};
            const setS = (patch: Partial<typeof s>) => setD("seo", { ...s, ...patch });

            // Char counter color
            const titleLen = (s.title ?? "").length;
            const descLen  = (s.description ?? "").length;
            const tColor = titleLen === 0 ? C.muted : titleLen > 60 ? C.danger : titleLen >= 50 ? C.success : "#f59e0b";
            const dColor = descLen  === 0 ? C.muted : descLen  > 160 ? C.danger : descLen  >= 140 ? C.success : "#f59e0b";

            // SEO Health Score
            const checks = [
              { label: "Title (50–60 симв.)",    ok: titleLen >= 50 && titleLen <= 60 },
              { label: "Description (140–160)",  ok: descLen  >= 140 && descLen  <= 160 },
              { label: "Keywords",               ok: !!(s.keywords?.trim()) },
              { label: "Canonical URL",          ok: !!(s.canonicalUrl?.trim()) },
              { label: "OG Image 1200×630",      ok: !!(s.ogImage?.trim()) },
              { label: "Geo-координати",         ok: !!(s.geoLat?.trim() && s.geoLng?.trim()) },
            ];
            const score = checks.filter(c => c.ok).length;
            const pct   = Math.round((score / checks.length) * 100);

            return (
              <>
                {/* ── SEO Health ── */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 3px", fontFamily: SANS }}>SEO Health Score</h3>
                      <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>{score} з {checks.length} пунктів виконано</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "26px", fontWeight: 800, color: pct >= 80 ? C.success : pct >= 50 ? "#f59e0b" : C.danger, lineHeight: 1 }}>{pct}%</div>
                      <div style={{ fontSize: "11px", color: C.muted }}>
                        {pct >= 80 ? "Відмінно" : pct >= 50 ? "Непогано" : "Потрібна увага"}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#e5e7eb", marginBottom: "14px", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "3px", width: `${pct}%`, background: pct >= 80 ? C.success : pct >= 50 ? "#f59e0b" : C.danger, transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: "8px" }}>
                    {checks.map(({ label, ok }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "8px", background: ok ? "#f0fdf4" : "#fafafa", border: `1px solid ${ok ? "#86efac" : "#e5e7eb"}` }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ok ? C.success : "#d1d5db", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: ok ? "#14532d" : C.muted, fontWeight: ok ? 600 : 400, lineHeight: 1.3 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Базові мета-теги ── */}
                <Card title="📄 Базові мета-теги">
                  <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                    <strong>Правило сеньйор-SEO:</strong> Title — головний фактор ранжирування. Включайте основний ключ + місто + бренд. Description впливає на CTR (кількість кліків), не на позиції.
                  </div>

                  <Field label="Title" hint={`${titleLen}/60 символів · Ідеально: 50–60`}>
                    <div style={{ position: "relative" }}>
                      <TInput
                        value={s.title ?? ""}
                        onChange={(v) => setS({ title: v })}
                        placeholder="Купити чорнозем Київ | КиївЧорнозем — від 350 грн/т"
                      />
                      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: 700, color: tColor, background: C.white, padding: "0 4px", pointerEvents: "none" }}>
                        {titleLen}/60
                      </span>
                    </div>
                    {/* SERP preview */}
                    {s.title && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>Вигляд у Google</p>
                        <p style={{ fontSize: "15px", color: "#1a0dab", margin: "0 0 2px", textDecoration: "underline", lineHeight: 1.3, wordBreak: "break-word" }}>{s.title}</p>
                        {s.canonicalUrl && <p style={{ fontSize: "12px", color: "#006621", margin: "0 0 3px" }}>{s.canonicalUrl}</p>}
                        {s.description && <p style={{ fontSize: "12px", color: "#545454", margin: 0, lineHeight: 1.5 }}>{s.description.slice(0, 160)}{s.description.length > 160 ? "…" : ""}</p>}
                      </div>
                    )}
                  </Field>

                  <Field label="Meta Description" hint={`${descLen}/160 символів · Ідеально: 140–160`}>
                    <div style={{ position: "relative" }}>
                      <TInput
                        multiline rows={3}
                        value={s.description ?? ""}
                        onChange={(v) => setS({ description: v })}
                        placeholder="Чорнозем з доставкою по Києву від виробника. Без посередників..."
                      />
                      <span style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "12px", fontWeight: 700, color: dColor, background: C.white, padding: "0 4px", pointerEvents: "none" }}>
                        {descLen}/160
                      </span>
                    </div>
                  </Field>

                  <Field label="Keywords" hint="Через кому · Google не ранжирує за keywords, але Bing/Yandex — так">
                    <TInput value={s.keywords ?? ""} onChange={(v) => setS({ keywords: v })} placeholder="чорнозем Київ, купити чорнозем, доставка чорнозему" />
                  </Field>

                  <Grid2>
                    <Field label="Canonical URL" hint="Повна URL: https://kyivchornozem.com/">
                      <TInput value={s.canonicalUrl ?? ""} onChange={(v) => setS({ canonicalUrl: v })} placeholder="https://kyivchornozem.com/" />
                    </Field>
                    <Field label="Robots" hint="Дозвіл для пошукових роботів">
                      <div style={{ position: "relative" }}>
                        <select value={s.robots ?? "index, follow"} onChange={(e) => setS({ robots: e.target.value })}
                          style={{ width: "100%", padding: "12px 36px 12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, WebkitAppearance: "none", cursor: "pointer" }}>
                          <option value="index, follow">index, follow ✓ (рекомендовано)</option>
                          <option value="noindex, nofollow">noindex, nofollow (приховати від Google)</option>
                          <option value="index, nofollow">index, nofollow</option>
                          <option value="noindex, follow">noindex, follow</option>
                        </select>
                        <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </Field>
                  </Grid2>
                </Card>

                {/* ── Open Graph ── */}
                <Card title="🌐 Open Graph — соцмережі та месенджери">
                  <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#0c4a6e", lineHeight: 1.6 }}>
                    OG-теги керують тим, як виглядає посилання у <strong>Facebook, Telegram, Viber, LinkedIn, WhatsApp</strong>. Якщо поля порожні — використовується Title/Description автоматично.
                  </div>
                  <Field label="OG Title" hint="Якщо порожнє — береться Title вище">
                    <TInput value={s.ogTitle ?? ""} onChange={(v) => setS({ ogTitle: v })} placeholder={s.title ?? ""} />
                  </Field>
                  <Field label="OG Description" hint="Якщо порожнє — береться Description вище">
                    <TInput multiline rows={2} value={s.ogDescription ?? ""} onChange={(v) => setS({ ogDescription: v })} placeholder={s.description?.slice(0, 100) ?? ""} />
                  </Field>
                  {/* ── OG Image: upload + URL fallback ── */}
                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
                      OG Image — превью для соцмереж
                    </label>

                    {/* Upload zone */}
                    <ImageUploader
                      label=""
                      value={s.ogImage?.startsWith("data:") ? s.ogImage : (s.ogImage?.startsWith("http") ? s.ogImage : "")}
                      onChange={(url) => setS({ ogImage: url })}
                      aspect="landscape"
                      imageKey="ogImage"
                    />

                    {/* Divider OR */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0 12px" }}>
                      <div style={{ flex: 1, height: "1px", background: C.border }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>АБО ПУБЛІЧНА URL</span>
                      <div style={{ flex: 1, height: "1px", background: C.border }} />
                    </div>

                    {/* URL input */}
                    <TInput
                      value={s.ogImage?.startsWith("data:") ? "" : (s.ogImage ?? "")}
                      onChange={(v) => setS({ ogImage: v })}
                      placeholder="https://chernozem.com.ua/og-image.jpg"
                    />

                    {/* URL preview */}
                    {s.ogImage && !s.ogImage.startsWith("data:") && (
                      <div style={{ marginTop: "8px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}` }}>
                        <img src={s.ogImage} alt="OG Preview" style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      </div>
                    )}

                    {/* Note */}
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "flex-start", gap: "6px", background: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 10px" }}>
                      <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: 1.2 }}>⚠️</span>
                      <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                        <b>Для Facebook, Telegram, LinkedIn</b> потрібна публічна URL на хостингу — base64 зображення соціальні мережі не сканують. Після деплою на <b>chernozem.com.ua</b> — завантажте картинку 1200×630 px і вставте URL.
                      </p>
                    </div>
                  </div>
                  <Field label="OG URL (og:url)" hint="Канонічна URL сторінки для соцмереж">
                    <TInput value={s.ogUrl ?? ""} onChange={(v) => setS({ ogUrl: v })} placeholder="https://kyivchornozem.com/" />
                  </Field>
                </Card>

                {/* ── JSON-LD LocalBusiness ── */}
                <Card title="🏪 JSON-LD LocalBusiness — структуровані дані">
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#14532d", lineHeight: 1.6 }}>
                    <strong>Критично для локального SEO!</strong> Ці дані показуються у <strong>Google Maps, Knowledge Panel</strong> («картка бізнесу» праворуч у пошуку) та у Featured Snippets. Дозволяють з'являтись у запитах «чорнозем Київ на карті».
                  </div>
                  <Grid2>
                    <Field label="Широта (latitude)" hint="Для Києва ~ 50.4501">
                      <TInput value={s.geoLat ?? ""} onChange={(v) => setS({ geoLat: v })} placeholder="50.4342" />
                    </Field>
                    <Field label="Довгота (longitude)" hint="Для Києва ~ 30.5234">
                      <TInput value={s.geoLng ?? ""} onChange={(v) => setS({ geoLng: v })} placeholder="30.5726" />
                    </Field>
                  </Grid2>
                  <p style={{ fontSize: "12px", color: C.muted, marginTop: "-8px", marginBottom: "16px" }}>
                    Знайдіть точні координати на <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ color: C.accent }}>maps.google.com</a> → ПКМ на маркері → скопіюйте числа.
                  </p>
                  <Field label="Цінова категорія" hint="$ — дешево, $$ — середньо, $$$ — дорого">
                    <div style={{ position: "relative" }}>
                      <select value={s.priceRange ?? "$$"} onChange={(e) => setS({ priceRange: e.target.value })}
                        style={{ width: "100%", padding: "12px 36px 12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, WebkitAppearance: "none", cursor: "pointer" }}>
                        <option value="$">$ — Бюджетно</option>
                        <option value="$$">$$ — Середній цінник (рекомендовано)</option>
                        <option value="$$$">$$$ — Преміум</option>
                      </select>
                      <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </Field>
                  <div style={{ background: "#f4f5f7", borderRadius: "8px", padding: "10px 12px", fontSize: "11px", color: C.muted, fontFamily: "monospace", lineHeight: 1.6 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontFamily: SANS, fontWeight: 600, color: C.text }}>Автоматично використовується з розділу «Загальне»:</p>
                    <span style={{ color: C.text }}>Назва:</span> {draft.general.companyName}<br />
                    <span style={{ color: C.text }}>Адреса:</span> {draft.general.address}<br />
                    <span style={{ color: C.text }}>Телефон:</span> {draft.general.phone}<br />
                    <span style={{ color: C.text }}>Графік:</span> {draft.general.workingHours}
                  </div>
                </Card>

                {/* ── SEO Text Block ── */}
                {(() => {
                  const st = draft.seoText ?? {};
                  const setSt = (patch: Partial<typeof draft.seoText>) =>
                    setDraft((d) => ({ ...d, seoText: { ...d.seoText, ...patch } }));
                  return (
                    <Card title="📝 SEO-текст на сторінці">
                      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                        <strong>Навіщо це:</strong> 400–600 слів природного SEO-тексту внизу сторінки. Google отримує відповіді на інформаційні запити — підвищує позиції за довгохвостими ключами. Структура: H2 → 4× H3 — не порушує H-ієрархію сторінки.
                      </div>
                      {/* Enable toggle */}
                      <div onClick={() => setSt({ enabled: !st.enabled })}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: st.enabled ? "#f0fdf4" : "#f9fafb", border: `1.5px solid ${st.enabled ? "#86efac" : C.border}`, borderRadius: "10px", marginBottom: "20px", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, fontFamily: SANS }}>Показувати на сайті</div>
                          <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{st.enabled ? "✅ Блок видимий — Google індексує текст" : "⬛ Прихований"}</div>
                        </div>
                        <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: st.enabled ? C.accent : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <div style={{ position: "absolute", top: "3px", left: st.enabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.22)", transition: "left 0.2s" }} />
                        </div>
                      </div>
                      {/* H2 */}
                      <Field label="H2 — Заголовок секції" hint="50–70 символів · ключ + намір + місто">
                        <TInput value={st.h2 ?? ""} onChange={(v) => setSt({ h2: v })} placeholder="Купити чорнозем у Києві: що це таке, чому важливо і як замовити" />
                      </Field>
                      <Field label="Вступний абзац" hint="2–3 речення · тема + бренд + ключ">
                        <TInput multiline value={st.intro ?? ""} onChange={(v) => setSt({ intro: v })} rows={3} placeholder="Чорнозем — це не просто темна земля…" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 блок 1 — Заголовок" hint="Освіта: що таке чорнозем">
                        <TInput value={st.h3_1 ?? ""} onChange={(v) => setSt({ h3_1: v })} placeholder="Що таке справжній чорнозем і чим він відрізняється від «суміші»" />
                      </Field>
                      <Field label="H3 блок 1 — Текст">
                        <TInput multiline value={st.body1 ?? ""} onChange={(v) => setSt({ body1: v })} rows={4} placeholder="На ринку нерідко продають так звану «рослинну землю»…" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 блок 2 — Заголовок" hint="USP: чому купувати у нас">
                        <TInput value={st.h3_2 ?? ""} onChange={(v) => setSt({ h3_2: v })} placeholder="В��д виробника без посередників — ось у чому наша ключова відмінність" />
                      </Field>
                      <Field label="H3 блок 2 — Текст">
                        <TInput multiline value={st.body2 ?? ""} onChange={(v) => setSt({ body2: v })} rows={4} placeholder="Коли ви купуєте чорнозем через посередника…" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 блок 3 — Заголовок" hint="Ціни поточного року — топ комерційний запит">
                        <TInput value={st.h3_3 ?? ""} onChange={(v) => setSt({ h3_3: v })} placeholder="Ціна чорнозему в Києві у 2026 році — прозоро і без сюрпризів" />
                      </Field>
                      <Field label="H3 блок 3 — Текст">
                        <TInput multiline value={st.body3 ?? ""} onChange={(v) => setSt({ body3: v })} rows={4} placeholder="Вартість чорнозему насипом у 2026 році становить…" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 блок 4 — Заголовок" hint="Гео-охоплення — підсилює локальне SEO">
                        <TInput value={st.h3_4 ?? ""} onChange={(v) => setSt({ h3_4: v })} placeholder="Де ми доставляємо чорнозем — Київ та вся Київська область" />
                      </Field>
                      <Field label="H3 блок 4 — Текст" hint="Перелічіть райони/міста природно в тексті, не списком">
                        <TInput multiline value={st.body4 ?? ""} onChange={(v) => setSt({ body4: v })} rows={5} placeholder="Ми доставляємо чорнозем по всіх десяти районах Києва…" />
                      </Field>
                    </Card>
                  );
                })()}

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 28px", borderRadius: "10px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 2px 12px rgba(63,174,108,0.3)" }}>
                    <Save size={15} />{saved ? "Збережено ✓" : saving ? "Зберігаємо…" : "Зберегти SEO налаштування"}
                  </button>
                </div>
              </>
            );
          })()}

          {/* ═══ INTEGRATIONS ═══ */}
          {tab === "integrations" && (
            <>
              {/* ── Pending orders alert ── */}
              {pendingCount > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#b91c1c", marginBottom: "2px" }}>
                      {pendingCount} невідправлен{pendingCount === 1 ? "е" : "их"} замовлень у черзі
                    </div>
                    <div style={{ fontSize: "12px", color: "#dc2626" }}>
                      Перевірте налаштування Telegram Bot або інтернет-з'єднання.
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await retryPendingOrders();
                      setPendingCount(loadPendingOrders().length);
                      setToast("✓ Повторна спроба надсилання виконана");
                    }}
                    style={{ padding: "8px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontFamily: SANS, fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Відправити зараз
                  </button>
                </div>
              )}

              {/* ── Google Analytics ── */}
              <Card title="📊 Google Analytics 4">
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "12px 14px", marginBottom: "18px", display: "flex", gap: "10px" }}>
                  <BarChart2 size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#0c4a6e", margin: "0 0 4px" }}>Як отримати Measurement ID?</p>
                    <ol style={{ fontSize: "12px", color: "#0369a1", margin: 0, paddingLeft: "16px", lineHeight: 1.8 }}>
                      <li>Відкрийте <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: "#0369a1" }}>analytics.google.com</a></li>
                      <li>Адмін → Потоки даних → Ваш сайт</li>
                      <li>Скопіюйте Measurement ID (формат <code style={{ background: "#e0f2fe", padding: "1px 5px", borderRadius: "3px" }}>G-XXXXXXXXXX</code>)</li>
                    </ol>
                  </div>
                </div>
                <Field label="Google Analytics Measurement ID" hint='Формат: G-XXXXXXXXXX · Залиште порожнім щоб вимкнути'>
                  <TInput
                    value={intg.gaId}
                    onChange={(v) => setIntg({ ...intg, gaId: v.trim() })}
                    placeholder="G-XXXXXXXXXX"
                  />
                  {intg.gaId && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: C.success, background: "#d1fae5", border: "1px solid #6ee7b7", padding: "3px 10px", borderRadius: "20px" }}>
                        ✓ GA буде активовано при відкритті сайту
                      </span>
                    </div>
                  )}
                </Field>
                <button
                  onClick={handleSaveIntg}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", background: intgSaved ? C.success : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: SANS, transition: "background 0.3s" }}>
                  <Save size={14} />{intgSaved ? "Збережено ✓" : "Зберегти"}
                </button>
              </Card>

              {/* ── Telegram ── */}
              <Card title="✈️ Telegram — сповіщення про замовлення">
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 14px", marginBottom: "18px", display: "flex", gap: "10px" }}>
                  <Send size={16} color={C.success} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#14532d", margin: "0 0 4px" }}>Як налаштувати за 3 хвилини?</p>
                    <ol style={{ fontSize: "12px", color: "#16a34a", margin: 0, paddingLeft: "16px", lineHeight: 1.9 }}>
                      <li>Напишіть <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: "#16a34a" }}>@BotFather</a> → /newbot → скопіюйте токен</li>
                      <li>Створіть групу/канал, додайте туди бота як адміністратора</li>
                      <li>Напишіть <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: "#16a34a" }}>@userinfobot</a> у групі — отримайте Chat ID</li>
                      <li>Вставте токен та Chat ID нижче, натисніть «Надіслати тес��»</li>
                    </ol>
                  </div>
                </div>

                <Field label="Bot Token" hint="Від @BotFather · напр. 123456789:ABCDefghIJK...">
                  <TInput
                    value={intg.tgBotToken}
                    onChange={(v) => { setIntg({ ...intg, tgBotToken: v }); setTgTestResult(null); }}
                    placeholder="123456789:ABCDefghIJKlmnoPQRstuvwxyz"
                  />
                </Field>

                <Field label="Chat ID" hint="ID групи, каналу або особистий · напр. -1001234567890">
                  <TInput
                    value={intg.tgChatId}
                    onChange={(v) => { setIntg({ ...intg, tgChatId: v }); setTgTestResult(null); }}
                    placeholder="-1001234567890"
                  />
                </Field>

                {tgTestResult && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", background: tgTestResult.ok ? "#d1fae5" : "#fef2f2", border: `1px solid ${tgTestResult.ok ? "#6ee7b7" : "#fca5a5"}`, marginBottom: "14px" }}>
                    {tgTestResult.ok
                      ? <CheckCircle size={15} color={C.success} />
                      : <AlertCircle size={15} color={C.danger} />}
                    <span style={{ fontSize: "13px", fontWeight: 600, color: tgTestResult.ok ? "#065f46" : C.danger }}>{tgTestResult.msg}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleTgTest}
                    disabled={tgTesting || !intg.tgBotToken || !intg.tgChatId}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", background: tgTesting ? "#9ca3af" : "#0088cc", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: (tgTesting || !intg.tgBotToken || !intg.tgChatId) ? "not-allowed" : "pointer", fontFamily: SANS, opacity: (!intg.tgBotToken || !intg.tgChatId) ? 0.5 : 1, transition: "opacity 0.2s" }}>
                    <Send size={13} />{tgTesting ? "Відправляємо..." : "Надіслати тест"}
                  </button>
                  <button
                    onClick={handleSaveIntg}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", background: intgSaved ? C.success : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: SANS, transition: "background 0.3s" }}>
                    <Save size={14} />{intgSaved ? "Збережено ✓" : "Зберегти"}
                  </button>
                </div>

                {intg.tgBotToken && intg.tgChatId && (
                  <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={14} color={C.success} />
                    <span style={{ fontSize: "12px", color: "#14532d", fontWeight: 500 }}>
                      Telegram налаштовано — нові замовлення з сайту надходитимуть у бот автоматично
                    </span>
                  </div>
                )}
              </Card>

              {/* ── Status summary ── */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 14px", fontFamily: SANS }}>Статус інтеграцій</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Google Analytics", ok: !!intg.gaId, value: intg.gaId || "Не налаштовано" },
                    { label: "Telegram Bot Token", ok: !!intg.tgBotToken, value: intg.tgBotToken ? `${intg.tgBotToken.slice(0, 12)}...` : "Не налаштовано" },
                    { label: "Telegram Chat ID", ok: !!intg.tgChatId, value: intg.tgChatId || "Не налаштовано" },
                  ].map(({ label, ok, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ok ? C.success : "#d1d5db", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>{label}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: ok ? C.success : C.muted, fontFamily: "monospace", background: ok ? "#d1fae5" : "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ height: "8px" }} />
        </div>

        {/* ══ MOBILE STICKY BOTTOM BAR ══ */}
        {isMobile && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "10px 12px", display: "flex", gap: "10px", zIndex: 90, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
            <button onClick={handleReset}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "13px", borderRadius: "10px", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: SANS, minHeight: "48px" }}>
              <RotateCcw size={15} />Скинути
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "13px", borderRadius: "10px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 3px 14px rgba(63,174,108,0.35)", minHeight: "48px" }}>
              <Save size={16} />{saved ? "Збережено ✓" : saving ? "Зберігаємо…" : "Зберегти зміни"}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onHide={() => setToast("")} />}

      <style>{`
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:4px; }
      `}</style>
    </div>
    </>
  );
}
