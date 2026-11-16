// lib/firebaseIdToken.js
// Verifikasi Firebase ID token tanpa `firebase-admin/auth`.
//
// Kenapa nggak pakai getAuth().verifyIdToken: di Vercel dua route yang
// meng-import `firebase-admin/auth` crash 500 sebelum handler jalan
// (register-webhook & generate-code), padahal lokal normal. Jadi verifikasi
// ditulis sendiri pakai crypto bawaan Node + public key resmi Firebase:
// - signature RS256 dicek dengan sertifikat x509 dari Google (di-cache)
// - aud harus project Firebase kita, iss harus securetoken.google.com/<project>
// - exp belum lewat, sub (uid) wajib ada
// Nol dependency, jalan di runtime Node mana pun.

import { createPublicKey, createVerify } from "crypto";

const URL_CERTS =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cacheCerts = { certs: null, kedaluwarsa: 0 };

function base64UrlToBuffer(value) {
  const ternormal = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(ternormal, "base64");
}

export function decodeJwt(idToken) {
  const bagian = String(idToken || "").split(".");
  if (bagian.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlToBuffer(bagian[0]).toString("utf8"));
    const payload = JSON.parse(base64UrlToBuffer(bagian[1]).toString("utf8"));
    return {
      header,
      payload,
      signingInput: `${bagian[0]}.${bagian[1]}`,
      signature: base64UrlToBuffer(bagian[2]),
    };
  } catch {
    return null;
  }
}

async function ambilCertsFirebase() {
  const sekarang = Date.now();
  if (cacheCerts.certs && cacheCerts.kedaluwarsa > sekarang) return cacheCerts.certs;

  const res = await fetch(URL_CERTS);
  if (!res.ok) throw new Error("Gagal ambil public key Firebase");

  const certs = await res.json();
  const cacheControl = res.headers.get("cache-control") || "";
  const maxAge = Number((cacheControl.match(/max-age=(\d+)/) || [])[1] || 3600);
  cacheCerts = { certs, kedaluwarsa: sekarang + maxAge * 1000 };
  return certs;
}

// Kembalikan payload token (dengan `uid` = sub) kalau valid, atau null.
export async function verifyFirebaseIdToken(
  idToken,
  {
    projectId = process.env.FIREBASE_PROJECT_ID,
    ambilCerts = ambilCertsFirebase,
    sekarangDetik = Math.floor(Date.now() / 1000),
  } = {}
) {
  if (!idToken || !projectId) return null;

  const decoded = decodeJwt(idToken);
  if (!decoded) return null;

  const { header, payload, signingInput, signature } = decoded;
  if (header?.alg !== "RS256" || !header?.kid) return null;
  if (!payload?.sub) return null;

  const certs = await ambilCerts();
  const cert = certs?.[header.kid];
  if (!cert) return null;

  let signatureValid = false;
  try {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(signingInput);
    verifier.end();
    signatureValid = verifier.verify(createPublicKey(cert), signature);
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) return null;

  if (payload.aud !== projectId) return null;
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (!(Number(payload.exp) > sekarangDetik)) return null;
  if (payload.iat && Number(payload.iat) > sekarangDetik + 60) return null;

  return { ...payload, uid: payload.sub };
}
