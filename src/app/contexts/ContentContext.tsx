import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  SiteContent,
  loadContent,
  loadImagesAsync,
  saveContent,
  DEFAULT_CONTENT,
} from "../lib/siteContent";
import * as api from "../lib/api";

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
  useEffect(() => {
    // Step 0: apply localStorage snapshot immediately after hydration
    const localSnapshot = loadContent();
    if (localSnapshot !== DEFAULT_CONTENT) {
      setContent(localSnapshot);
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

        // Злиття зображень: пріоритет за незбереженими локальними (data:)
        const scImages = sc.images || {};
        const lImages = localImages || prev.images || {};
        const images = { ...scImages };
        
        for (const [k, v] of Object.entries(lImages)) {
          if (typeof v === "string" && v.startsWith("data:")) {
            images[k as keyof typeof images] = v;
          }
        }

        return { ...sc, images };
      });
    };

    loadImagesAsync()
      .then((images) => { localImages = images; })
      .catch(console.warn)
      .finally(tryCommit);

    api.fetchContent()
      .then((sc) => {
        if (sc) {
          // ── Міграція: оновити badge ТІЛЬКИ якщо це відоме старе значення ──
          const OLD_BADGE_VALUES = [
            "Прямі поставки чорнозему",
            "Прямі поставки чорнозему • Київ",
            "Прямі поставки чорнозему • Київ та Київська область",
            "Прямі поставки чорнозему • Київ та область",
          ];
          if (sc.hero?.badge) {
            let badge = sc.hero.badge;
            if (OLD_BADGE_VALUES.includes(badge)) {
              badge = "Прямі поставки чорнозему • Київ та область";
            }
            if (/клієнтів/i.test(badge)) {
              badge = badge.split(/\s*[·•]\s*/)
                .filter(seg => !/клієнтів/i.test(seg))
                .join(" • ")
                .trim() || "Прямі поставки чорнозему • Київ та область";
            }
            sc = { ...sc, hero: { ...sc.hero, badge } };
          }
          serverContent = sc;
        }
      })
      .catch((e) => {
        console.warn("[ContentContext] Сервер недоступний, використовується fallback локальних даних:", e);
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
