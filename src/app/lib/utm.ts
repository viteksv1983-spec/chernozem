// ═══════════════════════════════════════════════════════════
//  UTM Parameter Tracking
//  Captures UTM params from URL on page load, saves to
//  sessionStorage so they persist through the funnel.
//  Passed to Telegram on order submission.
// ═══════════════════════════════════════════════════════════

const UTM_KEY = 'kc_utm_v1';

export interface UtmParams {
  source?:   string; // utm_source
  medium?:   string; // utm_medium
  campaign?: string; // utm_campaign
  term?:     string; // utm_term
  content?:  string; // utm_content
  ref?:      string; // document.referrer hostname (fallback)
  gclid?:    string; // Google Ads click ID
  fbclid?:   string; // Facebook click ID
}

/** Call once on SitePage mount — reads URL params and stores them */
export function captureUtm(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);

    const utm: UtmParams = {};

    const source   = params.get('utm_source');
    const medium   = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const term     = params.get('utm_term');
    const content  = params.get('utm_content');
    const gclid    = params.get('gclid');
    const fbclid   = params.get('fbclid');

    if (source)   utm.source   = source;
    if (medium)   utm.medium   = medium;
    if (campaign) utm.campaign = campaign;
    if (term)     utm.term     = term;
    if (content)  utm.content  = content;
    if (gclid)    utm.gclid   = gclid;
    if (fbclid)   utm.fbclid  = fbclid;

    // Capture referrer if no explicit source
    if (!source && document.referrer) {
      try {
        const ref = new URL(document.referrer).hostname;
        if (ref && ref !== window.location.hostname) utm.ref = ref;
      } catch { /* ignore */ }
    }

    // Only overwrite stored UTM if we have new data (don't overwrite on internal nav)
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch { /* ignore errors — non-critical */ }
}

/** Returns stored UTM params */
export function getUtm(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Formats UTM params for Telegram message (one line) */
export function utmToString(utm: UtmParams): string {
  if (!utm || Object.keys(utm).length === 0) return '';

  const parts: string[] = [];

  if (utm.source)   parts.push(`джерело: ${utm.source}`);
  if (utm.medium)   parts.push(`medium: ${utm.medium}`);
  if (utm.campaign) parts.push(`кампанія: ${utm.campaign}`);
  if (utm.gclid)    parts.push('Google Ads');
  if (utm.fbclid)   parts.push('Facebook Ads');
  if (utm.ref)      parts.push(`реф: ${utm.ref}`);

  return parts.join(' · ');
}
