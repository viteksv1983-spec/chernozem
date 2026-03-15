import { useState, useEffect, lazy, Suspense } from "react";
import { ErrorBoundary }   from "../components/ErrorBoundary";
import { SeoHead }         from "../components/SeoHead";
import { Header }          from "../components/Header";
import { Hero }            from "../components/Hero";
import { Benefits }        from "../components/Benefits";
import { Calculator }      from "../components/Calculator";
import { Pricing }         from "../components/Pricing";
import { WhoIsItFor }      from "../components/WhoIsItFor";
import { HowItWorks }      from "../components/HowItWorks";
import { SocialProof }     from "../components/SocialProof";
import { FAQ }             from "../components/FAQ";
import { FinalCTA }        from "../components/FinalCTA";
import { Footer }          from "../components/Footer";
import { OfflineNotice }   from "../components/OfflineNotice";
import { StickyMobileBar } from "../components/StickyMobileBar";
import { SeoTextSection }  from "../components/SeoTextSection";
import {
  loadIntegrations,
  injectGoogleAnalytics,
  trackEvent,
  retryPendingOrders,
} from "../lib/integrations";
import { captureUtm } from "../lib/utm";

// ── Lazy-load non-critical components ─────────────────────────────────────
// These are never visible on first render → smaller initial JS parse time.
// Vite will code-split these into separate chunks automatically.
const OrderModal = lazy(() =>
  import("../components/OrderModal").then((m) => ({ default: m.OrderModal }))
);
const PrivacyModal = lazy(() =>
  import("../components/PrivacyModal").then((m) => ({ default: m.PrivacyModal }))
);
const FloatingContactButtons = lazy(() =>
  import("../components/FloatingContactButtons").then((m) => ({
    default: m.FloatingContactButtons,
  }))
);

export function SitePage() {
  const [modalOpen, setModalOpen]     = useState(false);
  const [isCalc, setIsCalc]           = useState(false);
  const [prefillTons, setPrefillTons] = useState<number | undefined>(undefined);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    // 1. Capture UTM params from URL → sessionStorage
    captureUtm();

    // 2. Connect Google Analytics if configured
    const { gaId } = loadIntegrations();
    if (gaId) injectGoogleAnalytics(gaId);

    // 3. Retry any pending (failed) Telegram orders
    retryPendingOrders().catch(console.warn);

    // 4. Also retry on reconnect
    const onOnline = () => retryPendingOrders().catch(console.warn);
    window.addEventListener("online", onOnline);

    // 5. Preload lazy chunks during browser idle time so modals open instantly
    //    when user clicks — no perceptible delay.
    const preloadTimer = setTimeout(() => {
      import("../components/OrderModal");
      import("../components/PrivacyModal");
      import("../components/FloatingContactButtons");
    }, 2500);

    return () => {
      window.removeEventListener("online", onOnline);
      clearTimeout(preloadTimer);
    };
  }, []);

  const openOrder = () => {
    setIsCalc(false);
    setPrefillTons(undefined);
    setModalOpen(true);
    trackEvent("cta_click", { location: "generic" });
  };

  const openCalc = () => {
    setIsCalc(true);
    setPrefillTons(undefined);
    setModalOpen(true);
    trackEvent("calculator_open");
  };

  const openOrderFromCalc = (tons: number) => {
    setIsCalc(true);
    setPrefillTons(tons);
    setModalOpen(true);
    trackEvent("cta_click", { location: "calculator", tons });
  };

  const openOrderWithTons = (tons: number) => {
    setIsCalc(false);
    setPrefillTons(tons);
    setModalOpen(true);
    trackEvent("cta_click", { location: "pricing", tons });
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          overflowX: "hidden",
          background: "#0d1a0f",
        }}
      >
        {/* Offline banner (fixed top) */}
        <OfflineNotice />

        <SeoHead />
        <Header onOrder={openOrder} />

        <main>
          {/* Above-fold: eager */}
          <Hero onOrder={openOrder} onCalc={openCalc} />

          {/* Below-fold: content-visibility:auto applied via CSS (mobile.css) */}
          <Benefits />
          <Calculator onOrder={openOrderFromCalc} />
          <Pricing onOrder={openOrderWithTons} />
          <WhoIsItFor onOrder={openOrder} />
          <HowItWorks onOrder={openOrder} />
          <SocialProof onOrder={openOrder} />
          <FAQ />
          <FinalCTA onOrder={openOrder} />
        </main>

        <SeoTextSection />

        <Footer onPrivacy={() => setPrivacyOpen(true)} />

        {/* Lazy — rendered only when needed, code-split into separate chunks */}
        <Suspense fallback={null}>
          <OrderModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            isCalc={isCalc}
            prefillTons={prefillTons}
          />
        </Suspense>

        <Suspense fallback={null}>
          <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        </Suspense>

        <StickyMobileBar onOrder={openOrder} />

        <Suspense fallback={null}>
          <FloatingContactButtons />
        </Suspense>

        <style>{`
          html, body { margin: 0; padding: 0; background: #0d1a0f; }
          html { scroll-behavior: smooth; }
          @keyframes phonePulse {
            0%   { box-shadow: 0 0 0 0 rgba(58,122,87,0.6); }
            60%  { box-shadow: 0 0 0 12px rgba(58,122,87,0); }
            100% { box-shadow: 0 0 0 0 rgba(58,122,87,0); }
          }
          button { -webkit-tap-highlight-color: transparent; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f5efe4; }
          ::-webkit-scrollbar-thumb { background: #c0a890; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #9a7a60; }
          input[type="range"] {
            -webkit-appearance: none; appearance: none;
            background: #e0d8c8; border-radius: 4px; height: 5px; cursor: pointer;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 20px; height: 20px;
            border-radius: 50%; background: #3a7a57; cursor: pointer;
            box-shadow: 0 2px 8px rgba(58,122,87,0.4);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px; height: 20px; border-radius: 50%;
            background: #3a7a57; cursor: pointer; border: none;
            box-shadow: 0 2px 8px rgba(58,122,87,0.4);
          }
          ::selection { background: rgba(58,122,87,0.25); color: #140c07; }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}