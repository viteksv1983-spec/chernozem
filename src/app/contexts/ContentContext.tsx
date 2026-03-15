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
  // Початкове значення — з localStorage (SSR-safe, без затримки)
  const [content, setContent] = useState<SiteContent>(loadContent);

  // ── Крок 1+2 (об'єднано): завантажити зображення + серверний контент
  //    і застосувати ОДНИМ setState.
  //
  //    Раніше: 2 окремих useEffect → 2 setContent → 2 повних ре-рендери
  //    всього дерева (Hero + Header + всі секції).
  //    Тепер: обидва джерела чекають один одного → 1 setState → 1 ре-рендер.
  //    Різниця на мобільному: -15-40ms TBT.
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let localImages: SiteContent["images"] | null = null;
    let serverContent: SiteContent | null = null;
    let pendingCount = 2;

    const tryCommit = () => {
      pendingCount--;
      if (pendingCount > 0) return; // ще чекаємо другого джерела

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