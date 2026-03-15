import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const SANS = "'Inter', system-ui, sans-serif";

export function OfflineNotice() {
  // Hydration-safe: start with false (matches SSR where navigator is undefined).
  // useEffect sets real value after hydration.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Apply real value after hydration
    setOffline(!navigator.onLine);

    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#1c0a00",
            borderBottom: "1px solid rgba(239,68,68,0.35)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontFamily: SANS,
          }}
        >
          {/* Blinking dot */}
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ef4444",
              animation: "pulse-offline 1.5s infinite",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#fca5a5" }}>
            Немає з'єднання з інтернетом. Замовлення відправляться автоматично після відновлення зв'язку.
          </span>
          <style>{`
            @keyframes pulse-offline {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.8); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}