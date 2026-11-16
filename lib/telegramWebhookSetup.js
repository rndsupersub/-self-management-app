// lib/telegramWebhookSetup.js
// Satu sumber logika buat daftarin webhook Telegram:
// - /api/telegram/setup (pakai secret, buat CLI/cron)
// - /api/telegram/register-webhook (pakai login Firebase, buat tombol di web)
// Secret token selalu yang sama dengan yang diverifikasi lib/telegramSecurity.js,
// jadi webhook nggak mungkin terdaftar tanpa secret.

import { getWebhookSecret } from "./telegramSecurity";

// URL webhook HARUS dari env, bukan dari Host header.
// Fallback ke Host cuma boleh di dev lokal (localhost), buat kenyamanan.
export function resolveWebhookUrl(req) {
  const explicit = (process.env.TELEGRAM_WEBHOOK_URL || "").trim();
  if (explicit) return explicit.replace(/\/+$/, "").endsWith("/api/telegram")
    ? explicit.replace(/\/+$/, "")
    : `${explicit.replace(/\/+$/, "")}/api/telegram`;

  // VERCEL_PROJECT_PRODUCTION_URL = domain produksi yang stabil.
  // VERCEL_URL berubah tiap deployment, jadi cuma dipakai paling akhir.
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).trim();
  if (base) return `${base.replace(/\/+$/, "")}/api/telegram`;

  const host = req?.headers?.get?.("host") || "";
  if (process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return `http://${host}/api/telegram`;
  }
  return "";
}

export async function getTelegramWebhookInfo(token) {
  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await res.json();
  return data.ok ? data.result || {} : null;
}

// Daftarin (atau perbaiki) webhook + secret token + allowed updates.
export async function registerTelegramWebhook({ token, url }) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");
  if (!url) throw new Error("URL webhook belum bisa ditentukan");
  if (process.env.NODE_ENV === "production" && !/^https:\/\//.test(url)) {
    throw new Error("URL webhook production wajib https");
  }

  const secretToken = getWebhookSecret();
  if (!secretToken) throw new Error("Secret token webhook nggak bisa dibuat");

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: secretToken,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    }),
  });
  const data = await res.json();
  const info = await getTelegramWebhookInfo(token);

  return {
    ok: data.ok === true,
    url,
    description: data.description || info?.last_error_message || "",
    info,
  };
}
