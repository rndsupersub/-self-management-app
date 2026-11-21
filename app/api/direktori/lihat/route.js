// app/api/direktori/lihat/route.js
// Ubah titik koordinat (dari tautan Google Maps) jadi alamat yang bisa dibaca.
//
// Sumbernya tetap OpenStreetMap (Nominatim reverse), jadi gratis dan tanpa
// API key. Dipakai fitur "Tambah dari Google Maps": user menempel tautan
// tempat, aplikasi mengisi nama, alamat, kota, provinsi, negara, dan wilayah.

import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import { wilayahDariKoordinat } from "@/lib/direktoriCari";
import { deteksiWilayah } from "@/lib/direktoriData";

export const maxDuration = 20;

const UA = "SelfManagementApp/1.0 (direktori vendor/agency/jasa; aplikasi pribadi)";
const TTL_CACHE_MS = 10 * 60 * 1000;
const BATAS_PER_MENIT = 30;
const cache = new Map();
const catatanUser = new Map();

function bolehLihat(uid) {
  const sekarang = Date.now();
  const jejak = (catatanUser.get(uid) || []).filter((waktu) => sekarang - waktu < 60_000);
  if (jejak.length >= BATAS_PER_MENIT) return false;
  jejak.push(sekarang);
  catatanUser.set(uid, jejak);
  if (catatanUser.size > 500) catatanUser.clear();
  return true;
}

function unik(daftar = []) {
  const hasil = [];
  for (const teks of daftar) {
    const bersih = String(teks || "").trim();
    if (!bersih) continue;
    if (hasil.some((h) => h.toLowerCase() === bersih.toLowerCase())) continue;
    hasil.push(bersih);
  }
  return hasil;
}

export async function GET(req) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json(
        { ok: false, error: "FIREBASE_PROJECT_ID belum diset di server." },
        { status: 500 }
      );
    }

    const header = req.headers.get("authorization") || "";
    const idToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded) {
      return NextResponse.json(
        { ok: false, error: "Sesi login tidak valid. Muat ulang halaman, lalu login lagi." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180 ||
      (lat === 0 && lon === 0)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Tautan itu tidak memuat titik koordinat. Buka tempatnya di Google Maps, tekan Bagikan → Salin tautan, lalu tempel lagi.",
        },
        { status: 400 }
      );
    }

    if (!bolehLihat(decoded.uid)) {
      return NextResponse.json(
        { ok: false, error: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi." },
        { status: 429 }
      );
    }

    const kunci = `${lat.toFixed(5)},${lon.toFixed(5)}`;
    const tersimpan = cache.get(kunci);
    if (tersimpan && Date.now() - tersimpan.waktu < TTL_CACHE_MS) {
      return NextResponse.json(
        { ok: true, ...tersimpan.data, sumber: "cache" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("extratags", "1");
    url.searchParams.set("accept-language", "id");

    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "id" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Layanan peta publik sedang tidak bisa dihubungi (kode ${res.status}). Titik koordinatnya tetap tersimpan.`,
        },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({}));
    const a = data.address || {};
    const extra = data.extratags || {};

    const jalan = [a.road || a.pedestrian || a.footway || a.path, a.house_number]
      .filter(Boolean)
      .join(" ");
    const wilayahKecil = [a.village || a.neighbourhood || a.hamlet, a.suburb || a.city_district || a.district]
      .filter(Boolean)
      .join(", ");
    const kota = a.city || a.town || a.municipality || a.county || "";
    const provinsi = a.state || a.region || "";
    const negara = a.country || "";
    const alamat = unik([jalan, wilayahKecil, kota, provinsi]).join(", ");

    const nama =
      data.name ||
      extra.name ||
      a.shop ||
      a.office ||
      a.craft ||
      a.industrial ||
      a.amenity ||
      a.building ||
      "";

    const wilayah =
      wilayahDariKoordinat(lat, lon) ||
      deteksiWilayah({ kota, provinsi, negara });

    const hasil = {
      nama: String(nama || "").slice(0, 120),
      alamat,
      kota,
      provinsi,
      negara,
      kodeNegara: String(a.country_code || "").toUpperCase(),
      wilayah,
      telepon: extra.phone || extra["contact:phone"] || "",
      website: extra.website || extra["contact:website"] || "",
      tampilan: data.display_name || "",
    };

    cache.set(kunci, { waktu: Date.now(), data: hasil });
    if (cache.size > 300) cache.clear();

    return NextResponse.json(
      { ok: true, ...hasil, sumber: "openstreetmap" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[direktori/lihat] Error:", err);
    const pesan =
      err?.name === "TimeoutError"
        ? "Pengambilan alamat terlalu lama. Titik koordinatnya tetap bisa disimpan."
        : err?.message || "Gagal mengambil alamat dari titik itu.";
    return NextResponse.json({ ok: false, error: pesan }, { status: 503 });
  }
}
