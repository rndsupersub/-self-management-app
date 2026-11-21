// components/DirektoriMitra.js
"use client";

// Direktori = mesin pencari usaha (vendor, agency, jasa), bukan daftar vendor
// milik brand. User mengetik kata kunci + memilih wilayah, lalu aplikasi
// mencari usaha nyata di peta publik (OpenStreetMap). Setiap hasil punya
// tombol yang langsung membuka titiknya di Google Maps.
//
// Hasil yang berguna bisa disimpan ke "Direktori saya" (tersimpan di dokumen
// user), lalu diedit, diberi catatan, atau ditandai tutup usaha. Jadi datanya
// tetap milik user dan bisa dipakai di Pekerjaan maupun Bisnis.

import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  BookOpen,
  Briefcase,
  Check,
  Crosshair,
  ExternalLink,
  Factory,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Printer,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  CONTOH_PENCARIAN,
  JENIS_MITRA,
  SARAN_LAYANAN,
  STATUS_MITRA,
  WILAYAH,
  WILAYAH_DEFAULT,
  buatMitraKosong,
  cariMitra,
  deteksiWilayah,
  generateId,
  getWilayah,
  imporDariVendorBrand,
  kunciMitra,
  labelJenis,
  mitraDariHasilCari,
  tautanAman,
  tautanEmail,
  tautanKoordinat,
  tautanMaps,
  tautanTelepon,
  tautanWhatsApp,
  vendorDariDaftarMitra,
} from "@/lib/direktoriData";
import PanduanCari from "@/components/PanduanCari";
import TambahDariMaps from "@/components/TambahDariMaps";

const IKON_JENIS = { vendor: Factory, agency: Sparkles, jasa: Briefcase };

const KELAS_CHIP = (aktif) =>
  `btn btn-xs rounded-full border ${
    aktif
      ? "bg-stone-800 text-white border-stone-800"
      : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
  }`;

function ChipKontak({ href, ikon: Ikon, label, judul, luar = false }) {
  const isi = (
    <>
      <Ikon size={12} className="mr-1" /> {label}
    </>
  );
  if (!href) {
    return (
      <span className="btn btn-xs bg-white border border-stone-200 text-stone-400 cursor-default">
        {isi}
      </span>
    );
  }
  return (
    <a
      className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
      href={href}
      title={judul || label}
      {...(luar ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {isi}
    </a>
  );
}

function namaDomain(url) {
  const teks = tautanAman(url);
  if (!teks) return "";
  try {
    return new URL(teks).hostname.replace(/^www\./, "");
  } catch {
    return "Website";
  }
}

function BarisKontak({ mitra }) {
  const kontak = mitra.kontak || {};
  return (
    <div className="flex flex-wrap gap-1.5" data-html2canvas-ignore="true">
      <ChipKontak
        href={tautanWhatsApp(kontak.wa)}
        ikon={MessageCircle}
        label={kontak.wa || "WA belum ada"}
        judul={kontak.wa || "Nomor WhatsApp belum tercatat"}
        luar
      />
      <ChipKontak
        href={tautanTelepon(kontak.telepon)}
        ikon={Phone}
        label={kontak.telepon || "Telp belum ada"}
        judul={kontak.telepon || "Nomor telepon belum tercatat"}
      />
      <ChipKontak
        href={tautanEmail(kontak.email)}
        ikon={Mail}
        label={kontak.email || "Email belum ada"}
        judul={kontak.email || "Email belum tercatat"}
      />
      {kontak.fax && (
        <span className="btn btn-xs bg-white border border-stone-200 text-stone-500 cursor-default" title="Nomor fax">
          <Printer size={12} className="mr-1" /> {kontak.fax}
        </span>
      )}
      {mitra.website && (
        <ChipKontak
          href={tautanAman(mitra.website)}
          ikon={Globe}
          label={namaDomain(mitra.website)}
          judul={mitra.website}
          luar
        />
      )}
    </div>
  );
}

function AlamatMitra({ mitra }) {
  const teks = [mitra.alamat, mitra.kota, mitra.provinsi, mitra.negara]
    .filter(Boolean)
    .join(", ");
  const lat = Number(mitra.koordinat?.lat);
  const lon = Number(mitra.koordinat?.lon);
  const adaKoordinat =
    Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;

  if (!teks && !adaKoordinat) return null;

  return (
    <div className="space-y-0.5">
      {teks ? (
        <p className="text-xs text-stone-600 flex items-start gap-1">
          <MapPin size={12} className="mt-0.5 shrink-0 text-stone-400" />
          <span>{teks}</span>
        </p>
      ) : (
        <p className="text-xs text-stone-500 flex items-start gap-1">
          <MapPin size={12} className="mt-0.5 shrink-0 text-stone-400" />
          <span>Alamat belum tercatat di data peta. Titik koordinatnya sudah benar.</span>
        </p>
      )}
      {adaKoordinat && (
        <p className="text-[10px] text-stone-400 pl-4">
          Titik peta: {lat.toFixed(5)}, {lon.toFixed(5)}
        </p>
      )}
    </div>
  );
}

function BadgeWilayah({ mitra }) {
  const wilayah = getWilayah(mitra.wilayah || deteksiWilayah(mitra));
  return (
    <span className="badge badge-sm bg-stone-50 text-stone-600 border-stone-200">
      <MapPin size={10} className="mr-1" />
      {wilayah.label.split(" (")[0]}
    </span>
  );
}

// Kartu hasil pencarian peta. Semua tombolnya mengarah keluar (Maps, WA,
// telepon, email, website) supaya user bisa langsung menghubungi usahanya.
function KartuCari({ hasil, onSimpan, tersimpan }) {
  const Ikon = IKON_JENIS[hasil.jenis] || Factory;
  const tutup = hasil.status === "tutup";

  return (
    <div
      className={`card bg-white border shadow-sm hover:shadow transition ${
        tutup ? "border-stone-200 opacity-90" : "border-stone-200"
      }`}
    >
      <div className="card-body p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <Ikon size={16} className="shrink-0 text-stone-500" />
              <span className="truncate" title={hasil.nama}>
                {hasil.nama}
              </span>
            </h3>
            <p className="text-xs text-stone-500">{hasil.layanan || "Kategori belum tercatat di peta"}</p>
          </div>
          <button
            type="button"
            className={`btn btn-xs shrink-0 ${
              tersimpan
                ? "btn-ghost text-stone-400 cursor-default"
                : "bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
            }`}
            onClick={() => !tersimpan && onSimpan(hasil)}
            disabled={tersimpan}
            title={tersimpan ? "Sudah ada di direktori saya" : "Simpan ke direktori saya"}
            data-html2canvas-ignore="true"
          >
            {tersimpan ? <Check size={12} className="mr-1" /> : <Save size={12} className="mr-1" />}
            {tersimpan ? "Tersimpan" : "Simpan"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="badge badge-sm bg-stone-100 text-stone-700 border-stone-300">
            {labelJenis(hasil.jenis)}
          </span>
          <BadgeWilayah mitra={hasil} />
          {typeof hasil.jarakKm === "number" && (
            <span
              className="badge badge-sm bg-stone-50 text-stone-600 border-stone-200"
              title={`Jarak dari pusat ${hasil.jarakDari || "wilayah"}`}
            >
              <Crosshair size={10} className="mr-1" /> ± {hasil.jarakKm} km
            </span>
          )}
          {hasil.diLuarWilayah && (
            <span className="badge badge-sm bg-amber-50 text-amber-800 border-amber-200">
              Di luar wilayah
            </span>
          )}
          {tutup ? (
            <span className="badge badge-sm bg-red-50 text-error border-red-200">
              <X size={10} className="mr-1" /> Tutup usaha
            </span>
          ) : (
            <span className="badge badge-sm bg-stone-50 text-stone-500 border-stone-200">
              Status belum dicek
            </span>
          )}
          {hasil.terkait && (
            <span className="badge badge-sm bg-amber-50 text-amber-800 border-amber-200">
              Hasil terkait
            </span>
          )}
        </div>

        <AlamatMitra mitra={hasil} />
        <BarisKontak mitra={hasil} />

        {!hasil.kontak?.telepon && !hasil.kontak?.wa && !hasil.website && (
          <p className="text-[11px] text-stone-500">
            Telepon/website belum tercatat di data peta. Tombol Google Maps membuka kartu tempat
            itu — biasanya nomor dan websitenya ada di sana.
          </p>
        )}

        {(hasil.jamBuka || hasil.kontak?.narahubung) && (
          <p className="text-[11px] text-stone-500">
            {hasil.kontak?.narahubung && <>Pengelola: {hasil.kontak.narahubung} · </>}
            {hasil.jamBuka ? `Jam buka: ${hasil.jamBuka}` : ""}
          </p>
        )}

        {tutup && hasil.statusCatatan && (
          <p className="text-[11px] text-error/90 italic">{hasil.statusCatatan}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5" data-html2canvas-ignore="true">
            {hasil.mapsUrl && (
              <a
                className="btn btn-xs bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
                href={hasil.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Buka ${hasil.nama} di Google Maps (kartu tempat)`}
              >
                <MapPin size={12} className="mr-1" /> Google Maps
                <ExternalLink size={10} className="ml-1" />
              </a>
            )}
            {hasil.mapsKoordinat && hasil.mapsKoordinat !== hasil.mapsUrl && (
              <a
                className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                href={hasil.mapsKoordinat}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka titik koordinat presisi di Google Maps"
              >
                <Crosshair size={12} className="mr-1" /> Titik peta
              </a>
            )}
            {hasil.tautanOsm && (
              <a
                className="btn btn-xs btn-ghost text-stone-500 hover:text-stone-800"
                href={hasil.tautanOsm}
                target="_blank"
                rel="noopener noreferrer"
                title="Lihat data sumber di OpenStreetMap"
              >
                <ExternalLink size={11} className="mr-1" /> Sumber peta
              </a>
            )}
          </div>
          <span className="text-[10px] text-stone-400">{hasil.kategori || "OpenStreetMap"}</span>
        </div>
      </div>
    </div>
  );
}

// Kartu entri milik user (tab Tersimpan).
function KartuMitra({ mitra, onEdit, onHapus, onTutup, onExport }) {
  const Ikon = IKON_JENIS[mitra.jenis] || Factory;
  const tutup = (mitra.status || "aktif") === "tutup";
  const maps = tautanMaps(mitra);
  const titik = tautanKoordinat(mitra);
  const website = tautanAman(mitra.website);

  return (
    <div className="card bg-white border border-stone-200 shadow-sm hover:shadow transition">
      <div className="card-body p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <Ikon size={16} className="shrink-0 text-stone-500" />
              <span className="truncate" title={mitra.nama}>
                {mitra.nama || "(tanpa nama)"}
              </span>
            </h3>
            <p className="text-xs text-stone-500">{mitra.layanan || "Layanan belum diisi"}</p>
          </div>
          <div className="flex shrink-0 gap-1" data-html2canvas-ignore="true">
            <button
              type="button"
              className="btn btn-ghost btn-xs text-stone-400 hover:text-stone-800"
              onClick={() => onEdit(mitra)}
              title="Edit entri"
              aria-label={`Edit ${mitra.nama}`}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
              onClick={() => onHapus(mitra)}
              title="Hapus entri"
              aria-label={`Hapus ${mitra.nama}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="badge badge-sm bg-stone-100 text-stone-700 border-stone-300">
            {labelJenis(mitra.jenis)}
          </span>
          <BadgeWilayah mitra={mitra} />
          {tutup ? (
            <span className="badge badge-sm bg-red-50 text-error border-red-200">
              <X size={10} className="mr-1" /> Tutup usaha
            </span>
          ) : (
            <span className="badge badge-sm bg-green-50 text-green-700 border-green-200">
              <Check size={10} className="mr-1" /> Aktif
            </span>
          )}
        </div>

        {tutup && mitra.statusCatatan && (
          <p className="text-[11px] text-error/90 italic">Keterangan: {mitra.statusCatatan}</p>
        )}

        <BarisKontak mitra={mitra} />
        <AlamatMitra mitra={mitra} />

        {(mitra.kontak?.narahubung || mitra.kontak?.wa || mitra.kontak?.telepon) && (
          <p className="text-[11px] text-stone-500">
            {mitra.kontak?.narahubung && <>Narahubung: {mitra.kontak.narahubung} · </>}
            {mitra.kontak?.wa || mitra.kontak?.telepon || "-"}
          </p>
        )}

        {mitra.catatan && <p className="text-xs text-stone-600">{mitra.catatan}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5" data-html2canvas-ignore="true">
            {maps && (
              <a
                className="btn btn-xs bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di Google Maps"
              >
                <MapPin size={12} className="mr-1" /> Google Maps
              </a>
            )}
            {website && (
              <a
                className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                title={mitra.website}
              >
                <Globe size={12} className="mr-1" /> {namaDomain(mitra.website)}
              </a>
            )}
            {titik && titik !== maps && (
              <a
                className="btn btn-xs btn-ghost text-stone-500 hover:text-stone-800"
                href={titik}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka titik koordinat presisi"
              >
                <Crosshair size={12} className="mr-1" /> Titik peta
              </a>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-xs text-stone-600 hover:text-stone-900"
              onClick={() => onExport(mitra)}
              title="Ekspor entri ini ke tab Vendor"
              data-html2canvas-ignore="true"
            >
              <Factory size={12} className="mr-1" /> Ke Vendor
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-stone-500 hover:text-stone-800"
              onClick={() => onTutup(mitra)}
              data-html2canvas-ignore="true"
            >
              {tutup ? (
                <>
                  <Check size={12} className="mr-1" /> Tandai aktif lagi
                </>
              ) : (
                <>
                  <X size={12} className="mr-1" /> Tandai tutup usaha
                </>
              )}
            </button>
          </div>
          <span className="text-[10px] text-stone-400">
            {mitra.updatedAt
              ? `Diperbarui ${new Date(mitra.updatedAt).toLocaleDateString("id-ID")}`
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DirektoriMitra({
  daftar = [],
  onUpdate,
  brandNama = "",
  vendorBrand = [],
  onExportVendor,
  kategoriVendor = [],
}) {
  const daftarAman = Array.isArray(daftar) ? daftar : [];

  const [mode, setMode] = useState("cari");

  // ---- pencarian ----
  const [q, setQ] = useState("");
  const [wilayah, setWilayah] = useState(WILAYAH_DEFAULT);
  const [jenis, setJenis] = useState("semua");
  const [hasil, setHasil] = useState([]);
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState("");
  const [infoSimpan, setInfoSimpan] = useState("");
  const [sudahCari, setSudahCari] = useState(false);

  // ---- daftar tersimpan ----
  const [qTersimpan, setQTersimpan] = useState("");
  const [jenisTersimpan, setJenisTersimpan] = useState("semua");
  const [statusTersimpan, setStatusTersimpan] = useState("semua");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(buatMitraKosong());

  const tersimpan = useMemo(
    () => cariMitra(daftarAman, { q: qTersimpan, jenis: jenisTersimpan, status: statusTersimpan, urut: "wilayah" }),
    [daftarAman, qTersimpan, jenisTersimpan, statusTersimpan]
  );

  // Kunci entri memakai nama + koordinat, jadi dua cabang dengan nama sama
  // tetap bisa disimpan sebagai dua entri.
  const tersimpanSet = useMemo(
    () => new Set(daftarAman.map((m) => kunciMitra(m))),
    [daftarAman]
  );

  useEffect(() => {
    if (!infoSimpan) return undefined;
    const waktu = setTimeout(() => setInfoSimpan(""), 5000);
    return () => clearTimeout(waktu);
  }, [infoSimpan]);

  const jalankanCari = useCallback(
    async (kata) => {
      const teks = String(kata ?? q).trim();
      if (teks.length < 2) {
        setPesan("Ketik minimal 2 huruf. Contoh: bengkel las, digital printing, konveksi.");
        return;
      }

      setMencari(true);
      setPesan("");
      setInfoSimpan("");
      setSudahCari(true);
      setHasil([]);

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Sesi login tidak ditemukan. Muat ulang halaman lalu login lagi.");
        }
        const token = await user.getIdToken();
        const param = new URLSearchParams({ q: teks, wilayah, jenis });
        const res = await fetch(`/api/direktori/cari?${param}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Pencarian gagal (kode ${res.status}).`);
        }
        const list = Array.isArray(data.hasil) ? data.hasil : [];
        setHasil(list);
        if (list.length === 0) {
          setPesan(
            "Belum ada usaha yang cocok. Coba kata kunci lain (mis. \"plastik\", \"bengkel\", \"percetakan\") atau ganti wilayah. Data peta publik (OpenStreetMap) memang belum selengkap Google Maps, jadi usaha kecil bisa saja belum terdaftar. Tombol \"Cari di Google Maps\" di atas membuka daftar Google untuk kata kunci yang sama."
          );
        } else if (data.catatan) {
          setPesan(data.catatan);
        }
      } catch (err) {
        setPesan(err.message || "Pencarian gagal. Coba lagi.");
      } finally {
        setMencari(false);
      }
    },
    [q, wilayah, jenis]
  );

  const contohKlik = (kata) => {
    setQ(kata);
    jalankanCari(kata);
  };

  const mapsPencarian = useMemo(() => {
    const teks = [q.trim(), wilayah !== "semua" ? getWilayah(wilayah).label.split(" (")[0] : ""]
      .filter(Boolean)
      .join(" ");
    if (!teks) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teks)}`;
  }, [q, wilayah]);

  const simpanHasil = (hasilCari) => {
    const baru = {
      ...mitraDariHasilCari(hasilCari),
      id: generateId("mitra"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!baru.nama.trim()) return;
    if (tersimpanSet.has(kunciMitra(baru))) {
      setInfoSimpan(`"${baru.nama}" sudah ada di direktori saya.`);
      return;
    }
    onUpdate([...daftarAman, baru]);
    setInfoSimpan(`"${baru.nama}" disimpan ke direktori saya. Buka tab Tersimpan untuk melengkapi kontaknya.`);
  };

  // ---- CRUD daftar tersimpan ----
  const bukaTambah = () => {
    setEditId(null);
    setForm(buatMitraKosong({ jenis: jenisTersimpan === "semua" ? "vendor" : jenisTersimpan }));
    setShowForm(true);
  };

  const bukaEdit = (mitra) => {
    setEditId(mitra.id);
    setForm(buatMitraKosong({ ...mitra, kontak: mitra.kontak || {} }));
    setShowForm(true);
  };

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(buatMitraKosong());
  };

  const simpan = () => {
    if (!form.nama.trim()) return;
    const waktu = new Date().toISOString();
    if (editId) {
      onUpdate(
        daftarAman.map((m) =>
          m.id === editId
            ? {
                ...m,
                ...form,
                nama: form.nama.trim(),
                layanan: form.layanan.trim(),
                wilayah: form.wilayah || deteksiWilayah(form),
                updatedAt: waktu,
              }
            : m
        )
      );
    } else {
      const baru = {
        ...form,
        id: generateId("mitra"),
        nama: form.nama.trim(),
        layanan: form.layanan.trim(),
        wilayah: form.wilayah || deteksiWilayah(form),
        createdAt: waktu,
        updatedAt: waktu,
      };
      onUpdate([...daftarAman, baru]);
    }
    tutupForm();
  };

  const hapus = (mitra) => {
    if (!confirm(`Hapus "${mitra.nama}" dari direktori?`)) return;
    onUpdate(daftarAman.filter((m) => m.id !== mitra.id));
  };

  const toggleStatus = (mitra) => {
    const tutup = (mitra.status || "aktif") === "tutup";
    onUpdate(
      daftarAman.map((m) =>
        m.id === mitra.id
          ? {
              ...m,
              status: tutup ? "aktif" : "tutup",
              statusCatatan: tutup ? "" : m.statusCatatan || "Sudah tidak menerima pesanan",
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const impor = () => {
    const baru = imporDariVendorBrand(vendorBrand, brandNama);
    if (baru.length === 0) return;
    const tambahan = baru
      .filter((m) => !tersimpanSet.has(kunciMitra(m)))
      .map((m) => ({
        ...m,
        id: generateId("mitra"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    if (tambahan.length === 0) {
      setInfoSimpan("Semua vendor brand ini sudah ada di direktori saya.");
      return;
    }
    onUpdate([...daftarAman, ...tambahan]);
    setInfoSimpan(
      `${tambahan.length} vendor diimpor ke direktori saya. Lengkapi WhatsApp, wilayah, dan statusnya.`
    );
  };

  // Ekspor entri direktori ke tab Vendor. Data langsung terisi dari entri
  // yang sudah didapat: nama, kontak, alamat, layanan, dan tautan peta.
  const eksporKeVendor = (satuAtauBanyak) => {
    if (typeof onExportVendor !== "function") {
      setInfoSimpan("Ekspor ke Vendor belum tersedia di halaman ini.");
      return;
    }
    const list = Array.isArray(satuAtauBanyak) ? satuAtauBanyak : [satuAtauBanyak];
    const baru = vendorDariDaftarMitra(list, vendorBrand, kategoriVendor);
    if (baru.length === 0) {
      setInfoSimpan(
        list.length === 1
          ? `"${list[0]?.nama || "Entri"}" sudah ada di daftar Vendor brand ini.`
          : "Semua entri sudah ada di daftar Vendor brand ini."
      );
      return;
    }
    onExportVendor(baru);
    setInfoSimpan(
      `${baru.length} entri diekspor ke tab Vendor. Datanya sudah terisi — cek dan lengkapi di sana.`
    );
  };

  // Isi form dari tautan Google Maps (dibaca components/TambahDariMaps.js).
  const isiDariMaps = (mitra, pesanAwal) => {
    setEditId(null);
    setForm(buatMitraKosong(mitra));
    setShowForm(true);
    setInfoSimpan(pesanAwal || "");
  };

  const ubah = (patch) => setForm((f) => ({ ...f, ...patch }));
  const ubahKontak = (patch) => setForm((f) => ({ ...f, kontak: { ...f.kontak, ...patch } }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-end gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Search size={20} /> Direktori Vendor, Agency &amp; Jasa
          </h2>
          <p className="text-xs text-stone-500">
            Mesin pencari usaha di peta publik (OpenStreetMap) — gratis, tanpa langganan. Setiap
            hasil bisa dibuka langsung di Google Maps, disimpan, atau diekspor ke tab Vendor.
          </p>
        </div>
        <div className="flex flex-wrap gap-1" data-html2canvas-ignore="true">
          {[
            { id: "cari", label: "Cari usaha", ikon: Search },
            { id: "tersimpan", label: `Tersimpan (${daftarAman.length})`, ikon: Save },
            { id: "panduan", label: "Panduan", ikon: BookOpen },
          ].map((tab) => {
            const Ikon = tab.ikon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-xs rounded-full border ${
                  mode === tab.id
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-600 border-stone-300"
                }`}
                onClick={() => setMode(tab.id)}
              >
                <Ikon size={12} className="mr-1" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "cari" && (
        <>
          <div className="card bg-white shadow border border-stone-200">
            <div className="card-body p-4 space-y-3">
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  jalankanCari();
                }}
              >
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 pr-10 text-stone-800 bg-white"
                    placeholder="Mau cari usaha apa? mis. bengkel las, digital printing, konveksi, jasa ekspedisi"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Kata kunci pencarian direktori"
                  />
                  {q && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"
                      onClick={() => setQ("")}
                      aria-label="Bersihkan pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  className="select select-bordered text-stone-800 bg-white"
                  value={wilayah}
                  onChange={(e) => setWilayah(e.target.value)}
                  aria-label="Wilayah pencarian"
                >
                  <option value="semua">Semua wilayah</option>
                  {WILAYAH.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" type="submit" disabled={mencari}>
                  {mencari ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-1" /> Mencari...
                    </>
                  ) : (
                    <>
                      <Search size={16} className="mr-1" /> Cari
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-stone-400 mr-1">Jenis:</span>
                <button className={KELAS_CHIP(jenis === "semua")} onClick={() => setJenis("semua")}>
                  Semua
                </button>
                {JENIS_MITRA.map((j) => {
                  const Ikon = IKON_JENIS[j.id] || Factory;
                  return (
                    <button
                      key={j.id}
                      className={KELAS_CHIP(jenis === j.id)}
                      onClick={() => setJenis(j.id)}
                    >
                      <Ikon size={12} className="mr-1" /> {j.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-stone-400 mr-1">Coba:</span>
                {CONTOH_PENCARIAN.map((kata) => (
                  <button
                    key={kata}
                    className="btn btn-xs btn-ghost text-stone-600 hover:text-stone-900"
                    onClick={() => contohKlik(kata)}
                    data-html2canvas-ignore="true"
                  >
                    {kata}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pesan && (
            <div
              className={`rounded border p-3 text-xs ${
                hasil.length === 0 && !mencari
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}
            >
              {pesan}
            </div>
          )}

          {infoSimpan && (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-xs text-green-800">
              {infoSimpan}
            </div>
          )}

          {!mencari && sudahCari && hasil.length === 0 && mapsPencarian && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-stone-200 bg-white p-3">
              <p className="text-xs text-stone-600">
                Data peta publik di wilayah ini masih tipis. Buka kata kunci yang sama di Google
                Maps untuk hasil lebih lengkap, lalu simpan kontaknya ke direktori saya.
              </p>
              <a
                className="btn btn-sm bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
                href={mapsPencarian}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={14} className="mr-1" /> Buka di Google Maps
                <ExternalLink size={11} className="ml-1" />
              </a>
            </div>
          )}

          {mencari && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card bg-white border border-stone-200">
                  <div className="card-body p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                    <div className="h-6 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!mencari && hasil.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-stone-500">
                  {hasil.length} usaha ditemukan untuk &quot;{q.trim()}&quot; · urutan wilayah:
                  Bandung → Jakarta → JABODETABEK → Jawa Tengah → Jawa Timur → provinsi lain →
                  China, Jepang, Korea, Asia lain → Amerika, Eropa.
                </p>
                {mapsPencarian && (
                  <a
                    className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                    href={mapsPencarian}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-html2canvas-ignore="true"
                  >
                    <MapPin size={12} className="mr-1" /> Buka pencarian ini di Google Maps
                    <ExternalLink size={10} className="ml-1" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {hasil.map((item) => (
                  <KartuCari
                    key={item.id}
                    hasil={item}
                    onSimpan={simpanHasil}
                    tersimpan={tersimpanSet.has(kunciMitra(item))}
                  />
                ))}
              </div>

              <p className="text-[11px] text-stone-400">
                Data peta © OpenStreetMap contributors. Kontak yang belum tercatat di peta bisa
                dicek lewat tombol Google Maps.
              </p>
            </>
          )}

          {!mencari && !sudahCari && (
            <div className="card bg-white shadow border border-stone-200">
              <div className="card-body p-8 text-center text-stone-400">
                <Search size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm text-stone-500">
                  Ketik kata kunci lalu tekan Cari. Misalnya &quot;bengkel las&quot; di Bandung,
                  &quot;digital printing&quot; di Jakarta, atau &quot;konveksi&quot; di Jawa Barat.
                </p>
                <p className="text-xs mt-1">
                  Pencarian berjalan di data peta publik, jadi tidak perlu API key atau biaya.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "tersimpan" && (
        <>
          <div className="card bg-white shadow border border-stone-200">
            <div className="card-body p-3 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full pl-9 text-stone-800 bg-white"
                    placeholder="Cari di direktori saya: nama, layanan, kota, nomor..."
                    value={qTersimpan}
                    onChange={(e) => setQTersimpan(e.target.value)}
                    aria-label="Cari di direktori saya"
                  />
                </div>
                <select
                  className="select select-bordered select-xs text-stone-800 bg-white"
                  value={jenisTersimpan}
                  onChange={(e) => setJenisTersimpan(e.target.value)}
                  aria-label="Filter jenis entri tersimpan"
                >
                  <option value="semua">Semua jenis</option>
                  {JENIS_MITRA.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.label}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered select-xs text-stone-800 bg-white"
                  value={statusTersimpan}
                  onChange={(e) => setStatusTersimpan(e.target.value)}
                  aria-label="Filter status entri tersimpan"
                >
                  <option value="semua">Semua status</option>
                  {STATUS_MITRA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-stone-400">{tersimpan.length} entri</span>
              </div>

              <div className="flex flex-wrap gap-1" data-html2canvas-ignore="true">
                <button className="btn btn-primary btn-xs" onClick={bukaTambah}>
                  <Plus size={14} className="mr-1" /> Tambah manual
                </button>
                {daftarAman.length > 0 && (
                  <button
                    className="btn btn-xs bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
                    onClick={() => eksporKeVendor(daftarAman)}
                    title="Isi tab Vendor otomatis dari semua entri tersimpan"
                  >
                    <Factory size={14} className="mr-1" /> Ekspor ke Vendor ({daftarAman.length})
                  </button>
                )}
                {vendorBrand.length > 0 && (
                  <button className="btn btn-ghost btn-xs text-stone-600" onClick={impor}>
                    <Plus size={14} className="mr-1" /> Impor vendor brand ini ({vendorBrand.length})
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-xs text-stone-600"
                  onClick={() => setMode("cari")}
                >
                  <Search size={14} className="mr-1" /> Cari usaha baru
                </button>
              </div>
            </div>
          </div>

          <TambahDariMaps onSiap={isiDariMaps} />

          {showForm && (
            <div className="card bg-white shadow border border-stone-300">
              <div className="card-body p-4">
                <h3 className="text-base font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Pencil size={16} />{" "}
                    {editId
                      ? "Edit Entri"
                      : form.sumber === "google-maps"
                        ? "Lengkapi Data dari Google Maps"
                        : "Tambah Entri Manual"}
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">
                        Nama perusahaan / orang *
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full text-stone-800 bg-white"
                        placeholder="PT Contoh Jaya"
                        value={form.nama}
                        onChange={(e) => ubah({ nama: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">Jenis</label>
                      <select
                        className="select select-bordered select-sm w-full text-stone-800 bg-white"
                        value={form.jenis}
                        onChange={(e) => ubah({ jenis: e.target.value })}
                      >
                        {JENIS_MITRA.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">
                        Layanan / keahlian
                      </label>
                      <input
                        type="text"
                        list="saran-layanan-direktori"
                        className="input input-bordered input-sm w-full text-stone-800 bg-white"
                        placeholder="Injection Moulding, Branding, Host Live..."
                        value={form.layanan}
                        onChange={(e) => ubah({ layanan: e.target.value })}
                      />
                      <datalist id="saran-layanan-direktori">
                        {SARAN_LAYANAN.filter(
                          (s) => form.jenis === "semua" || s.jenis === form.jenis
                        ).map((s) => (
                          <option key={`${s.jenis}-${s.label}`} value={s.label} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">
                        Kata kunci tambahan (opsional)
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full text-stone-800 bg-white"
                        placeholder="mis. autocare, stiker kemasan, OEM"
                        value={form.tags}
                        onChange={(e) => ubah({ tags: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Narahubung (nama orang)"
                      value={form.kontak.narahubung}
                      onChange={(e) => ubahKontak({ narahubung: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Nomor WhatsApp (08xx / 62xx)"
                      value={form.kontak.wa}
                      onChange={(e) => ubahKontak({ wa: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Telepon kantor"
                      value={form.kontak.telepon}
                      onChange={(e) => ubahKontak({ telepon: e.target.value })}
                    />
                    <input
                      type="email"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Email"
                      value={form.kontak.email}
                      onChange={(e) => ubahKontak({ email: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Fax (opsional)"
                      value={form.kontak.fax}
                      onChange={(e) => ubahKontak({ fax: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Website (contoh.com)"
                      value={form.website}
                      onChange={(e) => ubah({ website: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Alamat lengkap"
                      value={form.alamat}
                      onChange={(e) => ubah({ alamat: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Link Google Maps (opsional)"
                      value={form.mapsUrl}
                      onChange={(e) => ubah({ mapsUrl: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Kota"
                      value={form.kota}
                      onChange={(e) =>
                        ubah({
                          kota: e.target.value,
                          wilayah: deteksiWilayah({ ...form, kota: e.target.value }),
                        })
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Provinsi"
                      value={form.provinsi}
                      onChange={(e) => ubah({ provinsi: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-stone-800 bg-white"
                      placeholder="Negara"
                      value={form.negara}
                      onChange={(e) => ubah({ negara: e.target.value })}
                    />
                    <div>
                      <select
                        className="select select-bordered select-sm w-full text-stone-800 bg-white"
                        value={form.wilayah || WILAYAH_DEFAULT}
                        onChange={(e) => ubah({ wilayah: e.target.value })}
                        aria-label="Wilayah untuk urutan hasil"
                      >
                        {WILAYAH.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">Status</label>
                      <select
                        className="select select-bordered select-sm w-full text-stone-800 bg-white"
                        value={form.status || "aktif"}
                        onChange={(e) => ubah({ status: e.target.value })}
                      >
                        {STATUS_MITRA.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 mb-1 block">
                        Keterangan tutup (kalau sudah tidak berbisnis)
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full text-stone-800 bg-white"
                        placeholder="mis. tutup sejak 2024, pindah luar kota"
                        value={form.statusCatatan}
                        onChange={(e) => ubah({ statusCatatan: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-600 mb-1 block">
                      Keterangan singkat
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full text-sm text-stone-800 bg-white"
                      rows="2"
                      placeholder="Kapasitas, minimal order, jam kerja, catatan negosiasi..."
                      value={form.catatan}
                      onChange={(e) => ubah({ catatan: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-sm flex-1"
                      onClick={simpan}
                      disabled={!form.nama.trim()}
                    >
                      <Save size={16} className="mr-1" />{" "}
                      {editId ? "Simpan Perubahan" : "Tambah ke Direktori"}
                    </button>
                    <button className="btn btn-ghost btn-sm text-stone-700" onClick={tutupForm}>
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tersimpan.length === 0 ? (
            <div className="card bg-white shadow border border-stone-200">
              <div className="card-body p-8 text-center text-stone-400">
                <Save size={40} className="mx-auto mb-2 opacity-50" />
                {daftarAman.length === 0 ? (
                  <p className="text-sm">
                    Belum ada entri tersimpan. Cari usaha di tab &quot;Cari usaha&quot;, lalu tekan
                    Simpan pada hasil yang berguna.
                  </p>
                ) : (
                  <p className="text-sm">
                    Tidak ada yang cocok dengan filter ini. Coba kata kunci lain atau ubah filter
                    jenis/status.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {tersimpan.map((mitra) => (
                <KartuMitra
                  key={mitra.id}
                  mitra={mitra}
                  onEdit={bukaEdit}
                  onHapus={hapus}
                  onTutup={toggleStatus}
                  onExport={eksporKeVendor}
                />
              ))}
            </div>
          )}

          {daftarAman.length > 0 && (
            <p className="text-[11px] text-stone-400">
              Status &quot;Tutup usaha&quot; diisi manual olehmu — aplikasi tidak menebak dari jam
              operasional. Untuk entri hasil pencarian peta, status awal mengikuti tanda
              &quot;disused/abandoned&quot; di data OpenStreetMap.
            </p>
          )}
        </>
      )}

      {mode === "panduan" && <PanduanCari />}
    </div>
  );
}
