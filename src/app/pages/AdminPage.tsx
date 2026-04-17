import { useState, useEffect, useRef, useCallback } from "react";
import { useContent } from "../contexts/ContentContext";
import {
  DEFAULT_CONTENT, ADMIN_PASSWORD_KEY,
  SiteContent, BenefitItem, ReviewItem, FaqItem,
  IMAGE_ALT_DEFAULTS, ImageAlts,
} from "../lib/siteContent";
import * as api from "../lib/api";

// в”Ђв”Ђ Session key for stored admin password в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const ADMIN_SESSION_KEY = "kyivchornozem_admin_pass_v1";

// в”Ђв”Ђ Fallback images (Unsplash URLs вЂ” no figma:asset in production build) в”Ђв”Ђ
const _basePath = import.meta.env.BASE_URL;
const _soilFallback          = `${_basePath}assets/images/soil.jpg`;
const _truckDeliveryFallback = `${_basePath}assets/images/truckDelivery.jpg`;
const _gardenResultFallback  = `${_basePath}assets/images/gardenResult.jpg`;
const _homeownerFallback     = `${_basePath}assets/images/homeowner.jpg`;
const _agroFallback          = `${_basePath}assets/images/agro.jpg`;
const _landscapeFallback     = `${_basePath}assets/images/landscape.jpg`;
const _gardenSegFallback     = `${_basePath}assets/images/gardenSeg.jpg`;
const _lawnFallback          = `${_basePath}assets/images/lawn.jpg`;
const _zilFallback           = `${_basePath}assets/images/truckDelivery.jpg`;
const _kamazFallback         = `${_basePath}assets/images/kamaz.jpg`;
const _mazFallback           = `${_basePath}assets/images/maz.jpg`;
const _volvoFallback         = `${_basePath}assets/images/kamaz.jpg`;

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

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  HOOK вЂ” detect mobile
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mobile;
}

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  LOGIN
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
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
          <h1 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>РђРґРјС–РЅ-РїР°РЅРµР»СЊ</h1>
          <p style={{ fontSize: "14px", color: C.muted }}>РљРёС—РІР§РѕСЂРЅРѕР·РµРј В· РЈРїСЂР°РІР»С–РЅРЅСЏ СЃР°Р№С‚РѕРј</p>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>РџР°СЂРѕР»СЊ РґРѕСЃС‚СѓРїСѓ</label>
            <input
              type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }}
              placeholder="Р’РІРµРґС–С‚СЊ РїР°СЂРѕР»СЊ..." autoFocus
              style={{ width: "100%", padding: "14px 16px", border: `1.5px solid ${error ? C.danger : C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: error ? C.dangerLight : C.white, boxSizing: "border-box" }}
            />
            {error && <p style={{ fontSize: "13px", color: C.danger, marginTop: "6px" }}>РќРµРїСЂР°РІРёР»СЊРЅРёР№ РїР°СЂРѕР»СЊ.</p>}
          </div>
          <button type="submit" disabled={checking} style={{ width: "100%", padding: "16px", background: checking ? `${C.accent}80` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: checking ? "wait" : "pointer", fontFamily: SANS, transition: "all 0.2s" }}>
            {checking ? "РџРµСЂРµРІС–СЂРєР°..." : "РЈРІС–Р№С‚Рё"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "12px", color: C.muted, marginTop: "20px" }}>
          РџР°СЂРѕР»СЊ Р·РјС–РЅСЋС”С‚СЊСЃСЏ РІ Р°РґРјС–РЅ-РїР°РЅРµР»С– в†’ Р—Р°РіР°Р»СЊРЅРµ в†’ Р‘РµР·РїРµРєР°
        </p>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  IMAGE UPLOADER
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
interface ImageUploaderProps {
  label: string;
  hint?: string;
  value: string;
  fallbackSrc?: string;
  onChange: (url: string) => void;
  aspect?: "landscape" | "square" | "portrait";
  /** Storage key РґР»СЏ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РІ Supabase (РЅР°РїСЂ. "heroPhoto") */
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

      // Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅР° СЃРµСЂРІРµСЂ СЏРєС‰Рѕ Р°РґРјС–РЅ Р°РІС‚РѕСЂРёР·РѕРІР°РЅРёР№ С– С” imageKey
      const adminPass = api.getAdminPassword();
      if (imageKey && adminPass) {
        try {
          const mimeType = `image/${result.format}`;
          const url = await api.uploadImage(imageKey, result.dataUrl, mimeType);
          onChange(url);
        } catch (uploadErr) {
          console.warn("[ImageUploader] Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РЅР° СЃРµСЂРІРµСЂ РЅРµ РІРґР°Р»РѕСЃСЏ, РІРёРєРѕСЂРёСЃС‚РѕРІСѓС”С‚СЊСЃСЏ base64:", uploadErr);
          onChange(result.dataUrl); // fallback РґРѕ base64
        }
      } else {
        onChange(result.dataUrl);
      }

      // Auto-populate alt text if empty
      if (onAltChange && !altValue && defaultAlt) {
        onAltChange(defaultAlt);
      }
    } catch (e) {
      alert("РќРµ РІРґР°Р»РѕСЃСЏ РѕР±СЂРѕР±РёС‚Рё Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.");
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
              Р—Р°РІР°РЅС‚Р°Р¶РµРЅРѕ
            </span>
          )}
          {!isUploaded && hasFallback && <span style={{ fontSize: "11px", color: "#92400e", background: "#fef3c7", border: "1px solid #fcd34d", padding: "2px 8px", borderRadius: "20px" }}>РћСЂРёРіС–РЅР°Р»</span>}
          {!isUploaded && !hasFallback && <span style={{ fontSize: "11px", color: C.muted, background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "2px 8px", borderRadius: "20px" }}>РќРµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ</span>}
        </div>
        {isUploaded && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {/* Format badge */}
            {lastResult && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: lastResult.format === "webp" ? "#0369a1" : "#6b7280", background: lastResult.format === "webp" ? "#e0f2fe" : "#f3f4f6", border: `1px solid ${lastResult.format === "webp" ? "#7dd3fc" : "#e5e7eb"}`, padding: "2px 7px", borderRadius: "4px" }}>
                {lastResult.format.toUpperCase()}
              </span>
            )}
            {/* Size вЂ” С‚С–Р»СЊРєРё РґР»СЏ base64, РЅРµ РґР»СЏ URL */}
            {value.startsWith("data:") && (
              <span style={{ fontSize: "11px", color: C.muted, background: "#f3f4f6", padding: "2px 7px", borderRadius: "4px" }}>
                {base64Size(value)}
              </span>
            )}
            {value.startsWith("http") && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#0369a1", background: "#e0f2fe", border: "1px solid #7dd3fc", padding: "2px 7px", borderRadius: "4px" }}>
                вЃ Supabase
              </span>
            )}
            {/* Compression ratio */}
            {lastResult && lastResult.ratio >= 1.5 && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", background: "#d1fae5", border: "1px solid #6ee7b7", padding: "2px 7px", borderRadius: "4px" }}>
                в€’{Math.round((1 - 1 / lastResult.ratio) * 100)}% ({formatBytes(lastResult.originalBytes)} в†’ {formatBytes(lastResult.compressedBytes)})
              </span>
            )}
            <button onClick={(e) => { e.stopPropagation(); onChange(""); setLastResult(null); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: C.dangerLight, border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: C.danger, fontSize: "12px", fontWeight: 600, fontFamily: SANS, minHeight: "32px" }}>
              <X size={12} /> Р’РёРґР°Р»РёС‚Рё
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
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>Р—Р°РІР°РЅС‚Р°Р¶РµРЅРѕ</span>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", opacity: hovered || dragOver ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none" }}>
            <Upload size={24} color="#fff" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>Р—Р°РјС–РЅРёС‚Рё С„РѕС‚Рѕ</p>
          </div>
          {loading && <LoadingOverlay message="РљРѕРЅРІРµСЂС‚Р°С†С–СЏ РІ WebP..." />}
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
            <p style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 700, color: "#fff", margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё РІР»Р°СЃРЅРµ С„РѕС‚Рѕ</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>РџРѕРєР°Р·СѓС”С‚СЊСЃСЏ РѕСЂРёРіС–РЅР°Р» (Figma)</p>
          </div>
          {loading && <LoadingOverlay message="РљРѕРЅРІРµСЂС‚Р°С†С–СЏ РІ WebP..." />}
        </div>
      )}

      {/* EMPTY */}
      {!isUploaded && !hasFallback && (
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ position: "relative", height: `${h}px`, borderRadius: "12px", border: `2px dashed ${dragOver ? C.accent : hovered ? "#9ca3af" : "#d1d5db"}`, overflow: "hidden", cursor: "pointer", background: dragOver ? C.accentLight : hovered ? "#f9fafb" : "#fafafa", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {loading ? <LoadingOverlay inline message="РљРѕРЅРІРµСЂС‚Р°С†С–СЏ РІ WebP..." /> : (
            <>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: dragOver ? C.accent : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                <Upload size={22} color={dragOver ? "#fff" : C.accent} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: C.text, margin: 0 }}>Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё С„РѕС‚Рѕ</p>
              <p style={{ fontSize: "11px", color: C.muted, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                {isMobile ? "РќР°С‚РёСЃРЅС–С‚СЊ С‰РѕР± РІРёР±СЂР°С‚Рё С„Р°Р№Р»" : "РљР»С–РєРЅС–С‚СЊ Р°Р±Рѕ РїРµСЂРµС‚СЏРіРЅС–С‚СЊ В· JPG, PNG, WEBP"}
              </p>
              <span style={{ fontSize: "10px", color: C.accent, background: C.accentLight, border: `1px solid ${C.accent}40`, padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>
                РђРІС‚Рѕ-РєРѕРЅРІРµСЂС‚Р°С†С–СЏ WebP
              </span>
            </>
          )}
        </div>
      )}

      {hint && <p style={{ fontSize: "12px", color: C.muted, marginTop: "6px", lineHeight: 1.4 }}>{hint}</p>}

      {/* в”Ђв”Ђ Alt text field (shown when slot has alt props) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      {onAltChange !== undefined && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: C.accent, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Alt-С‚РµРєСЃС‚ (SEO)
            </span>
            {altValue && (
              <span style={{ fontSize: "10px", color: "#065f46", background: "#d1fae5", border: "1px solid #6ee7b7", padding: "1px 7px", borderRadius: "20px", fontWeight: 600 }}>
                Р—Р°РїРѕРІРЅРµРЅРѕ
              </span>
            )}
            {!altValue && defaultAlt && (
              <button
                type="button"
                onClick={() => onAltChange(defaultAlt)}
                style={{ fontSize: "10px", color: C.accent, background: C.accentLight, border: `1px solid ${C.accent}40`, padding: "1px 8px", borderRadius: "20px", cursor: "pointer", fontWeight: 600, fontFamily: SANS }}
              >
                в†є РђРІС‚Рѕ
              </button>
            )}
          </div>
          <input
            type="text"
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={defaultAlt || "РћРїРёСЃ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ РґР»СЏ РїРѕС€СѓРєРѕРІРёС… СЃРёСЃС‚РµРјвЂ¦"}
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
            РћРїРёСЃ С„РѕС‚Рѕ РґР»СЏ Google Images С‚Р° СЃРєСЂС–РЅ-СЂС–РґРµСЂС–РІ. Р РµРєРѕРјРµРЅРґРѕРІР°РЅРѕ: 50вЂ“125 СЃРёРјРІРѕР»С–РІ.
            {defaultAlt && !altValue && (
              <> Р‘СѓРґРµ Р°РІС‚РѕР·Р°РїРѕРІРЅРµРЅРѕ РїСЂРё Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅС– С„РѕС‚Рѕ.</>
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
        {message ?? "РћР±СЂРѕР±РєР°..."}
      </p>
    </div>
  );
}

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  HELPER COMPONENTS
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty field during typing вЂ” don't commit NaN
    if (raw === "" || raw === "-") return;
    let num = Number(raw);
    // Reject NaN (invalid input like "abc")
    if (Number.isNaN(num)) return;
    // Enforce min/max bounds
    if (min !== undefined) num = Math.max(min, num);
    if (max !== undefined) num = Math.min(max, num);
    onChange(num);
  };
  return (
    <input type="number" value={value} onChange={handleChange} min={min} max={max}
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

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  TABS CONFIG
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
type Tab = "general" | "hero" | "benefits" | "howitworks" | "whofor" | "pricing" | "reviews" | "faq" | "images" | "finalcta" | "integrations" | "seo";

const TABS: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: "general",      label: "Р—Р°РіР°Р»СЊРЅРµ",        shortLabel: "Р—Р°РіР°Р»СЊРЅРµ",   icon: <Settings size={16} /> },
  { id: "hero",         label: "Hero СЃРµРєС†С–СЏ",      shortLabel: "Hero",       icon: <Layout size={16} /> },
  { id: "benefits",     label: "РџРµСЂРµРІР°РіРё",         shortLabel: "РџРµСЂРµРІР°РіРё",   icon: <Star size={16} /> },
  { id: "howitworks",   label: "РЇРє С†Рµ РїСЂР°С†СЋС”",     shortLabel: "РљСЂРѕРєРё",      icon: <CheckCircle size={16} /> },
  { id: "whofor",       label: "РљРѕРјСѓ РїС–РґС…РѕРґРёС‚СЊ",   shortLabel: "РљРѕРјСѓ",       icon: <Users size={16} /> },
  { id: "pricing",      label: "Р¦С–РЅРё С– СЃР°РјРѕСЃРєРёРґРё", shortLabel: "Р¦С–РЅРё",       icon: <DollarSign size={16} /> },
  { id: "reviews",      label: "Р’С–РґРіСѓРєРё",          shortLabel: "Р’С–РґРіСѓРєРё",    icon: <User size={16} /> },
  { id: "faq",          label: "FAQ",              shortLabel: "FAQ",        icon: <HelpCircle size={16} /> },
  { id: "images",       label: "Р—РѕР±СЂР°Р¶РµРЅРЅСЏ",       shortLabel: "Р¤РѕС‚Рѕ",       icon: <ImageIcon size={16} /> },
  { id: "finalcta",     label: "Р¤С–РЅР°Р»СЊРЅРёР№ CTA",    shortLabel: "CTA",        icon: <CheckCircle size={16} /> },
  { id: "seo",          label: "SEO",              shortLabel: "SEO",        icon: <BarChart2 size={16} /> },
  { id: "integrations", label: "Р†РЅС‚РµРіСЂР°С†С–С—",       shortLabel: "Р†РЅС‚РµРіСЂ.",    icon: <Zap size={16} /> },
];

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  MAIN ADMIN PAGE
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
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

  // в”Ђв”Ђ Р’С–РґРЅРѕРІРёС‚Рё РїР°СЂРѕР»СЊ Р°РґРјС–РЅР° С–Р· sessionStorage (РІРёРґР°Р»РµРЅРѕ, С‚РµРїРµСЂ РІ api.ts) в”Ђв”Ђ
  const [storageInfo, setStorageInfo] = useState("");
  const isMobile = useIsMobile();
  const tabsRef    = useRef<HTMLDivElement>(null);

  const { content, updateContent, resetContent } = useContent();

  // в”Ђв”Ђ Change Password state в”Ђв”Ђ
  const [pwCurrent, setPwCurrent]   = useState("");
  const [pwNew, setPwNew]           = useState("");
  const [pwConfirm, setPwConfirm]   = useState("");
  const [pwError, setPwError]       = useState("");
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwNew.trim()) { setPwError("Р’РІРµРґС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ"); return; }
    if (pwNew.length < 6) { setPwError("РџР°СЂРѕР»СЊ РјР°С” Р±СѓС‚Рё РјС–РЅС–РјСѓРј 6 СЃРёРјРІРѕР»С–РІ"); return; }
    if (pwNew !== pwConfirm) { setPwError("РџР°СЂРѕР»С– РЅРµ Р·Р±С–РіР°СЋС‚СЊСЃСЏ"); return; }
    setPwSaving(true);
    try {
      const currentOk = await api.verifyPassword(pwCurrent);
      if (!currentOk) { setPwError("РџРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ РЅРµРІС–СЂРЅРёР№"); return; }
      await api.changePassword(pwNew, pwCurrent);
      // РћРЅРѕРІРёС‚Рё СЃРµСЃС–Р№РЅРёР№ РїР°СЂРѕР»СЊ
      sessionStorage.setItem(ADMIN_SESSION_KEY, pwNew);
      setPwSuccess(true);
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setToast("вњ“ РџР°СЂРѕР»СЊ Р·РјС–РЅРµРЅРѕ СѓСЃРїС–С€РЅРѕ!");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(`РџРѕРјРёР»РєР°: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPwSaving(false);
    }
  };

  // в”Ђв”Ђ Integrations state в”Ђв”Ђ
  const [intg, setIntg] = useState<IntegrationSettings>(() => loadIntegrations());
  const [tgTesting, setTgTesting] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [intgSaved, setIntgSaved] = useState(false);

  const handleSaveIntg = () => {
    saveIntegrations(intg);
    setIntgSaved(true);
    setToast("вњ“ Р†РЅС‚РµРіСЂР°С†С–С— Р·Р±РµСЂРµР¶РµРЅРѕ!");
    setTimeout(() => setIntgSaved(false), 2500);
  };

  const handleTgTest = async () => {
    setTgTesting(true);
    setTgTestResult(null);
    const res = await sendTelegramTest(intg.tgBotToken, intg.tgChatId);
    setTgTestResult({ ok: res.ok, msg: res.ok ? "РўРµСЃС‚РѕРІРµ РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ РЅР°РґС–СЃР»Р°РЅРѕ! вњ“" : (res.error ?? "РџРѕРјРёР»РєР°") });
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

  const [draft, _setDraft] = useState<SiteContent>(() => safeMerge(content));
  const isDirtyRef = useRef(false);

  const setDraft = useCallback((value: React.SetStateAction<SiteContent>) => {
    isDirtyRef.current = true;
    _setDraft(value);
  }, []);

  useEffect(() => {
    if (!isDirtyRef.current) {
      _setDraft(safeMerge(content));
    }
  }, [content]);
  useEffect(() => {
    const lsUsed = estimateStorageUsed();
    const imgCount = Object.values(draft.images).filter(Boolean).length;
    setStorageInfo(`${lsUsed} LS В· ${imgCount}/12 С„РѕС‚Рѕ IDB`);
  }, [draft.images, draft.reviews]);

  // в”Ђв”Ђ Autosave: 3 s debounce after any draft change в”Ђв”Ђ
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

  const handleReset = async () => {
    // UX Safety: require explicit text confirmation to prevent accidental data loss
    const answer = prompt(
      "вљ пёЏ РЈРІР°РіР°! Р¦СЏ РґС–СЏ СЃРєРёРЅРµ Р’РЎР• РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РґРѕ РїРѕС‡Р°С‚РєРѕРІРёС….\n\n" +
      "Р”Р»СЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ РІРІРµРґС–С‚СЊ СЃР»РѕРІРѕ: РЎРљРРќРЈРўР"
    );
    if (answer?.trim() !== "РЎРљРРќРЈРўР") {
      if (answer !== null) setToast("РЎРєРёРґР°РЅРЅСЏ СЃРєР°СЃРѕРІР°РЅРѕ вЂ” РІРІРµРґРµРЅРѕ РЅРµРІС–СЂРЅРµ СЃР»РѕРІРѕ");
      return;
    }
    resetContent();
    setDraft(DEFAULT_CONTENT);
    try {
      await api.saveContent(DEFAULT_CONTENT);
      setToast("РЎРєРёРЅСѓС‚Рѕ РґРѕ РїРѕС‡Р°С‚РєРѕРІРёС… РЅР°Р»Р°С€С‚СѓРІР°РЅСЊ С‚Р° Р·Р±РµСЂРµР¶РµРЅРѕ РЅР° СЃРµСЂРІРµСЂС–");
    } catch (e) {
      setToast("РЎРєРёРЅСѓС‚Рѕ Р»РѕРєР°Р»СЊРЅРѕ (РїРѕРјРёР»РєР° Р·Р±РµСЂРµР¶РµРЅРЅСЏ РЅР° СЃРµСЂРІРµСЂС–)");
      console.error("Reset server save error:", e);
    }
  };

  // в”Ђв”Ђ Pending orders badge (Telegram failures) в”Ђв”Ђ
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
      updateContent(() => draft); // Р·Р±РµСЂРµРіС‚Рё РІ localStorage/IDB СЏРє СЂРµР·РµСЂРІРЅСѓ РєРѕРїС–СЋ
      await api.saveContent(draft); // Р·Р±РµСЂРµРіС‚Рё РЅР° СЃРµСЂРІРµСЂС– (РґР»СЏ РІСЃС–С… РїСЂРёСЃС‚СЂРѕС—РІ)
      isDirtyRef.current = false;
      setSaved(true);
      setToast("вњ“ Р—РјС–РЅРё Р·Р±РµСЂРµР¶РµРЅРѕ РЅР° СЃРµСЂРІРµСЂС–!");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
      setToast(`вљ  РџРѕРјРёР»РєР° Р·Р±РµСЂРµР¶РµРЅРЅСЏ: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };


  const selectTab = (t: Tab) => { setTab(t); setDrawer(false); };

  const setD      = <K extends keyof SiteContent>(key: K, val: SiteContent[K]) => setDraft((d) => ({ ...d, [key]: val }));
  const setImg    = (key: keyof SiteContent["images"], val: string) => setD("images", { ...draft.images, [key]: val });
  const setImgAlt = (key: keyof ImageAlts, val: string) => setDraft((d) => ({ ...d, imageAlts: { ...d.imageAlts, [key]: val } }));

  // Prevent admin page from appearing in search results (noindex via useEffect)
  useEffect(() => {
    document.title = "РђРґРјС–РЅ-РїР°РЅРµР»СЊ | РљРёС—РІР§РѕСЂРЅРѕР·РµРј";
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

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ MOBILE BACKDROP в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 199, backdropFilter: "blur(2px)" }} />
      )}

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ SIDEBAR / DRAWER в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
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
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", fontFamily: SERIF }}>РљРёС—РІР§РѕСЂРЅРѕР·РµРј</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>РђРґРјС–РЅ-РїР°РЅРµР»СЊ</div>
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
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Р—Р°Р№РЅСЏС‚Рѕ: {storageInfo}</span>
            </div>
          )}
          {autoSavedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: "11px", color: "rgba(74,222,128,0.7)" }}>РђРІС‚РѕР·Р±РµСЂРµР¶РµРЅРѕ Рѕ {autoSavedAt}</span>
            </div>
          )}
        </div>


        {/* Footer */}
        <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <a href="/site" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 12px", borderRadius: "8px", color: "rgba(255,255,255,0.55)", fontSize: "13px", textDecoration: "none", marginBottom: "2px", minHeight: "44px" }}>
            <Eye size={14} />РџРµСЂРµРіР»СЏРЅСѓС‚Рё СЃР°Р№С‚
          </a>
          <button onClick={() => {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
            setAuthed(false);
          }}
            style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "11px 12px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "13px", fontFamily: SANS, minHeight: "44px" }}>
            <LogOut size={14} />Р’РёР№С‚Рё
          </button>
        </div>
      </aside>

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ MAIN в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* в”Ђв”Ђ HEADER в”Ђв”Ђ */}
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
                <RotateCcw size={14} />РЎРєРёРЅСѓС‚Рё
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 20px", borderRadius: "8px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 2px 10px rgba(63,174,108,0.3)" }}>
                <Save size={14} />{saved ? "Р—Р±РµСЂРµР¶РµРЅРѕ вњ“" : saving ? "Р—Р±РµСЂС–РіР°С”РјРѕвЂ¦" : "Р—Р±РµСЂРµРіС‚Рё"}
              </button>
            </div>
          )}

          {/* Mobile: save icon button */}
          {isMobile && (
            <button onClick={handleSave} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, flexShrink: 0, transition: "background 0.3s" }}>
              <Save size={15} />
              {saved ? "вњ“" : saving ? "вЂ¦" : "Р—Р±РµСЂРµРіС‚Рё"}
            </button>
          )}
        </header>

        {/* в”Ђв”Ђ MOBILE TABS STRIP в”Ђв”Ђ */}
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

        {/* в”Ђв”Ђ SCROLL CONTENT в”Ђв”Ђ */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px 120px" : "24px 28px 48px", maxWidth: isMobile ? "100%" : "940px", width: "100%" }}>

          {/* в•ђв•ђв•ђ GENERAL в•ђв•ђв•ђ */}
          {tab === "general" && (
            <>
              <Card title="рџЏў РљРѕРјРїР°РЅС–СЏ">
                <Grid2>
                  <Field label="РќР°Р·РІР° РєРѕРјРїР°РЅС–С—"><TInput value={draft.general.companyName} onChange={(v) => setD("general", { ...draft.general, companyName: v })} /></Field>
                  <Field label="Р С–Рє Р·Р°СЃРЅСѓРІР°РЅРЅСЏ"><TInput value={draft.general.foundedYear} onChange={(v) => setD("general", { ...draft.general, foundedYear: v })} /></Field>
                </Grid2>
                <Field label="Р¤РћРџ (РїРѕРІРЅР° РЅР°Р·РІР°)"><TInput value={draft.general.fopName} onChange={(v) => setD("general", { ...draft.general, fopName: v })} /></Field>
                <Field label="РљС–Р»СЊРєС–СЃС‚СЊ РєР»С–С”РЅС‚С–РІ"><TInput value={draft.general.clientsCount} onChange={(v) => setD("general", { ...draft.general, clientsCount: v })} placeholder="2 000" /></Field>
              </Card>
              <Card title="рџ“ћ РљРѕРЅС‚Р°РєС‚Рё">
                <Grid2>
                  <Field label="РўРµР»РµС„РѕРЅ (РІС–РґРѕР±СЂР°Р¶РµРЅРЅСЏ)"><TInput value={draft.general.phone} onChange={(v) => setD("general", { ...draft.general, phone: v })} /></Field>
                  <Field label="РўРµР»РµС„РѕРЅ (raw)" hint="+380981116059"><TInput value={draft.general.phoneRaw} onChange={(v) => setD("general", { ...draft.general, phoneRaw: v })} /></Field>
                </Grid2>
                <Field label="РђРґСЂРµСЃР° СЃРєР»Р°РґСѓ"><TInput value={draft.general.address} onChange={(v) => setD("general", { ...draft.general, address: v })} /></Field>
                <Field label="Р“СЂР°С„С–Рє СЂРѕР±РѕС‚Рё"><TInput value={draft.general.workingHours} onChange={(v) => setD("general", { ...draft.general, workingHours: v })} /></Field>
              </Card>
              <Card title="рџЏ¦ Р РµРєРІС–Р·РёС‚Рё">
                <Grid2>
                  <Field label="IBAN"><TInput value={draft.general.iban} onChange={(v) => setD("general", { ...draft.general, iban: v })} /></Field>
                  <Field label="РќР°Р·РІР° Р±Р°РЅРєСѓ"><TInput value={draft.general.bankName} onChange={(v) => setD("general", { ...draft.general, bankName: v })} /></Field>
                </Grid2>
              </Card>

              {/* в”Ђв”Ђ SECURITY: Change Password в”Ђв”Ђ */}
              <Card title="рџ”ђ Р‘РµР·РїРµРєР° вЂ” Р·РјС–РЅР° РїР°СЂРѕР»СЏ">
                <p style={{ fontSize: "13px", color: C.muted, marginBottom: "16px", lineHeight: 1.5 }}>
                  Р”Р»СЏ Р·РјС–РЅРё РїР°СЂРѕР»СЏ РІРІРµРґС–С‚СЊ РїРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ С‚Р° РЅРѕРІРёР№ РїР°СЂРѕР»СЊ РЅРёР¶С‡Рµ.
                  Р РµРєРѕРјРµРЅРґСѓС”РјРѕ Р·РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ РїС–СЃР»СЏ РїРµСЂС€РѕРіРѕ РІС…РѕРґСѓ.
                </p>

                <Field label="РџРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ">
                  <TInput type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="РџРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ" />
                </Field>
                <Grid2>
                  <Field label="РќРѕРІРёР№ РїР°СЂРѕР»СЊ">
                    <TInput type="password" value={pwNew} onChange={setPwNew} placeholder="РњС–РЅС–РјСѓРј 6 СЃРёРјРІРѕР»С–РІ" />
                  </Field>
                  <Field label="РџС–РґС‚РІРµСЂРґРёС‚Рё РїР°СЂРѕР»СЊ">
                    <TInput type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ" />
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
                    <span style={{ fontSize: "13px", color: C.success }}>РџР°СЂРѕР»СЊ СѓСЃРїС–С€РЅРѕ Р·РјС–РЅРµРЅРѕ!</span>
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", background: pwSaving ? C.accentLight : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, color: pwSaving ? C.accent : "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: pwSaving ? "wait" : "pointer", fontFamily: SANS, minHeight: "48px", transition: "all 0.2s" }}
                >
                  <Lock size={14} />
                  {pwSaving ? "Р—Р±РµСЂС–РіР°С”РјРѕвЂ¦" : "Р—РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ"}
                </button>
              </Card>
            </>
          )}

          {/* в•ђв•ђв•ђ HERO в•ђпїЅпїЅв•ђ */}
          {tab === "hero" && (
            <>
              <Card title="рџЏ· Р‘РµР№РґР¶">
                <Field label="РўРµРєСЃС‚ РЅР°Рґ Р·Р°РіРѕР»РѕРІРєРѕРј"><TInput value={draft.hero.badge} onChange={(v) => setD("hero", { ...draft.hero, badge: v })} /></Field>
              </Card>
              <Card title="рџ“ќ Р—Р°РіРѕР»РѕРІРѕРє С‚Р° РєРЅРѕРїРєРё">
                <Field label="Р СЏРґРѕРє 1"><TInput value={draft.hero.headlineLine1} onChange={(v) => setD("hero", { ...draft.hero, headlineLine1: v })} /></Field>
                <Field label="РђРєС†РµРЅС‚РЅРµ СЃР»РѕРІРѕ (Р·РµР»РµРЅРёР№)"><TInput value={draft.hero.headlineAccent} onChange={(v) => setD("hero", { ...draft.hero, headlineAccent: v })} /></Field>
                <Field label="Р СЏРґРѕРє 2"><TInput value={draft.hero.headlineLine2} onChange={(v) => setD("hero", { ...draft.hero, headlineLine2: v })} /></Field>
                <Field label="РџС–РґР·Р°РіРѕР»РѕРІРѕРє"><TInput multiline rows={3} value={draft.hero.subheadline} onChange={(v) => setD("hero", { ...draft.hero, subheadline: v })} /></Field>
                <Grid2>
                  <Field label="РљРЅРѕРїРєР° 1"><TInput value={draft.hero.ctaPrimary} onChange={(v) => setD("hero", { ...draft.hero, ctaPrimary: v })} /></Field>
                  <Field label="РљРЅРѕРїРєР° 2"><TInput value={draft.hero.ctaSecondary} onChange={(v) => setD("hero", { ...draft.hero, ctaSecondary: v })} /></Field>
                </Grid2>
              </Card>
            </>
          )}

          {/* в•ђв•ђв•ђ BENEFITS в•ђв•ђв•ђ */}
          {tab === "benefits" && (
            <Card title="в­ђ РљР°СЂС‚РєРё РїРµСЂРµРІР°Рі">
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px" }}>РќР°С‚РёСЃРЅС–С‚СЊ РЅР° РєР°СЂС‚РєСѓ С‰РѕР± СЂРѕР·РіРѕСЂРЅСѓС‚Рё.</p>
              {draft.benefits.map((b, i) => (
                <Collapsible key={i} title={`${i + 1}. ${b.title}`} onDelete={() => setD("benefits", draft.benefits.filter((_, j) => j !== i))}>
                  <Field label="Р—Р°РіРѕР»РѕРІРѕРє"><TInput value={b.title} onChange={(v) => setD("benefits", draft.benefits.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="РћРїРёСЃ"><TInput multiline rows={3} value={b.desc} onChange={(v) => setD("benefits", draft.benefits.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Р”РѕРґР°С‚Рё РїРµСЂРµРІР°РіСѓ" onClick={() => setD("benefits", [...draft.benefits, { title: "РќРѕРІР° РїРµСЂРµРІР°РіР°", desc: "РћРїРёСЃ..." } as BenefitItem])} />
            </Card>
          )}

          {/* в•ђв•ђв•ђ HOW IT WORKS в•ђв•ђв•ђ */}
          {tab === "howitworks" && (
            <Card title="рџ›  РЇРє С†Рµ РїСЂР°С†СЋС” вЂ” РєСЂРѕРєРё">
              {draft.howItWorks.map((step, i) => (
                <Collapsible key={i} title={`РљСЂРѕРє ${step.num}: ${step.title}`} onDelete={() => setD("howItWorks", draft.howItWorks.filter((_, j) => j !== i))}>
                  <Grid2>
                    <Field label="РќРѕРјРµСЂ (01, 02...)"><TInput value={step.num} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, num: v } : x))} /></Field>
                    <Field label="РќРѕС‚Р°С‚РєР° (Р±РµР№РґР¶)"><TInput value={step.note} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, note: v } : x))} /></Field>
                  </Grid2>
                  <Field label="Р—Р°РіРѕР»РѕРІРѕРє"><TInput value={step.title} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="РћРїРёСЃ"><TInput multiline rows={3} value={step.desc} onChange={(v) => setD("howItWorks", draft.howItWorks.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Р”РѕРґР°С‚Рё РєСЂРѕРє" onClick={() => setD("howItWorks", [...draft.howItWorks, { num: `0${draft.howItWorks.length + 1}`, title: "РќРѕРІРёР№ РєСЂРѕРє", desc: "РћРїРёСЃ...", note: "РќРѕС‚Р°С‚РєР°" }])} />
            </Card>
          )}

          {/* в•ђв•ђв•ђ WHO FOR в•ђв•ђв•ђ */}
          {tab === "whofor" && (
            <Card title="рџ‘Ґ РљРѕРјСѓ РїС–РґС…РѕРґРёС‚СЊ">
              <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px" }}>Р¤РѕС‚Рѕ вЂ” Сѓ РІРєР»Р°РґС†С– В«Р¤РѕС‚РѕВ».</p>
              {draft.whoIsItFor.map((seg, i) => (
                <Collapsible key={i} title={seg.label} badge={seg.tag} onDelete={() => setD("whoIsItFor", draft.whoIsItFor.filter((_, j) => j !== i))}>
                  <Grid2>
                    <Field label="РњС–С‚РєР° (РЅР°РїСЂ. В«Р”Р»СЏ РіР°Р·РѕРЅСѓВ»)"><TInput value={seg.label} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, label: v } : x))} /></Field>
                    <Field label="РўРµТ‘"><TInput value={seg.tag} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, tag: v } : x))} /></Field>
                  </Grid2>
                  <Field label="Р—Р°РіРѕР»РѕРІРѕРє РєР°СЂС‚РєРё"><TInput value={seg.title} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field>
                  <Field label="РћРїРёСЃ"><TInput multiline rows={3} value={seg.desc} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, desc: v } : x))} /></Field>
                  <Field label="РџСѓРЅРєС‚Рё (РєРѕР¶РµРЅ Р· РЅРѕРІРѕРіРѕ СЂСЏРґРєР°)" hint="РљРѕР¶РµРЅ СЂСЏРґРѕРє = РѕРєСЂРµРјРёР№ РїСѓРЅРєС‚">
                    <TInput multiline rows={4} value={seg.points.join("\n")} onChange={(v) => setD("whoIsItFor", draft.whoIsItFor.map((x, j) => j === i ? { ...x, points: v.split("\n").filter(Boolean) } : x))} />
                  </Field>
                </Collapsible>
              ))}
            </Card>
          )}

          {/* в•ђв•ђв•ђ PRICING в•ђв•ђв•ђ */}
          {tab === "pricing" && (
            <>
              <Card title="рџ’° Р¦С–РЅРё РЅР° С‚РѕРІР°СЂ">
                <Grid2>
                  <Field label="Р¦С–РЅР° РЅР°СЃРёРїРѕРј (РіСЂРЅ/С‚)"><NInput value={draft.pricing.bulkPricePerTon} onChange={(v) => setD("pricing", { ...draft.pricing, bulkPricePerTon: v })} min={1} /></Field>
                  <Field label="Р¦С–РЅР° РјС–С€РѕРє (РіСЂРЅ)"><NInput value={draft.pricing.bagPrice} onChange={(v) => setD("pricing", { ...draft.pricing, bagPrice: v })} min={1} /></Field>
                  <Field label="Р’Р°РіР° РјС–С€РєР° (РєРі)"><NInput value={draft.pricing.bagWeightKg} onChange={(v) => setD("pricing", { ...draft.pricing, bagWeightKg: v })} min={1} /></Field>
                  <Field label="РњС–РЅ. Р·Р°РјРѕРІР»РµРЅРЅСЏ (С‚)"><NInput value={draft.pricing.minTons} onChange={(v) => setD("pricing", { ...draft.pricing, minTons: v })} min={1} /></Field>
                </Grid2>
              </Card>
              <Card title="рџљ› РЎР°РјРѕСЃРєРёРґРё вЂ” С‚РµРєСЃС‚ С– С†С–РЅРё">
                {draft.pricing.delivery.map((d, i) => (
                  <Collapsible key={i} title={`${d.truck} вЂ” ${d.capacity}`} onDelete={() => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.filter((_, j) => j !== i) })}>
                    <Grid2>
                      <Field label="РќР°Р·РІР°"><TInput value={d.truck} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, truck: v } : x) })} /></Field>
                      <Field label="Р’Р°РЅС‚Р°Р¶РЅС–СЃС‚СЊ"><TInput value={d.capacity} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, capacity: v } : x) })} /></Field>
                      <Field label="РћР±'С”Рј"><TInput value={d.volume} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, volume: v } : x) })} /></Field>
                      <Field label="РўРµРєСЃС‚ С†С–РЅ (Р’С–С‚СЂРёРЅР°)"><TInput value={d.price} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, price: v } : x) })} /></Field>
                      <Field label="РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ (РњС–РЅ. С†С–РЅР°, РіСЂРЅ)"><NInput value={d.priceMin} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, priceMin: v } : x) })} min={0} /></Field>
                      <Field label="РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ (РњР°РєСЃ. С†С–РЅР°, РіСЂРЅ)"><NInput value={d.priceMax} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, priceMax: v } : x) })} min={0} /></Field>
                    </Grid2>
                    <Field label="РќРѕС‚Р°С‚РєР°"><TInput value={d.note} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, note: v } : x) })} /></Field>
                    <Field label="Р”Р»СЏ РєРѕРіРѕ РїС–РґС…РѕРґРёС‚СЊ"><TInput value={d.usageLabel} onChange={(v) => setD("pricing", { ...draft.pricing, delivery: draft.pricing.delivery.map((x, j) => j === i ? { ...x, usageLabel: v } : x) })} /></Field>
                  </Collapsible>
                ))}
              </Card>
              <Card title="рџљ› Р¤РѕС‚Рѕ СЃР°РјРѕСЃРєРёРґС–РІ">
                <p style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>РЇРєС‰Рѕ РЅРµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ вЂ” РїРѕРєР°Р·СѓСЋС‚СЊСЃСЏ РѕСЂРёРіС–РЅР°Р»СЊРЅС– Figma-Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.</p>
                <Grid2>
                  <ImageUploader label="Р—Р†Р›" hint="Р¤РѕС‚Рѕ РЅР° Р±С–Р»РѕРјСѓ С‚Р»С–" value={draft.images.truckZil} onChange={(v) => setImg("truckZil", v)} aspect="landscape" imageKey="truckZil"
                    altValue={draft.imageAlts.truckZil} onAltChange={(v) => setImgAlt("truckZil", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckZil} />
                  <ImageUploader label="РљРђРњРђР—" value={draft.images.truckKamaz} onChange={(v) => setImg("truckKamaz", v)} aspect="landscape" imageKey="truckKamaz"
                    altValue={draft.imageAlts.truckKamaz} onAltChange={(v) => setImgAlt("truckKamaz", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckKamaz} />
                  <ImageUploader label="РњРђР—" value={draft.images.truckMaz} onChange={(v) => setImg("truckMaz", v)} aspect="landscape" imageKey="truckMaz"
                    altValue={draft.imageAlts.truckMaz} onAltChange={(v) => setImgAlt("truckMaz", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckMaz} />
                  <ImageUploader label="Р’РћР›Р¬Р’Рћ" value={draft.images.truckVolvo} onChange={(v) => setImg("truckVolvo", v)} aspect="landscape" imageKey="truckVolvo"
                    altValue={draft.imageAlts.truckVolvo} onAltChange={(v) => setImgAlt("truckVolvo", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckVolvo} />
                </Grid2>
              </Card>
            </>
          )}

          {/* в•ђв•ђв•ђ REVIEWS в•ђв•ђв•ђ */}
          {tab === "reviews" && (
            <Card title="рџ’¬ Р’С–РґРіСѓРєРё РєР»С–С”РЅС‚С–РІ">
              {draft.reviews.map((r, i) => (
                <Collapsible key={i} title={r.name} badge={r.role} onDelete={() => setD("reviews", draft.reviews.filter((_, j) => j !== i))}>
                  <ImageUploader label="Р¤РѕС‚Рѕ РєР»С–С”РЅС‚Р° (Р°РІР°С‚Р°СЂ)" hint="РљРІР°РґСЂР°С‚РЅРµ. РЇРєС‰Рѕ РЅРµРјР°С” вЂ” С–РЅС–С†С–Р°Р»Рё." value={r.photoOverride || ""} aspect="square" onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, photoOverride: v } : x))} />
                  <Grid2>
                    <Field label="Р†Рј'СЏ"><TInput value={r.name} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, name: v } : x))} /></Field>
                    <Field label="Р†РЅС–С†С–Р°Р»Рё (2 Р»С–С‚РµСЂРё)"><TInput value={r.initials} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, initials: v } : x))} /></Field>
                    <Field label="Р РѕР»СЊ / РјС–СЃС‚Рѕ"><TInput value={r.role} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, role: v } : x))} /></Field>
                    <Field label="Р”Р°С‚Р°"><TInput value={r.date} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, date: v } : x))} /></Field>
                  </Grid2>
                  <Field label="РўРµРєСЃС‚ РІС–РґРіСѓРєСѓ"><TInput multiline rows={4} value={r.text} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, text: v } : x))} /></Field>
                  <Field label="Р РµР№С‚РёРЅРі (1вЂ“5)"><NInput value={r.rating} min={1} max={5} onChange={(v) => setD("reviews", draft.reviews.map((x, j) => j === i ? { ...x, rating: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Р”РѕРґР°С‚Рё РІС–РґРіСѓРє" onClick={() => setD("reviews", [...draft.reviews, { name: "РќРѕРІРёР№ РєР»С–С”РЅС‚", role: "РњС–СЃС‚Рѕ", initials: "РќРљ", rating: 5, text: "РўРµРєСЃС‚ РІС–РґРіСѓРєСѓ...", date: "2026", photoOverride: "" } as ReviewItem])} />
            </Card>
          )}

          {/* в•ђв•ђв•ђ FAQ в•ђв•ђв•ђ */}
          {tab === "faq" && (
            <Card title="вќ“ РџРёС‚Р°РЅРЅСЏ С‚Р° РІС–РґРїРѕРІС–РґС–">
              {draft.faq.map((f, i) => (
                <Collapsible key={i} title={f.q} onDelete={() => setD("faq", draft.faq.filter((_, j) => j !== i))}>
                  <Field label="РџРёС‚Р°РЅРЅСЏ"><TInput value={f.q} onChange={(v) => setD("faq", draft.faq.map((x, j) => j === i ? { ...x, q: v } : x))} /></Field>
                  <Field label="Р’С–РґРїРѕРІС–РґСЊ"><TInput multiline rows={4} value={f.a} onChange={(v) => setD("faq", draft.faq.map((x, j) => j === i ? { ...x, a: v } : x))} /></Field>
                </Collapsible>
              ))}
              <AddButton label="Р”РѕРґР°С‚Рё РїРёС‚Р°РЅРЅСЏ" onClick={() => setD("faq", [...draft.faq, { q: "РќРѕРІРµ РїРёС‚Р°РЅРЅСЏ?", a: "Р’С–РґРїРѕРІС–РґСЊ..." } as FaqItem])} />
            </Card>
          )}

          {/* в•ђв•ђв•ђ IMAGES в•ђв•ђв•ђ */}
          {tab === "images" && (
            <>
              {/* STATUS DASHBOARD */}
              {(() => {
                type ImgKey = keyof SiteContent["images"];
                const imgMap: { key: ImgKey; label: string }[] = [
                  { key: "heroPhoto",          label: "Hero" },
                  { key: "truckDelivery",      label: "Р”РѕСЃС‚Р°РІРєР°" },
                  { key: "gardenResult",       label: "Р РµР·СѓР»СЊС‚Р°С‚" },
                  { key: "homeowner",          label: "РљР»С–С”РЅС‚" },
                  { key: "lawnPhoto",          label: "Р“Р°Р·РѕРЅ" },
                  { key: "gardenSegmentPhoto", label: "Р“РѕСЂРѕРґ" },
                  { key: "landscapePhoto",     label: "Р›Р°РЅРґС€Р°С„С‚" },
                  { key: "agroPhoto",          label: "РђРіСЂРѕ" },
                  { key: "truckZil",           label: "Р—Р†Р›" },
                  { key: "truckKamaz",         label: "РљРђРњРђР—" },
                  { key: "truckMaz",           label: "РњРђР—" },
                  { key: "truckVolvo",         label: "Р’РћР›Р¬Р’Рћ" },
                ];
                const uploaded = imgMap.filter(x => !!draft.images[x.key]).length;
                const total    = imgMap.length;
                const pct      = Math.round((uploaded / total) * 100);
                return (
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>РЎС‚Р°С‚СѓСЃ Р·РѕР±СЂР°Р¶РµРЅСЊ</h3>
                        <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>{uploaded} Р· {total} Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: uploaded === total ? C.success : C.accent, lineHeight: 1 }}>{pct}%</div>
                        <div style={{ fontSize: "11px", color: C.muted }}>РіРѕС‚РѕРІРЅС–СЃС‚СЊ</div>
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
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#14532d", margin: "0 0 2px" }}>Р—Р°Р№РЅСЏС‚Рѕ: {storageInfo} / ~5 РњР‘</p>
                  <p style={{ fontSize: "12px", color: "#16a34a", margin: 0 }}>Р—РѕР±СЂР°Р¶РµРЅРЅСЏ СЃС‚РёСЃРєР°СЋС‚СЊСЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ РґРѕ ~100вЂ“200 РљР‘.</p>
                </div>
              </div>

              <Card title="рџЊ… Hero вЂ” С„РѕРЅРѕРІРµ С„РѕС‚Рѕ">
                <ImageUploader label="Р¤РѕС‚Рѕ С‡РѕСЂРЅРѕР·РµРјСѓ (С„РѕРЅ Hero)" hint="Р“РѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРµ, 1920Г—1080px+" value={draft.images.heroPhoto} onChange={(v) => setImg("heroPhoto", v)} aspect="landscape" imageKey="heroPhoto"
                  altValue={draft.imageAlts.heroPhoto} onAltChange={(v) => setImgAlt("heroPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.heroPhoto} />
              </Card>

              <Card title="рџ“ё Р“Р°Р»РµСЂРµСЏ (SocialProof)">
                <ImageUploader label="Р¤РѕС‚Рѕ 1 вЂ” Р”РѕСЃС‚Р°РІРєР° СЃР°РјРѕСЃРєРёРґРѕРј" value={draft.images.truckDelivery} onChange={(v) => setImg("truckDelivery", v)} aspect="landscape" imageKey="truckDelivery"
                  altValue={draft.imageAlts.truckDelivery} onAltChange={(v) => setImgAlt("truckDelivery", v)} defaultAlt={IMAGE_ALT_DEFAULTS.truckDelivery} />
                <ImageUploader label="Р¤РѕС‚Рѕ 2 вЂ” Р РµР·СѓР»СЊС‚Р°С‚ СѓРєР»Р°РґРєРё" value={draft.images.gardenResult} onChange={(v) => setImg("gardenResult", v)} aspect="landscape" imageKey="gardenResult"
                  altValue={draft.imageAlts.gardenResult} onAltChange={(v) => setImgAlt("gardenResult", v)} defaultAlt={IMAGE_ALT_DEFAULTS.gardenResult} />
                <ImageUploader label="Р¤РѕС‚Рѕ 3 вЂ” Р—Р°РґРѕРІРѕР»РµРЅРёР№ РєР»С–С”РЅС‚" value={draft.images.homeowner} onChange={(v) => setImg("homeowner", v)} aspect="portrait" imageKey="homeowner"
                  altValue={draft.imageAlts.homeowner} onAltChange={(v) => setImgAlt("homeowner", v)} defaultAlt={IMAGE_ALT_DEFAULTS.homeowner} />
              </Card>

              <Card title="рџ—‚ РљР°С‚РµРіРѕСЂС–С— В«РљРѕРјСѓ РїС–РґС…РѕРґРёС‚СЊВ»">
                <ImageUploader label="Р“Р°Р·РѕРЅ" value={draft.images.lawnPhoto} onChange={(v) => setImg("lawnPhoto", v)} aspect="landscape" imageKey="lawnPhoto"
                  altValue={draft.imageAlts.lawnPhoto} onAltChange={(v) => setImgAlt("lawnPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.lawnPhoto} />
                <ImageUploader label="Р“РѕСЂРѕРґ" value={draft.images.gardenSegmentPhoto} onChange={(v) => setImg("gardenSegmentPhoto", v)} aspect="landscape" imageKey="gardenSegmentPhoto"
                  altValue={draft.imageAlts.gardenSegmentPhoto} onAltChange={(v) => setImgAlt("gardenSegmentPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.gardenSegmentPhoto} />
                <ImageUploader label="Р›Р°РЅРґС€Р°С„С‚" value={draft.images.landscapePhoto} onChange={(v) => setImg("landscapePhoto", v)} aspect="landscape" imageKey="landscapePhoto"
                  altValue={draft.imageAlts.landscapePhoto} onAltChange={(v) => setImgAlt("landscapePhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.landscapePhoto} />
                <ImageUploader label="РЎС–Р»СЊСЃСЊРєРµ РіРѕСЃРїРѕРґР°СЂСЃС‚РІРѕ" value={draft.images.agroPhoto} onChange={(v) => setImg("agroPhoto", v)} aspect="landscape" imageKey="agroPhoto"
                  altValue={draft.imageAlts.agroPhoto} onAltChange={(v) => setImgAlt("agroPhoto", v)} defaultAlt={IMAGE_ALT_DEFAULTS.agroPhoto} />
              </Card>
            </>
          )}

          {/* в•ђв•ђв•ђ FINAL CTA в•ђв•ђв•ђ */}
          {tab === "finalcta" && (
            <Card title="рџЋЇ Р¤С–РЅР°Р»СЊРЅРёР№ CTA">
              <Field label="Р‘РµР№РґР¶ С‚РµСЂРјС–РЅРѕРІРѕСЃС‚С–"><TInput value={draft.finalCta.urgencyBadge} onChange={(v) => setD("finalCta", { ...draft.finalCta, urgencyBadge: v })} /></Field>
              <Field label="Р—Р°РіРѕР»РѕРІРѕРє СЂСЏРґРѕРє 1"><TInput value={draft.finalCta.headline1} onChange={(v) => setD("finalCta", { ...draft.finalCta, headline1: v })} /></Field>
              <Field label="Р—Р°РіРѕР»РѕРІРѕРє СЂСЏРґРѕРє 2 (РєСѓСЂСЃРёРІ)"><TInput value={draft.finalCta.headlineAccent} onChange={(v) => setD("finalCta", { ...draft.finalCta, headlineAccent: v })} /></Field>
              <Field label="РџС–РґС‚РµРєСЃС‚"><TInput multiline rows={3} value={draft.finalCta.subtext} onChange={(v) => setD("finalCta", { ...draft.finalCta, subtext: v })} /></Field>
            </Card>
          )}

          {/* в•ђв•ђв•ђ SEO в•ђв•ђв•ђ */}
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
              { label: "Title (50вЂ“60 СЃРёРјРІ.)",    ok: titleLen >= 50 && titleLen <= 60 },
              { label: "Description (140вЂ“160)",  ok: descLen  >= 140 && descLen  <= 160 },
              { label: "Keywords",               ok: !!(s.keywords?.trim()) },
              { label: "Canonical URL",          ok: !!(s.canonicalUrl?.trim()) },
              { label: "OG Image 1200Г—630",      ok: !!(s.ogImage?.trim()) },
              { label: "Geo-РєРѕРѕСЂРґРёРЅР°С‚Рё",         ok: !!(s.geoLat?.trim() && s.geoLng?.trim()) },
            ];
            const score = checks.filter(c => c.ok).length;
            const pct   = Math.round((score / checks.length) * 100);

            return (
              <>
                {/* в”Ђв”Ђ SEO Health в”Ђв”Ђ */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 3px", fontFamily: SANS }}>SEO Health Score</h3>
                      <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>{score} Р· {checks.length} РїСѓРЅРєС‚С–РІ РІРёРєРѕРЅР°РЅРѕ</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "26px", fontWeight: 800, color: pct >= 80 ? C.success : pct >= 50 ? "#f59e0b" : C.danger, lineHeight: 1 }}>{pct}%</div>
                      <div style={{ fontSize: "11px", color: C.muted }}>
                        {pct >= 80 ? "Р’С–РґРјС–РЅРЅРѕ" : pct >= 50 ? "РќРµРїРѕРіР°РЅРѕ" : "РџРѕС‚СЂС–Р±РЅР° СѓРІР°РіР°"}
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

                {/* в”Ђв”Ђ Р‘Р°Р·РѕРІС– РјРµС‚Р°-С‚РµРіРё в”Ђв”Ђ */}
                <Card title="рџ“„ Р‘Р°Р·РѕРІС– РјРµС‚Р°-С‚РµРіРё">
                  <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                    <strong>РџСЂР°РІРёР»Рѕ СЃРµРЅСЊР№РѕСЂ-SEO:</strong> Title вЂ” РіРѕР»РѕРІРЅРёР№ С„Р°РєС‚РѕСЂ СЂР°РЅР¶РёСЂСѓРІР°РЅРЅСЏ. Р’РєР»СЋС‡Р°Р№С‚Рµ РѕСЃРЅРѕРІРЅРёР№ РєР»СЋС‡ + РјС–СЃС‚Рѕ + Р±СЂРµРЅРґ. Description РІРїР»РёРІР°С” РЅР° CTR (РєС–Р»СЊРєС–СЃС‚СЊ РєР»С–РєС–РІ), РЅРµ РЅР° РїРѕР·РёС†С–С—.
                  </div>

                  <Field label="Title" hint={`${titleLen}/60 СЃРёРјРІРѕР»С–РІ В· Р†РґРµР°Р»СЊРЅРѕ: 50вЂ“60`}>
                    <div style={{ position: "relative" }}>
                      <TInput
                        value={s.title ?? ""}
                        onChange={(v) => setS({ title: v })}
                        placeholder="РљСѓРїРёС‚Рё С‡РѕСЂРЅРѕР·РµРј РљРёС—РІ | РљРёС—РІР§РѕСЂРЅРѕР·РµРј вЂ” РІС–Рґ 350 РіСЂРЅ/С‚"
                      />
                      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: 700, color: tColor, background: C.white, padding: "0 4px", pointerEvents: "none" }}>
                        {titleLen}/60
                      </span>
                    </div>
                    {/* SERP preview */}
                    {s.title && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>Р’РёРіР»СЏРґ Сѓ Google</p>
                        <p style={{ fontSize: "15px", color: "#1a0dab", margin: "0 0 2px", textDecoration: "underline", lineHeight: 1.3, wordBreak: "break-word" }}>{s.title}</p>
                        {s.canonicalUrl && <p style={{ fontSize: "12px", color: "#006621", margin: "0 0 3px" }}>{s.canonicalUrl}</p>}
                        {s.description && <p style={{ fontSize: "12px", color: "#545454", margin: 0, lineHeight: 1.5 }}>{s.description.slice(0, 160)}{s.description.length > 160 ? "вЂ¦" : ""}</p>}
                      </div>
                    )}
                  </Field>

                  <Field label="Meta Description" hint={`${descLen}/160 СЃРёРјРІРѕР»С–РІ В· Р†РґРµР°Р»СЊРЅРѕ: 140вЂ“160`}>
                    <div style={{ position: "relative" }}>
                      <TInput
                        multiline rows={3}
                        value={s.description ?? ""}
                        onChange={(v) => setS({ description: v })}
                        placeholder="Р§РѕСЂРЅРѕР·РµРј Р· РґРѕСЃС‚Р°РІРєРѕСЋ РїРѕ РљРёС”РІСѓ РІС–Рґ РІРёСЂРѕР±РЅРёРєР°. Р‘РµР· РїРѕСЃРµСЂРµРґРЅРёРєС–РІ..."
                      />
                      <span style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "12px", fontWeight: 700, color: dColor, background: C.white, padding: "0 4px", pointerEvents: "none" }}>
                        {descLen}/160
                      </span>
                    </div>
                  </Field>

                  <Field label="Keywords" hint="Р§РµСЂРµР· РєРѕРјСѓ В· Google РЅРµ СЂР°РЅР¶РёСЂСѓС” Р·Р° keywords, Р°Р»Рµ Bing/Yandex вЂ” С‚Р°Рє">
                    <TInput value={s.keywords ?? ""} onChange={(v) => setS({ keywords: v })} placeholder="С‡РѕСЂРЅРѕР·РµРј РљРёС—РІ, РєСѓРїРёС‚Рё С‡РѕСЂРЅРѕР·РµРј, РґРѕСЃС‚Р°РІРєР° С‡РѕСЂРЅРѕР·РµРјСѓ" />
                  </Field>

                  <Grid2>
                    <Field label="Canonical URL" hint="РџРѕРІРЅР° URL: https://kyivchornozem.com/">
                      <TInput value={s.canonicalUrl ?? ""} onChange={(v) => setS({ canonicalUrl: v })} placeholder="https://kyivchornozem.com/" />
                    </Field>
                    <Field label="Robots" hint="Р”РѕР·РІС–Р» РґР»СЏ РїРѕС€СѓРєРѕРІРёС… СЂРѕР±РѕС‚С–РІ">
                      <div style={{ position: "relative" }}>
                        <select value={s.robots ?? "index, follow"} onChange={(e) => setS({ robots: e.target.value })}
                          style={{ width: "100%", padding: "12px 36px 12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, WebkitAppearance: "none", cursor: "pointer" }}>
                          <option value="index, follow">index, follow вњ“ (СЂРµРєРѕРјРµРЅРґРѕРІР°РЅРѕ)</option>
                          <option value="noindex, nofollow">noindex, nofollow (РїСЂРёС…РѕРІР°С‚Рё РІС–Рґ Google)</option>
                          <option value="index, nofollow">index, nofollow</option>
                          <option value="noindex, follow">noindex, follow</option>
                        </select>
                        <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </Field>
                  </Grid2>
                </Card>

                {/* в”Ђв”Ђ Open Graph в”Ђв”Ђ */}
                <Card title="рџЊђ Open Graph вЂ” СЃРѕС†РјРµСЂРµР¶С– С‚Р° РјРµСЃРµРЅРґР¶РµСЂРё">
                  <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#0c4a6e", lineHeight: 1.6 }}>
                    OG-С‚РµРіРё РєРµСЂСѓСЋС‚СЊ С‚РёРј, СЏРє РІРёРіР»СЏРґР°С” РїРѕСЃРёР»Р°РЅРЅСЏ Сѓ <strong>Facebook, Telegram, Viber, LinkedIn, WhatsApp</strong>. РЇРєС‰Рѕ РїРѕР»СЏ РїРѕСЂРѕР¶РЅС– вЂ” РІРёРєРѕСЂРёСЃС‚РѕРІСѓС”С‚СЊСЃСЏ Title/Description Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ.
                  </div>
                  <Field label="OG Title" hint="РЇРєС‰Рѕ РїРѕСЂРѕР¶РЅС” вЂ” Р±РµСЂРµС‚СЊСЃСЏ Title РІРёС‰Рµ">
                    <TInput value={s.ogTitle ?? ""} onChange={(v) => setS({ ogTitle: v })} placeholder={s.title ?? ""} />
                  </Field>
                  <Field label="OG Description" hint="РЇРєС‰Рѕ РїРѕСЂРѕР¶РЅС” вЂ” Р±РµСЂРµС‚СЊСЃСЏ Description РІРёС‰Рµ">
                    <TInput multiline rows={2} value={s.ogDescription ?? ""} onChange={(v) => setS({ ogDescription: v })} placeholder={s.description?.slice(0, 100) ?? ""} />
                  </Field>
                  {/* в”Ђв”Ђ OG Image: upload + URL fallback в”Ђв”Ђ */}
                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
                      OG Image вЂ” РїСЂРµРІСЊСЋ РґР»СЏ СЃРѕС†РјРµСЂРµР¶
                    </label>

                    {/* Upload zone */}
                    <ImageUploader
                      label=""
                      value={s.ogImage || ""}
                      onChange={(url) => setS({ ogImage: url })}
                      aspect="landscape"
                      imageKey="ogImage"
                    />

                    {/* Divider OR */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0 12px" }}>
                      <div style={{ flex: 1, height: "1px", background: C.border }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>РђР‘Рћ РџРЈР‘Р›Р†Р§РќРђ URL</span>
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
                        <img 
                          src={s.ogImage.startsWith("/") && !s.ogImage.startsWith(import.meta.env.BASE_URL) ? `${import.meta.env.BASE_URL}${s.ogImage.slice(1)}` : s.ogImage} 
                          alt="OG Preview" 
                          style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} 
                          onError={(e) => { e.currentTarget.style.display = "none"; }} 
                        />
                      </div>
                    )}

                    {/* Note */}
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "flex-start", gap: "6px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "8px 10px" }}>
                      <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: 1.2 }}>в„№пёЏ</span>
                      <p style={{ fontSize: "12px", color: "#14532d", margin: 0, lineHeight: 1.5 }}>
                        <b>РђРІС‚РѕРјР°С‚РёР·Р°С†С–СЏ URL:</b> Р’Рё РјРѕР¶РµС‚Рµ РїСЂРѕСЃС‚Рѕ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РєР°СЂС‚РёРЅРєСѓ РІРёС‰Рµ, Р°Р±Рѕ РІСЃС‚Р°РІРёС‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РЅРёР¶С‡Рµ. РЎРёСЃС‚РµРјР° Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ Р·РіРµРЅРµСЂСѓС” Р°Р±СЃРѕР»СЋС‚РЅРµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Facebook С‚Р° Telegram РїС–Рґ РєР°РїРѕС‚РѕРј!
                      </p>
                    </div>
                  </div>
                  <Field label="OG URL (og:url)" hint="РљР°РЅРѕРЅС–С‡РЅР° URL СЃС‚РѕСЂС–РЅРєРё РґР»СЏ СЃРѕС†РјРµСЂРµР¶">
                    <TInput value={s.ogUrl ?? ""} onChange={(v) => setS({ ogUrl: v })} placeholder="https://kyivchornozem.com/" />
                  </Field>
                </Card>

                {/* в”Ђв”Ђ JSON-LD LocalBusiness в”Ђв”Ђ */}
                <Card title="рџЏЄ JSON-LD LocalBusiness вЂ” СЃС‚СЂСѓРєС‚СѓСЂРѕРІР°РЅС– РґР°РЅС–">
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#14532d", lineHeight: 1.6 }}>
                    <strong>РљСЂРёС‚РёС‡РЅРѕ РґР»СЏ Р»РѕРєР°Р»СЊРЅРѕРіРѕ SEO!</strong> Р¦С– РґР°РЅС– РїРѕРєР°Р·СѓСЋС‚СЊСЃСЏ Сѓ <strong>Google Maps, Knowledge Panel</strong> (В«РєР°СЂС‚РєР° Р±С–Р·РЅРµСЃСѓВ» РїСЂР°РІРѕСЂСѓС‡ Сѓ РїРѕС€СѓРєСѓ) С‚Р° Сѓ Featured Snippets. Р”РѕР·РІРѕР»СЏСЋС‚СЊ Р·'СЏРІР»СЏС‚РёСЃСЊ Сѓ Р·Р°РїРёС‚Р°С… В«С‡РѕСЂРЅРѕР·РµРј РљРёС—РІ РЅР° РєР°СЂС‚С–В».
                  </div>
                  <Grid2>
                    <Field label="РЁРёСЂРѕС‚Р° (latitude)" hint="Р”Р»СЏ РљРёС”РІР° ~ 50.4501">
                      <TInput value={s.geoLat ?? ""} onChange={(v) => setS({ geoLat: v })} placeholder="50.4342" />
                    </Field>
                    <Field label="Р”РѕРІРіРѕС‚Р° (longitude)" hint="Р”Р»СЏ РљРёС”РІР° ~ 30.5234">
                      <TInput value={s.geoLng ?? ""} onChange={(v) => setS({ geoLng: v })} placeholder="30.5726" />
                    </Field>
                  </Grid2>
                  <p style={{ fontSize: "12px", color: C.muted, marginTop: "-8px", marginBottom: "16px" }}>
                    Р—РЅР°Р№РґС–С‚СЊ С‚РѕС‡РЅС– РєРѕРѕСЂРґРёРЅР°С‚Рё РЅР° <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ color: C.accent }}>maps.google.com</a> в†’ РџРљРњ РЅР° РјР°СЂРєРµСЂС– в†’ СЃРєРѕРїС–СЋР№С‚Рµ С‡РёСЃР»Р°.
                  </p>
                  <Field label="Р¦С–РЅРѕРІР° РєР°С‚РµРіРѕСЂС–СЏ" hint="$ вЂ” РґРµС€РµРІРѕ, $$ вЂ” СЃРµСЂРµРґРЅСЊРѕ, $$$ вЂ” РґРѕСЂРѕРіРѕ">
                    <div style={{ position: "relative" }}>
                      <select value={s.priceRange ?? "$$"} onChange={(e) => setS({ priceRange: e.target.value })}
                        style={{ width: "100%", padding: "12px 36px 12px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", fontFamily: SANS, outline: "none", background: C.white, boxSizing: "border-box", color: C.text, WebkitAppearance: "none", cursor: "pointer" }}>
                        <option value="$">$ вЂ” Р‘СЋРґР¶РµС‚РЅРѕ</option>
                        <option value="$$">$$ вЂ” РЎРµСЂРµРґРЅС–Р№ С†С–РЅРЅРёРє (СЂРµРєРѕРјРµРЅРґРѕРІР°РЅРѕ)</option>
                        <option value="$$$">$$$ вЂ” РџСЂРµРјС–СѓРј</option>
                      </select>
                      <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </Field>
                  <div style={{ background: "#f4f5f7", borderRadius: "8px", padding: "10px 12px", fontSize: "11px", color: C.muted, fontFamily: "monospace", lineHeight: 1.6 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontFamily: SANS, fontWeight: 600, color: C.text }}>РђРІС‚РѕРјР°С‚РёС‡РЅРѕ РІРёРєРѕСЂРёСЃС‚РѕРІСѓС”С‚СЊСЃСЏ Р· СЂРѕР·РґС–Р»Сѓ В«Р—Р°РіР°Р»СЊРЅРµВ»:</p>
                    <span style={{ color: C.text }}>РќР°Р·РІР°:</span> {draft.general.companyName}<br />
                    <span style={{ color: C.text }}>РђРґСЂРµСЃР°:</span> {draft.general.address}<br />
                    <span style={{ color: C.text }}>РўРµР»РµС„РѕРЅ:</span> {draft.general.phone}<br />
                    <span style={{ color: C.text }}>Р“СЂР°С„С–Рє:</span> {draft.general.workingHours}
                  </div>
                </Card>

                {/* в”Ђв”Ђ SEO Text Block в”Ђв”Ђ */}
                {(() => {
                  const st = draft.seoText ?? {};
                  const setSt = (patch: Partial<typeof draft.seoText>) =>
                    setDraft((d) => ({ ...d, seoText: { ...d.seoText, ...patch } }));
                  return (
                    <Card title="рџ“ќ SEO-С‚РµРєСЃС‚ РЅР° СЃС‚РѕСЂС–РЅС†С–">
                      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                        <strong>РќР°РІС–С‰Рѕ С†Рµ:</strong> 400вЂ“600 СЃР»С–РІ РїСЂРёСЂРѕРґРЅРѕРіРѕ SEO-С‚РµРєСЃС‚Сѓ РІРЅРёР·Сѓ СЃС‚РѕСЂС–РЅРєРё. Google РѕС‚СЂРёРјСѓС” РІС–РґРїРѕРІС–РґС– РЅР° С–РЅС„РѕСЂРјР°С†С–Р№РЅС– Р·Р°РїРёС‚Рё вЂ” РїС–РґРІРёС‰СѓС” РїРѕР·РёС†С–С— Р·Р° РґРѕРІРіРѕС…РІРѕСЃС‚РёРјРё РєР»СЋС‡Р°РјРё. РЎС‚СЂСѓРєС‚СѓСЂР°: H2 в†’ 4Г— H3 вЂ” РЅРµ РїРѕСЂСѓС€СѓС” H-С–С”СЂР°СЂС…С–СЋ СЃС‚РѕСЂС–РЅРєРё.
                      </div>
                      {/* Enable toggle */}
                      <div onClick={() => setSt({ enabled: !st.enabled })}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: st.enabled ? "#f0fdf4" : "#f9fafb", border: `1.5px solid ${st.enabled ? "#86efac" : C.border}`, borderRadius: "10px", marginBottom: "20px", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, fontFamily: SANS }}>РџРѕРєР°Р·СѓРІР°С‚Рё РЅР° СЃР°Р№С‚С–</div>
                          <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{st.enabled ? "вњ… Р‘Р»РѕРє РІРёРґРёРјРёР№ вЂ” Google С–РЅРґРµРєСЃСѓС” С‚РµРєСЃС‚" : "в¬› РџСЂРёС…РѕРІР°РЅРёР№"}</div>
                        </div>
                        <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: st.enabled ? C.accent : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <div style={{ position: "absolute", top: "3px", left: st.enabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.22)", transition: "left 0.2s" }} />
                        </div>
                      </div>
                      {/* H2 */}
                      <Field label="H2 вЂ” Р—Р°РіРѕР»РѕРІРѕРє СЃРµРєС†С–С—" hint="50вЂ“70 СЃРёРјРІРѕР»С–РІ В· РєР»СЋС‡ + РЅР°РјС–СЂ + РјС–СЃС‚Рѕ">
                        <TInput value={st.h2 ?? ""} onChange={(v) => setSt({ h2: v })} placeholder="РљСѓРїРёС‚Рё С‡РѕСЂРЅРѕР·РµРј Сѓ РљРёС”РІС–: С‰Рѕ С†Рµ С‚Р°РєРµ, С‡РѕРјСѓ РІР°Р¶Р»РёРІРѕ С– СЏРє Р·Р°РјРѕРІРёС‚Рё" />
                      </Field>
                      <Field label="Р’СЃС‚СѓРїРЅРёР№ Р°Р±Р·Р°С†" hint="2вЂ“3 СЂРµС‡РµРЅРЅСЏ В· С‚РµРјР° + Р±СЂРµРЅРґ + РєР»СЋС‡">
                        <TInput multiline value={st.intro ?? ""} onChange={(v) => setSt({ intro: v })} rows={3} placeholder="Р§РѕСЂРЅРѕР·РµРј вЂ” С†Рµ РЅРµ РїСЂРѕСЃС‚Рѕ С‚РµРјРЅР° Р·РµРјР»СЏвЂ¦" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 Р±Р»РѕРє 1 вЂ” Р—Р°РіРѕР»РѕРІРѕРє" hint="РћСЃРІС–С‚Р°: С‰Рѕ С‚Р°РєРµ С‡РѕСЂРЅРѕР·РµРј">
                        <TInput value={st.h3_1 ?? ""} onChange={(v) => setSt({ h3_1: v })} placeholder="Р©Рѕ С‚Р°РєРµ СЃРїСЂР°РІР¶РЅС–Р№ С‡РѕСЂРЅРѕР·РµРј С– С‡РёРј РІС–РЅ РІС–РґСЂС–Р·РЅСЏС”С‚СЊСЃСЏ РІС–Рґ В«СЃСѓРјС–С€С–В»" />
                      </Field>
                      <Field label="H3 Р±Р»РѕРє 1 вЂ” РўРµРєСЃС‚">
                        <TInput multiline value={st.body1 ?? ""} onChange={(v) => setSt({ body1: v })} rows={4} placeholder="РќР° СЂРёРЅРєСѓ РЅРµСЂС–РґРєРѕ РїСЂРѕРґР°СЋС‚СЊ С‚Р°Рє Р·РІР°РЅСѓ В«СЂРѕСЃР»РёРЅРЅСѓ Р·РµРјР»СЋВ»вЂ¦" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 Р±Р»РѕРє 2 вЂ” Р—Р°РіРѕР»РѕРІРѕРє" hint="USP: С‡РѕРјСѓ РєСѓРїСѓРІР°С‚Рё Сѓ РЅР°СЃ">
                        <TInput value={st.h3_2 ?? ""} onChange={(v) => setSt({ h3_2: v })} placeholder="Р’пїЅпїЅРґ РІРёСЂРѕР±РЅРёРєР° Р±РµР· РїРѕСЃРµСЂРµРґРЅРёРєС–РІ вЂ” РѕСЃСЊ Сѓ С‡РѕРјСѓ РЅР°С€Р° РєР»СЋС‡РѕРІР° РІС–РґРјС–РЅРЅС–СЃС‚СЊ" />
                      </Field>
                      <Field label="H3 Р±Р»РѕРє 2 вЂ” РўРµРєСЃС‚">
                        <TInput multiline value={st.body2 ?? ""} onChange={(v) => setSt({ body2: v })} rows={4} placeholder="РљРѕР»Рё РІРё РєСѓРїСѓС”С‚Рµ С‡РѕСЂРЅРѕР·РµРј С‡РµСЂРµР· РїРѕСЃРµСЂРµРґРЅРёРєР°вЂ¦" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 Р±Р»РѕРє 3 вЂ” Р—Р°РіРѕР»РѕРІРѕРє" hint="Р¦С–РЅРё РїРѕС‚РѕС‡РЅРѕРіРѕ СЂРѕРєСѓ вЂ” С‚РѕРї РєРѕРјРµСЂС†С–Р№РЅРёР№ Р·Р°РїРёС‚">
                        <TInput value={st.h3_3 ?? ""} onChange={(v) => setSt({ h3_3: v })} placeholder="Р¦С–РЅР° С‡РѕСЂРЅРѕР·РµРјСѓ РІ РљРёС”РІС– Сѓ 2026 СЂРѕС†С– вЂ” РїСЂРѕР·РѕСЂРѕ С– Р±РµР· СЃСЋСЂРїСЂРёР·С–РІ" />
                      </Field>
                      <Field label="H3 Р±Р»РѕРє 3 вЂ” РўРµРєСЃС‚">
                        <TInput multiline value={st.body3 ?? ""} onChange={(v) => setSt({ body3: v })} rows={4} placeholder="Р’Р°СЂС‚С–СЃС‚СЊ С‡РѕСЂРЅРѕР·РµРјСѓ РЅР°СЃРёРїРѕРј Сѓ 2026 СЂРѕС†С– СЃС‚Р°РЅРѕРІРёС‚СЊвЂ¦" />
                      </Field>
                      <div style={{ height: "1px", background: C.border, margin: "4px 0 20px" }} />
                      <Field label="H3 Р±Р»РѕРє 4 вЂ” Р—Р°РіРѕР»РѕРІРѕРє" hint="Р“РµРѕ-РѕС…РѕРїР»РµРЅРЅСЏ вЂ” РїС–РґСЃРёР»СЋС” Р»РѕРєР°Р»СЊРЅРµ SEO">
                        <TInput value={st.h3_4 ?? ""} onChange={(v) => setSt({ h3_4: v })} placeholder="Р”Рµ РјРё РґРѕСЃС‚Р°РІР»СЏС”РјРѕ С‡РѕСЂРЅРѕР·РµРј вЂ” РљРёС—РІ С‚Р° РІСЃСЏ РљРёС—РІСЃСЊРєР° РѕР±Р»Р°СЃС‚СЊ" />
                      </Field>
                      <Field label="H3 Р±Р»РѕРє 4 вЂ” РўРµРєСЃС‚" hint="РџРµСЂРµР»С–С‡С–С‚СЊ СЂР°Р№РѕРЅРё/РјС–СЃС‚Р° РїСЂРёСЂРѕРґРЅРѕ РІ С‚РµРєСЃС‚С–, РЅРµ СЃРїРёСЃРєРѕРј">
                        <TInput multiline value={st.body4 ?? ""} onChange={(v) => setSt({ body4: v })} rows={5} placeholder="РњРё РґРѕСЃС‚Р°РІР»СЏС”РјРѕ С‡РѕСЂРЅРѕР·РµРј РїРѕ РІСЃС–С… РґРµСЃСЏС‚Рё СЂР°Р№РѕРЅР°С… РљРёС”РІР°вЂ¦" />
                      </Field>
                    </Card>
                  );
                })()}

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 28px", borderRadius: "10px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 2px 12px rgba(63,174,108,0.3)" }}>
                    <Save size={15} />{saved ? "Р—Р±РµСЂРµР¶РµРЅРѕ вњ“" : saving ? "Р—Р±РµСЂС–РіР°С”РјРѕвЂ¦" : "Р—Р±РµСЂРµРіС‚Рё SEO РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ"}
                  </button>
                </div>
              </>
            );
          })()}

          {/* в•ђв•ђв•ђ INTEGRATIONS в•ђв•ђв•ђ */}
          {tab === "integrations" && (
            <>
              {/* в”Ђв”Ђ Pending orders alert в”Ђв”Ђ */}
              {pendingCount > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>вљ пёЏ</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#b91c1c", marginBottom: "2px" }}>
                      {pendingCount} РЅРµРІС–РґРїСЂР°РІР»РµРЅ{pendingCount === 1 ? "Рµ" : "РёС…"} Р·Р°РјРѕРІР»РµРЅСЊ Сѓ С‡РµСЂР·С–
                    </div>
                    <div style={{ fontSize: "12px", color: "#dc2626" }}>
                      РџРµСЂРµРІС–СЂС‚Рµ РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ Telegram Bot Р°Р±Рѕ С–РЅС‚РµСЂРЅРµС‚-Р·'С”РґРЅР°РЅРЅСЏ.
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await retryPendingOrders();
                      setPendingCount(loadPendingOrders().length);
                      setToast("вњ“ РџРѕРІС‚РѕСЂРЅР° СЃРїСЂРѕР±Р° РЅР°РґСЃРёР»Р°РЅРЅСЏ РІРёРєРѕРЅР°РЅР°");
                    }}
                    style={{ padding: "8px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontFamily: SANS, fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Р’С–РґРїСЂР°РІРёС‚Рё Р·Р°СЂР°Р·
                  </button>
                </div>
              )}

              {/* в”Ђв”Ђ Google Analytics в”Ђв”Ђ */}
              <Card title="рџ“Љ Google Analytics 4">
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "12px 14px", marginBottom: "18px", display: "flex", gap: "10px" }}>
                  <BarChart2 size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#0c4a6e", margin: "0 0 4px" }}>РЇРє РѕС‚СЂРёРјР°С‚Рё Measurement ID?</p>
                    <ol style={{ fontSize: "12px", color: "#0369a1", margin: 0, paddingLeft: "16px", lineHeight: 1.8 }}>
                      <li>Р’С–РґРєСЂРёР№С‚Рµ <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: "#0369a1" }}>analytics.google.com</a></li>
                      <li>РђРґРјС–РЅ в†’ РџРѕС‚РѕРєРё РґР°РЅРёС… в†’ Р’Р°С€ СЃР°Р№С‚</li>
                      <li>РЎРєРѕРїС–СЋР№С‚Рµ Measurement ID (С„РѕСЂРјР°С‚ <code style={{ background: "#e0f2fe", padding: "1px 5px", borderRadius: "3px" }}>G-XXXXXXXXXX</code>)</li>
                    </ol>
                  </div>
                </div>
                <Field label="Google Analytics Measurement ID" hint='Р¤РѕСЂРјР°С‚: G-XXXXXXXXXX В· Р—Р°Р»РёС€С‚Рµ РїРѕСЂРѕР¶РЅС–Рј С‰РѕР± РІРёРјРєРЅСѓС‚Рё'>
                  <TInput
                    value={intg.gaId}
                    onChange={(v) => setIntg({ ...intg, gaId: v.trim() })}
                    placeholder="G-XXXXXXXXXX"
                  />
                  {intg.gaId && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: C.success, background: "#d1fae5", border: "1px solid #6ee7b7", padding: "3px 10px", borderRadius: "20px" }}>
                        вњ“ GA Р±СѓРґРµ Р°РєС‚РёРІРѕРІР°РЅРѕ РїСЂРё РІС–РґРєСЂРёС‚С‚С– СЃР°Р№С‚Сѓ
                      </span>
                    </div>
                  )}
                </Field>

                <Field label="Google Tag Manager ID" hint='Р¤РѕСЂРјР°С‚: GTM-XXXXXXX В· Р—Р°Р»РёС€С‚Рµ РїРѕСЂРѕР¶РЅС–Рј С‰РѕР± РІРёРјРєРЅСѓС‚Рё'>
                  <TInput
                    value={intg.gtmId || ""}
                    onChange={(v) => setIntg({ ...intg, gtmId: v.trim() })}
                    placeholder="GTM-XXXXXXX"
                  />
                  {intg.gtmId && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: C.success, background: "#d1fae5", border: "1px solid #6ee7b7", padding: "3px 10px", borderRadius: "20px" }}>
                        вњ“ GTM РєРѕРЅС‚РµР№РЅРµСЂ Р±СѓРґРµ Р°РєС‚РёРІРѕРІР°РЅРѕ РїСЂРё РІС–РґРєСЂРёС‚С‚С– СЃР°Р№С‚Сѓ
                      </span>
                    </div>
                  )}
                </Field>
                <button
                  onClick={handleSaveIntg}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", background: intgSaved ? C.success : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: SANS, transition: "background 0.3s" }}>
                  <Save size={14} />{intgSaved ? "Р—Р±РµСЂРµР¶РµРЅРѕ вњ“" : "Р—Р±РµСЂРµРіС‚Рё"}
                </button>
              </Card>

              {/* в”Ђв”Ђ Telegram в”Ђв”Ђ */}
              <Card title="вњ€пёЏ Telegram вЂ” СЃРїРѕРІС–С‰РµРЅРЅСЏ РїСЂРѕ Р·Р°РјРѕРІР»РµРЅРЅСЏ">
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 14px", marginBottom: "18px", display: "flex", gap: "10px" }}>
                  <Send size={16} color={C.success} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#14532d", margin: "0 0 4px" }}>РЇРє РЅР°Р»Р°С€С‚СѓРІР°С‚Рё Р·Р° 3 С…РІРёР»РёРЅРё?</p>
                    <ol style={{ fontSize: "12px", color: "#16a34a", margin: 0, paddingLeft: "16px", lineHeight: 1.9 }}>
                      <li>РќР°РїРёС€С–С‚СЊ <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: "#16a34a" }}>@BotFather</a> в†’ /newbot в†’ СЃРєРѕРїС–СЋР№С‚Рµ С‚РѕРєРµРЅ</li>
                      <li>РЎС‚РІРѕСЂС–С‚СЊ РіСЂСѓРїСѓ/РєР°РЅР°Р», РґРѕРґР°Р№С‚Рµ С‚СѓРґРё Р±РѕС‚Р° СЏРє Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂР°</li>
                      <li>РќР°РїРёС€С–С‚СЊ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: "#16a34a" }}>@userinfobot</a> Сѓ РіСЂСѓРїС– вЂ” РѕС‚СЂРёРјР°Р№С‚Рµ Chat ID</li>
                      <li>Р’СЃС‚Р°РІС‚Рµ С‚РѕРєРµРЅ С‚Р° Chat ID РЅРёР¶С‡Рµ, РЅР°С‚РёСЃРЅС–С‚СЊ В«РќР°РґС–СЃР»Р°С‚Рё С‚РµСЃпїЅпїЅВ»</li>
                    </ol>
                  </div>
                </div>

                <Field label="Bot Token" hint="Р’С–Рґ @BotFather В· РЅР°РїСЂ. 123456789:ABCDefghIJK...">
                  <TInput
                    value={intg.tgBotToken}
                    onChange={(v) => { setIntg({ ...intg, tgBotToken: v }); setTgTestResult(null); }}
                    placeholder="123456789:ABCDefghIJKlmnoPQRstuvwxyz"
                  />
                </Field>

                <Field label="Chat ID" hint="ID РіСЂСѓРїРё, РєР°РЅР°Р»Сѓ Р°Р±Рѕ РѕСЃРѕР±РёСЃС‚РёР№ В· РЅР°РїСЂ. -1001234567890">
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
                    <Send size={13} />{tgTesting ? "Р’С–РґРїСЂР°РІР»СЏС”РјРѕ..." : "РќР°РґС–СЃР»Р°С‚Рё С‚РµСЃС‚"}
                  </button>
                  <button
                    onClick={handleSaveIntg}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", background: intgSaved ? C.success : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: SANS, transition: "background 0.3s" }}>
                    <Save size={14} />{intgSaved ? "Р—Р±РµСЂРµР¶РµРЅРѕ вњ“" : "Р—Р±РµСЂРµРіС‚Рё"}
                  </button>
                </div>

                {intg.tgBotToken && intg.tgChatId && (
                  <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={14} color={C.success} />
                    <span style={{ fontSize: "12px", color: "#14532d", fontWeight: 500 }}>
                      Telegram РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ вЂ” РЅРѕРІС– Р·Р°РјРѕРІР»РµРЅРЅСЏ Р· СЃР°Р№С‚Сѓ РЅР°РґС…РѕРґРёС‚РёРјСѓС‚СЊ Сѓ Р±РѕС‚ Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ
                    </span>
                  </div>
                )}
              </Card>

              {/* в”Ђв”Ђ Status summary в”Ђв”Ђ */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: isMobile ? "16px" : "20px 24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 14px", fontFamily: SANS }}>РЎС‚Р°С‚СѓСЃ С–РЅС‚РµРіСЂР°С†С–Р№</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Google Analytics", ok: !!intg.gaId, value: intg.gaId || "РќРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ" },
                    { label: "Google Tag Manager", ok: !!intg.gtmId, value: intg.gtmId || "РќРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ" },
                    { label: "Telegram Bot Token", ok: !!intg.tgBotToken, value: intg.tgBotToken ? `${intg.tgBotToken.slice(0, 12)}...` : "РќРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ" },
                    { label: "Telegram Chat ID", ok: !!intg.tgChatId, value: intg.tgChatId || "РќРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ" },
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

        {/* в•ђв•ђ MOBILE STICKY BOTTOM BAR в•ђв•ђ */}
        {isMobile && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "10px 12px", display: "flex", gap: "10px", zIndex: 90, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
            <button onClick={handleReset}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "13px", borderRadius: "10px", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: SANS, minHeight: "48px" }}>
              <RotateCcw size={15} />РЎРєРёРЅСѓС‚Рё
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "13px", borderRadius: "10px", background: saved ? C.success : saving ? `${C.accent}90` : `linear-gradient(135deg, ${C.accent}, #2d7a50)`, border: "none", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: SANS, transition: "background 0.3s", boxShadow: "0 3px 14px rgba(63,174,108,0.35)", minHeight: "48px" }}>
              <Save size={16} />{saved ? "Р—Р±РµСЂРµР¶РµРЅРѕ вњ“" : saving ? "Р—Р±РµСЂС–РіР°С”РјРѕвЂ¦" : "Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё"}
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
