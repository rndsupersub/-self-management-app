// components/DirektoriMitra.js
"use client";

// Mesin pencari direktori Vendor / Agency / Jasa.
// Semua data disimpan di dokumen user (dokumen yang sama dengan Pekerjaan &
// Bisnis), jadi entri yang ditambahkan di satu brand langsung terlihat di
// brand lain. Tidak ada data contoh karangan: entri pertama diisi user, atau
// diimpor dari daftar vendor brand ini.

import { useMemo, useState } from "react";
import {
  Briefcase,
  Check,
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
  labelJenis,
  labelStatus,
  normalisasiTeks,
  tautanAman,
  tautanEmail,
  tautanMaps,
  tautanTelepon,
  tautanWhatsApp,
} from "@/lib/direktoriData";

const IKON_JENIS = { vendor: Factory, agency: Sparkles, jasa: Briefcase };

const KELAS_CHIP = (aktif) =>
  `btn btn-xs rounded-full border ${
    aktif
      ? "bg-stone-800 text-white border-stone-800"
      : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
  }`;

function KartuHasil({ mitra, onEdit, onHapus, onTutup }) {
  const Ikon = IKON_JENIS[mitra.jenis] || Factory;
  const tutup = (mitra.status || "aktif") === "tutup";
  const wa = tautanWhatsApp(mitra.kontak?.wa);
  const telp = tautanTelepon(mitra.kontak?.telepon);
  const email = tautanEmail(mitra.kontak?.email);
  const maps = tautanMaps(mitra);
  const website = tautanAman(mitra.website);
  const wilayah = getWilayah(mitra.wilayah || deteksiWilayah(mitra));

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
          <span className="badge badge-sm bg-stone-50 text-stone-600 border-stone-200">
            <MapPin size={10} className="mr-1" />
            {wilayah.label.split(" (")[0]}
          </span>
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
          <p className="text-[11px] text-error/90 italic">
            Keterangan: {mitra.statusCatatan}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5" data-html2canvas-ignore="true">
          {wa && (
            <a
              className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp ${mitra.kontak?.wa}`}
            >
              <MessageCircle size={12} className="mr-1" /> WhatsApp
            </a>
          )}
          {telp && (
            <a
              className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
              href={telp}
              title={`Telepon ${mitra.kontak?.telepon}`}
            >
              <Phone size={12} className="mr-1" /> Telepon
            </a>
          )}
          {email && (
            <a
              className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
              href={email}
              title={mitra.kontak?.email}
            >
              <Mail size={12} className="mr-1" /> Email
            </a>
          )}
          {mitra.kontak?.fax && (
            <span
              className="btn btn-xs bg-white border border-stone-200 text-stone-500 cursor-default"
              title="Nomor fax"
            >
              <Printer size={12} className="mr-1" /> {mitra.kontak.fax}
            </span>
          )}
          {maps && (
            <a
              className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka di Google Maps"
            >
              <MapPin size={12} className="mr-1" /> Maps
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
              <Globe size={12} className="mr-1" /> Website
              <ExternalLink size={10} className="ml-1" />
            </a>
          )}
        </div>

        {(mitra.kontak?.narahubung || mitra.kontak?.wa || mitra.kontak?.telepon) && (
          <p className="text-[11px] text-stone-500">
            {mitra.kontak?.narahubung && <>Narahubung: {mitra.kontak.narahubung} · </>}
            {mitra.kontak?.wa || mitra.kontak?.telepon || "-"}
          </p>
        )}

        {(mitra.alamat || mitra.kota) && (
          <p className="text-xs text-stone-600 flex items-start gap-1">
            <MapPin size={12} className="mt-0.5 shrink-0 text-stone-400" />
            <span>
              {[mitra.alamat, mitra.kota, mitra.provinsi, mitra.negara]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
        )}

        {mitra.catatan && <p className="text-xs text-stone-600">{mitra.catatan}</p>}

        <div className="flex justify-between items-center pt-1">
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

export default function DirektoriMitra({ daftar = [], onUpdate, brandNama = "", vendorBrand = [] }) {
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState("semua");
  const [wilayah, setWilayah] = useState("semua");
  const [status, setStatus] = useState("semua");
  const [urut, setUrut] = useState("wilayah");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(buatMitraKosong());

  const daftarAman = Array.isArray(daftar) ? daftar : [];

  const hasil = useMemo(
    () => cariMitra(daftarAman, { q, jenis, wilayah, status, urut }),
    [daftarAman, q, jenis, wilayah, status, urut]
  );

  const jumlahTutup = daftarAman.filter((m) => (m.status || "aktif") === "tutup").length;

  const adaFilter =
    q.trim() !== "" || jenis !== "semua" || wilayah !== "semua" || status !== "semua";

  const resetFilter = () => {
    setQ("");
    setJenis("semua");
    setWilayah("semua");
    setStatus("semua");
    setUrut("wilayah");
  };

  const bukaTambah = () => {
    setEditId(null);
    setForm(buatMitraKosong({ jenis: jenis === "semua" ? "vendor" : jenis }));
    setShowForm(true);
  };

  const bukaEdit = (mitra) => {
    setEditId(mitra.id);
    setForm(buatMitraKosong({ ...mitra, kontak: mitra.kontak || {} }));
    setShowForm(true);
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
    setShowForm(false);
    setEditId(null);
    setForm(buatMitraKosong());
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
    const adaNama = new Set(daftarAman.map((m) => normalisasiTeks(m.nama)));
    const tambahan = baru
      .filter((m) => !adaNama.has(normalisasiTeks(m.nama)))
      .map((m) => ({ ...m, id: generateId("mitra"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    if (tambahan.length === 0) {
      alert("Semua vendor brand ini sudah ada di direktori.");
      return;
    }
    onUpdate([...daftarAman, ...tambahan]);
    alert(`${tambahan.length} vendor diimpor. Lengkapi WhatsApp, wilayah, dan status tutupnya.`);
  };

  const ubah = (patch) => setForm((f) => ({ ...f, ...patch }));
  const ubahKontak = (patch) => setForm((f) => ({ ...f, kontak: { ...f.kontak, ...patch } }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Search size={20} /> Direktori Vendor, Agency &amp; Jasa ({daftarAman.length})
          </h2>
          <p className="text-xs text-stone-500">
            Cari kontak yang bisa dihubungi. Urutan hasil: Bandung → Jakarta → JABODETABEK →
            Jawa Tengah → Jawa Timur → provinsi lain → China, Jepang, Korea, Asia lain →
            Amerika, Eropa.
            {jumlahTutup > 0 && ` · ${jumlahTutup} entri sudah tutup usaha.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1" data-html2canvas-ignore="true">
          {vendorBrand.length > 0 && (
            <button className="btn btn-ghost btn-xs text-stone-600" onClick={impor}>
              <Plus size={14} className="mr-1" /> Impor vendor brand ini ({vendorBrand.length})
            </button>
          )}
          <button className="btn btn-primary btn-xs" onClick={bukaTambah}>
            <Plus size={14} className="mr-1" /> Tambah Entri
          </button>
        </div>
      </div>

      <div className="card bg-white shadow border border-stone-200">
        <div className="card-body p-3 space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-9 pr-9 text-stone-800 bg-white"
              placeholder="Cari: injection moulding, busa, branding, desain label, host live, ekspor impor..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Cari vendor, agency, atau jasa"
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

          <div className="flex flex-wrap gap-1 items-center">
            <button className={KELAS_CHIP(jenis === "semua")} onClick={() => setJenis("semua")}>
              Semua
            </button>
            {JENIS_MITRA.map((j) => {
              const Ikon = IKON_JENIS[j.id] || Factory;
              return (
                <button key={j.id} className={KELAS_CHIP(jenis === j.id)} onClick={() => setJenis(j.id)}>
                  <Ikon size={12} className="mr-1" /> {j.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="select select-bordered select-xs text-stone-800 bg-white"
              value={wilayah}
              onChange={(e) => setWilayah(e.target.value)}
              aria-label="Filter wilayah"
            >
              <option value="semua">Semua wilayah</option>
              {WILAYAH.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-xs text-stone-800 bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter status"
            >
              <option value="semua">Semua status</option>
              {STATUS_MITRA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-xs text-stone-800 bg-white"
              value={urut}
              onChange={(e) => setUrut(e.target.value)}
              aria-label="Urutkan hasil"
            >
              <option value="wilayah">Urut wilayah (default)</option>
              <option value="nama">Nama A-Z</option>
              <option value="terbaru">Terbaru diubah</option>
            </select>
            {adaFilter && (
              <button className="btn btn-ghost btn-xs text-stone-500" onClick={resetFilter}>
                <X size={12} className="mr-1" /> Reset
              </button>
            )}
            <span className="ml-auto text-xs text-stone-400">{hasil.length} hasil</span>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card bg-white shadow border border-stone-300">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-stone-800 mb-3 flex items-center gap-2">
              <Pencil size={16} /> {editId ? "Edit Entri" : "Tambah Entri Baru"}
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
                  onChange={(e) => ubah({ kota: e.target.value, wilayah: deteksiWilayah({ ...form, kota: e.target.value }) })}
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
                  <Save size={16} className="mr-1" /> {editId ? "Simpan Perubahan" : "Tambah ke Direktori"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-stone-700"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setForm(buatMitraKosong());
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasil.length === 0 ? (
        <div className="card bg-white shadow border border-stone-200">
          <div className="card-body p-8 text-center text-stone-400">
            <Search size={40} className="mx-auto mb-2 opacity-50" />
            {daftarAman.length === 0 ? (
              <p className="text-sm">
                Direktori masih kosong. Klik &quot;+ Tambah Entri&quot; untuk memasukkan vendor,
                agency, atau jasa pertama
                {vendorBrand.length > 0 && " (atau impor vendor yang sudah ada di brand ini)"}.
              </p>
            ) : (
              <p className="text-sm">
                Tidak ada yang cocok. Coba kata kunci lain (mis. &quot;moulding&quot;,
                &quot;branding&quot;, &quot;host live&quot;) atau reset filter.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {hasil.map((mitra) => (
            <KartuHasil
              key={mitra.id}
              mitra={mitra}
              onEdit={bukaEdit}
              onHapus={hapus}
              onTutup={toggleStatus}
            />
          ))}
        </div>
      )}

      {daftarAman.length > 0 && (
        <p className="text-[11px] text-stone-400">
          Status &quot;Tutup usaha&quot; diisi manual olehmu — aplikasi tidak menebak dari jam
          operasional. Nomor kontak dan alamat sebaiknya dicek ulang sebelum dihubungi.
        </p>
      )}
    </div>
  );
}
