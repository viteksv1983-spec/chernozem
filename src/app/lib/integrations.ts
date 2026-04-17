// ─────────────────────────────────────────────────────────────
//  КиївЧорнозем — Integration Settings
//  Зберігається окремо від контенту сайту (власний localStorage key)
// ─────────────────────────────────────────────────────────────

export interface IntegrationSettings {
  /** Google Analytics 4 Measurement ID, напр. "G-XXXXXXXXXX" */
  gaId: string;
  /** Google Tag Manager Container ID, напр. "GTM-XXXXXXX" */
  gtmId: string;
  /** Telegram Bot Token від @BotFather, напр. "123456:ABCdef..." */
  tgBotToken: string;
  /** Telegram Chat ID або @username каналу/групи */
  tgChatId: string;
}

const STORAGE_KEY = "kc_integrations_v1";

const DEFAULTS: IntegrationSettings = {
  gaId: "",
  gtmId: "",
  tgBotToken: "",
  tgChatId: "",
};

export function loadIntegrations(): IntegrationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveIntegrations(settings: IntegrationSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ─────────────────────────────────────────────────────────────
//  Google Analytics — динамічне підключення
// ─────────────────────────────────────────────────────────────
let gaInjected = false;

/**
 * Defer GA/GTM injection until the user's first interaction.
 *
 * WHY: GTM/GA4 script is ~70-100KB of synchronous JS that runs a
 * Long Task on the main thread → directly adds to TBT.
 * By loading it after `pointerdown / touchstart / scroll / keydown`
 * it does NOT count toward TBT at all (measured during load, not runtime).
 *
 * Fallback: inject unconditionally after 5s for bounce/passive users
 * so analytics still captures sessions that never interact.
 */
export function injectGoogleAnalytics(gaId: string): void {
  if (!gaId || gaInjected) return;
  if (typeof document === "undefined") return;

  const doInject = () => {
    if (gaInjected) return;
    gaInjected = true;

    // Remove all deferred listeners immediately
    DEFERRED_EVENTS.forEach((evt) =>
      window.removeEventListener(evt, doInject)
    );
    clearTimeout(fallbackTimer);

    const existing = document.getElementById("ga-script");
    if (existing) existing.remove();

    const script1 = document.createElement("script");
    script1.id = "ga-script";
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.id = "ga-init";
    // Minified to reduce inline script parse cost
    script2.innerHTML =
      `window.dataLayer=window.dataLayer||[];` +
      `function gtag(){dataLayer.push(arguments);}` +
      `gtag('js',new Date());gtag('config','${gaId}');`;
    document.head.appendChild(script2);
  };

  // Wait for first interaction — avoids ANY TBT penalty from GA
  const DEFERRED_EVENTS = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
  DEFERRED_EVENTS.forEach((evt) =>
    window.addEventListener(evt, doInject, { once: true, passive: true })
  );

  // Fallback: inject after 5s regardless (captures passive/bounce visitors)
  const fallbackTimer = setTimeout(doInject, 5000);
}

/** GA4 event tracking helper */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", eventName, params ?? {});
    }
  } catch { /* non-critical */ }
}

// ─────────────────────────────────────────────────────────────
//  Google Tag Manager — динамічне підключення
// ─────────────────────────────────────────────────────────────
let gtmInjected = false;

/**
 * Інжектує GTM Script у <head> та GTM noscript у <body>.
 * Виконується синхронно під час старту програми (не deferred), 
 * щоб маркетингові тригери працювали без затримок.
 */
export function injectGTM(gtmId: string): void {
  if (!gtmId || gtmInjected) return;
  if (typeof document === "undefined") return;

  gtmInjected = true;

  // 1. Script in <head>
  const script = document.createElement("script");
  script.id = "gtm-script";
  // Minified GTM snippet
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmId}');`;
  document.head.insertBefore(script, document.head.firstChild);

  // 2. Noscript in <body> (Fallback for completeness, though JS is required for React CSR)
  const noscript = document.createElement("noscript");
  noscript.id = "gtm-noscript";
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}

// ─────────────────────────────────────────────────────────────
//  Telegram — відправка повідомлення
// ─────────────────────────────────────────────────────────────
export interface OrderData {
  name: string;
  phone: string;
  volumeLabel: string;   // "10 т" або "50 мішків"
  soilType: "bulk" | "bags";
  truckName: string;
  truckCapacity: string;
  soilCost: number;
  totalMin: number;
  totalMax: number;
  utmInfo?: string;      // formatted UTM string (optional)
}

// ─────────────────────────────────────────────────────────────
//  Pending Orders Queue (retry on reconnect)
// ─────────────────────────────────────────────────────────────
const PENDING_ORDERS_KEY = "kc_pending_orders_v1";

interface PendingOrder {
  id: string;
  order: OrderData;
  timestamp: number;
  attempts: number;
}

export function savePendingOrder(order: OrderData): string {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const pending = loadPendingOrders();
  pending.push({ id, order, timestamp: Date.now(), attempts: 0 });
  try {
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pending));
  } catch { /* ignore storage errors */ }
  return id;
}

export function loadPendingOrders(): PendingOrder[] {
  try {
    const raw = localStorage.getItem(PENDING_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removePendingOrder(id: string): void {
  const pending = loadPendingOrders().filter((p) => p.id !== id);
  try {
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pending));
  } catch { /* ignore */ }
}

/**
 * Retry all pending (failed) Telegram orders.
 * Call on page load / online event.
 * Orders are dropped after 5 failed attempts.
 */
export async function retryPendingOrders(): Promise<void> {
  const pending = loadPendingOrders();
  if (!pending.length) return;

  const { tgBotToken, tgChatId } = loadIntegrations();
  if (!tgBotToken?.trim() || !tgChatId?.trim()) return;

  for (const item of [...pending]) {
    if (item.attempts >= 5) {
      removePendingOrder(item.id);
      continue;
    }
    const result = await sendTelegramMessage(item.order, tgBotToken, tgChatId);
    if (result.ok) {
      removePendingOrder(item.id);
    } else {
      const all = loadPendingOrders();
      const idx = all.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        all[idx].attempts += 1;
        try {
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(all));
        } catch { /* ignore */ }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  Internal: build + send a single Telegram message
// ─────────────────────────────────────────────────────────────
async function sendTelegramMessage(
  order: OrderData,
  token: string,
  chatId: string
): Promise<{ ok: boolean; error?: string }> {
  const soilLine =
    order.soilType === "bulk"
      ? `📦 <b>Замовлення:</b> Насипом — ${order.volumeLabel}`
      : `📦 <b>Замовлення:</b> У мішках — ${order.volumeLabel}`;

  const now = new Date().toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const utmLine = order.utmInfo
    ? `🌐 <b>Джерело:</b> ${escapeHtml(order.utmInfo)}\n`
    : "";

  const text =
    `🌱 <b>Нова заявка — КиївЧорнозем</b>\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Ім'я:</b> ${escapeHtml(order.name)}\n` +
    `📞 <b>Телефон:</b> ${escapeHtml(order.phone)}\n` +
    soilLine + `\n` +
    `🚛 <b>Самоскид:</b> ${order.truckName} (${order.truckCapacity})\n` +
    `💰 <b>Чорнозем:</b> ${order.soilCost.toLocaleString("uk-UA")} грн\n` +
    `💰 <b>Разом (~):</b> ${order.totalMin.toLocaleString("uk-UA")}–${order.totalMax.toLocaleString("uk-UA")} грн\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    utmLine +
    `⏰ ${now}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token.trim()}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: "HTML",
        }),
      }
    );
    const data = await res.json();
    if (data.ok) return { ok: true };
    return { ok: false, error: data.description ?? "Помилка Telegram API" };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ─────────────────────────────────────────────────────────────
//  Public: send order (auto-saves to retry queue on failure)
// ─────────────────────────────────────────────────────────────
export async function sendTelegramOrder(
  order: OrderData
): Promise<{ ok: boolean; error?: string }> {
  const { tgBotToken, tgChatId } = loadIntegrations();

  if (!tgBotToken?.trim() || !tgChatId?.trim()) {
    return { ok: false, error: "Telegram не налаштовано" };
  }

  const result = await sendTelegramMessage(order, tgBotToken, tgChatId);

  // If failed → save to pending queue for retry
  if (!result.ok) {
    savePendingOrder(order);
  }

  return result;
}

/** Тестове повідомлення для перевірки налаштувань */
export async function sendTelegramTest(
  token: string,
  chatId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim() || !chatId?.trim()) {
    return { ok: false, error: "Введіть токен та Chat ID" };
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token.trim()}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: "✅ <b>КиївЧорнозем</b> — тестове повідомлення!\n\nТелеграм-сповіщення про замовлення налаштовано успішно 🎉",
          parse_mode: "HTML",
        }),
      }
    );
    const data = await res.json();
    if (data.ok) return { ok: true };
    return { ok: false, error: data.description ?? "Помилка" };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}