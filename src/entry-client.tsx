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

// Check if the root has any actual DOM elements or non-empty text
// (ignores HTML comments like <!--app-html--> that Vite leaves behind)
const hasSSRContent = Array.from(rootEl.childNodes).some(node => 
  node.nodeType === Node.ELEMENT_NODE || 
  (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
);

if (hasSSRContent) {
  // ── SSR content present → hydrate ──────────────────────
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // ── No SSR content (dev / CSR fallback) → create root ──
  // Clear any placeholder comments first to be safe
  rootEl.innerHTML = "";
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
