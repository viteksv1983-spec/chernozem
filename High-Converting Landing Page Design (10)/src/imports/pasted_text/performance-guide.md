You are a **Senior Staff Frontend Performance Engineer (Google / Vercel level)**.

Your task is to **perform a deep mobile performance optimization of a React + Vite landing page** and output **production-ready code improvements**.

The goal is to achieve:

Mobile Google PageSpeed: **90–100**
LCP: **< 2.0s**
TBT: **< 150ms**
CLS: **< 0.05**

The website is a **high-converting landing page for black soil delivery in Kyiv (Ukraine)**.

Current deployment example:
https://viteksv1983-spec.github.io/chernozem/

Stack:

React
TypeScript
Vite
TailwindCSS
Component architecture
Single page landing
Sections include:

Header
Hero
Benefits
Pricing
Calculator
SocialProof
FAQ
Final CTA

The site is deployed on **GitHub Pages**.

Your task is to act as a **performance engineer**, not a designer.

Focus strictly on:

mobile performance
rendering speed
bundle optimization
LCP optimization
JS execution time
network payload size

---

FIRST — Perform a **full performance audit** of a typical React landing page like this.

Explain the main causes of slow mobile loading:

JS bundle size
render blocking resources
image weight
hydration cost
React rendering cost
fonts
third-party scripts
animations

Explain how each one affects:

LCP
TBT
INP
CLS

---

SECOND — Provide a **step-by-step optimization plan**.

Divide it into stages:

1. Critical rendering path optimization
2. JS bundle optimization
3. React rendering optimization
4. Image optimization
5. Network optimization
6. Hosting/CDN optimization

Each stage must include:

explanation
expected performance gain
production ready code examples

---

THIRD — Rewrite the landing architecture for **maximum mobile speed**.

Explain how to structure the page so that:

Hero loads instantly
Below-the-fold sections load lazily

Provide a **recommended architecture** such as:

Hero (SSR/static HTML)
Lazy sections
Deferred scripts
Intersection observer loading

---

FOURTH — Implement **code splitting and lazy loading**.

Provide real code examples for:

React.lazy
Suspense
dynamic imports

Example sections to lazy load:

Calculator
FAQ
Testimonials
Heavy UI components

Explain how this reduces initial JS.

---

FIFTH — Implement **Intersection Observer section loading**.

Provide production code for:

lazy rendering sections only when near viewport.

Example:

Benefits section
Pricing
Calculator
FAQ

Include React hook implementation.

---

SIXTH — Optimize images.

Explain best practices for landing pages.

Convert all images to:

WebP
AVIF

Explain optimal sizes:

Hero image
Card images
Icons

Provide HTML examples using:

srcset
sizes
loading="lazy"
fetchpriority="high"

---

SEVENTH — Optimize the **Hero section (LCP element)**.

Explain how to achieve **instant hero rendering**.

Provide techniques:

hero image preload
critical CSS
font optimization
rendering hero without React hydration

Provide code examples.

---

EIGHTH — Bundle size analysis.

Explain how to detect heavy libraries.

Provide configuration for:

rollup-plugin-visualizer in Vite

Show how to analyze:

bundle weight
vendor chunk
component chunks

Explain which libraries commonly slow down landing pages.

---

NINTH — React rendering optimization.

Explain how to prevent unnecessary re-renders.

Provide examples using:

React.memo
useMemo
useCallback

Explain when they should be used.

---

TENTH — Font loading optimization.

Explain how to load Google Fonts without blocking render.

Include:

preconnect
font-display swap

Provide full HTML example.

---

ELEVENTH — Network optimization.

Explain:

Brotli compression
HTTP caching
immutable assets
preload
prefetch

Provide example headers and HTML.

---

TWELFTH — Hosting optimization.

Compare performance for:

GitHub Pages
Cloudflare Pages
Vercel
Netlify

Explain which one is best for landing pages and why.

---

THIRTEENTH — Provide a **final optimized architecture blueprint** for a fast landing page.

Include:

ideal bundle sizes
ideal image sizes
ideal resource count

Example targets:

HTML < 30kb
JS < 120kb
CSS < 30kb
Images < 350kb

Explain how this leads to:

PageSpeed 90–100 mobile.

---

FOURTEENTH — Provide a **complete mobile performance checklist** for React landing pages.

Include:

code
network
images
fonts
React architecture
hosting
CDN

The checklist should be detailed enough that a developer can follow it step by step.

---

IMPORTANT:

Write the response as a **senior engineer performance guide**.

Use:

clear architecture diagrams
code examples
practical implementation steps

Avoid generic advice.

Focus only on **real engineering optimizations used in production**.

Use **detailed explanations and unlimited length if needed**.
