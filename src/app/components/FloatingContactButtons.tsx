import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useContent } from "../contexts/ContentContext";

const SANS = "'Inter', system-ui, sans-serif";

// ── SVG icons (Viber + Telegram don't exist in lucide-react) ─────────────────

function TelegramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#26A5E4" />
      <path
        d="M5.5 11.8l12.4-4.8c.6-.2 1.1.1.9.9l-2.1 9.9c-.15.7-.6.9-1.1.55l-3-2.3-1.45 1.4c-.16.16-.3.3-.6.3l.2-3.1 5.35-4.83c.23-.2-.05-.32-.36-.12L7.8 14.4 4.84 13.5c-.65-.2-.66-.65.66-.9z"
        fill="white"
      />
    </svg>
  );
}

function ViberIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#7360F2" />
      <path
        d="M16.5 7.2C15.1 6 13.1 5.5 12 5.5c-1.1 0-3.1.5-4.5 1.7C6.4 8.3 5.8 9.8 5.8 11.4c0 1.2.3 2.4.9 3.4l.1.2-.4 2.6 2.6-.4.2.1c.9.5 2 .8 3 .8 1.1 0 3.1-.5 4.5-1.7 1.1-1.1 1.7-2.6 1.7-4.3 0-1.7-.6-3.1-1.9-4z"
        fill="white" opacity="0.15"
      />
      <path
        d="M16.5 7.2C15.1 6 13.1 5.5 12 5.5c-1.1 0-3.1.5-4.5 1.7C6.4 8.3 5.8 9.8 5.8 11.4c0 1.2.3 2.4.9 3.4l.1.2-.4 2.6 2.6-.4.2.1c.9.5 2 .8 3 .8 1.1 0 3.1-.5 4.5-1.7 1.1-1.1 1.7-2.6 1.7-4.3 0-1.7-.6-3.1-1.9-4z"
        stroke="white" strokeWidth="1" fill="none"
      />
      <path
        d="M10.2 9.1c.2 0 .35.1.45.3l.6 1.3c.1.2.05.45-.1.6l-.4.4c-.05.05-.06.12-.02.18.3.5.72.95 1.22 1.3.06.04.13.03.18-.02l.4-.4c.15-.15.4-.2.6-.1l1.3.6c.2.1.3.25.3.45v.8c0 .25-.2.45-.45.45C11 14.95 9 12.95 9 10.7v-.15c0-.25.2-.45.45-.45h.75z"
        fill="white"
      />
      <path d="M12.3 8.5c1.5.2 2.5 1.2 2.7 2.7" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M12.3 7c2.2.25 3.7 1.75 4 4" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface ButtonInfo {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
  shadow: string;
}

export function FloatingContactButtons() {
  const { content } = useContent();
  const phoneRaw = content.general.phoneRaw || "+380981116059";

  // Strip leading + for viber protocol
  const phoneDigits = phoneRaw.replace(/^\+/, "");

  const buttons: ButtonInfo[] = [
    {
      id: "telegram",
      label: "Написати в Telegram",
      href: `https://t.me/+${phoneDigits}`,
      icon: <TelegramIcon size={26} />,
      bg: "#26A5E4",
      shadow: "0 6px 24px rgba(38,165,228,0.5)",
    },
    {
      id: "viber",
      label: "Написати у Viber",
      href: `viber://chat?number=${phoneDigits}`,
      icon: <ViberIcon size={26} />,
      bg: "#7360F2",
      shadow: "0 6px 24px rgba(115,96,242,0.5)",
    },
  ];

  // Show after 5 seconds (don't be intrusive on first impression)
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            position: "fixed",
            // On mobile: sit above the StickyMobileBar (76px) + 12px gap
            // On desktop: 32px from bottom
            bottom: "var(--fab-bottom, 32px)",
            right: "20px",
            zIndex: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <style>{`
            @media (max-width: 768px) {
              :root { --fab-bottom: 90px; }
            }
            @media (min-width: 769px) {
              :root { --fab-bottom: 32px; }
            }
          `}</style>

          {/* Expandable button list (stagger animation) */}
          <AnimatePresence>
            {expanded && buttons.map((btn, i) => (
              <motion.div
                key={btn.id}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.8 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 360, damping: 26 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredId === btn.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.16 }}
                      style={{
                        background: "rgba(20,12,7,0.92)",
                        color: "#fff",
                        fontFamily: SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        padding: "6px 14px",
                        borderRadius: "20px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      {btn.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Circle button */}
                <motion.a
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={btn.label}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => setHoveredId(btn.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: btn.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    boxShadow: btn.shadow,
                    flexShrink: 0,
                  }}
                >
                  {btn.icon}
                </motion.a>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Toggle button — always visible */}
          <motion.button
            onClick={() => setExpanded((v) => !v)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            aria-label={expanded ? "Закрити месенджери" : "Написати нам"}
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: expanded ? "#140c07" : "linear-gradient(135deg, #3a7a57 0%, #2d6045 100%)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: expanded
                ? "0 4px 20px rgba(0,0,0,0.45)"
                : "0 6px 28px rgba(45,96,69,0.55)",
              transition: "background 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Pulse ring when collapsed */}
            {!expanded && (
              <span style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                animation: "fabPulse 2.2s ease-in-out infinite",
                border: "2px solid rgba(143,232,180,0.4)",
              }} />
            )}
            <motion.div
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.22 }}
            >
              {expanded ? (
                /* X icon when open */
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M5 5L17 17M17 5L5 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              ) : (
                /* Chat bubble icon when closed */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5C21 16.19 16.97 20 12 20c-1.32 0-2.58-.27-3.72-.76L3 21l1.76-5.28A8.96 8.96 0 013 11.5C3 6.81 7.03 3 12 3s9 3.81 9 8.5z"
                    fill="white" opacity="0.9"
                  />
                </svg>
              )}
            </motion.div>
          </motion.button>

          <style>{`
            @keyframes fabPulse {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.35); opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
