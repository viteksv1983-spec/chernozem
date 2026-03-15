/**
 * LazySection — defers rendering of below-fold content until
 * the section is within `rootMargin` of the viewport.
 *
 * Combines IntersectionObserver deferral WITH a Suspense boundary,
 * so React.lazy() children only start loading when near-viewport.
 *
 * Loading order:
 *  1. Render stable placeholder div (correct height → stable scrollbar)
 *  2. Section enters rootMargin → setRendered(true)
 *  3. React.lazy() chunk is already prefetched (SitePage does it at t+2.5s)
 *     → Suspense resolves instantly, no loading flash
 *  4. Real section mounts and renders
 *
 * Navigation anchors: a zero-height <div id={anchorId}> lives ABOVE the
 * placeholder so hash-navigation always works even before render.
 */

import { useRef, useState, useEffect, ReactNode, memo, Suspense } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Approximate section height — keeps scrollbar stable while deferred */
  minHeight?: number;
  /** Stable navigation anchor id */
  anchorId?: string;
  /** IntersectionObserver rootMargin — distance before viewport to start */
  rootMargin?: string;
}

export const LazySection = memo(function LazySection({
  children,
  minHeight = 600,
  anchorId,
  rootMargin = "500px",
}: LazySectionProps) {
  const [rendered, setRendered] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rendered) return;

    const el = placeholderRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRendered(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRendered(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rendered, rootMargin]);

  // Minimal stable placeholder while Suspense resolves lazy chunks
  const fallback = <div style={{ minHeight, background: "transparent" }} />;

  return (
    <>
      {/* Zero-height nav anchor — ALWAYS in DOM for hash links */}
      {anchorId && (
        <div
          id={anchorId}
          aria-hidden="true"
          style={{ height: 0, overflow: "hidden", pointerEvents: "none" }}
        />
      )}

      {rendered ? (
        /**
         * content-visibility: auto — instructs the browser to skip
         * layout, style recalc, and paint for content that is currently
         * off-screen. Once the section enters the viewport, the browser
         * renders it normally.
         *
         * contain-intrinsic-size: tells the browser the estimated height
         * of the section while it's off-screen, so it can accurately
         * calculate scroll height and position — prevents CLS/jump.
         *
         * Together these reduce rendering cost for all sections the user
         * has already scrolled past, and for sections rendered ahead of
         * the viewport. Chrome measures ~10-30% rendering speed improvement
         * on long pages.
         *
         * NOTE: only on rendered children, NOT the placeholder, because
         * the placeholder already uses the same property for deferred state.
         */
        <div
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: `0 ${minHeight}px`,
          }}
        >
          {/* Suspense boundary: handles React.lazy() chunks loading */}
          <Suspense fallback={fallback}>
            {children}
          </Suspense>
        </div>
      ) : (
        <div
          ref={placeholderRef}
          style={{
            minHeight,
            containIntrinsicSize: `0 ${minHeight}px`,
            contentVisibility: "auto",
          }}
        />
      )}
    </>
  );
});