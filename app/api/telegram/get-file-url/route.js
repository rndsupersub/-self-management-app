// app/api/telegram/get-file-url/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { ok: false, error: "fileId wajib" },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN belum diset" },
        { status: 500 }
      );
    }

    // Step 1: getFile untuk dapetin file_path
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`
    );
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json(
        { ok: false, error: "Gagal ambil file dari Telegram", detail: data },
        { status: 400 }
      );
    }

    const filePath = data.result.file_path;
    if (!filePath) {
      return NextResponse.json(
        { ok: false, error: "file_path nggak ada" },
        { status: 400 }
      );
    }

    // Step 2: bikin link file
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    return NextResponse.json({
      ok: true,
      fileUrl,
      filePath,
      fileSize: data.result.file_size || 0,
    });
  } catch (err) {
    console.error("[get-file-url] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}