import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-Admin-Password"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Constants ────────────────────────────────────────────────────
const CONTENT_KEY          = "site_content_v1";
const ADMIN_HASH_KEY       = "admin_password_hash_v1";
const DEFAULT_ADMIN_PASS   = "admin2025";
const SALT                 = "kyivchornozem_2025";
const BUCKET_NAME          = "make-857b076b-images";

// ── Supabase client ──────────────────────────────────────────────
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ── Create storage bucket on startup ────────────────────────────
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: { name: string }) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME);
      if (error) console.log("Bucket create error:", error.message);
      else console.log("Created bucket:", BUCKET_NAME);
    } else {
      console.log("Bucket already exists:", BUCKET_NAME);
    }
  } catch (e) {
    console.log("Bucket setup error:", e);
  }
})();

// ── Helpers ──────────────────────────────────────────────────────
async function sha256hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyAdminPassword(password: string): Promise<boolean> {
  const inputHash = await sha256hex(password + SALT);
  const stored    = await kv.get<string>(ADMIN_HASH_KEY);
  if (stored) return inputHash === stored;
  const defaultHash = await sha256hex(DEFAULT_ADMIN_PASS + SALT);
  return inputHash === defaultHash;
}

// ── Health ───────────────────────────────────────────────────────
app.get("/make-server-857b076b/health", (c) => c.json({ status: "ok" }));

// ── GET content ──────────────────────────────────────────────────
app.get("/make-server-857b076b/content", async (c) => {
  try {
    const content = await kv.get(CONTENT_KEY);
    return c.json({ content: content ?? null });
  } catch (e) {
    console.log("Error loading content:", e);
    return c.json({ error: `Failed to load content: ${e}` }, 500);
  }
});

// ── POST content (save) ──────────────────────────────────────────
app.post("/make-server-857b076b/content", async (c) => {
  try {
    const adminPassword = c.req.header("X-Admin-Password");
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return c.json({ error: "Unauthorized: invalid admin password" }, 401);
    }
    const body = await c.req.json();
    await kv.set(CONTENT_KEY, body.content);
    return c.json({ success: true });
  } catch (e) {
    console.log("Error saving content:", e);
    return c.json({ error: `Failed to save content: ${e}` }, 500);
  }
});

// ── POST admin/verify ────────────────────────────────────────────
app.post("/make-server-857b076b/admin/verify", async (c) => {
  try {
    const { password } = await c.req.json();
    const valid = await verifyAdminPassword(password);
    return c.json({ valid });
  } catch (e) {
    console.log("Error verifying password:", e);
    return c.json({ error: `Verification error: ${e}` }, 500);
  }
});

// ── POST admin/change-password ───────────────────────────────────
app.post("/make-server-857b076b/admin/change-password", async (c) => {
  try {
    const adminPassword = c.req.header("X-Admin-Password");
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return c.json({ error: "Unauthorized: invalid admin password" }, 401);
    }
    const { newPassword } = await c.req.json();
    const hash = await sha256hex(newPassword + SALT);
    await kv.set(ADMIN_HASH_KEY, hash);
    return c.json({ success: true });
  } catch (e) {
    console.log("Error changing password:", e);
    return c.json({ error: `Failed to change password: ${e}` }, 500);
  }
});

// ── POST images/upload ───────────────────────────────────────────
app.post("/make-server-857b076b/images/upload", async (c) => {
  try {
    const adminPassword = c.req.header("X-Admin-Password");
    if (!adminPassword || !(await verifyAdminPassword(adminPassword))) {
      return c.json({ error: "Unauthorized: invalid admin password" }, 401);
    }

    const { imageKey, imageBase64, mimeType } = await c.req.json();

    // Convert base64 → Uint8Array
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const binaryStr  = atob(base64Data);
    const bytes      = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const ext      = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const filePath = `${imageKey}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, { contentType: mimeType, upsert: true });

    if (uploadErr) {
      console.log("Upload error:", uploadErr.message);
      return c.json({ error: `Storage upload error: ${uploadErr.message}` }, 500);
    }

    // 10-year signed URL (practical "permanent")
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 315_360_000);

    if (signErr || !signed?.signedUrl) {
      return c.json({ error: `Failed to create signed URL: ${signErr?.message}` }, 500);
    }

    return c.json({ url: signed.signedUrl });
  } catch (e) {
    console.log("Error uploading image:", e);
    return c.json({ error: `Image upload error: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);
