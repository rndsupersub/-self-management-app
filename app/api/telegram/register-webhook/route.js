// app/api/telegram/register-webhook/route.js
// Daftarin / perbaiki webhook Telegram dari dashboard (cukup login Firebase).
// Jadi nggak perlu curl manual tiap kali domain atau kode webhook berubah.
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { resolveWebhookUrl, getTelegramWebhookInfo, registerTelegramWebhook } from "@/lib/telegramWebhookSetup";

let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

async function verifyUser(req) {
  const header = req.headers.get("authorization") || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!idToken) return null;
  try {
    return await getAuth(getAdminApp()).verifyIdToken(idToken);
  } catch (err) {
    console.error("[register-webhook] Token invalid:", err.message);
    return null;
  }
}

function statusFromInfo(info, expectedUrl) {
  if (!info) return { terdaftar: false, cocok: false };
  return {
    terdaftar: !!info.url,
    cocok: !!expectedUrl && info.url === expectedUrl,
    lastErrorMessage: info.last_error_message || null,
    lastErrorDate: info.last_error_date
      ? new Date(info.last_error_date * 1000).toISOString()
      : null,
    pendingUpdateCount: info.pending_update_count ?? 0,
  };
}

// GET — status webhook sekarang (buat ditampilin di dashboard)
export async function GET(req) {
  if (!(await verifyUser(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN belum diset" }, { status: 500 });

  const expectedUrl = resolveWebhookUrl(req);
  const info = await getTelegramWebhookInfo(token);
  return NextResponse.json({
    ok: true,
    url: info?.url || "",
    expectedUrl,
    secretDikonfigurasi: !!process.env.TELEGRAM_WEBHOOK_SECRET,
    ...statusFromInfo(info, expectedUrl),
  });
}

// POST — daftarin ulang webhook + secret token
export async function POST(req) {
  if (!(await verifyUser(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN belum diset" }, { status: 500 });

  const url = resolveWebhookUrl(req);
  if (!url) {
    return NextResponse.json(
      {
        error:
          "URL webhook belum bisa ditentukan. Set TELEGRAM_WEBHOOK_URL atau NEXT_PUBLIC_APP_URL di environment production.",
      },
      { status: 400 }
    );
  }

  try {
    const hasil = await registerTelegramWebhook({ token, url });
    return NextResponse.json({
      ok: hasil.ok,
      url: hasil.url,
      description: hasil.description,
      ...statusFromInfo(hasil.info, hasil.url),
    }, { status: hasil.ok ? 200 : 502 });
  } catch (err) {
    console.error("[register-webhook] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
