// ═══════════════════════════════════════════════════════════
//  Smart Image Compression Pipeline
//  WebP-first → multi-pass quality → target KB
//  Fallback chain: WebP → JPEG → JPEG low quality
// ═══════════════════════════════════════════════════════════

export interface CompressionResult {
  dataUrl:         string;
  format:          "webp" | "jpeg";
  originalBytes:   number;
  compressedBytes: number;
  /** How many times smaller vs original (e.g. 4.2) */
  ratio:           number;
  /** Final quality value used (0–1) */
  quality:         number;
}

// ────────────────────────────────────────────────────────────
//  Feature detection (cached, synchronous)
// ────────────────────────────────────────────────────────────
let _webpSupported: boolean | null = null;

function supportsWebP(): boolean {
  if (_webpSupported !== null) return _webpSupported;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    _webpSupported = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    _webpSupported = false;
  }
  return _webpSupported;
}

// ────────────────────────────────────────────────────────────
//  Draw image on canvas and try to encode at given quality
// ────────────────────────────────────────────────────────────
function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: "image/webp" | "image/jpeg",
  quality: number,
): string {
  return canvas.toDataURL(mimeType, quality);
}

function dataUrlBytes(dataUrl: string): number {
  // base64 encodes 3 bytes as 4 chars
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

// ────────────────────────────────────────────────────────────
//  Scale width/height to fit within maxW × maxH
// ────────────────────────────────────────────────────────────
function scaleDims(
  w: number, h: number,
  maxW: number, maxH: number,
): [number, number] {
  if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
  if (h > maxH) { w = Math.round((w * maxH) / h); h = maxH; }
  return [w, h];
}

// ────────────────────────────────────────────────────────────
//  Main entry: compress to ≤ targetKB, preferring WebP
// ────────────────────────────────────────────────────────────
export function compressImage(
  file: File,
  maxWidth  = 1400,
  maxHeight = 1050,
  targetKB  = 160,        // target compressed size in KB
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не вдалося прочитати файл"));
    reader.onload  = (evt) => {
      const src = evt.target?.result as string;
      const originalBytes = dataUrlBytes(src);

      const img = new Image();
      img.onerror = () => reject(new Error("Не вдалося декодувати зображення"));
      img.onload  = () => {
        const [w, h] = scaleDims(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        // White background (needed for JPEG fallback transparency)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const targetBytes = targetKB * 1024;
        const useWebP     = supportsWebP();

        // Quality ladder — try from best to most aggressive
        const qualities = [0.88, 0.80, 0.72, 0.64, 0.55, 0.46, 0.38];

        let bestDataUrl = "";
        let usedQuality = qualities[0];
        let usedFormat: "webp" | "jpeg" = useWebP ? "webp" : "jpeg";

        for (const q of qualities) {
          const mime: "image/webp" | "image/jpeg" = useWebP ? "image/webp" : "image/jpeg";
          const candidate = encodeCanvas(canvas, mime, q);
          const bytes     = dataUrlBytes(candidate);

          bestDataUrl = candidate;
          usedQuality = q;
          usedFormat  = useWebP ? "webp" : "jpeg";

          if (bytes <= targetBytes) break; // found a good enough quality
        }

        // If WebP and still too large at lowest quality, try JPEG as last resort
        if (useWebP && dataUrlBytes(bestDataUrl) > targetBytes * 1.3) {
          for (const q of [0.65, 0.50, 0.38]) {
            const candidate = encodeCanvas(canvas, "image/jpeg", q);
            if (dataUrlBytes(candidate) <= targetBytes * 1.2) {
              bestDataUrl = candidate;
              usedQuality = q;
              usedFormat  = "jpeg";
              break;
            }
          }
        }

        const compressedBytes = dataUrlBytes(bestDataUrl);
        const ratio = originalBytes > 0 ? originalBytes / compressedBytes : 1;

        resolve({
          dataUrl:         bestDataUrl,
          format:          usedFormat,
          originalBytes,
          compressedBytes,
          ratio,
          quality:         usedQuality,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

// ────────────────────────────────────────────────────────────
//  Helpers for UI display
// ────────────────────────────────────────────────────────────

/** Human-readable byte count */
export function formatBytes(bytes: number): string {
  if (bytes < 1024)           return `${bytes} Б`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/** Human-readable size of a base64 data-URL string */
export function base64Size(dataUrl: string): string {
  return formatBytes(dataUrlBytes(dataUrl));
}

// ────────────────────────────────────────────────────────────
//  Compress an already-loaded data URL (or any fetchable URL)
//  via canvas — same pipeline as compressImage but no FileReader
// ────────────────────────────────────────────────────────────
export function compressDataUrl(
  src: string,
  maxWidth  = 1400,
  maxHeight = 1050,
  targetKB  = 200,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => resolve(src);
    img.onload = () => {
      const [w, h] = scaleDims(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const targetBytes = targetKB * 1024;
      const useWebP     = supportsWebP();
      const qualities   = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

      let result = "";
      for (const q of qualities) {
        const mime: "image/webp" | "image/jpeg" = useWebP ? "image/webp" : "image/jpeg";
        result = canvas.toDataURL(mime, q);
        if (dataUrlBytes(result) <= targetBytes) break;
      }
      // JPEG fallback if WebP still too large
      if (useWebP && dataUrlBytes(result) > targetBytes * 1.3) {
        for (const q of [0.60, 0.45, 0.35]) {
          const cand = canvas.toDataURL("image/jpeg", q);
          if (dataUrlBytes(cand) <= targetBytes * 1.2) { result = cand; break; }
        }
      }
      resolve(result || src);
    };
    img.src = src;
  });
}

/** Estimate total localStorage usage */
export function estimateStorageUsed(): string {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    total += key.length + (localStorage.getItem(key)?.length ?? 0);
  }
  const mb = (total * 2) / (1024 * 1024); // UTF-16 → 2 bytes per char
  return `${mb.toFixed(1)} МБ`;
}