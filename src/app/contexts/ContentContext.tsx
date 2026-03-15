import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  SiteContent,
  loadContent,
  loadImagesAsync,
  saveContent,
  DEFAULT_CONTENT,
} from "../lib/siteContent";
import * as api from "../lib/api";

// ── Encoding sanitizer ──────────────────────────────────────────────────────
// Supabase KV can silently corrupt Ukrainian characters (especially "і" U+0456)
// during save/load cycles, replacing them with U+FFFD (replacement character).
// This deep-walks all string values and removes/replaces the damage.
function sanitizeEncoding<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // Replace U+FFFD (replacement character) — common corruption artifact
    // In Ukrainian text, the missing char is almost always "і" (U+0456)
    // but we can't auto-guess, so we just strip the replacement chars.
    // Specific fixes for known corrupted phrases are handled in migrations below.
    return obj.replace(/\uFFFD/g, "") as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeEncoding) as T;
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = sanitizeEncoding(v);
    }
    return result as T;
  }
  return obj;
}

// ── Known corrupted text → correct text mapping ─────────────────────────────
// When a specific string was corrupted, we know exactly what it should be.
// This is more reliable than guessing from stripped U+FFFD positions.
const TEXT_FIXES: Array<[RegExp, string]> = [
  // "Чорнозем у мшках" (after U+FFFD stripped) → correct
  [/Чорнозем у м\s*шках/g, "Чорнозем у мішках"],
  // "є расований" → "Є фасований" (common after і/ф corruption)
  [/є рас\s*ваний/gi, "Є фасований"],
  // "фас\s*ваний" → "фасований" (if "о" was corrupted)  
  [/фас\s*ваний/gi, "фасований"],
  // "мшках по 50" → "мішках по 50"
  [/м\s*шках по/g, "мішках по"],
  // "грн\/мшок" → "грн/мішок"
  [/грн\s*\/\s*м\s*шок/g, "грн/мішок"],
  [/м\s*шок\b/g, "мішок"],
];

function applyTextFixes(str: string): string {
  let result = str;
  for (const [pattern, replacement] of TEXT_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function deepFixText<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return applyTextFixes(obj) as T;
  if (Array.isArray(obj)) return obj.map(deepFixText) as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = deepFixText(v);
    }
    return result as T;
  }
  return obj;
}

interface ContentContextValue {
  content: SiteContent;
  updateContent: (updater: (prev: SiteContent) => SiteContent) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextValue>({
  content: DEFAULT_CONTENT,
  updateContent: () => {},
  resetContent: () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  // ── Hydration-safe: завжди стартуємо з DEFAULT_CONTENT ──────────────────
  // SSR (renderToString) не має window/localStorage → повертає DEFAULT_CONTENT.
  // Щоб клієнтський first render ТОЧНО збігався з SSR-виводом, ми теж
  // стартуємо з DEFAULT_CONTENT. localStorage/сервер підвантажуються в useEffect.
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  // ── Крок 0+1+2: localStorage → зображення → серверний контент ──────────
  //
  //    Hydration safety: initial state = DEFAULT_CONTENT (matches SSR).
  //    Immediately after hydration, useEffect applies localStorage snapshot
  //    (synchronous read, no network), then batch-loads IDB images + server
  //    content and commits them in ONE setState.
  //
  //    Render timeline for returning visitor:
  //      Render 1: DEFAULT_CONTENT (hydration match ✅, ~0ms)
  //      Render 2: localStorage content + IDB images + server content (batch)
  //    For first-time visitor (no localStorage):
  //      Render 1: DEFAULT_CONTENT (hydration match ✅)
  //      Render 2: server content (when fetch completes)
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Step 0: apply localStorage snapshot immediately after hydration.
    // This is synchronous — no flash for returning visitors whose content
    // matches defaults (which is 99% of public site visitors).
    const localSnapshot = loadContent();

    // Only update if localStorage actually had custom content.
    // loadContent() returns DEFAULT_CONTENT by reference when storage is empty.
    if (localSnapshot !== DEFAULT_CONTENT) {
      setContent(deepFixText(sanitizeEncoding(localSnapshot)));
    }

    // Steps 1+2: batch-load IDB images + server content
    let localImages: SiteContent["images"] | null = null;
    let serverContent: SiteContent | null = null;
    let pendingCount = 2;

    const tryCommit = () => {
      pendingCount--;
      if (pendingCount > 0) return;

      setContent((prev) => {
        const sc = serverContent;

        if (!sc) {
          // Сервер недоступний → застосовуємо локальні зображення якщо є
          return localImages ? { ...prev, images: localImages } : prev;
        }

        // Якщо сервер є, перевіряємо чи є у нього зображення
        const hasServerImgs = Object.values(sc.images ?? {}).some(
          (v) => typeof v === "string" && v.length > 0
        );
        const images = hasServerImgs
          ? sc.images
          : (localImages ?? prev.images);

        return { ...sc, images };
      });
    };

    loadImagesAsync()
      .then((images) => { localImages = images; })
      .catch(console.warn)
      .finally(tryCommit);

    api.fetchContent()
      .then((sc) => {
        // ── Міграція: виправити старе значення "по Києву" → "по Києву та області" ──
        if (sc?.hero?.headlineLine2 === "по Києву") {
          sc = { ...sc, hero: { ...sc.hero, headlineLine2: "по Києву та області" } };
        }

        // ── Міграція: оновити badge ТІЛЬКИ якщо це відоме старе значення ──
        // Не чіпаємо якщо адмін свідомо встановив інший текст.
        const OLD_BADGE_VALUES = [
          "Прямі поставки чорнозему",
          "Прямі поставки чорнозему • Київ",
          "Прямі поставки чорнозему • Київ та Київська область",
        ];
        if (
          sc?.hero?.badge &&
          OLD_BADGE_VALUES.includes(sc.hero.badge)
        ) {
          sc = { ...sc, hero: { ...sc.hero, badge: "Прямі поставки чорнозему • Київ та область" } };
        }

        // ── Міграція: прибрати "Понад 2 000 клієнтів" з badge ──
        // Якщо badge містить сегмент з "клієнтів", видаляємо його
        // (розділювач " · " або " • ").
        if (sc?.hero?.badge && /клієнтів/i.test(sc.hero.badge)) {
          const cleaned = sc.hero.badge
            .split(/\s*[·•]\s*/)
            .filter((seg: string) => !/клієнтів/i.test(seg))
            .join(" • ")
            .trim();
          sc = { ...sc, hero: { ...sc.hero, badge: cleaned || "Прямі поставки чорнозему • Київ та область" } };
        }

        // ── Міграція: виправити повреждення кодування ──
        sc = sanitizeEncoding(sc);
        sc = deepFixText(sc);

        serverContent = sc;
      })
      .catch((e) => {
        console.warn("[ContentContext] Сервер недоступний, використовується localStorage:", e);
      })
      .finally(tryCommit);
  }, []);

  // ── Синхронізація між вкладками (зміни тексту в localStorage) ─────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "kyivchornozem_content") {
        const next = loadContent();
        setContent((prev) => ({ ...next, images: prev.images }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── updateContent: зберігає до localStorage/IDB (резервна копія) ──────
  // Збереження на сервер відбувається явно з AdminPage (handleSave)
  const updateContent = useCallback((updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const next = updater(prev);
      saveContent(next);
      return next;
    });
  }, []);

  const resetContent = useCallback(() => {
    saveContent(DEFAULT_CONTENT);
    setContent(DEFAULT_CONTENT);
  }, []);

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}