import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Phone, ShoppingCart } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SANS = "'Inter', system-ui, sans-serif";

interface StickyMobileBarProps {
  onOrder: () => void;
}

export function StickyMobileBar({ onOrder }: StickyMobileBarProps) {
  const { content } = useContent();
  const phoneHref = `tel:${content.general.phoneRaw}`;

  // JS-based mobile detection — more reliable than Tailwind class on fixed children
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 280, damping: 28 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "rgba(14, 8, 4, 0.97)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      {/* Phone button */}
      <motion.a
        href={phoneHref}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          background: "rgba(58, 122, 87, 0.2)",
          border: "1.5px solid rgba(58, 122, 87, 0.5)",
          flexShrink: 0,
          textDecoration: "none",
          animation: "mobilePhonePulse 2.5s ease-in-out infinite",
        }}
      >
        <Phone size={22} color="#8fe8b4" />
      </motion.a>

      {/* Order button */}
      <motion.button
        onClick={onOrder}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          height: "52px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #3a7a57 0%, #2d6045 100%)",
          border: "none",
          cursor: "pointer",
          fontFamily: SANS,
          fontSize: "16px",
          fontWeight: 600,
          color: "#ffffff",
          boxShadow: "0 4px 20px rgba(58, 122, 87, 0.45)",
        }}
      >
        <ShoppingCart size={18} />
        Замовити доставку
      </motion.button>

      <style>{`
        @keyframes mobilePhonePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(58,122,87,0.50); }
          60%       { box-shadow: 0 0 0 8px rgba(58,122,87,0); }
        }
      `}</style>
    </motion.div>
  );
}
