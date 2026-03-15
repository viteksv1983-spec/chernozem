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

  // ── Крок 1: Завантажити зображення з IndexedDB (швидко, локально) ─────
  useEffect(() => {
    loadImagesAsync().then((images) => {
      setContent((prev) => {
        // Не перезаписувати якщо вже є серверні URL зображення
        const hasServerImages = Object.values(prev.images).some(
          (v) => typeof v === "string" && v.startsWith("http"),
        );
        if (hasServerImages) return prev;
        return { ...prev, images };
      });
    }).catch(console.warn);
  }, []);

  // ── Крок 2: Завантажити контент із сервера (авторитетно) ──────────────
  useEffect(() => {
    api.fetchContent()
      .then((serverContent) => {
        if (serverContent) {
          setContent((prev) => {
            // Якщо сервер не має зображень — зберегти локальні (міграція)
            const hasServerImages = Object.values(serverContent.images ?? {}).some(
              (v) => typeof v === "string" && v.length > 0,
            );
            const images = hasServerImages ? serverContent.images : prev.images;
            return { ...serverContent, images };
          });
        }
        // Якщо сервер повернув null — залишаємо localStorage-контент
      })
      .catch((e) => {
        console.warn("[ContentContext] Сервер недоступний, використовується localStorage:", e);
      });
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
