/**
 * КиівЧорнозем — Static Pre-render Script
 *
 * Runs after `vite build` + `vite build --ssr src/entry-server.tsx`.
 * For each route:
 *   1. Calls render(url) from the SSR bundle
 *   2. Injects the rendered HTML + head tags into dist/index.html
 *   3. Writes the final HTML file to dist/
 *
 * Usage (automatically called by the build script in package.json):
 *   node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, rmSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SSR_BUNDLE = resolve(DIST, "_ssr", "entry-server.js");

// ── Routes to pre-render ───────────────────────────────────────────────────
// For a single-page landing, only "/" needs pre-rendering.
// Add more paths here if you create additional public pages.
const ROUTES_TO_RENDER = ["/"];

async function main() {
  console.log("\n🔄  Pre-rendering routes…");

  // 1. Load the SSR bundle built by `vite build --ssr`
  let render;
  try {
    ({ render } = await import(pathToFileURL(SSR_BUNDLE).href));
  } catch (err) {
    console.error("❌  SSR bundle not found:", SSR_BUNDLE);
    console.error("    Make sure to run: vite build --ssr src/entry-server.tsx");
    process.exit(1);
  }

  // 2. Read the client-build HTML template
  const template = readFileSync(resolve(DIST, "index.html"), "utf-8");

  for (const url of ROUTES_TO_RENDER) {
    try {
      const { html, head, status } = await render(url);

      if (status >= 300 && status < 400) {
        console.log(`  ↩  ${url}  →  ${status} redirect — skipping`);
        continue;
      }

      // 3. Inject rendered content into the HTML template
      let result = template;

      // Replace head placeholder with react-helmet-async output
      result = result.replace("<!--head-tags-->", head || "");

      // Replace body placeholder with the rendered React tree
      result = result.replace("<!--app-html-->", html);

      // 4. Write output file
      let outFile;
      if (url === "/") {
        outFile = resolve(DIST, "index.html");
      } else {
        // e.g. /about → dist/about/index.html
        const outDir = resolve(DIST, url.slice(1));
        mkdirSync(outDir, { recursive: true });
        outFile = resolve(outDir, "index.html");
      }

      writeFileSync(outFile, result, "utf-8");
      console.log(`  ✅  ${url}  →  ${outFile.replace(ROOT, "")}`);
    } catch (err) {
      console.error(`  ❌  Failed to render ${url}:`, err);
    }
  }

  // 5. Remove the temporary SSR bundle from dist/
  try {
    rmSync(resolve(DIST, "_ssr"), { recursive: true, force: true });
    console.log("  🧹  Cleaned up _ssr bundle");
  } catch {
    // Non-fatal
  }

  console.log("\n✨  Pre-rendering complete!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
