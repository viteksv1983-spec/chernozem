import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    // Tailwind is only needed for the client bundle (generates CSS).
    // Skip it for the SSR build to keep the server bundle lean.
    ...(isSsrBuild ? [] : [tailwindcss()]),
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