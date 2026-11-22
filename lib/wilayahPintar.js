// lib/wilayahPintar.js
// Filter wilayah yang "pintar": membaca alamat bebas (hasil peta, manual,
// tempelan Google Maps) lalu menyimpulkan kota/provinsi/negaranya.
//
// Contoh:
// - "Jl. Gegerkalong Hilir No. 12" -> Bandung, Jawa Barat, Indonesia
// - "Blok M Plaza, Kebayoran Baru" -> Jakarta, DKI Jakarta, Indonesia
// - "Guangzhou, Guangdong"         -> Guangzhou, Guangdong, China
//
// Pilihan filter dibangun dari data yang benar-benar ada (entri user + hasil
// pencarian). Jadi kalau suatu hari muncul kota baru, kotanya otomatis masuk
// daftar filter tanpa perlu mengubah kode.

import { normalisasiTeks } from "./direktoriData.js";

// Kawasan/kelurahan yang sering dipakai orang, dipetakan ke kota induknya.
// Ini yang membuat "Gegerkalong" langsung terbaca sebagai Bandung.
const KAWASAN = [
  {
    kata: [
      "gegerkalong",
      "setiabudi bandung",
      "setiabudhi",
      "dago",
      "cihampelas",
      "pasteur",
      "sukajadi",
      "cicendo",
      "cihapit",
      "lembang",
      "cimahi",
      "cipaganti",
      "buabatu",
      "buah batu",
      "margahayu",
      "mohammad toha",
      "moh toha",
      "kiara condong",
      "kiaracondong",
      "cicaheum",
      "antapani",
      "ujung berung",
      "ujungberung",
      "cibiru",
      "arcamanik",
      "gedebage",
      "rancasari",
      "cinambo",
      "mandalajati",
      "panyileukan",
      "cikutra",
      "cisitu",
      "dipatiukur",
      "dipati ukur",
      "sadang serang",
      "babakan ciparay",
      "bojongloa",
      "astanaanyar",
      "regol",
      "lengkong",
      "coblong",
      "andir",
      "bandung kulon",
      "bandung wetan",
      "batununggal",
      "soreang",
      "padalarang",
      "banjaran",
      "majalaya",
      "ciwidey",
      "pangalengan",
    ],
    kota: "Bandung",
    provinsi: "Jawa Barat",
    negara: "Indonesia",
    wilayahId: "bandung",
  },
  {
    kata: [
      "blok m",
      "blokm",
      "kemang",
      "senayan",
      "sudirman",
      "thamrin",
      "kuningan",
      "tebet",
      "cilandak",
      "kebayoran",
      "menteng",
      "matraman",
      "jatinegara",
      "cempaka putih",
      "kelapa gading",
      "pluit",
      "penjaringan",
      "taman sari",
      "glodok",
      "mangga dua",
      "tanah abang",
      "pasar minggu",
      "jagakarsa",
      "pesanggrahan",
      "mampang",
      "kebon jeruk",
      "grogol",
      "kalideres",
      "cengkareng",
      "duren sawit",
      "cakung",
      "pulogadung",
      "jatiasih",
      "kramat jati",
      "pasar rebo",
      "ciracas",
      "setiabudi jakarta",
      "kuningan barat",
      "slipi",
      "tomang",
      "gandaria",
      "pondok indah",
      "cililitan",
      "rawamangun",
      "salemba",
      "cikini",
      "sawah besar",
    ],
    kota: "Jakarta",
    provinsi: "DKI Jakarta",
    negara: "Indonesia",
    wilayahId: "jakarta",
  },
  {
    kata: ["bogor", "cibinong", "sentul", "cileungsi", "depok", "margonda", "cinere", "tangerang", "serpong", "bsd", "ciputat", "bekasi", "cikarang", "karawang", "serang", "cilegon", "bintaro"],
    kota: "",
    provinsi: "",
    negara: "Indonesia",
    wilayahId: "jabodetabek",
    petakanKota: {
      bogor: "Bogor",
      cibinong: "Bogor",
      sentul: "Bogor",
      cileungsi: "Bogor",
      depok: "Depok",
      margonda: "Depok",
      cinere: "Depok",
      tangerang: "Tangerang",
      serpong: "Tangerang Selatan",
      bsd: "Tangerang Selatan",
      ciputat: "Tangerang Selatan",
      bintaro: "Tangerang Selatan",
      bekasi: "Bekasi",
      cikarang: "Bekasi",
      karawang: "Karawang",
      serang: "Serang",
      cilegon: "Cilegon",
    },
  },
];

// Kota -> provinsi. Dipakai untuk melengkapi alamat yang cuma menyebut kota.
export const KOTA_PROVINSI = {
  bandung: ["Bandung", "Jawa Barat"],
  cimahi: ["Cimahi", "Jawa Barat"],
  bogor: ["Bogor", "Jawa Barat"],
  depok: ["Depok", "Jawa Barat"],
  bekasi: ["Bekasi", "Jawa Barat"],
  karawang: ["Karawang", "Jawa Barat"],
  tasikmalaya: ["Tasikmalaya", "Jawa Barat"],
  cirebon: ["Cirebon", "Jawa Barat"],
  sukabumi: ["Sukabumi", "Jawa Barat"],
  jakarta: ["Jakarta", "DKI Jakarta"],
  tangerang: ["Tangerang", "Banten"],
  "tangerang selatan": ["Tangerang Selatan", "Banten"],
  serang: ["Serang", "Banten"],
  cilegon: ["Cilegon", "Banten"],
  semarang: ["Semarang", "Jawa Tengah"],
  solo: ["Surakarta", "Jawa Tengah"],
  surakarta: ["Surakarta", "Jawa Tengah"],
  magelang: ["Magelang", "Jawa Tengah"],
  yogyakarta: ["Yogyakarta", "DI Yogyakarta"],
  jogja: ["Yogyakarta", "DI Yogyakarta"],
  surabaya: ["Surabaya", "Jawa Timur"],
  sidoarjo: ["Sidoarjo", "Jawa Timur"],
  gresik: ["Gresik", "Jawa Timur"],
  malang: ["Malang", "Jawa Timur"],
  pasuruan: ["Pasuruan", "Jawa Timur"],
  kediri: ["Kediri", "Jawa Timur"],
  jember: ["Jember", "Jawa Timur"],
  denpasar: ["Denpasar", "Bali"],
  badung: ["Badung", "Bali"],
  medan: ["Medan", "Sumatera Utara"],
  palembang: ["Palembang", "Sumatera Selatan"],
  padang: ["Padang", "Sumatera Barat"],
  pekanbaru: ["Pekanbaru", "Riau"],
  batam: ["Batam", "Kepulauan Riau"],
  "bandar lampung": ["Bandar Lampung", "Lampung"],
  makassar: ["Makassar", "Sulawesi Selatan"],
  manado: ["Manado", "Sulawesi Utara"],
  balikpapan: ["Balikpapan", "Kalimantan Timur"],
  samarinda: ["Samarinda", "Kalimantan Timur"],
  banjarmasin: ["Banjarmasin", "Kalimantan Selatan"],
  pontianak: ["Pontianak", "Kalimantan Barat"],
  manokwari: ["Manokwari", "Papua Barat"],
  jayapura: ["Jayapura", "Papua"],
  guangzhou: ["Guangzhou", "Guangdong"],
  shenzhen: ["Shenzhen", "Guangdong"],
  dongguan: ["Dongguan", "Guangdong"],
  ningbo: ["Ningbo", "Zhejiang"],
  yiwu: ["Yiwu", "Zhejiang"],
  shanghai: ["Shanghai", "Shanghai"],
  qingdao: ["Qingdao", "Shandong"],
  xiamen: ["Xiamen", "Fujian"],
  tokyo: ["Tokyo", "Tokyo"],
  osaka: ["Osaka", "Osaka"],
  nagoya: ["Nagoya", "Aichi"],
  seoul: ["Seoul", "Seoul"],
  busan: ["Busan", "Busan"],
  "ho chi minh": ["Ho Chi Minh", "Ho Chi Minh"],
  hanoi: ["Hanoi", "Hanoi"],
  bangkok: ["Bangkok", "Bangkok"],
  "kuala lumpur": ["Kuala Lumpur", "Kuala Lumpur"],
  singapore: ["Singapore", "Singapore"],
  singapura: ["Singapore", "Singapore"],
};

// Negara yang sering muncul di data direktori.
export const NAMA_NEGARA = [
  ["indonesia", "Indonesia"],
  ["china", "China"],
  ["tiongkok", "China"],
  ["japan", "Jepang"],
  ["jepang", "Jepang"],
  ["south korea", "Korea Selatan"],
  ["korea", "Korea Selatan"],
  ["singapore", "Singapura"],
  ["singapura", "Singapura"],
  ["malaysia", "Malaysia"],
  ["thailand", "Thailand"],
  ["vietnam", "Vietnam"],
  ["india", "India"],
  ["taiwan", "Taiwan"],
  ["united states", "Amerika Serikat"],
  ["usa", "Amerika Serikat"],
  ["amerika", "Amerika Serikat"],
  ["germany", "Jerman"],
  ["jerman", "Jerman"],
  ["netherlands", "Belanda"],
  ["belanda", "Belanda"],
  ["australia", "Australia"],
  ["turkey", "Turki"],
  ["turki", "Turki"],
];

function cariNamaNegara(teks) {
  const t = normalisasiTeks(teks);
  for (const [pola, nama] of NAMA_NEGARA) {
    if (t.includes(pola)) return nama;
  }
  return "";
}

// Provinsi di luar Indonesia, supaya kota seperti Guangzhou tidak dilabeli
// Indonesia hanya karena namanya ada di daftar kota.
const PROVINSI_NEGARA = {
  guangdong: "China",
  zhejiang: "China",
  shandong: "China",
  fujian: "China",
  shanghai: "China",
  tokyo: "Jepang",
  osaka: "Jepang",
  aichi: "Jepang",
  seoul: "Korea Selatan",
  busan: "Korea Selatan",
  "ho chi minh": "Vietnam",
  hanoi: "Vietnam",
  bangkok: "Thailand",
  "kuala lumpur": "Malaysia",
  singapore: "Singapura",
};

function cariKota(teks) {
  const t = normalisasiTeks(teks);
  if (!t) return null;
  // Nama kota terpanjang dicek lebih dulu supaya "tangerang selatan" tidak
  // keburu terbaca "tangerang".
  const kunci = Object.keys(KOTA_PROVINSI).sort((a, b) => b.length - a.length);
  for (const kota of kunci) {
    const pola = new RegExp(`(^|[^a-z])${kota}([^a-z]|$)`);
    if (pola.test(t)) {
      const [namaKota, provinsi] = KOTA_PROVINSI[kota];
      return { kota: namaKota, provinsi };
    }
  }
  return null;
}

// Baca wilayah dari teks bebas (alamat/kota/provinsi/negara digabung).
export function bacaWilayah(...bagian) {
  const teks = bagian.filter(Boolean).map(String).join(" ");
  const bersih = normalisasiTeks(teks);
  if (!bersih) return { kota: "", provinsi: "", negara: "", wilayahId: "" };

  for (const grup of KAWASAN) {
    for (const kata of grup.kata) {
      const pola = new RegExp(`(^|[^a-z])${normalisasiTeks(kata)}([^a-z]|$)`);
      if (!pola.test(bersih)) continue;
      let kota = grup.kota;
      if (!kota && grup.petakanKota) {
        const kunci = Object.keys(grup.petakanKota).find((k) =>
          new RegExp(`(^|[^a-z])${k}([^a-z]|$)`).test(bersih)
        );
        kota = kunci ? grup.petakanKota[kunci] : "";
      }
      // Provinsi diisi dari kota yang benar-benar terdeteksi, supaya filter
      // tidak menampilkan nama grup yang campur aduk.
      const provinsi =
        grup.provinsi ||
        (kota ? KOTA_PROVINSI[normalisasiTeks(kota)]?.[1] : "") ||
        "Jawa Barat";
      return {
        kota,
        provinsi,
        negara: grup.negara,
        wilayahId: grup.wilayahId,
      };
    }
  }

  const kota = cariKota(bersih);
  const negaraTeks = cariNamaNegara(bersih);
  const negaraKota = kota
    ? negaraTeks || PROVINSI_NEGARA[normalisasiTeks(kota.provinsi)] || "Indonesia"
    : "";
  return {
    kota: kota?.kota || "",
    provinsi: kota?.provinsi || "",
    negara: negaraKota || negaraTeks || "",
    wilayahId: "",
  };
}

// Lengkapi field wilayah yang masih kosong, tanpa menimpa isian user.
export function lengkapiWilayah(mitra = {}) {
  const tebakan = bacaWilayah(
    mitra.alamat,
    mitra.kota,
    mitra.provinsi,
    mitra.negara,
    mitra.catatan
  );
  const kota = mitra.kota || tebakan.kota || "";
  let provinsi = mitra.provinsi || tebakan.provinsi || "";
  let negara = mitra.negara || tebakan.negara || "";
  if (!negara && provinsi) negara = "Indonesia";
  if (negara && !provinsi && kota) {
    provinsi = KOTA_PROVINSI[normalisasiTeks(kota)]?.[1] || "";
  }
  return { kota, provinsi, negara };
}

export function labelLokasi(mitra = {}) {
  const { kota, provinsi, negara } = lengkapiWilayah(mitra);
  return [kota, provinsi, negara].filter(Boolean).join(", ");
}

function kunci(nilai) {
  return normalisasiTeks(nilai);
}

// Filter wilayah bertingkat: negara -> provinsi -> kota.
export function cocokWilayah(mitra = {}, filter = {}) {
  const { kota, provinsi, negara } = lengkapiWilayah(mitra);
  if (filter.negara && kunci(negara) !== kunci(filter.negara)) return false;
  if (filter.provinsi && kunci(provinsi) !== kunci(filter.provinsi)) return false;
  if (filter.kota && kunci(kota) !== kunci(filter.kota)) return false;
  return true;
}

// Bangun daftar pilihan filter dari data yang ada. Kota/provinsi/negara baru
// otomatis muncul selama data itu ada di entri user atau hasil pencarian.
export function bangunPilihanWilayah(daftar = [], filter = {}) {
  const negara = new Map();
  const provinsi = new Map();
  const kota = new Map();

  for (const mitra of daftar) {
    const w = lengkapiWilayah(mitra || {});
    if (!w.negara && !w.provinsi && !w.kota) continue;

    if (w.negara) negara.set(w.negara, (negara.get(w.negara) || 0) + 1);

    if (w.provinsi) {
      const kunciProvinsi = `${w.negara}|${w.provinsi}`;
      const ada = provinsi.get(kunciProvinsi) || { nama: w.provinsi, negara: w.negara, jumlah: 0 };
      ada.jumlah += 1;
      provinsi.set(kunciProvinsi, ada);
    }

    if (w.kota) {
      const kunciKota = `${w.negara}|${w.provinsi}|${w.kota}`;
      const ada = kota.get(kunciKota) || {
        nama: w.kota,
        provinsi: w.provinsi,
        negara: w.negara,
        jumlah: 0,
      };
      ada.jumlah += 1;
      kota.set(kunciKota, ada);
    }
  }

  const urut = (a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama, "id");

  return {
    negara: [...negara.entries()]
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama, "id")),
    provinsi: [...provinsi.values()]
      .filter((p) => !filter.negara || kunci(p.negara) === kunci(filter.negara))
      .sort(urut),
    kota: [...kota.values()]
      .filter((k) => !filter.negara || kunci(k.negara) === kunci(filter.negara))
      .filter((k) => !filter.provinsi || kunci(k.provinsi) === kunci(filter.provinsi))
      .sort(urut),
  };
}

export const FILTER_WILAYAH_KOSONG = { negara: "", provinsi: "", kota: "" };

export function adaFilterWilayah(filter = {}) {
  return Boolean(filter.negara || filter.provinsi || filter.kota);
}
