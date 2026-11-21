// lib/panduanCari.js
// Pencarian panduan/tutorial: video YouTube asli + tautan panduan tertulis.
//
// Kenapa begini:
// - YouTube punya hasil pencarian yang bisa dibaca tanpa API key dan tanpa
//   biaya, jadi judul, kanal, durasi, dan ringkasan deskripsi diambil apa
//   adanya. Aplikasi TIDAK mengarang langkah pemasangan.
// - Untuk panduan tertulis dan sosial media, aplikasi menyediakan tautan
//   pencarian resmi (Google, TikTok, Instagram, Facebook) karena situs-situs
//   itu memblokir pembacaan otomatis dari server. User membuka sumbernya
//   langsung, jadi informasi yang dibaca selalu yang terbaru dan asli.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const BATAS_WAKTU_MS = 12_000;
const TTL_CACHE_MS = 10 * 60 * 1000;
const MAKS_VIDEO = 8;

const cache = new Map();

function teksAman(nilai, maks = 300) {
  return String(nilai ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maks);
}

// Ambil semua videoRenderer dari struktur ytInitialData. Struktur YouTube
// berubah-ubah, jadi cara paling tahan lama adalah menelusuri seluruh objek
// dan mengambil apa pun yang punya videoId + judul.
function kumpulkanVideo(data) {
  const hasil = [];
  const terlihat = new Set();

  const jalan = (simpul) => {
    if (!simpul || typeof simpul !== "object") return;
    if (Array.isArray(simpul)) {
      for (const isi of simpul) jalan(isi);
      return;
    }
    const video = simpul.videoRenderer;
    if (video?.videoId && !terlihat.has(video.videoId)) {
      const id = String(video.videoId);
      if (/^[\w-]{11}$/.test(id)) {
        terlihat.add(id);
        const judul = teksAman(
          (video.title?.runs || []).map((r) => r.text).join("") || video.title?.simpleText,
          160
        );
        if (judul) {
          const ringkasan = teksAman(
            (video.detailedMetadataSnippets || [])
              .map((s) => (s?.snippetText?.runs || []).map((r) => r.text).join(""))
              .join(" "),
            320
          );
          hasil.push({
            id,
            judul,
            kanal: teksAman(video.ownerText?.runs?.[0]?.text || video.longBylineText?.runs?.[0]?.text, 80),
            durasi: teksAman(video.lengthText?.simpleText, 12),
            tayang: teksAman(video.publishedTimeText?.simpleText, 40),
            tontonan: teksAman(video.viewCountText?.simpleText, 40),
            ringkasan,
            tautan: `https://www.youtube.com/watch?v=${id}`,
            thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          });
        }
      }
    }
    for (const kunci of Object.keys(simpul)) jalan(simpul[kunci]);
  };

  jalan(data);
  return hasil.slice(0, MAKS_VIDEO);
}

async function cariVideoYouTube(q) {
  const kata = /cara|tutorial|how to|tips|trik/i.test(q) ? q : `${q} tutorial`;
  const param = new URLSearchParams({ search_query: kata });
  const res = await fetch(`https://www.youtube.com/results?${param}`, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`YouTube membalas ${res.status}`);
  const html = await res.text();
  const cocok = html.match(/ytInitialData\s*=\s*(\{[\s\S]*?\});<\/script>/);
  if (!cocok) throw new Error("Struktur halaman YouTube tidak dikenali.");
  const data = JSON.parse(cocok[1]);
  return kumpulkanVideo(data);
}

function tautanPanduan(q) {
  const teks = encodeURIComponent(q);
  const tag = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join("");
  return {
    youtube: `https://www.youtube.com/results?search_query=${teks}`,
    google: `https://www.google.com/search?q=${teks}`,
    tiktok: `https://www.tiktok.com/search?q=${teks}`,
    instagram: tag ? `https://www.instagram.com/explore/tags/${tag}/` : "https://www.instagram.com/",
    facebook: `https://www.facebook.com/search/top?q=${teks}`,
  };
}

export async function cariPanduan({ q } = {}) {
  const kata = teksAman(q, 120);
  if (kata.length < 2) {
    return { video: [], tautan: {}, catatan: "Kata kunci terlalu pendek." };
  }

  const kunciCache = kata.toLowerCase();
  const tersimpan = cache.get(kunciCache);
  if (tersimpan && tersimpan.kedaluwarsa > Date.now()) {
    return tersimpan.nilai;
  }

  let video = [];
  let catatan = "";

  try {
    video = await cariVideoYouTube(kata);
    if (video.length === 0) {
      catatan =
        "YouTube tidak mengembalikan video untuk kata kunci ini. Coba kata kunci lain, atau buka tautan pencarian di bawah.";
    }
  } catch (err) {
    catatan =
      "Daftar video YouTube sedang tidak bisa diambil. Tautan pencarian di bawah tetap bisa dibuka langsung.";
    console.error("[panduan] Gagal mengambil YouTube:", err?.message || err);
  }

  const nilai = {
    q: kata,
    video,
    tautan: tautanPanduan(kata),
    catatan,
  };

  cache.set(kunciCache, { nilai, kedaluwarsa: Date.now() + TTL_CACHE_MS });
  if (cache.size > 200) {
    const tertua = cache.keys().next().value;
    cache.delete(tertua);
  }

  return nilai;
}

