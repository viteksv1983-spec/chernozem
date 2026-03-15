You are a **Senior Frontend Performance Engineer specializing in Lighthouse optimization for React + Vite applications**.

The project is a high-performance landing page that already includes advanced optimizations:

• React.lazy for section components
• IntersectionObserver lazy mounting
• requestIdleCallback for heavy work
• deferred Google Analytics
• hero image preload
• content-visibility optimization

However Lighthouse still reports:

1. Network dependency chains caused by many small dynamic chunks
2. Too many `preconnect` resource hints

Your task is to **optimize the architecture while preserving lazy loading behavior**.

---

FIRST TASK — Reduce dynamic import network chains

Currently each landing section loads as a separate chunk:

Calculator
Pricing
WhoIsItFor
HowItWorks
SocialProof
FAQ
FinalCTA

Each file is very small (2-6KB) but still creates its own HTTP request, which Lighthouse counts as part of the critical dependency chain.

Refactor the build configuration so that these sections are grouped into a single **lazy bundle**.

Provide a Vite configuration using:

rollupOptions.output.manualChunks

Example structure:

main bundle (Hero + Header)

lazy bundle:
landingSections.js

This bundle should include all non-critical landing sections.

Explain why this reduces:

network waterfall length
HTTP overhead
Lighthouse dependency chain warnings.

---

SECOND TASK — Optimize resource hints

Lighthouse reports:

"More than four preconnect resource hints were detected".

Refactor the resource hint strategy:

• keep **only 2-3 critical preconnects**
• convert other hints to `dns-prefetch`

Provide a final recommended head configuration.

Example:

critical:
fonts.gstatic.com
supabase storage

secondary:
images CDN
Google Tag Manager

Explain why too many preconnects hurt performance.

---

THIRD TASK — Maintain lazy loading performance

Ensure the new architecture still:

• avoids loading below-the-fold sections on initial render
• preserves IntersectionObserver lazy mounting
• keeps the initial bundle under 120KB

Provide example code structure for:

LazySection wrapper
React.lazy usage.

---

Finally explain how these changes improve Lighthouse metrics:

LCP
network dependency chains
overall performance score.
