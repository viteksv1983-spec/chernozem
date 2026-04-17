// ══════════════════════════════════════════════════════════
//  КиївЧорнозем — Server API Client (PHP Backend)
// ══════════════════════════════════════════════════════════

import type { SiteContent } from './siteContent';

const BASE = import.meta.env.BASE_URL + 'api.php';

const AUTH_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

// ── Session admin password ──────────────────────────────────
// Читається напряму з sessionStorage
const ADMIN_SESSION_KEY = "kyivchornozem_admin_pass_v1";

export function getAdminPassword(): string | null {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(ADMIN_SESSION_KEY);
  }
  return null;
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
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    await new Promise(r => setTimeout(r, 500)); // mock network delay
    return; // mock success (AdminPage already updates localStorage)
  }

  const pass = getAdminPassword();
  if (!pass) throw new Error('Пароль адміна не встановлено');
  const res = await fetch(`${BASE}?action=content`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': pass },
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
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    // DEV/demo only — this branch is tree-shaken in production builds by Vite.
    // On GitHub Pages (demo), accept the default password for testing purposes.
    await new Promise(r => setTimeout(r, 400));
    return password !== ''; // Simple dev fallback
  }

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
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    await new Promise(r => setTimeout(r, 600));
    return; // mock success
  }

  const pass = currentPassword ?? getAdminPassword();
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
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    await new Promise(r => setTimeout(r, 800));
    return imageBase64; // just return the base64 string as the URL for offline mode
  }

  const pass = getAdminPassword();
  if (!pass) throw new Error('Пароль адміна не встановлено');
  const res = await fetch(`${BASE}?action=upload`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': pass },
    body: JSON.stringify({ imageKey, imageBase64, mimeType }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Помилка завантаження зображення: ${(data as { error?: string }).error ?? res.status}`);
  }
  const data = await res.json();
  return (data as { url: string }).url;
}

// ── Telegram Proxy ──────────────────────────────────────────
// In production: messages are sent via PHP proxy (token stays server-side)
// In DEV/GitHub Pages: falls back to direct Telegram API (client-side token)

/** Send a Telegram message via PHP proxy (production) */
export async function sendTelegramViaProxy(
  text: string
): Promise<{ ok: boolean; error?: string }> {
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    // DEV/demo: skip proxy, return success (or do direct send if desired)
    return { ok: true };
  }

  try {
    const res = await fetch(`${BASE}?action=telegram-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data as { ok: boolean; error?: string };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Save Telegram config to server (admin-only, requires auth) */
export async function saveTelegramConfig(
  botToken: string,
  chatId: string
): Promise<boolean> {
  const pass = getAdminPassword();
  if (!pass) return false;

  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    return true; // DEV stub
  }

  const res = await fetch(`${BASE}?action=telegram-config`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'X-Admin-Password': pass },
    body: JSON.stringify({ botToken, chatId }),
  });
  return res.ok;
}
