// ═══════════════════════════════════════════════════════
//  Client Entry Point — SSR-aware hydration
//
//  • If the server pre-rendered HTML is present inside #root
//    → hydrateRoot (reuse the existing DOM, no flash/repaint)
//  • If #root is empty (dev mode or CSR-only fallback)
//    → createRoot (fresh mount)
// ═══════════════════════════════════════════════════════
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  // ── SSR content present → hydrate ──────────────────────
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // ── No SSR content (dev / CSR fallback) → create root ──
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
