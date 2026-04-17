// ══════════════════════════════════════════════════════════
//  КиївЧорнозем — Server API Client (PHP Backend)
// ══════════════════════════════════════════════════════════

import type { SiteContent } from './siteContent';

const BASE = import.meta.env.BASE_URL + 'api.php';

const AUTH_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

// ── Session admin password (module-level) ────────────────────
// Встановлюється при логіні адміна, очищається при виході.
let _adminPassword: string | null = null;

export function setAdminPassword(p: string | null): void {
  _adminPassword = p;
}

export function getAdminPassword(): string | null {
  return _adminPassword;
}

// ── Content ──────────────────────────────────────────────────

export async function fetchContent(): Promise<SiteContent | null> {
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    try {
      const devRes = await fetch(import.meta.env.BASE_URL + 'data/content.json', { cache: 'no-store' });
      if (devRes.ok) {
         const devData = await devRes.json();
         // our static extraction yields the raw object
         return (devData as SiteContent);
      }
    } catch(e) {
      console.warn("Dev mode JSON fetch failed", e);
    }
  }

  const res = await fetch(`${BASE}?action=content`, { headers: AUTH_HEADERS, cache: 'no-store' });
  if (!res.ok) throw new Error(`Помилка завантаження контенту: ${res.status}`);
  
  // if Vite raw PHP returns, json() will throw
  const data = await res.json();
  return (data.content as SiteContent) ?? null;
}

/** Зберегти контент на сервері. Потрібен пароль адміна. */
export async function saveContent(content: SiteContent): Promise<void> {
  if (!_adminPassword) throw new Error('Пароль адміна не встановлено');
  const res = await fetch(`${BASE}?action=content`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': _adminPassword },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Помилка збереження: ${(data as { error?: string }).error ?? res.status}`);
  }
}

// ── Admin auth ───────────────────────────────────────────────

/** Перевірити пароль адміна на сервері */
export async function verifyPassword(password: string): Promise<boolean> {
  const res = await fetch(`${BASE}?action=verify`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(`Помилка перевірки пароля: ${res.status}`);
  const data = await res.json();
  return (data as { valid: boolean }).valid === true;
}

/** Змінити пароль адміна */
export async function changePassword(newPassword: string, currentPassword?: string): Promise<void> {
  const pass = currentPassword ?? _adminPassword;
  if (!pass) throw new Error('Пароль адміна не встановлено');
  const res = await fetch(`${BASE}?action=change-password`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': pass },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Помилка зміни пароля: ${(data as { error?: string }).error ?? res.status}`);
  }
}

// ── Image upload ─────────────────────────────────────────────

/**
 * Завантажити зображення на локальний сервер
 * @param imageKey  — назва слота (напр. "heroPhoto")
 * @param imageBase64 — data URL зображення
 * @param mimeType    — MIME-тип (напр. "image/webp")
 * @returns url зображення
 */
export async function uploadImage(
  imageKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  if (!_adminPassword) throw new Error('Пароль адміна не встановлено');
  const res = await fetch(`${BASE}?action=upload`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': _adminPassword },
    body: JSON.stringify({ imageKey, imageBase64, mimeType }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Помилка завантаження зображення: ${(data as { error?: string }).error ?? res.status}`);
  }
  const data = await res.json();
  return (data as { url: string }).url;
}
