import { useEffect, useRef, useState } from "react";

interface TruckImageCanvasProps {
  src: string;
  alt: string;
  height?: number;
  padding?: number;
  whiteThreshold?: number;
  filter?: string;
}

export function TruckImageCanvas({
  src,
  alt,
  height = 200,
  padding = 10,
  whiteThreshold = 238,
  filter = "contrast(1.12) saturate(1.10) brightness(1.02) drop-shadow(0 4px 14px rgba(0,0,0,0.18))",
}: TruckImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgCacheRef = useRef<HTMLImageElement | null>(null);
  const boundsRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  function detectBounds(
    imgEl: HTMLImageElement,
    srcW: number,
    srcH: number,
    threshold: number
  ): { x: number; y: number; w: number; h: number } {
    const tmp = document.createElement("canvas");
    tmp.width = srcW;
    tmp.height = srcH;
    const tCtx = tmp.getContext("2d", { willReadFrequently: true })!;
    tCtx.drawImage(imgEl, 0, 0, srcW, srcH);
    const { data } = tCtx.getImageData(0, 0, srcW, srcH);
    let minX = srcW, maxX = 0, minY = srcH, maxY = 0;
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const i = (y * srcW + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 15 || (r >= threshold && g >= threshold && b >= threshold)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (minX > maxX || minY > maxY) return { x: 0, y: 0, w: srcW, h: srcH };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  // Paint the already-loaded image onto the canvas — no image loading, no flicker
  function paint(canvasEl: HTMLCanvasElement, img: HTMLImageElement) {
    const bounds = boundsRef.current;
    if (!bounds) return;

    // Use the natural (un-scaled) container width to avoid reading scaled size
    const parent = canvasEl.parentElement;
    if (!parent) return;

    // getBoundingClientRect includes CSS transform scale — use offsetWidth instead
    const cssW = parent.offsetWidth || 280;
    const cssH = height;

    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = Math.round(cssW * dpr);
    canvasEl.height = Math.round(cssH * dpr);
    canvasEl.style.width = `${cssW}px`;
    canvasEl.style.height = `${cssH}px`;

    const ctx = canvasEl.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);

    const px = Math.round(padding);
    const { x, y, w, h } = bounds;
    const bx = Math.max(0, x - px);
    const by = Math.max(0, y - px);
    const bw = Math.min(img.naturalWidth - bx, w + px * 2);
    const bh = Math.min(img.naturalHeight - by, h + px * 2);

    const breathe = 8;
    const scale = Math.min((cssW - breathe * 2) / bw, (cssH - breathe * 2) / bh);
    const drawW = bw * scale;
    const drawH = bh * scale;
    const drawX = (cssW - drawW) / 2;
    const drawY = (cssH - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.drawImage(img, bx, by, bw, bh, drawX, drawY, drawW, drawH);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoaded(false);
    setError(false);
    imgCacheRef.current = null;
    boundsRef.current = null;

    const img = new Image();
    img.onload = () => {
      try {
        boundsRef.current = detectBounds(img, img.naturalWidth, img.naturalHeight, whiteThreshold);
      } catch {
        boundsRef.current = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      }
      imgCacheRef.current = img;
      if (canvasRef.current) {
        paint(canvasRef.current, img);
        setLoaded(true);
      }
    };
    img.onerror = () => setError(true);
    img.src = src;

    // ResizeObserver: repaint only — no image reload, no flicker
    // Debounced so rapid scale animations don't spam repaints
    const observer = new ResizeObserver(() => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (canvasRef.current && imgCacheRef.current && boundsRef.current) {
          paint(canvasRef.current, imgCacheRef.current);
        }
      }, 60);
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      observer.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, height, padding, whiteThreshold]);

  if (error) {
    return (
      <div style={{ width: "100%", height: `${height}px`, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", filter }}>
        <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: `${height}px`, background: "#ffffff", position: "relative", overflow: "hidden", filter }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, #f0ece6 25%, #e8e2da 50%, #f0ece6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-label={alt}
        style={{ display: "block", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
      />
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
