// lib/panduanCari.js
// Pencarian panduan/tutorial: video YouTube asli + panduan terstruktur.
//
// Kenapa begini:
// - YouTube punya hasil pencarian yang bisa dibaca tanpa API key dan tanpa
//   biaya, jadi judul, kanal, durasi, dan deskripsi diambil apa adanya.
//   Aplikasi TIDAK mengarang langkah pemasangan.
// - Deskripsi video biasanya memuat bahan, alat, urutan langkah, dan tautan
//   artikel. Bagian-bagian itu dirapikan jadi struktur panduan: persiapan,
//   langkah-langkah, tips, lalu sumber video dan artikel.
// - Untuk sosial media, aplikasi menyediakan tautan pencarian resmi karena
//   situs-situs itu memblokir pembacaan otomatis dari server.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const BATAS_WAKTU_MS = 12_000;
const BATAS_DESKRIPSI_MS = 15_000;
const TTL_CACHE_MS = 10 * 60 * 1000;
const MAKS_VIDEO = 8;
const MAKS_VIDEO_DESKRIPSI = 4;

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
            deskripsi: "",
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

// Deskripsi lengkap cuma ada di halaman video. Diambil dari sumbernya, bukan
// dikarang, lalu dipakai untuk menyusun bahan/alat dan langkah.
async function ambilDeskripsiVideo(id) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(BATAS_DESKRIPSI_MS),
      cache: "no-store",
    });
    if (!res.ok) return "";
    const html = await res.text();
    const cocok = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (!cocok) return "";
    try {
      return teksDeskripsi(JSON.parse(`"${cocok[1]}"`));
    } catch {
      return "";
    }
  } catch {
    return "";
  }
}

function teksDeskripsi(nilai) {
  return String(nilai || "")
    .replace(/\r/g, "")
    .slice(0, 6000);
}

async function lengkapiDeskripsi(video) {
  const target = video.slice(0, MAKS_VIDEO_DESKRIPSI);
  const hasil = await Promise.allSettled(
    target.map(async (v) => ({ id: v.id, deskripsi: await ambilDeskripsiVideo(v.id) }))
  );
  const peta = new Map();
  hasil.forEach((h) => {
    if (h.status === "fulfilled" && h.value.deskripsi) peta.set(h.value.id, h.value.deskripsi);
  });
  // Kalau deskripsi lengkap gagal diambil, potongan deskripsi dari hasil
  // pencarian tetap dipakai supaya panduan tidak kosong.
  return video.map((v) => ({
    ...v,
    deskripsi: peta.get(v.id) || v.deskripsi || v.ringkasan || "",
  }));
}

// ========== PENYUSUN PANDUAN ==========
// Baris deskripsi dipisah per kalimat/poin. Tautan dipisah supaya tidak
// mengganggu teks, tapi tetap dicatat untuk bagian sumber artikel.
const KATA_PERSIAPAN = /bahan|material|alat|tools?|equipment|perlu|siapkan|persiapan|persiapan|komponen|perlengkapan/i;
const KATA_LANGKAH = /^(langkah|step|tahap|cara|proses)\b/i;
const KATA_BUANG = /^(subscribe|subrek|follow|ikuti|instagram|tiktok|facebook|business|email|wa|whatsapp|kontak|jangan lupa|terima kasih|thanks|music|musik|lagu|sumber gambar|disclaimer|copyright)\b/i;

function pecahBaris(deskripsi) {
  return String(deskripsi || "")
    .split("\n")
    .map((baris) => {
      const asli = baris.trim();
      const tanpaTautan = asli
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const bernomor = /^(\d{1,2}[.)]|[-*•]|langkah\s*\d+|step\s*\d+|tahap\s*\d+)\b/i.test(asli);
      return {
        asli,
        teks: tanpaTautan.replace(/^[-*•]\s*/, "").trim(),
        bernomor,
      };
    })
    .filter((b) => b.teks.length >= 25 && !KATA_BUANG.test(b.teks));
}

function kunciTeks(teks) {
  return String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function susunPoin(video, filter) {
  const poin = [];
  const sudah = new Set();
  for (const v of video) {
    for (const baris of pecahBaris(v.deskripsi || v.ringkasan)) {
      if (!filter(baris)) continue;
      const kunci = kunciTeks(baris.teks);
      if (!kunci || sudah.has(kunci)) continue;
      sudah.add(kunci);
      poin.push({ teks: baris.teks, sumber: v.judul, tautan: v.tautan });
      if (poin.length >= 10) return poin;
    }
  }
  return poin;
}

function tautanArtikel(video) {
  const hasil = [];
  const sudah = new Set();
  const terlarang = /youtube\.com|youtu\.be|instagram|tiktok|facebook|t\.me|twitter|x\.com|patreon|amazon|shopee|tokopedia/i;
  video.forEach((v) => {
    const cocok = String(v.deskripsi || "").match(/https?:\/\/[^\s"'<>)\]]+/g) || [];
    cocok.forEach((mentah) => {
      const tautan = mentah.replace(/[.,;)]+$/, "");
      if (!tautan || terlarang.test(tautan) || sudah.has(tautan)) return;
      sudah.add(tautan);
      let host = "";
      try {
        host = new URL(tautan).hostname.replace(/^www\./, "");
      } catch {
        return;
      }
      hasil.push({ teks: host, tautan });
    });
  });
  return hasil.slice(0, 8);
}

function susunBagian(video, kata) {
  const persiapan = susunPoin(video, (b) => KATA_PERSIAPAN.test(b.teks));
  const langkah = susunPoin(
    video,
    (b) => (b.bernomor || KATA_LANGKAH.test(b.teks)) && !KATA_PERSIAPAN.test(b.teks)
  );
  const langkahCadangan = langkah.length === 0 ? susunPoin(video, (b) => !KATA_PERSIAPAN.test(b.teks)) : [];
  const dipakai = new Set([...persiapan, ...langkah, ...langkahCadangan].map((p) => kunciTeks(p.teks)));
  const tips = susunPoin(video, (b) => !dipakai.has(kunciTeks(b.teks)) && !KATA_PERSIAPAN.test(b.teks));
  const artikel = tautanArtikel(video);

  const bagian = [];
  if (persiapan.length > 0) {
    bagian.push({ id: "persiapan", judul: "🧰 Persiapan: Bahan dan Alat", poin: persiapan.slice(0, 8) });
  }
  if (langkah.length > 0 || langkahCadangan.length > 0) {
    bagian.push({
      id: "langkah",
      judul: "🛠️ Langkah-Langkah",
      poin: (langkah.length > 0 ? langkah : langkahCadangan).slice(0, 10),
    });
  }
  if (tips.length > 0) {
    bagian.push({ id: "tips", judul: "💡 Catatan & Tips dari Video", poin: tips.slice(0, 6) });
  }
  if (artikel.length > 0) {
    bagian.push({ id: "artikel", judul: "🔗 Sumber Artikel & Panduan Tambahan", poin: artikel });
  }

  if (bagian.length === 0) {
    // Deskripsi kosong: tetap beri pijakan dari judul video yang benar-benar ada.
    bagian.push({
      id: "sumber",
      judul: "🎬 Sumber Video",
      poin: video.slice(0, 6).map((v) => ({
        teks: `${v.judul}${v.kanal ? ` — ${v.kanal}` : ""}`,
        sumber: v.judul,
        tautan: v.tautan,
      })),
    });
  }

  // Kata kunci dari judul: dipakai untuk saran persempit, bukan isi langkah.
  const judulGabung = video.map((v) => v.judul).join(" ");
  const subjek = deteksiSubjek(`${kata} ${judulGabung}`);
  return { bagian, subjek };
}

const KATA_STOP = new Set([
  "yang", "untuk", "dengan", "dari", "cara", "dan", "atau", "pada", "ini",
  "itu", "adalah", "akan", "bisa", "juga", "dalam", "tidak", "agar", "biar",
  "tutorial", "video", "part", "episode", "how", "the", "and", "with", "your",
  "membuat", "buat", "pasang", "memasang",
]);

function deteksiSubjek(teks) {
  const t = String(teks || "").toLowerCase();
  if (/\bjok\b|jokset|sadelt/.test(t)) {
    if (/mobil|car|avanza|xenia|innova|ertiga/.test(t)) return "Jok mobil";
    if (/motor|beat|vario|nmax|pcx|supra|jupiter|mio/.test(t)) return "Jok motor";
    return "Jok (motor & mobil)";
  }
  if (/busa|spons|foam|sponge/.test(t)) return "Busa / spons";
  if (/las\b|welding|weld/.test(t)) return "Las / pengelasan";
  if (/kemasan|packing|packaging/.test(t)) return "Kemasan";
  if (/jahit|konveksi|garment|tailor/.test(t)) return "Jahit / konveksi";
  if (/cat\b|painting|pengecatan/.test(t)) return "Pengecatan";
  if (/velg|pelek|roda/.test(t)) return "Velg / roda";
  return teks ? teks.charAt(0).toUpperCase() + teks.slice(1) : "";
}

function saranPersempit(kata, subjek) {
  const t = String(kata || "").toLowerCase();
  const hasil = [];
  if (/jok/.test(t)) {
    hasil.push(`${kata} motor`, `${kata} mobil`);
  } else if (/busa|spons/.test(t)) {
    hasil.push(`${kata} jok`, `${kata} kasur`);
  } else if (/las/.test(t)) {
    hasil.push(`${kata} besi`, `${kata} aluminium`);
  } else {
    hasil.push(`${kata} pemula`, `${kata} alat dan bahan`);
  }
  return hasil.filter((s) => s.toLowerCase() !== t && s !== subjek).slice(0, 3);
}

function ringkasPanduan(video, kata) {
  const judulGabung = video.map((v) => v.judul).join(" ");
  const frekuensi = new Map();
  for (const kataJudul of judulGabung.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (kataJudul.length < 4 || KATA_STOP.has(kataJudul)) continue;
    frekuensi.set(kataJudul, (frekuensi.get(kataJudul) || 0) + 1);
  }
  const kataKunci = [...frekuensi.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([k]) => k);

  const { bagian, subjek } = susunBagian(video, kata);
  const jumlahPoin = bagian.reduce((n, b) => n + b.poin.length, 0);
  const adaDeskripsi = video.some((v) => String(v.deskripsi || "").trim().length > 0);

  const ringkas = adaDeskripsi
    ? `${subjek || kata}: dirangkum dari ${video.length} video YouTube yang benar-benar ditemukan. ${jumlahPoin} poin bahan, langkah, dan tips di bawah diambil dari deskripsi asli video. Langkah paling akurat tetap ada di video/sumber yang dibuka.`
    : `${subjek || kata}: ${video.length} video YouTube ditemukan, tetapi deskripsinya tidak memuat langkah tertulis. Buka videonya untuk melihat proses lengkapnya.`;

  return {
    topik: kata,
    subjek,
    kataKunci,
    bagian,
    jumlah: video.length,
    adaDeskripsi,
    saranPersempit: saranPersempit(kata, subjek),
    ringkas,
  };
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
    if (video.length > 0) {
      // Deskripsi diambil paralel dengan batas waktu per video. Kalau satu
      // gagal, video lain tetap dipakai.
      video = await lengkapiDeskripsi(video);
    } else {
      catatan =
        "YouTube tidak mengembalikan video untuk kata kunci ini. Coba kata kunci lain, atau buka tautan pencarian di bawah.";
    }
  } catch (err) {
    catatan =
      "Daftar video YouTube sedang tidak bisa diambil. Tautan pencarian di bawah tetap bisa dibuka langsung.";
    console.error("[panduan] Gagal mengambil YouTube:", err?.message || err);
  }

  const ringkasan = video.length > 0 ? ringkasPanduan(video, kata) : null;

  const nilai = {
    q: kata,
    judul: `Panduan: ${kata}`,
    video,
    tautan: tautanPanduan(kata),
    ringkasan,
    ringkas: ringkasan?.ringkas || "",
    bagian: ringkasan?.bagian || [],
    catatan,
  };

  cache.set(kunciCache, { nilai, kedaluwarsa: Date.now() + TTL_CACHE_MS });
  if (cache.size > 200) {
    const tertua = cache.keys().next().value;
    cache.delete(tertua);
  }

  return nilai;
}
