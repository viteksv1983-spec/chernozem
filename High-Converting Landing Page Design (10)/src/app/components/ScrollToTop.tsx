/**
 * ScrollToTop — pure CSS transitions, zero motion/react dependency.
 *
 * Previously used motion.button + AnimatePresence which:
 *   - Pulled full motion/react into this chunk
 *   - Added JS animation overhead for a simple show/hide button
 *
 * Now: CSS `opacity` + `transform` transition handles the animation.
 * GPU-composited (only compositor layers involved), zero JS per frame.
 * Bundle savings: motion/react removed from this chunk entirely.
 */

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollUp}
      aria-label="Прокрутити нагору"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "20px",
        zIndex: 190,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(14,8,4,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: visible ? "pointer" : "default",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
        // CSS transition — GPU composited, no JS per frame
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.72) translateY(14px)",
        transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ArrowUp size={20} color="#8fe8b4" strokeWidth={2} />
    </button>
  );
}
