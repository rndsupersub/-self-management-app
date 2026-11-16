#!/usr/bin/env node
// scripts/telegram-setup.mjs
// Satu perintah buat cek & daftarin webhook Telegram (nggak perlu curl manual).
//
//   npm run telegram:setup                      # cek status webhook
//   npm run telegram:setup -- --url=https://domain-lo.com
//   npm run telegram:setup -- --status
//
// Token & secret dibaca dari .env.local / environment. Nggak ada yang dicetak.
// Secret token yang didaftarin ke Telegram SAMA dengan yang dipakai server
// (lib/telegramSecurity.js): TELEGRAM_WEBHOOK_SECRET, atau turunan SHA-256
// dari TELEGRAM_BOT_TOKEN kalau env itu kosong.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env.local");
const env = { ...process.env };

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!env[key]) env[key] = value;
  }
}

const args = process.argv.slice(2);
const argValue = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : "";
};

const token = (env.TELEGRAM_BOT_TOKEN || "").trim();
const statusOnly = args.includes("--status");

function safeSecret(value) {
  return String(value || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 256);
}

function webhookSecret() {
  const explicit = safeSecret(env.TELEGRAM_WEBHOOK_SECRET);
  if (explicit) return explicit;
  if (!token) return "";
  return createHash("sha256").update(`telegram-webhook:${token}`).digest("hex");
}

function webhookUrl() {
  const explicit = (argValue("url") || env.TELEGRAM_WEBHOOK_URL || "").trim();
  if (explicit) {
    const clean = explicit.replace(/\/+$/, "");
    return clean.endsWith("/api/telegram") ? clean : `${clean}/api/telegram`;
  }
  const base = (
    env.NEXT_PUBLIC_APP_URL ||
    env.NEXT_PUBLIC_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "")
  ).trim();
  if (base) return `${base.replace(/\/+$/, "")}/api/telegram`;
  return "";
}

async function telegram(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return res.json();
}

function ringkas(info, expectedUrl) {
  return {
    url: info?.url || "(belum terdaftar)",
    cocokDenganEnv: expectedUrl ? info?.url === expectedUrl : null,
    pendingUpdate: info?.pending_update_count ?? 0,
    lastError: info?.last_error_message || null,
    lastErrorAt: info?.last_error_date
      ? new Date(info.last_error_date * 1000).toISOString()
      : null,
  };
}

async function main() {
  if (!token) {
    console.error("✖ TELEGRAM_BOT_TOKEN belum ada di .env.local / environment.");
    process.exit(1);
  }
  const secret = webhookSecret();
  let url = webhookUrl();

  // Nggak ada URL di env? Pakai URL webhook yang sekarang terdaftar, jadi
  // `npm run telegram:setup` tanpa argumen tetap bisa "perbaiki" webhook.
  const infoAwal = await telegram("getWebhookInfo");
  if (!infoAwal.ok) {
    console.error("✖ getWebhookInfo gagal:", infoAwal.description);
    process.exit(1);
  }
  const urlTerdaftar = infoAwal.result?.url || "";
  const urlTarget = url || urlTerdaftar;

  if (statusOnly) {
    console.log("📡 Status webhook:");
    console.log(JSON.stringify(ringkas(infoAwal.result, urlTarget), null, 2));
    console.log(`🔑 Secret token siap dipakai: ${secret ? "ya" : "tidak"}`);
    if (!urlTarget) {
      console.log("\nℹ Webhook belum pernah didaftarkan. Jalankan:");
      console.log("  npm run telegram:setup -- --url=https://domain-lo.com");
    }
    return;
  }

  if (!url) url = urlTerdaftar;
  if (!url) {
    console.error("✖ URL tujuan belum diketahui. Jalankan:");
    console.error("  npm run telegram:setup -- --url=https://domain-lo.com");
    process.exit(1);
  }

  const set = await telegram("setWebhook", {
    url,

    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });
  if (!set.ok) {
    console.error("✖ setWebhook gagal:", set.description);
    process.exit(1);
  }
  const info = await telegram("getWebhookInfo");
  console.log("✅ Webhook terdaftar (dengan secret token).");
  console.log(JSON.stringify(ringkas(info.result, url), null, 2));
  console.log(
    "\nℹ Pastikan server pakai token bot yang sama. Kalau TELEGRAM_WEBHOOK_SECRET diisi manual di server, nilainya harus sama dengan secret di atas (pakai env yang sama, jangan beda)."
  );
}

main().catch((err) => {
  console.error("✖ Error:", err.message);
  process.exit(1);
});
