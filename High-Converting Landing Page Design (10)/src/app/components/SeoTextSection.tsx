/**
 * SeoTextSection
 * ──────────────
 * Bottom-of-page editorial block targeting informational & long-tail queries.
 *
 * Heading hierarchy (continues from page context):
 *   H1  — Hero (main page heading)
 *   H2s — Section headings (Benefits, Calculator, Pricing, etc.)
 *   H2  — This section heading  ← one more H2, correct placement
 *   H3s — Four sub-topics within this section
 *
 * Design: light warm background, editorial typography, max-width 900px
 * for optimal reading line-length (~70 chars). Subtle, not intrusive.
 *
 * Visibility: controlled by content.seoText.enabled (admin toggle).
 */

import { useContent } from "../contexts/ContentContext";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, -apple-system, sans-serif";

export function SeoTextSection() {
  const { content } = useContent();
  const st = content.seoText;

  if (!st?.enabled) return null;

  return (
    <section
      id="seo-text"
      aria-label="Інформація про чорнозем"
      style={{
        background: "#f5f0e8",
        borderTop: "1px solid rgba(160,130,100,0.15)",
        padding: "72px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* ── Decorative leaf divider ── */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(58,122,87,0.20)" }} />
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0, opacity: 0.55 }}
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8l4 4-2 4zm4-2h-2l-2-4 4-4v8z"
              fill="#3a7a57"
            />
            <path
              d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z"
              stroke="#3a7a57"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="3" fill="#3a7a57" opacity="0.5" />
          </svg>
          <div style={{ flex: 1, height: "1px", background: "rgba(58,122,87,0.20)" }} />
        </div>

        {/* ── H2 ── */}
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(22px, 3.5vw, 34px)",
            fontWeight: 700,
            color: "#1a0f07",
            lineHeight: 1.18,
            letterSpacing: "-0.5px",
            marginBottom: "20px",
          }}
        >
          {st.h2}
        </h2>

        {/* ── Intro paragraph ── */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "#4a3728",
            lineHeight: 1.82,
            marginBottom: "48px",
            maxWidth: "820px",
          }}
        >
          {st.intro}
        </p>

        {/* ── Four H3 blocks ── */}
        {[
          { h3: st.h3_1, body: st.body1 },
          { h3: st.h3_2, body: st.body2 },
          { h3: st.h3_3, body: st.body3 },
          { h3: st.h3_4, body: st.body4 },
        ].map(({ h3, body }, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: idx < 3 ? "40px" : "0",
              paddingBottom: idx < 3 ? "40px" : "0",
              borderBottom: idx < 3 ? "1px solid rgba(160,130,100,0.18)" : "none",
            }}
          >
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(17px, 2.2vw, 22px)",
                fontWeight: 700,
                color: "#2a1a0e",
                lineHeight: 1.25,
                letterSpacing: "-0.2px",
                marginBottom: "14px",
              }}
            >
              {h3}
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: "clamp(14px, 1.65vw, 16px)",
                color: "#5a4535",
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          #seo-text {
            padding: 52px 16px 60px !important;
          }
        }
      `}</style>
    </section>
  );
}
