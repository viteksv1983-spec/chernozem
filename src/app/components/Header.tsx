import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import { Leaf, Phone, Menu, X } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

const NAV_SECTIONS = [
  { label: "Переваги",     id: "benefits"    },
  { label: "Ціни",         id: "pricing"     },
  { label: "Як працюємо", id: "how-it-works" },
  { label: "Відгуки",     id: "reviews"     },
  { label: "FAQ",          id: "faq"         },
];

// ── JS-based breakpoint hook (no Tailwind needed) ──────────────────────────
function useIsDesktop(bp = 768) {
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= bp
  );
  useEffect(() => {
    const fn = () => setDesktop(window.innerWidth >= bp);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return desktop;
}

export function Header({ onOrder }: { onOrder: () => void }) {
  const { content } = useContent();
  const PHONE      = content.general.phone;
  const PHONE_HREF = `tel:${content.general.phoneRaw}`;

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeSection,  setActiveSection]  = useState<string>("");
  const isDesktop = useIsDesktop();

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  // Close mobile menu when viewport widens to desktop
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    // Delay scroll until mobile menu finishes closing (animation = 280ms)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "background 0.35s ease, box-shadow 0.35s ease",
          background: scrolled ? "rgba(10,16,11,0.97)" : "rgba(10,16,11,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 32px rgba(0,0,0,0.40)"
            : "none",
        }}
      >
        {/* ── Scroll progress bar ── */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #3FAE6C, #8fe8b4)",
            transformOrigin: "0%",
            scaleX,
            zIndex: 10,
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          {/* ── Logo ── */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                background: "#3a7a57",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Leaf size={18} color="#fff" />
            </motion.div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: isDesktop ? "20px" : "17px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.1 }}>
                КиївЧорнозем
              </div>
              <div style={{ fontFamily: SANS, fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", lineHeight: 1 }}>
                ФОП Свєтличний С. О.
              </div>
            </div>
          </div>

          {/* ── Desktop Nav ── */}
          {isDesktop && (
            <nav style={{ display: "flex", gap: "32px" }}>
              {NAV_SECTIONS.slice(1).map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      fontFamily: SANS, fontSize: "14px", fontWeight: 500,
                      color: isActive ? "#8fe8b4" : "rgba(255,255,255,0.85)",
                      background: "none", border: "none", cursor: "pointer",
                      letterSpacing: "0.25px", position: "relative",
                      padding: "4px 0", transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        style={{
                          position: "absolute", bottom: "-2px", left: 0, right: 0,
                          height: "2px",
                          background: "linear-gradient(90deg, #3FAE6C, #8fe8b4)",
                          borderRadius: "2px",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ── Right side ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
            {/* Desktop: phone text + CTA */}
            {isDesktop && (
              <>
                <a
                  href={PHONE_HREF}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    fontFamily: SANS, fontSize: "15px", fontWeight: 600,
                    color: "rgba(255,255,255,0.88)", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8fe8b4")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
                >
                  <Phone size={14} color="#5ac88a" />
                  {PHONE}
                </a>
                <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.12)" }} />
                <motion.button
                  onClick={onOrder}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  style={{
                    fontFamily: SANS, fontSize: "14px", fontWeight: 700,
                    background: "linear-gradient(135deg, #3FAE6C 0%, #2a8a4e 100%)",
                    color: "#fff",
                    border: "1px solid rgba(143,232,180,0.25)",
                    borderRadius: "8px", padding: "10px 22px",
                    cursor: "pointer", whiteSpace: "nowrap",
                    boxShadow: "0 2px 14px rgba(63,174,108,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  Замовити
                </motion.button>
              </>
            )}

            {/* Mobile: phone icon + hamburger */}
            {!isDesktop && (
              <>
                <a
                  href={PHONE_HREF}
                  aria-label="Зателефонувати"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "40px", height: "40px",
                    borderRadius: "50%",
                    background: "rgba(58,122,87,0.25)",
                    border: "1.5px solid rgba(58,122,87,0.55)",
                    color: "#8fe8b4",
                    textDecoration: "none", flexShrink: 0,
                    animation: "phonePulse 2s ease-in-out infinite",
                  }}
                >
                  <Phone size={17} />
                </a>
                <motion.button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#fff", padding: "4px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {mobileOpen ? (
                      <motion.div key="close"
                        initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
                      >
                        <X size={24} />
                      </motion.div>
                    ) : (
                      <motion.div key="menu"
                        initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
                      >
                        <Menu size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile slide-down menu ── */}
        <AnimatePresence>
          {mobileOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{
                overflow: "hidden",
                background: "rgba(10,6,3,0.98)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ padding: "16px 20px 24px" }}>
                {NAV_SECTIONS.map((item, i) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        width: "100%", textAlign: "left",
                        fontFamily: SANS, fontSize: "17px",
                        color: isActive ? "#8fe8b4" : "rgba(255,255,255,0.85)",
                        background: "none", border: "none", cursor: "pointer",
                        padding: "13px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {isActive && (
                        <div style={{
                          width: "4px", height: "4px", borderRadius: "50%",
                          background: "#8fe8b4", flexShrink: 0,
                        }} />
                      )}
                      {item.label}
                    </motion.button>
                  );
                })}

                <motion.button
                  onClick={() => { setMobileOpen(false); onOrder(); }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "block", width: "100%",
                    fontFamily: SANS, fontSize: "16px", fontWeight: 700,
                    background: "linear-gradient(135deg, #3FAE6C 0%, #2d7a50 100%)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    padding: "14px 20px", cursor: "pointer",
                    marginTop: "18px", marginBottom: "4px",
                    boxShadow: "0 4px 20px rgba(63,174,108,0.35)",
                  }}
                >
                  Замовити чорнозем
                </motion.button>

                <a
                  href={PHONE_HREF}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    fontFamily: SANS, fontSize: "18px", fontWeight: 600,
                    color: "#3a7a57", textDecoration: "none", marginTop: "20px",
                  }}
                >
                  <Phone size={18} />
                  {PHONE}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <style>{`
        @keyframes phonePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(58,122,87,0.55); }
          50%       { box-shadow: 0 0 0 7px rgba(58,122,87,0); }
        }
      `}</style>
    </>
  );
}