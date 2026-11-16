// lib/telegramSecurity.js
// Helper keamanan buat webhook & pairing Telegram.
// - Webhook wajib pakai secret token yang sama dengan yang didaftarin ke Telegram.
// - Setup endpoint wajib secret (TELEGRAM_SETUP_SECRET / CRON_SECRET).

import { createHash, timingSafeEqual } from "crypto";

export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function secretValidChars(value) {
  // Telegram cuma ngebolehin A-Z a-z 0-9 _ - dan maksimal 256 karakter.
  return String(value || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 256);
}

// Secret token yang dikirim Telegram di header X-Telegram-Bot-Api-Secret-Token.
// Kalau env nggak diset, turunin dari bot token (hex aman buat Telegram).
export function getWebhookSecret() {
  const explicit = secretValidChars(process.env.TELEGRAM_WEBHOOK_SECRET);
  if (explicit) return explicit;
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!botToken) return "";
  return createHash("sha256").update(`telegram-webhook:${botToken}`).digest("hex");
}

export function verifyTelegramWebhook(req) {
  const expected = getWebhookSecret();
  if (!expected) return false;
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  return safeEqual(got, expected);
}

export function getSetupSecret() {
  return String(process.env.TELEGRAM_SETUP_SECRET || process.env.CRON_SECRET || "").trim();
}

// Setup cuma boleh dipanggil pakai secret. Bisa lewat header x-setup-secret
// atau query ?secret=... (praktis buat dipanggil manual dari browser).
export function verifySetupRequest(req) {
  const expected = getSetupSecret();
  if (!expected) return false;
  const url = new URL(req.url);
  const got =
    req.headers.get("x-setup-secret") ||
    url.searchParams.get("secret") ||
    "";
  return safeEqual(got, expected);
}
