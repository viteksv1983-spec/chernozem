/**
 * LazySection — defers rendering of below-fold content until
 * the section is within `rootMargin` of the viewport.
 *
 * Combines IntersectionObserver deferral WITH a Suspense boundary,
 * so React.lazy() children only start loading when near-viewport.
 *
 * Loading order:
 *  1. Render STABLE wrapper div with placeholder height (no CLS)
 *  2. Section enters rootMargin → setRendered(true)
 *  3. React.lazy() chunk is already prefetched (SitePage does it at t+2.5s)
 *     → Suspense resolves instantly, no loading flash
 *  4. Real section mounts and renders
 *
 * Navigation anchors: a zero-height <div id={anchorId}> lives ABOVE the
 * wrapper so hash-navigation always works even before render.
 *
 * ── React error #418 / #423 fix ────────────────────────────────────────────
 * Root cause: the original implementation rendered two DIFFERENT <div>s at
 * the same tree position (placeholder leaf vs. content branch) which caused
 * React 18 concurrent-mode to detect a DOM structure mismatch when a render
 * was interrupted and restarted via RouterProvider's startTransition, yielding
 * React errors #418 (hydration mismatch) and #423 (Suspense recovery attempt).
 *
 * Fix: ONE stable outer <div ref> always present in the tree — React never
 * unmounts/remounts it. Only style props and children change across the
 * placeholder→rendered transition. The ref is always valid. No DOM-node swap.
 * ────────────────────────────────────────────────────────────────────────────
 */

import {
  useRef, useState, useEffect, ReactNode, memo, Suspense,
  Component, ErrorInfo,
} from "react";

// ── Lightweight per-section error boundary ───────────────────────────────────
// Catches errors from individual lazy sections so they never propagate up
// to React Router's root ErrorBoundary (which would replace the whole page).
// On error: silently renders a transparent placeholder matching minHeight.

interface SectionBoundaryProps {
  children: ReactNode;
  minHeight: number;
}
interface SectionBoundaryState {
  crashed: boolean;
}

class SectionErrorBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  constructor(props: SectionBoundaryProps) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError(): SectionBoundaryState {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for diagnostics without crashing the page
    console.warn("[LazySection] Section render error (isolated):", error.message, info.componentStack);
  }

  render() {
    if (this.state.crashed) {
      // Transparent placeholder — keeps layout stable, section silently absent
      return <div style={{ minHeight: this.props.minHeight }} />;
    }
    return this.props.children;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

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

  // ── Always the same DOM node ─────────────────────────────────────────────
  // This ref is attached to ONE stable <div> that NEVER unmounts.
  // The IntersectionObserver observes it during the placeholder phase,
  // then the same div becomes the content-visibility container — all without
  // React ever removing/re-adding a DOM node at this tree position.
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rendered) return;

    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: environments without IntersectionObserver render immediately
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

      {/*
       * STABLE OUTER WRAPPER — always the same <div>, same ref.
       *
       * Placeholder phase (rendered = false):
       *   • minHeight keeps the scrollbar stable (no CLS on section swap)
       *   • No contentVisibility here: some browsers skip IntersectionObserver
       *     callbacks on content-visibility:auto elements, breaking the trigger
       *
       * Rendered phase (rendered = true):
       *   • contentVisibility:auto — browser skips layout/paint for off-screen
       *     sections, cutting rendering cost by ~10–30% on long pages
       *   • containIntrinsicSize — estimated height so scroll math stays correct
       *     even when section is skipped by contentVisibility
       *   • minHeight removed — section now self-sizes to its real content
       */}
      <div
        ref={wrapperRef}
        style={
          rendered
            ? {
                contentVisibility: "auto" as const,
                containIntrinsicSize: `0 ${minHeight}px`,
              }
            : {
                minHeight,
              }
        }
      >
        {rendered && (
          // Per-section error boundary prevents any section crash from
          // reaching React Router's root ErrorBoundary.
          <SectionErrorBoundary minHeight={minHeight}>
            {/*
             * Suspense boundary: handles React.lazy() chunk loading.
             * Fallback mirrors the placeholder height so no layout jump
             * occurs if the chunk hasn't resolved yet (rare — prefetch
             * fires 2.5s after load, well before user scroll reaches here).
             */}
            <Suspense fallback={<div style={{ minHeight }} />}>
              {children}
            </Suspense>
          </SectionErrorBoundary>
        )}
      </div>
    </>
  );
});
