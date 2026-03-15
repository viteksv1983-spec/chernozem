You are a **Staff Frontend Engineer and Production Readiness Auditor**.

Your task is to perform a **full production audit** of a React + Vite landing page before launch.

Behave like a **tech lead performing a final production review**.

This project is already highly optimized and deployed.

You must carefully analyze the system and identify:

• potential bugs
• architectural risks
• performance regressions
• stability issues
• production readiness concerns

IMPORTANT:

Do NOT suggest redesigning the application.

Do NOT propose large refactors.

Focus only on **safe, production-ready improvements**.

---

PROJECT ARCHITECTURE

React 18
React Router v7
Vite build system
GitHub Pages deployment
Supabase backend (Edge Functions + storage)
Native Service Worker (`sw.js`) with CacheFirst strategy

Performance optimizations already implemented:

• React.lazy for 13 components
• IntersectionObserver lazy section mounting
• requestIdleCallback chunk prefetching
• content-visibility optimization
• hero image preload
• interaction-deferred Google Analytics
• batch setState in ContentContext
• optimized canvas detectBounds algorithm
• explicit width/height for hero image (CLS = 0)

LazySection uses:

• stable wrapper div
• placeholder phase
• rendered phase
• SectionErrorBoundary for isolation.

---

FIRST TASK — React architecture audit

Inspect the component architecture.

Verify:

• LazySection stability
• Suspense boundaries
• ErrorBoundary placement
• React Router integration

Ensure there are no remaining risks for:

React error #418
React error #423
hydration mismatches
unexpected re-mount loops.

Confirm the design is safe in React 18 concurrent rendering.

---

SECOND TASK — Performance audit

Evaluate the entire performance pipeline.

Check:

• lazy chunk strategy
• requestIdleCallback usage
• IntersectionObserver behavior
• Service Worker caching strategy
• network waterfalls.

Ensure the architecture preserves:

LCP < 2.5s
TBT ≈ 0
CLS ≈ 0.

Identify any potential regressions.

---

THIRD TASK — Bundle and network audit

Analyze the build output.

Check:

• bundle splitting strategy
• vendor chunk size
• number of network requests
• dependency chain depth.

Recommend improvements only if they reduce:

network waterfall
bundle parsing cost.

Do NOT increase bundle size.

---

FOURTH TASK — Supabase integration audit

Review the integration with Supabase:

• API client usage
• Edge Functions
• storage access
• admin panel.

Ensure:

• no sensitive keys exposed
• proper error handling
• safe async flows.

---

FIFTH TASK — Service Worker audit

Review the native `sw.js`.

Verify:

• correct CacheFirst strategy
• safe update lifecycle
• no cache poisoning risks
• no stale HTML caching.

Confirm it is production safe.

---

SIXTH TASK — Lighthouse and SEO audit

Verify Lighthouse compatibility.

Check:

• hero preload strategy
• resource hints (preconnect, dns-prefetch)
• console error handling
• SPA routing fallback (`404.html` trick).

Ensure no console errors remain.

---

SEVENTH TASK — Accessibility audit

Check accessibility basics:

• semantic HTML structure
• ARIA usage
• keyboard navigation
• color contrast.

Recommend only minimal safe improvements.

---

EIGHTH TASK — CI/CD pipeline audit

Review deployment architecture:

GitHub Actions → build → GitHub Pages.

Ensure:

• build reproducibility
• no dependency conflicts
• no fragile steps in pipeline.

---

FINAL TASK — Production readiness verdict

Provide a final summary:

• architecture quality
• stability level
• performance readiness
• potential risks.

Rate the project as if it were being deployed by a professional engineering team.
