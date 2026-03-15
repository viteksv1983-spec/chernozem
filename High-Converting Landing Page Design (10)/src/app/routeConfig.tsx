// ═══════════════════════════════════════════════════════
//  Raw route definitions — SSR-safe (no createBrowserRouter).
//  Imported by both the client router and the server renderer.
// ═══════════════════════════════════════════════════════
import { Navigate } from "react-router";
import { SitePage }     from "./pages/SitePage";
import { AdminPage }    from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
    Component: AdminPage,
  },
  {
    // 404 — catches everything else
    path: "*",
    Component: NotFoundPage,
  },
];