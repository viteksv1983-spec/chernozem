// ═══════════════════════════════════════════════════════
//  Raw route definitions — SSR-safe (no createBrowserRouter).
//  Imported by both the client router and the server renderer.
//
//  AdminPage and NotFoundPage are lazy-loaded via React Router's
//  lazy() property to reduce the initial JS bundle for landing
//  page visitors (~30-40KB gzipped savings).
//  SitePage is imported synchronously because it's the SSR-critical
//  route that must be available for pre-rendering.
// ═══════════════════════════════════════════════════════
import { SitePage }     from "./pages/SitePage";

export const routeConfig = [
  {
    path: "/",
    Component: SitePage,
  },
  {
    path: "/site",
    Component: SitePage,
  },
  {
    path: "/admin",
    lazy: () => import("./pages/AdminPage").then(m => ({ Component: m.AdminPage })),
  },
  {
    // 404 — catches everything else
    path: "*",
    lazy: () => import("./pages/NotFoundPage").then(m => ({ Component: m.NotFoundPage })),
  },
];