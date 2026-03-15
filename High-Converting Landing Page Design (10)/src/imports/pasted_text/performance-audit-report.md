You are a **Principal Frontend Performance Architect (Google Chrome team / Vercel level)**.

Your task is to perform a **deep production-grade performance audit** of a React + Vite landing page that has already undergone multiple optimizations.

The goal is to push the mobile performance from **~90 PageSpeed to 95–100**.

The landing page is deployed here:

https://viteksv1983-spec.github.io/chernozem/

Stack:

React
TypeScript
Vite
TailwindCSS

Architecture:

Single page landing with sections:

Header
Hero
Benefits
Pricing
Calculator
SocialProof
FAQ
Final CTA

The page already implements the following optimizations:

1. Critical font injection before React mount (critical.ts)
2. Hero image converted to `<img>` with `fetchPriority="high"`
3. Lazy loading of sections using IntersectionObserver
4. requestIdleCallback used for heavy canvas computation
5. Duplicate font injection removed

These optimizations already reduced:

LCP
TBT
CLS

Now your task is to find **the remaining bottlenecks preventing perfect mobile performance**.

You must perform a **deep engineering-level audit**.

---

FIRST — Explain what performance limits usually remain when a React landing page already scores around **90 PageSpeed mobile**.

Analyze typical bottlenecks:

JS bundle size
hydration cost
React rendering cost
third-party scripts
CSS blocking
font loading
image decoding
network waterfalls

Explain how each affects:

LCP
TBT
INP

---

SECOND — Analyze how to reduce **React hydration cost**.

Explain techniques such as:

partial hydration
islands architecture
server-rendered hero
hydration deferral

Provide production-ready architectural examples.

---

THIRD — Propose a **React architecture specifically optimized for landing pages**.

Explain a structure where:

Hero renders instantly
Above-the-fold JS is minimal
Below-the-fold sections hydrate lazily

Provide example component structure.

---

FOURTH — Analyze **JavaScript bundle optimization**.

Explain:

how to reduce initial bundle to **<100kb gzip**

Provide strategies:

route-based splitting
component splitting
vendor chunk splitting
removing heavy libraries

Include example Vite configuration.

---

FIFTH — Analyze **image decoding and rendering cost**.

Explain how large hero images can slow LCP even if network loading is fast.

Provide solutions:

AVIF images
image dimension hints
decoding="async"
priority hints

Provide HTML examples.

---

SIXTH — Optimize **main thread scheduling**.

Explain how to reduce long tasks.

Provide techniques such as:

requestIdleCallback
scheduler.postTask
task splitting

Include code examples.

---

SEVENTH — Optimize **animation performance**.

Explain the cost of libraries such as:

framer-motion
scroll animations
canvas rendering

Provide lighter alternatives using:

CSS transforms
IntersectionObserver
GPU compositing.

---

EIGHTH — Optimize **network loading order**.

Explain how to control priority of:

CSS
fonts
hero images
JS bundles

Provide examples using:

preload
prefetch
priority hints.

---

NINTH — Evaluate **hosting platform performance**.

Compare:

GitHub Pages
Cloudflare Pages
Vercel
Netlify

Explain which hosting architecture provides the fastest global delivery.

---

TENTH — Provide a **final performance blueprint** for a high-performance React landing page.

Include:

ideal bundle sizes
ideal image weights
ideal number of requests

Example targets:

HTML < 30kb
JS < 100kb
CSS < 30kb
Images < 300kb

Explain how these targets produce:

PageSpeed 95–100 mobile.

---

IMPORTANT:

Your response must be written as a **deep engineering performance report**, not general advice.

Use:

clear technical explanations
architecture diagrams
real code examples
production-ready patterns.

Focus on **advanced optimizations used by senior frontend engineers**.
