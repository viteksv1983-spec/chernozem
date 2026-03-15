You are a **Senior Frontend Performance Engineer (Chrome / Vercel level)**.

Your task is to implement **four advanced mobile performance optimizations** for a React + Vite landing page.

The goal is to improve **mobile PageSpeed from ~90 to 95–100**.

The website is a high-performance React landing page that already includes:

React.lazy code splitting
IntersectionObserver section lazy loading
requestIdleCallback for heavy tasks
Hero image with fetchPriority="high"
Critical font injection before React mount
Deferred Google Analytics loading

Now implement the **next level performance optimizations**.

Your answer must contain **production-ready code**.

Do not give generic advice.

Explain the reasoning and provide the exact code changes.

---

FIRST OPTIMIZATION — content-visibility

Explain how the CSS property:

content-visibility: auto

improves rendering performance by skipping layout, style and paint work for offscreen DOM.

Then implement it for landing page sections.

Example target elements:

Benefits section
Pricing section
FAQ
Testimonials
Footer

Provide CSS like:

.section {
content-visibility: auto;
contain-intrinsic-size: 1000px;
}

Explain why contain-intrinsic-size prevents layout jumps.

---

SECOND OPTIMIZATION — async image decoding

Explain how image decoding can block the main thread even after the network request finishes.

Show how to add:

decoding="async"

to the hero image to allow background decoding.

Provide the final optimized hero markup including:

width
height
fetchpriority="high"
decoding="async"

Example:

<img
src="/hero.avif"
width="1080"
height="720"
fetchpriority="high"
decoding="async"
alt="Hero image"
/>

Explain how this improves LCP and reduces main thread blocking.

---

THIRD OPTIMIZATION — Vite manualChunks bundle splitting

Explain how the default Vite bundling can create large vendor chunks.

Show how to split libraries into separate chunks using:

rollupOptions.output.manualChunks

Provide a full example Vite configuration:

rollupOptions: {
output: {
manualChunks: {
react: ["react", "react-dom"],
motion: ["motion/react"],
supabase: ["@supabase/supabase-js"]
}
}
}

Explain how this reduces the initial JavaScript payload and improves parsing time.

---

FOURTH OPTIMIZATION — hero image preload

Explain how the browser preload scanner works.

Show how to preload the hero image so the browser begins downloading it before layout calculation.

Provide the exact HTML code to insert in the document head:

<link
rel="preload"
as="image"
href="/hero.avif"
imagesrcset="
hero-480.avif 480w,
hero-768.avif 768w,
hero-1080.avif 1080w
"
imagesizes="100vw"
/>

Explain how this improves LCP by 100–200ms.

---

Finally provide a **summary of expected performance improvements**:

LCP improvement
TBT reduction
bundle size reduction
rendering cost reduction

Target metrics:

LCP < 1.8s
TBT < 100ms
CLS ≈ 0
Mobile PageSpeed 95–100

Write the answer as a **technical performance implementation guide**.
