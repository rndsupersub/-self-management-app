// lib/exportPdf.js
// Export PDF "beneran" (bukan window.print()).
//
// Kenapa dibuat sendiri:
// - window.print() memaksa @page A4 portrait, jadi tabel/daftar yang lebar
//   terpotong di kanan dan kartu yang tinggi terbelah.
// - Di sini isi halaman ditangkap utuh (semua scroll dibuka dulu), lalu
//   dipotong per halaman A4 dengan orientasi otomatis: konten lebar -> landscape.
// - Ruang kosong di atas/bawah isi dipangkas dan halaman yang benar-benar
//   kosong dibuang, jadi dokumen satu halaman tidak pernah dapat halaman
//   putih tambahan di depan atau belakang.
// - Slide punya jalur sendiri: satu slide = satu halaman A4 landscape penuh
//   (297 x 210 mm), persis seperti yang terlihat di website.
//
// Semua proses terjadi di browser user: tanpa server, tanpa API key, tanpa biaya.

const MARGIN_MM = 8;
const MAKS_HALAMAN = 60;
const A4_LANDSCAPE = 297 / 210;

const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function tambahKelas(elemen, kelas) {
  if (elemen) elemen.classList.add(kelas);
}

function hapusKelas(elemen, kelas) {
  if (elemen) elemen.classList.remove(kelas);
}

// Buka semua pembatas tinggi (h-screen, overflow-hidden, scroll internal)
// supaya isi yang tadinya di luar layar ikut tertangkap.
function bukaPembatas(area, { tandaiArea = true } = {}) {
  // Semua leluhur ikut dibuka: area bisa berada di dalam main yang punya
  // tinggi tetap + overflow-y-auto, dan itu yang bikin isi panjang terpotong.
  const leluhur = [];
  let induk = area.parentElement;
  while (induk && induk !== document.body) {
    tambahKelas(induk, "pdf-ekspor-induk");
    leluhur.push(induk);
    induk = induk.parentElement;
  }

  document.documentElement.classList.add("pdf-ekspor");
  document.body.classList.add("pdf-ekspor");
  if (tandaiArea) {
    tambahKelas(area, "pdf-ekspor-area");
    area.scrollTop = 0;
  }

  return () => {
    if (tandaiArea) hapusKelas(area, "pdf-ekspor-area");
    leluhur.forEach((el) => hapusKelas(el, "pdf-ekspor-induk"));
    hapusKelas(document.body, "pdf-ekspor");
    hapusKelas(document.documentElement, "pdf-ekspor");
  };
}

// Saat html2canvas meng-clone dokumen: buka kotak ber-scroll, jangan biarkan
// teks "..." terpotong, dan pertahankan warna latar seperti di layar.
function siapkanClone(dokumen) {
  dokumen.documentElement.classList.add("pdf-ekspor");
  dokumen.body.classList.add("pdf-ekspor");
  dokumen.querySelectorAll("*").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const gaya = dokumen.defaultView?.getComputedStyle(el);
    if (!gaya) return;
    if (
      el.scrollHeight > el.clientHeight + 4 &&
      /(auto|scroll|hidden)/.test(`${gaya.overflowY} ${gaya.overflow}`)
    ) {
      el.style.height = "auto";
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
    }
    if (/(auto|scroll|hidden)/.test(`${gaya.overflowX} ${gaya.overflow}`)) {
      el.style.overflowX = "visible";
    }
    if (el.classList.contains("truncate")) {
      el.style.overflow = "visible";
      el.style.textOverflow = "clip";
      el.style.whiteSpace = "normal";
    }
  });
}

async function tangkapKanvas(area, { skala = 2, lebar, tinggi } = {}) {
  const html2canvas = (await import("html2canvas-pro")).default;
  const kotak = area.getBoundingClientRect();
  const lebarAkhir = Math.max(1, Math.ceil(lebar || area.scrollWidth || kotak.width));
  const tinggiAkhir = Math.max(1, Math.ceil(tinggi || area.scrollHeight || kotak.height));

  return html2canvas(area, {
    scale: skala,
    backgroundColor: "#ffffff",
    width: lebarAkhir,
    height: tinggiAkhir,
    windowWidth: Math.max(window.innerWidth, lebarAkhir),
    windowHeight: Math.max(window.innerHeight, tinggiAkhir),
    scrollX: 0,
    scrollY: 0,
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el?.getAttribute?.("data-html2canvas-ignore") === "true",
    onclone: siapkanClone,
  });
}

function barisPutih(ctx, lebar, y) {
  let data;
  try {
    data = ctx.getImageData(0, y, lebar, 1).data;
  } catch {
    return false;
  }
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false;
  }
  return true;
}

// Cari batas atas & bawah isi yang benar-benar ada, supaya sisa ruang kosong
// (mis. tinggi area mengikuti layar) tidak jadi halaman putih ekstra.
function batasIsi(kanvas) {
  const ctx = kanvas.getContext("2d");
  if (!ctx) return { atas: 0, bawah: kanvas.height };

  let atas = 0;
  let bawah = kanvas.height;
  try {
    while (atas < bawah - 2 && barisPutih(ctx, kanvas.width, atas)) atas += 2;
    while (bawah > atas + 2 && barisPutih(ctx, kanvas.width, bawah - 1)) bawah -= 2;
  } catch {
    return { atas: 0, bawah: kanvas.height };
  }
  return {
    atas: Math.max(0, atas - 2),
    bawah: Math.min(kanvas.height, bawah + 2),
  };
}

// Halaman dianggap kosong kalau seluruh pikselnya putih.
function halamanKosong(kanvas) {
  if (!kanvas || kanvas.width < 2 || kanvas.height < 2) return true;
  const ctx = kanvas.getContext("2d");
  if (!ctx) return false;
  let data;
  try {
    data = ctx.getImageData(0, 0, kanvas.width, kanvas.height).data;
  } catch {
    return false;
  }
  const totalPiksel = data.length / 4;
  const langkah = Math.max(1, Math.floor(totalPiksel / 120000)) * 4;
  for (let i = 0; i < data.length; i += langkah) {
    if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false;
  }
  return true;
}

// Cari baris yang benar-benar kosong (putih) di sekitar titik potong, supaya
// pemenggalan tidak melewati tengah tulisan atau tengah kartu.
function cariGarisPotong(ctx, lebar, target, bawahMaks) {
  const pita = 110;
  const atas = Math.max(0, target - pita);
  const bawah = Math.min(bawahMaks, target + pita);
  const tinggi = Math.floor(bawah - atas);
  if (tinggi < 4) return target;

  let data;
  try {
    data = ctx.getImageData(0, Math.floor(atas), Math.floor(lebar), tinggi).data;
  } catch {
    return target;
  }

  const lebarBulat = Math.floor(lebar);
  const barisKosong = (baris) => {
    if (baris < 0 || baris >= tinggi) return false;
    for (let x = 0; x < lebarBulat; x += 3) {
      const i = (baris * lebarBulat + x) * 4;
      if (data[i] < 249 || data[i + 1] < 249 || data[i + 2] < 249) return false;
    }
    return true;
  };

  const targetRelatif = Math.round(target - atas);
  for (let jarak = 0; jarak <= pita; jarak += 1) {
    const kandidat = [targetRelatif + jarak, targetRelatif - jarak];
    for (const baris of kandidat) {
      if (baris <= 2 || atas + baris >= bawahMaks) continue;
      if (barisKosong(baris)) return Math.floor(atas) + baris;
    }
  }
  return target;
}

function potongKanvas(kanvas, mulaiY, tinggi) {
  const potongan = document.createElement("canvas");
  potongan.width = kanvas.width;
  potongan.height = tinggi;
  const ctx = potongan.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, potongan.width, potongan.height);
  ctx.drawImage(kanvas, 0, mulaiY, kanvas.width, tinggi, 0, 0, potongan.width, tinggi);
  return potongan;
}

// Paksa kanvas ke rasio A4 landscape tanpa membuat gambar gepeng: kelebihan
// tinggi sedikit dipotong di tengah.
function kanvasRasioA4(kanvas) {
  const targetTinggi = Math.round(kanvas.width / A4_LANDSCAPE);
  if (Math.abs(kanvas.height - targetTinggi) <= 2) return kanvas;

  const hasil = document.createElement("canvas");
  hasil.width = kanvas.width;
  hasil.height = targetTinggi;
  const ctx = hasil.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, hasil.width, hasil.height);

  const potong = Math.min(kanvas.height, targetTinggi);
  const mulai = Math.max(0, Math.round((kanvas.height - potong) / 2));
  ctx.drawImage(kanvas, 0, mulai, kanvas.width, potong, 0, 0, hasil.width, potong);
  return hasil;
}

/**
 * Tangkap elemen lalu simpan jadi PDF A4 multi-halaman.
 * Halaman kosong (putih) tidak pernah ditulis, jadi dokumen pendek tetap
 * satu halaman saja.
 *
 * @param {object} opsi
 * @param {HTMLElement} opsi.area      elemen yang mau diekspor
 * @param {string} opsi.namaFile       nama file .pdf
 * @param {string} opsi.judul          judul dokumen (metadata PDF)
 * @param {"auto"|"portrait"|"landscape"} opsi.orientasi
 * @returns {Promise<{halaman:number, orientasi:string}>}
 */
export async function eksporElemenKePdf({
  area,
  namaFile = "laporan.pdf",
  judul = "Laporan",
  orientasi = "auto",
} = {}) {
  if (!area) throw new Error("Area yang mau diekspor tidak ditemukan.");

  const { jsPDF } = await import("jspdf");

  const pulihkan = bukaPembatas(area);
  // Beri waktu browser menghitung ulang layout setelah pembatas dibuka.
  await jeda(120);

  let kanvas;
  let skala = 2;
  try {
    const tinggiCss = Math.max(1, Math.ceil(area.scrollHeight || area.getBoundingClientRect().height));
    // Batas aman kanvas browser: perkecil skala kalau isinya sangat panjang.
    skala = tinggiCss > 12000 ? 1 : tinggiCss > 7000 ? 1.5 : 2;
    kanvas = await tangkapKanvas(area, { skala });
  } finally {
    pulihkan();
  }

  if (!kanvas || kanvas.width < 2 || kanvas.height < 2) {
    throw new Error("Isi halaman kosong, tidak ada yang bisa diekspor.");
  }

  const lebarKanvas = kanvas.width;
  const lebarCss = lebarKanvas / skala;
  const rasioKonten = lebarKanvas / Math.max(1, kanvas.height);

  // Orientasi otomatis: isi selebar desktop (atau lebih lebar dari tingginya)
  // dibuat landscape supaya teks tidak mengecil dan tidak terpotong.
  const landscape =
    orientasi === "landscape" ||
    (orientasi === "auto" && (lebarCss >= 860 || rasioKonten > 1.15));

  const [lebarHalaman, tinggiHalaman] = landscape ? [297, 210] : [210, 297];
  const lebarPakai = lebarHalaman - MARGIN_MM * 2;
  const tinggiPakai = tinggiHalaman - MARGIN_MM * 2;

  const mmPerPiksel = lebarPakai / lebarKanvas;
  const tinggiHalamanPiksel = Math.floor(tinggiPakai / mmPerPiksel);

  const batas = batasIsi(kanvas);
  const konteks = kanvas.getContext("2d");
  const potonganHalaman = [];
  let posisiY = batas.atas;
  let putaran = 0;

  while (posisiY < batas.bawah && potonganHalaman.length < MAKS_HALAMAN && putaran < MAKS_HALAMAN * 2) {
    putaran += 1;
    let tinggiPotong = Math.min(tinggiHalamanPiksel, batas.bawah - posisiY);
    const sisa = batas.bawah - (posisiY + tinggiPotong);
    if (sisa > 8 && konteks) {
      const potong = cariGarisPotong(konteks, lebarKanvas, posisiY + tinggiPotong, batas.bawah);
      if (potong > posisiY + 40) tinggiPotong = potong - posisiY;
    }

    const potongan = potongKanvas(kanvas, posisiY, tinggiPotong);
    // Halaman yang seluruhnya putih dibuang: inilah penyebab halaman kosong
    // di depan/belakang dokumen yang isinya sebenarnya cuma satu halaman.
    if (!halamanKosong(potongan)) {
      potonganHalaman.push({ kanvas: potongan, tinggiPotong });
    }

    posisiY += tinggiPotong;
  }

  if (potonganHalaman.length === 0) {
    throw new Error("Isi halaman kosong, tidak ada yang bisa diekspor.");
  }

  const dok = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  dok.setProperties({ title: judul, creator: "Self Management App" });

  potonganHalaman.forEach((h, i) => {
    if (i > 0) dok.addPage();
    dok.addImage(
      h.kanvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      MARGIN_MM,
      MARGIN_MM,
      lebarPakai,
      Math.min(tinggiPakai, h.tinggiPotong * mmPerPiksel),
      undefined,
      "FAST"
    );
  });

  dok.save(namaFile);
  return { halaman: potonganHalaman.length, orientasi: landscape ? "landscape" : "portrait" };
}

/**
 * Ekspor slide: satu slide = satu halaman A4 landscape penuh.
 * Ukuran halaman di PDF sama dengan pratinjau A4 landscape di website
 * (297 x 210 mm, tanpa margin) sehingga tidak ada bagian yang mengecil.
 *
 * @param {object} opsi
 * @param {HTMLElement[]} opsi.halaman  elemen slide berurutan
 * @param {string} opsi.namaFile
 * @param {string} opsi.judul
 * @returns {Promise<{halaman:number, orientasi:"landscape"}>}
 */
export async function eksporSlideKePdf({
  halaman = [],
  namaFile = "slide.pdf",
  judul = "Slide",
} = {}) {
  const daftar = (Array.isArray(halaman) ? halaman : []).filter(Boolean);
  if (daftar.length === 0) {
    throw new Error("Tidak ada slide yang bisa diekspor.");
  }

  const { jsPDF } = await import("jspdf");

  const wadah = daftar[0].parentElement;
  const pulihkan = wadah ? bukaPembatas(wadah, { tandaiArea: false }) : () => {};
  await jeda(120);

  const dok = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  dok.setProperties({ title: judul, creator: "Self Management App" });

  let jumlah = 0;
  try {
    for (const elemen of daftar) {
      const kotak = elemen.getBoundingClientRect();
      const lebar = Math.max(1, Math.round(kotak.width));
      const tinggi = Math.max(1, Math.round(kotak.height));
      // Resolusi target ~2600 px lebar, jadi teks tetap tajam saat dicetak.
      const skala = Math.min(4, Math.max(2, Math.ceil((2600 / lebar) * 10) / 10));

      let kanvas;
      try {
        kanvas = await tangkapKanvas(elemen, { skala, lebar, tinggi });
      } catch (err) {
        console.error("[export-pdf] slide gagal ditangkap", err);
        continue;
      }
      if (!kanvas || kanvas.width < 2 || kanvas.height < 2) continue;

      const gambar = kanvasRasioA4(kanvas);
      if (jumlah > 0) dok.addPage();
      dok.addImage(gambar.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210, undefined, "FAST");
      jumlah += 1;
    }
  } finally {
    pulihkan();
  }

  if (jumlah === 0) {
    throw new Error("Tidak ada slide yang bisa diekspor.");
  }

  dok.save(namaFile);
  return { halaman: jumlah, orientasi: "landscape" };
}
