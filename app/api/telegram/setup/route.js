// app/api/telegram/setup/route.js
import { NextResponse } from "next/server";
import { setBotCommands } from "@/lib/telegramData";
import { BOT_COMMANDS } from "@/lib/telegramHelp";
import {
  getWebhookSecret,
  verifySetupRequest,
  getSetupSecret,
} from "@/lib/telegramSecurity";
import {
  resolveWebhookUrl,
  getTelegramWebhookInfo,
  registerTelegramWebhook,
} from "@/lib/telegramWebhookSetup";

function setupUnauthorized() {
  return NextResponse.json(
    {
      error:
        "Unauthorized. Set TELEGRAM_SETUP_SECRET (atau CRON_SECRET), lalu kirim header x-setup-secret atau ?secret=...",
    },
    { status: 401 }
  );
}

// GET — cek info webhook
export async function GET(req) {
  if (!verifySetupRequest(req)) return setupUnauthorized();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Token belum diset" }, { status: 500 });

  const info = await getTelegramWebhookInfo(token);
  const suggestedUrl = resolveWebhookUrl(req);
  return NextResponse.json({
    webhook: info,
    suggestedUrl,
    urlCocok: !!suggestedUrl && info?.url === suggestedUrl,
    setupSecretConfigured: !!getSetupSecret(),
    webhookSecretConfigured: !!getWebhookSecret(),
  });
}

// POST — set webhook + secret token
export async function POST(req) {
  if (!verifySetupRequest(req)) return setupUnauthorized();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Token belum diset" }, { status: 500 });

  const url = resolveWebhookUrl(req);
  if (!url) {
    return NextResponse.json(
      {
        error:
          "URL webhook belum diset. Isi TELEGRAM_WEBHOOK_URL atau NEXT_PUBLIC_APP_URL (atau deploy di Vercel).",
      },
      { status: 500 }
    );
  }

  try {
    const hasil = await registerTelegramWebhook({ token, url });
    // Daftarin command ke menu "/" Telegram biar user nggak perlu hafal command.
    await setBotCommands(BOT_COMMANDS);
    return NextResponse.json({
      ok: hasil.ok,
      url: hasil.url,
      secretTokenConfigured: !!getWebhookSecret(),
      result: hasil.info?.url || null,
      description: hasil.description,
    });
  } catch (err) {
    console.error("[setup] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
