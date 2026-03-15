import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    // Tailwind + PWA only for the client bundle
    ...(isSsrBuild ? [] : [
      tailwindcss(),
      VitePWA({
        // Auto-update SW silently when a new build is deployed
        registerType: 'autoUpdate',
        // Inject SW registration script into index.html automatically
        injectRegister: 'auto',

        workbox: {
          // Pre-cache all hashed JS, CSS and HTML assets
          globPatterns: ['**/*.{js,css,html}'],

          // SPA fallback — serve index.html for any navigation request
          navigateFallback: '/chernozem/index.html',
          // Don't intercept admin route (keeps admin fresh from network)
          navigateFallbackDenylist: [/^\/chernozem\/admin/],

          // Hashed assets are immutable → serve from cache immediately
          // (CacheFirst: ignore GitHub Pages max-age=600 header)
          runtimeCaching: [
            {
              // All /chernozem/assets/*.js and *.css files have content hashes
              urlPattern: ({ url }) =>
                url.pathname.startsWith('/chernozem/assets/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'chernozem-assets-v1',
                expiration: {
                  maxEntries: 120,
                  // 1 year — safe because filenames change when content changes
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Unsplash hero + gallery images — cache for 7 days
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images-v1',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Google Fonts — cache for 1 year (they are immutable too)
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-v1',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },

        manifest: {
          name: 'КиївЧорнозем — доставка чорнозему по Києву',
          short_name: 'КиївЧорнозем',
          description: 'Чорнозем з доставкою. Прямо від виробника. ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО — 5 до 35 тонн.',
          theme_color: '#040c06',
          background_color: '#040c06',
          // 'browser' keeps it as a website, not a full-screen PWA app
          display: 'browser',
          start_url: '/chernozem/',
          scope: '/chernozem/',
          lang: 'uk',
          icons: [],
        },
      }),
    ]),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Base path for GitHub Pages — site is served at /chernozem/
  base: isSsrBuild ? '/' : '/chernozem/',

  build: {
    // ── Output directory ──────────────────────────────────────────────────
    // SSR bundle goes to dist/_ssr so it doesn't clash with the client build.
    // The prerender script cleans it up after use.
    outDir: isSsrBuild ? 'dist/_ssr' : 'dist',

    // Target modern browsers — smaller output, no legacy polyfills
    target: isSsrBuild ? 'node18' : 'es2020',

    // Use esbuild for minification — much faster than terser, similar output
    minify: isSsrBuild ? false : 'esbuild',

    // Split CSS per chunk — only load CSS needed for the current chunk
    cssCodeSplit: !isSsrBuild,

    // ── SSR-specific options ───────────────────────────────────────────────
    ...(isSsrBuild
      ? {
          // Keep SSR bundle as a single ESM file for easy import by the prerender script
          rollupOptions: {
            input: 'src/entry-server.tsx',
            output: {
              format: 'esm',
              entryFileNames: 'entry-server.js',
            },
          },
          // Don't emit assets (images, fonts) for the SSR build — client build handles them
          assetsDir: '',
        }
      : {
          // ── Client bundle — Rollup chunk splitting strategy ──────────────
          rollupOptions: {
            output: {
              /**
               * Manual chunk strategy:
               *  react-vendor  — react, react-dom, react-router (rarely changes → long cache)
               *  motion        — motion/react (~200KB, changes independently of app code)
               *  icons         — lucide-react (tree-shaken but still a separate cache unit)
               *  radix         — radix-ui components (heavy, but rarely change)
               *  mui           — MUI (admin panel only)
               *
               * Benefit: after each deploy, users only re-download chunks that actually changed.
               * App code changes → only the app chunk is invalidated, vendor chunks stay cached.
               */
              manualChunks: (id) => {
                if (id.includes('node_modules')) {
                  if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) {
                    return 'react-vendor';
                  }
                  if (/node_modules\/motion\//.test(id)) {
                    return 'motion';
                  }
                  if (/node_modules\/lucide-react\//.test(id)) {
                    return 'icons';
                  }
                  if (/node_modules\/@radix-ui\//.test(id)) {
                    return 'radix-ui';
                  }
                  if (/node_modules\/@mui\//.test(id)) {
                    return 'mui';
                  }
                }

                // ── Landing sections: one lazy bundle ─────────────────────────────
                // Before: 7 separate chunks (2–6 KB each) → 7 parallel HTTP requests
                //         Lighthouse counts each as a node in the network dependency chain.
                // After:  1 combined chunk (~35 KB) → 1 HTTP request
                //         → shorter waterfall, fewer chain nodes, better Lighthouse score.
                // All sections are React.lazy() → bundle is still loaded lazily,
                // only when the first section enters the viewport.
                if (/\/src\/app\/components\/(Calculator|Pricing|WhoIsItFor|HowItWorks|SocialProof|FAQ|FinalCTA)/.test(id)) {
                  return 'landingSections';
                }
              },

              // Smaller asset names (hash stays for cache busting)
              chunkFileNames: 'assets/[name]-[hash].js',
              entryFileNames: 'assets/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash].[ext]',
            },
          },
        }),

    // Warn when a chunk exceeds 600KB (helps catch unintended bundle bloat)
    chunkSizeWarningLimit: 600,
  },

  // ── SSR externals ────────────────────────────────────────────────────────────
  // Packages that should NOT be bundled into the SSR build.
  // react-helmet-async v3 must be bundled (it has ESM issues when externalized).
  ssr: {
    noExternal: ['react-helmet-async', 'motion'],
  },
}))