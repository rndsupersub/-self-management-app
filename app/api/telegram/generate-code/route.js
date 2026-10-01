// app/api/telegram/generate-code/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { generatePairingCode } from "@/lib/telegramData";

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

// POST { uid } → generate pairing code
export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "uid wajib" }, { status: 400 });

    const admin = getAdminApp();
    const firestore = getFirestore(admin);

    // Generate unique code
    let code;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 10) {
      code = generatePairingCode();
      const snap = await firestore.collection("pairingCodes").doc(code).get();
      exists = snap.exists;
      attempts++;
    }

    if (exists) {
      return NextResponse.json({ error: "Gagal generate code, coba lagi" }, { status: 500 });
    }

    // Simpen code
    await firestore.collection("pairingCodes").doc(code).set({
      uid,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, code });
  } catch (err) {
    console.error("[generate-code] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET { uid } → cek status link
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "uid wajib" }, { status: 400 });

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const userSnap = await firestore.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({ linked: false });
    }

    const data = userSnap.data();
    return NextResponse.json({
      linked: !!data.telegramChatId,
      telegramChatId: data.telegramChatId || null,
      telegramUsername: data.telegramUsername || null,
      telegramFirstName: data.telegramFirstName || null,
      telegramLinkedAt: data.telegramLinkedAt || null,
    });
  } catch (err) {
    console.error("[generate-code GET] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE { uid } → unlink
export async function DELETE(req) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "uid wajib" }, { status: 400 });

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    await firestore.collection("users").doc(uid).update({
      telegramChatId: null,
      telegramUsername: null,
      telegramFirstName: null,
      telegramLinkedAt: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}