// app/api/telegram/setup/route.js
import { NextResponse } from "next/server";

function getWebhookUrl(req) {
  // Ambil host dari request (buat auto-detect Vercel URL)
  const host = req.headers.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/telegram`;
}

// GET — cek info webhook
export async function GET(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Token belum diset" }, { status: 500 });

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await res.json();
  return NextResponse.json({
    webhook: data.result || null,
    suggestedUrl: getWebhookUrl(req),
  });
}

// POST — set webhook
export async function POST(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Token belum diset" }, { status: 500 });

  const url = getWebhookUrl(req);
  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(url)}`
  );
  const data = await res.json();
  return NextResponse.json({
    ok: data.ok,
    url,
    result: data.result,
    description: data.description,
  });
}