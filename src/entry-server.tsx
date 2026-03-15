// ═══════════════════════════════════════════════════════
//  Server Entry Point — SSG pre-render
//
//  Called by scripts/prerender.mjs during `vite build`.
//  Renders the React tree to a string, extracts helmet
//  head tags, and returns both for injection into
//  dist/index.html.
//
//  NOTE: This file must NOT import anything that calls
//  browser-only APIs at module level (window, document,
//  localStorage, etc.).  All such calls must be guarded
//  with `typeof window !== "undefined"` or live inside
//  useEffect (which doesn't run during renderToString).
// ═══════════════════════════════════════════════════════
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { ContentProvider } from "./app/contexts/ContentContext";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { routeConfig } from "./app/routeConfig";

// FilledContext is the shape react-helmet-async fills after renderToString
interface FilledHelmetContext {
  helmet: {
    title:  { toString(): string };
    meta:   { toString(): string };
    link:   { toString(): string };
    script: { toString(): string };
    style:  { toString(): string };
  };
}

/**
 * Renders the app at `url` to an HTML string.
 *
 * @param url  Absolute path to render, e.g. "/"
 * @returns    { html, head, status }
 *   - html   — full rendered React tree as an HTML string
 *   - head   — stringified <title> + <meta> + <link> tags
 *   - status — HTTP status code (200, 301, 404 …)
 */
export async function render(url: string) {
  // ── 1. Create a static request handler from route config ──────────────
  const { query, dataRoutes } = createStaticHandler(routeConfig);

  // createStaticHandler.query() expects a native Request object
  const fetchRequest = new Request(`http://prerender.local${url}`, {
    headers: { "Content-Type": "text/html" },
  });

  const context = await query(fetchRequest);

  // If the route returned a redirect Response, propagate the status
  if (context instanceof Response) {
    return {
      html: "",
      head: "",
      status: context.status,
    };
  }

  // ── 2. Build a StaticRouter from the resolved context ─────────────────
  const staticRouter = createStaticRouter(dataRoutes, context);

  // ── 3. Render to string with HelmetProvider in SSR context mode ────────
  const helmetContext: FilledHelmetContext = {} as FilledHelmetContext;

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ContentProvider>
        <StaticRouterProvider
          router={staticRouter}
          context={context}
          nonce=""
        />
      </ContentProvider>
    </HelmetProvider>
  );

  // ── 4. Extract head tags rendered by SeoHead.tsx via react-helmet-async
  const { helmet } = helmetContext;
  const head = helmet
    ? [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
        helmet.style.toString(),
      ]
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n    ")
    : "";

  return { html, head, status: context.statusCode ?? 200 };
}
