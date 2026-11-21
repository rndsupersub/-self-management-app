// lib/exportPdf.js
// Export PDF "beneran" (bukan window.print()).
//
// Kenapa dibuat ulang:
// - window.print() memaksa @page A4 portrait, jadi tabel/daftar yang lebar
//   terpotong di kanan dan kartu yang tinggi terbelah.
// - Di sini isi halaman ditangkap utuh (semua scroll dibuka dulu), lalu
//   dipotong per halaman A4 dengan orientasi otomatis: konten lebar -> landscape.
// - Pemotongan dicari di baris kosong supaya teks/kartu tidak terbelah.
//
// Semua proses terjadi di browser user: tanpa server, tanpa API key, tanpa biaya.

const MARGIN_MM = 8;
const MAKS_HALAMAN = 60;

function tambahKelas(elemen, kelas) {
  if (elemen) elemen.classList.add(kelas);
}

function hapusKelas(elemen, kelas) {
  if (elemen) elemen.classList.remove(kelas);
}

// Buka semua pembatas tinggi (h-screen, overflow-hidden, scroll internal)
// supaya isi yang tadinya di luar layar ikut tertangkap.
function bukaPembatas(area) {
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
  tambahKelas(area, "pdf-ekspor-area");
  area.scrollTop = 0;

  return () => {
    hapusKelas(area, "pdf-ekspor-area");
    leluhur.forEach((el) => hapusKelas(el, "pdf-ekspor-induk"));
    hapusKelas(document.body, "pdf-ekspor");
    hapusKelas(document.documentElement, "pdf-ekspor");
  };
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

/**
 * Tangkap elemen lalu simpan jadi PDF A4 multi-halaman.
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

  const html2canvas = (await import("html2canvas-pro")).default;
  const { jsPDF } = await import("jspdf");

  const pulihkan = bukaPembatas(area);
  // Beri waktu browser menghitung ulang layout setelah pembatas dibuka.
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 80)));

  let kanvas;
  let skala = 2;
  try {
    const lebar = Math.max(1, Math.ceil(area.scrollWidth || area.getBoundingClientRect().width));
    const tinggi = Math.max(1, Math.ceil(area.scrollHeight || area.getBoundingClientRect().height));
    // Batas aman kanvas browser: perkecil skala kalau isinya sangat panjang.
    skala = tinggi > 16000 ? 1 : tinggi > 8000 ? 1.5 : 2;

    kanvas = await html2canvas(area, {
      scale: skala,
      backgroundColor: "#ffffff",
      width: lebar,
      height: tinggi,
      windowWidth: Math.max(window.innerWidth, lebar),
      windowHeight: Math.max(window.innerHeight, tinggi),
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el?.getAttribute?.("data-html2canvas-ignore") === "true",
      onclone: (dokumen) => {
        dokumen.documentElement.classList.add("pdf-ekspor");
        dokumen.body.classList.add("pdf-ekspor");
        // Semua kotak yang punya scroll internal dibuka supaya isinya ikut.
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
      },
    });
  } finally {
    pulihkan();
  }

  if (!kanvas || kanvas.width < 2 || kanvas.height < 2) {
    throw new Error("Isi halaman kosong, tidak ada yang bisa diekspor.");
  }

  const lebarKanvas = kanvas.width;
  const tinggiKanvas = kanvas.height;
  const lebarCss = lebarKanvas / skala;
  const rasioKonten = lebarKanvas / Math.max(1, tinggiKanvas);

  // Orientasi otomatis: isi selebar desktop (atau lebih lebar dari tingginya)
  // dibuat landscape supaya teks tidak mengecil dan tidak terpotong.
  const landscape =
    orientasi === "landscape" ||
    (orientasi === "auto" && (lebarCss >= 860 || rasioKonten > 1.15));

  const ukuran = landscape ? [297, 210] : [210, 297];
  const [lebarHalaman, tinggiHalaman] = ukuran;
  const lebarPakai = lebarHalaman - MARGIN_MM * 2;
  const tinggiPakai = tinggiHalaman - MARGIN_MM * 2;

  const mmPerPiksel = lebarPakai / lebarKanvas;
  const tinggiHalamanPiksel = Math.floor(tinggiPakai / mmPerPiksel);

  const dok = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  dok.setProperties({ title: judul, creator: "Self Management App" });

  const konteks = kanvas.getContext("2d");
  let posisiY = 0;
  let halaman = 0;

  while (posisiY < tinggiKanvas && halaman < MAKS_HALAMAN) {
    let tinggiPotong = Math.min(tinggiHalamanPiksel, tinggiKanvas - posisiY);
    const sisa = tinggiKanvas - (posisiY + tinggiPotong);
    if (sisa > 8 && konteks) {
      const potong = cariGarisPotong(konteks, lebarKanvas, posisiY + tinggiPotong, tinggiKanvas);
      if (potong > posisiY + 40) tinggiPotong = potong - posisiY;
    }

    const potongan = potongKanvas(kanvas, posisiY, tinggiPotong);
    if (halaman > 0) dok.addPage();
    dok.addImage(
      potongan.toDataURL("image/jpeg", 0.93),
      "JPEG",
      MARGIN_MM,
      MARGIN_MM,
      lebarPakai,
      tinggiPotong * mmPerPiksel,
      undefined,
      "FAST"
    );

    posisiY += tinggiPotong;
    halaman += 1;
  }

  dok.save(namaFile);
  return { halaman, orientasi: landscape ? "landscape" : "portrait" };
}
