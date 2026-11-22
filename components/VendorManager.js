// components/VendorManager.js
"use client";

import { useMemo, useState } from "react";
import { DEFAULT_KATEGORI_VENDOR, DEFAULT_PERTANYAAN_VENDOR, DEFAULT_TUJUAN_KUNJUNGAN, STATUS_VENDOR, SATUAN_MOQ, TIPE_PERTANYAAN, generateId, formatRupiah, getBadgeClass, getWarnaStatus, getLabelStatus } from "@/lib/vendorData";
import { Factory, Settings, X, Plus, Pencil, Trash2, User, Phone, Package, Wallet, Calendar, ChevronRight, ChevronDown, List, Check, Save, Target, LayoutGrid, Grid2x2, Grid3x3, Rows3, Filter } from "lucide-react";
import FilterWilayah from "@/components/FilterWilayah";
import {
  bangunPilihanWilayah,
  cocokWilayah,
  adaFilterWilayah,
  FILTER_WILAYAH_KOSONG,
} from "@/lib/wilayahPintar";

// Mode tampilan ala Windows: Besar / Sedang / Kecil / Daftar.
// "Daftar" sengaja berbentuk tabel supaya hasil Export PDF tampil sebagai data.
const MODE_TAMPILAN = [
  { id: "besar", label: "Besar", ikon: LayoutGrid, judul: "Kartu besar (paling lengkap)" },
  { id: "sedang", label: "Sedang", ikon: Grid2x2, judul: "Kartu sedang" },
  { id: "kecil", label: "Kecil", ikon: Grid3x3, judul: "Kartu kecil (ringkas)" },
  { id: "daftar", label: "Daftar", ikon: Rows3, judul: "Tabel — paling enak untuk Export PDF" },
];

export default function VendorManager({
  vendorList = [],
  kategoriVendorList = DEFAULT_KATEGORI_VENDOR,
  pertanyaanVendorList = DEFAULT_PERTANYAAN_VENDOR,
  tujuanKunjunganList = DEFAULT_TUJUAN_KUNJUNGAN,
  satuanMoqList = SATUAN_MOQ,
  onAddVendor,
  onDeleteVendor,
  onClickVendor,
  onUpdateKategoriVendor,
  onUpdatePertanyaanVendor,
  onUpdateTujuanKunjungan,
  onUpdateSatuanMoq,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showKelolaKategori, setShowKelolaKategori] = useState(false);
  const [showKelolaPertanyaan, setShowKelolaPertanyaan] = useState(false);
  const [showKelolaTujuan, setShowKelolaTujuan] = useState(false);

  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterWilayah, setFilterWilayah] = useState(FILTER_WILAYAH_KOSONG);
  const [modeTampilan, setModeTampilan] = useState("besar");

  const [formData, setFormData] = useState({
    nama: "", kategoriId: kategoriVendorList[0]?.id || "lainnya", kontakNama: "", kontakTelp: "", kontakEmail: "", alamat: "", moqNilai: "", moqSatuan: "pcs", hpp: "", status: "silver", catatan: "", pertanyaanAwal: [],
  });

  const [newKategori, setNewKategori] = useState("");
  const [editingKategoriId, setEditingKategoriId] = useState(null);

  const [newPertanyaan, setNewPertanyaan] = useState({ pertanyaan: "", tipe: "checkbox" });
  const [editingPertanyaanId, setEditingPertanyaanId] = useState(null); // State Edit Pertanyaan

  // Kelola tujuan kunjungan
  const [newTujuan, setNewTujuan] = useState("");
  const [editingTujuanId, setEditingTujuanId] = useState(null);

  const [showKategoriBaru, setShowKategoriBaru] = useState(false);
  const [newKategoriInline, setNewKategoriInline] = useState("");
  const [showSatuanBaru, setShowSatuanBaru] = useState(false);
  const [newSatuanInline, setNewSatuanInline] = useState("");

  // Pilihan wilayah dibangun dari alamat vendor yang benar-benar ada, jadi
  // kota/provinsi baru otomatis muncul tanpa perlu mengubah kode.
  const pilihanWilayah = useMemo(() => bangunPilihanWilayah(vendorList, filterWilayah), [vendorList, filterWilayah]);

  const filteredVendor = vendorList.filter((v) => {
    if (filterKategori !== "all" && v.kategoriId !== filterKategori) return false;
    if (filterStatus !== "all" && v.status !== filterStatus) return false;
    if (adaFilterWilayah(filterWilayah) && !cocokWilayah(v, filterWilayah)) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({
      nama: "", kategoriId: kategoriVendorList[0]?.id || "lainnya", kontakNama: "", kontakTelp: "", kontakEmail: "", alamat: "", moqNilai: "", moqSatuan: "pcs", hpp: "", status: "silver", catatan: "",
      pertanyaanAwal: pertanyaanVendorList.map((q) => ({ id: q.id, pertanyaan: q.pertanyaan, tipe: q.tipe, jawaban: q.tipe === "checkbox" ? false : "" })),
    });
    setShowKategoriBaru(false); setShowSatuanBaru(false);
  };

  const handleBukaForm = () => { resetForm(); setShowForm(true); };

  const handleTambahVendor = () => {
    if (!formData.nama.trim()) return;
    const newVendor = {
      id: generateId("vendor"), nama: formData.nama, kategoriId: formData.kategoriId,
      kontak: { nama: formData.kontakNama, telp: formData.kontakTelp, email: formData.kontakEmail },
      alamat: formData.alamat, moq: { nilai: parseInt(formData.moqNilai) || 0, satuan: formData.moqSatuan },
      hpp: parseInt(formData.hpp) || 0, status: formData.status, catatan: formData.catatan, pertanyaanAwal: formData.pertanyaanAwal, logKunjungan: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    // PENTING: pertanyaan di form ini cuma milik vendor ini. Jangan disimpan
    // balik ke template, kalau tidak template berubah tiap kali tambah vendor
    // (pertanyaan yang dihapus di form ikut hilang untuk vendor berikutnya).
    onAddVendor(newVendor); setShowForm(false);
  };

  const handleUpdateJawaban = (index, jawaban) => {
    const updated = [...formData.pertanyaanAwal];
    updated[index] = { ...updated[index], jawaban };
    setFormData({ ...formData, pertanyaanAwal: updated });
  };

  const handleUpdateTipePertanyaan = (index, tipe) => {
    const updated = [...formData.pertanyaanAwal];
    updated[index] = { ...updated[index], tipe, jawaban: tipe === "checkbox" ? updated[index].jawaban === true : "" };
    setFormData({ ...formData, pertanyaanAwal: updated });
  };

  const handleUpdatePertanyaanText = (index, text) => {
    const updated = [...formData.pertanyaanAwal];
    updated[index] = { ...updated[index], pertanyaan: text };
    setFormData({ ...formData, pertanyaanAwal: updated });
  };

  const handleTambahPertanyaanInline = () => {
    setFormData({ ...formData, pertanyaanAwal: [...formData.pertanyaanAwal, { id: generateId("q"), pertanyaan: "", tipe: "checkbox", jawaban: false }] });
  };

  const handleHapusPertanyaanInline = (index) => {
    if (!confirm("Hapus pertanyaan ini? Cuma untuk vendor ini — template pertanyaan nggak berubah.")) return;
    setFormData({ ...formData, pertanyaanAwal: formData.pertanyaanAwal.filter((_, i) => i !== index) });
  };

  const handleTambahKategoriInline = () => {
    if (!newKategoriInline.trim()) return;
    const newK = { id: generateId("kat_vendor"), label: newKategoriInline };
    onUpdateKategoriVendor([...kategoriVendorList, newK]);
    setFormData({ ...formData, kategoriId: newK.id });
    setNewKategoriInline(""); setShowKategoriBaru(false);
  };

  const handleTambahSatuanInline = () => {
    if (!newSatuanInline.trim()) return;
    const newS = { id: newSatuanInline.toLowerCase().replace(/\s+/g, "_"), label: newSatuanInline };
    onUpdateSatuanMoq([...satuanMoqList, newS]);
    setFormData({ ...formData, moqSatuan: newS.id });
    setNewSatuanInline(""); setShowSatuanBaru(false);
  };

  // --- LOGIC KELOLA KATEGORI ---
  const handleBukaEditKategori = (kat) => { setNewKategori(kat.label); setEditingKategoriId(kat.id); };
  const handleBatalEditKategori = () => { setNewKategori(""); setEditingKategoriId(null); };
  const handleSimpanKategori = () => {
    if (!newKategori.trim()) return;
    if (editingKategoriId) {
      onUpdateKategoriVendor(kategoriVendorList.map(k => k.id === editingKategoriId ? { ...k, label: newKategori } : k));
    } else {
      onUpdateKategoriVendor([...kategoriVendorList, { id: generateId("kat_vendor"), label: newKategori }]);
    }
    setNewKategori(""); setEditingKategoriId(null);
  };
  const handleHapusKategori = (id) => {
    if (!confirm("Hapus kategori ini?")) return;
    onUpdateKategoriVendor(kategoriVendorList.filter((k) => k.id !== id));
  };

  // --- LOGIC KELOLA PERTANYAAN (DENGAN EDIT) ---
  const handleBukaEditPertanyaan = (q) => {
    setNewPertanyaan({ pertanyaan: q.pertanyaan, tipe: q.tipe });
    setEditingPertanyaanId(q.id);
  };
  const handleBatalEditPertanyaan = () => {
    setNewPertanyaan({ pertanyaan: "", tipe: "checkbox" });
    setEditingPertanyaanId(null);
  };
  const handleSimpanPertanyaan = () => {
    if (!newPertanyaan.pertanyaan.trim()) return;
    if (editingPertanyaanId) {
      onUpdatePertanyaanVendor(pertanyaanVendorList.map(q => q.id === editingPertanyaanId ? { ...q, pertanyaan: newPertanyaan.pertanyaan, tipe: newPertanyaan.tipe } : q));
    } else {
      onUpdatePertanyaanVendor([...pertanyaanVendorList, { id: generateId("q"), pertanyaan: newPertanyaan.pertanyaan, tipe: newPertanyaan.tipe }]);
    }
    setNewPertanyaan({ pertanyaan: "", tipe: "checkbox" });
    setEditingPertanyaanId(null);
  };
  const handleHapusPertanyaan = (id) => {
    if (!confirm("Hapus pertanyaan ini dari template? Vendor yang sudah ada tetap menyimpan pertanyaan sendiri.")) return;
    onUpdatePertanyaanVendor(pertanyaanVendorList.filter((q) => q.id !== id));
  };

  // --- LOGIC KELOLA TUJUAN KUNJUNGAN ---
  const jumlahLogDenganTujuan = (id) => vendorList.reduce((n, v) => n + (v.logKunjungan || []).filter((l) => l.tujuanId === id).length, 0);
  const handleBukaEditTujuan = (t) => { setNewTujuan(t.label); setEditingTujuanId(t.id); };
  const handleBatalEditTujuan = () => { setNewTujuan(""); setEditingTujuanId(null); };
  const handleSimpanTujuan = () => {
    if (!newTujuan.trim()) return;
    const list = Array.isArray(tujuanKunjunganList) ? tujuanKunjunganList : [];
    if (editingTujuanId) {
      onUpdateTujuanKunjungan(list.map((t) => (t.id === editingTujuanId ? { ...t, label: newTujuan } : t)));
    } else {
      onUpdateTujuanKunjungan([...list, { id: generateId("tujuan"), label: newTujuan }]);
    }
    setNewTujuan(""); setEditingTujuanId(null);
  };
  const handleHapusTujuan = (id) => {
    const dipakai = jumlahLogDenganTujuan(id);
    const pesan = dipakai > 0
      ? `Tujuan ini dipakai di ${dipakai} log kunjungan. Log tetap aman (label tujuan ikut tersimpan di log), tapi tujuan ini hilang dari pilihan. Lanjut hapus?`
      : "Hapus tujuan kunjungan ini?";
    if (!confirm(pesan)) return;
    onUpdateTujuanKunjungan((tujuanKunjunganList || []).filter((t) => t.id !== id));
  };

  // ========== RENDER KARTU / BARIS ==========
  const badgeStatus = (vendor) => (
    <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(getWarnaStatus(vendor.status))}`}>{getLabelStatus(vendor.status)}</span>
  );
  const tombolHapus = (vendor, kelas = "btn btn-ghost btn-xs text-stone-400 hover:text-error") => (
    <button className={kelas} onClick={(e) => { e.stopPropagation(); if (confirm("Hapus vendor ini?")) onDeleteVendor(vendor.id); }} title="Hapus vendor"><Trash2 size={14} /></button>
  );

  const renderKartu = (vendor) => {
    const kategoriData = kategoriVendorList.find((k) => k.id === vendor.kategoriId);

    if (modeTampilan === "kecil") {
      return (
        <div key={vendor.id} className="card bg-white shadow-sm border border-gray-200 hover:shadow transition cursor-pointer" onClick={() => onClickVendor(vendor.id)}>
          <div className="p-2 flex items-center gap-2">
            <Factory size={16} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate" title={vendor.nama}>{vendor.nama}</p>
              <p className="text-[10px] text-gray-500 truncate">{getLabelStatus(vendor.status)} · {vendor.logKunjungan?.length || 0} kunjungan</p>
            </div>
            <span className="shrink-0" data-html2canvas-ignore="true">{tombolHapus(vendor, "btn btn-ghost btn-xs text-error")}</span>
          </div>
        </div>
      );
    }

    if (modeTampilan === "sedang") {
      return (
        <div key={vendor.id} className="card bg-white shadow border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => onClickVendor(vendor.id)}>
          <div className="card-body p-3">
            <div className="flex justify-between items-start gap-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1 truncate"><Factory size={14} className="shrink-0" /> {vendor.nama}</h3>
                {kategoriData && <span className="text-[11px] text-gray-500">{kategoriData.label}</span>}
              </div>
              <span data-html2canvas-ignore="true">{tombolHapus(vendor)}</span>
            </div>
            <div className="flex flex-wrap gap-1 my-1.5">{badgeStatus(vendor)}</div>
            <div className="text-[11px] text-gray-600 space-y-0.5">
              {vendor.kontak?.nama && <p className="flex items-center gap-1 truncate"><User size={11} /> {vendor.kontak.nama}</p>}
              {vendor.moq?.nilai > 0 && <p className="flex items-center gap-1"><Package size={11} /> MOQ: {vendor.moq.nilai} {vendor.moq.satuan}</p>}
              <p className="flex items-center gap-1"><Calendar size={11} /> {vendor.logKunjungan?.length || 0} kunjungan</p>
            </div>
            <div className="card-actions justify-end mt-1">
              <span className="text-gray-400 text-[10px] flex items-center gap-1">Buka <ChevronRight size={10} /></span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={vendor.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => onClickVendor(vendor.id)}>
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Factory size={16} /> {vendor.nama}</h3>
              {kategoriData && <span className="text-xs text-gray-500">{kategoriData.label}</span>}
            </div>
            <span data-html2canvas-ignore="true">{tombolHapus(vendor)}</span>
          </div>
          <div className="flex flex-wrap gap-1 my-2">{badgeStatus(vendor)}</div>
          <div className="text-xs text-gray-600 space-y-1">
            {vendor.kontak?.nama && <p className="flex items-center gap-1"><User size={12} /> {vendor.kontak.nama}</p>}
            {vendor.kontak?.telp && <p className="flex items-center gap-1"><Phone size={12} /> {vendor.kontak.telp}</p>}
            {vendor.moq?.nilai > 0 && <p className="flex items-center gap-1"><Package size={12} /> MOQ: {vendor.moq.nilai} {vendor.moq.satuan}</p>}
            {vendor.hpp > 0 && <p className="flex items-center gap-1"><Wallet size={12} /> HPP: {formatRupiah(vendor.hpp)}</p>}
            <p className="flex items-center gap-1"><Calendar size={12} /> {vendor.logKunjungan?.length || 0} kunjungan</p>
          </div>
          <div className="card-actions justify-end mt-2">
            <span className="text-gray-400 text-xs flex items-center gap-1 hover:text-primary transition">Buka <ChevronRight size={12} /></span>
          </div>
        </div>
      </div>
    );
  };

  // Tabel: bentuk "data" supaya hasil Export PDF rapi dan terbaca.
  const renderDaftar = () => (
    <div className="card bg-white shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-xs w-full text-gray-800">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="w-8">#</th>
              <th>Nama Vendor</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Kontak</th>
              <th>Telp</th>
              <th className="text-right">MOQ</th>
              <th className="text-right">HPP</th>
              <th className="text-center">Kunjungan</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendor.map((vendor, i) => {
              const kategoriData = kategoriVendorList.find((k) => k.id === vendor.kategoriId);
              return (
                <tr key={vendor.id} className="hover:bg-stone-100/40 cursor-pointer" onClick={() => onClickVendor(vendor.id)}>
                  <td className="text-gray-400">{i + 1}</td>
                  <td className="font-semibold">{vendor.nama}</td>
                  <td>{kategoriData ? kategoriData.label : "-"}</td>
                  <td>{badgeStatus(vendor)}</td>
                  <td>{vendor.kontak?.nama || "-"}</td>
                  <td>{vendor.kontak?.telp || "-"}</td>
                  <td className="text-right">{vendor.moq?.nilai > 0 ? `${vendor.moq.nilai} ${vendor.moq.satuan}` : "-"}</td>
                  <td className="text-right">{vendor.hpp > 0 ? formatRupiah(vendor.hpp) : "-"}</td>
                  <td className="text-center">{vendor.logKunjungan?.length || 0}</td>
                  <td className="text-right" data-html2canvas-ignore="true">
                    <div className="flex justify-end gap-1">
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-stone-800" onClick={(e) => { e.stopPropagation(); onClickVendor(vendor.id); }} title="Buka"><ChevronRight size={14} /></button>
                      {tombolHapus(vendor)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const kelasGrid = modeTampilan === "besar"
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    : modeTampilan === "sedang"
    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Factory size={20} /> Vendor ({vendorList.length})</h2>
          <p className="text-xs text-gray-500">Kelola vendor, filter wilayah, dan tampilan. Semua data bisa diedit.</p>
        </div>
        <div className="flex items-center gap-1" data-html2canvas-ignore="true">
          <details className="dropdown dropdown-end">
            <summary className="btn btn-ghost btn-xs text-gray-600 list-none"><Settings size={14} className="mr-1"/> Kelola <ChevronDown size={12} className="ml-0.5"/></summary>
            <ul className="dropdown-content menu bg-white border border-gray-200 rounded-lg shadow-lg w-52 p-1 mt-1 z-30">
              <li><button type="button" onClick={(e) => { setShowKelolaKategori(true); e.currentTarget.blur(); }}><Settings size={14}/> Kategori vendor</button></li>
              <li><button type="button" onClick={(e) => { setShowKelolaPertanyaan(true); e.currentTarget.blur(); }}><List size={14}/> Pertanyaan awal</button></li>
              <li><button type="button" onClick={(e) => { setShowKelolaTujuan(true); e.currentTarget.blur(); }}><Target size={14}/> Tujuan kunjungan</button></li>
            </ul>
          </details>
          <button className="btn btn-primary btn-xs" onClick={handleBukaForm}><Plus size={14} className="mr-1"/> Tambah Vendor</button>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-3 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Filter size={12}/> Filter</span>
            <select className="select select-bordered select-xs text-gray-800 bg-white" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} aria-label="Filter kategori vendor">
              <option value="all">Semua Kategori</option>
              {kategoriVendorList.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
            <select className="select select-bordered select-xs text-gray-800 bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter status vendor">
              <option value="all">Semua Status</option>
              {STATUS_VENDOR.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            {(filterKategori !== "all" || filterStatus !== "all" || adaFilterWilayah(filterWilayah)) && (
              <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => { setFilterKategori("all"); setFilterStatus("all"); setFilterWilayah(FILTER_WILAYAH_KOSONG); }}><X size={12} className="mr-1"/> Reset semua</button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="join" data-html2canvas-ignore="true" role="group" aria-label="Mode tampilan">
                {MODE_TAMPILAN.map((m) => {
                  const Ikon = m.ikon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      title={m.judul}
                      className={`btn btn-xs join-item ${modeTampilan === m.id ? "btn-primary" : "btn-ghost text-gray-600"}`}
                      onClick={() => setModeTampilan(m.id)}
                      aria-pressed={modeTampilan === m.id}
                    >
                      <Ikon size={14} className="md:mr-1" /> <span className="hidden md:inline">{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{filteredVendor.length} vendor</span>
            </div>
          </div>

          <FilterWilayah
            pilihan={pilihanWilayah}
            nilai={filterWilayah}
            onChange={setFilterWilayah}
            jumlah={filteredVendor.length}
            jumlahTotal={vendorList.length}
            label="Wilayah vendor"
          />
        </div>
      </div>

      {showForm && (
        <div className="card bg-white shadow border border-stone-300">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><Pencil size={16} /> Tambah Vendor Baru</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Vendor *</label>
                  <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="PT ABC" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} autoFocus />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                  <div className="flex gap-1">
                    <select className="select select-bordered select-sm flex-1 text-gray-800 bg-white" value={formData.kategoriId} onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}>
                      {kategoriVendorList.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowKategoriBaru(!showKategoriBaru)} title="Tambah kategori baru"><Plus size={14} /></button>
                  </div>
                  {showKategoriBaru && (
                    <div className="flex gap-1 mt-1">
                      <input type="text" className="input input-bordered input-xs flex-1 text-gray-800 bg-white" placeholder="Nama kategori baru" value={newKategoriInline} onChange={(e) => setNewKategoriInline(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTambahKategoriInline()} autoFocus />
                      <button className="btn btn-primary btn-xs" onClick={handleTambahKategoriInline}><Save size={12} /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama kontak (Budi)" value={formData.kontakNama} onChange={(e) => setFormData({ ...formData, kontakNama: e.target.value })} />
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="No. Telp / WA" value={formData.kontakTelp} onChange={(e) => setFormData({ ...formData, kontakTelp: e.target.value })} />
                <input type="email" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Email" value={formData.kontakEmail} onChange={(e) => setFormData({ ...formData, kontakEmail: e.target.value })} />
              </div>

              <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Alamat lengkap" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">MOQ (nilai)</label>
                  <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="100" value={formData.moqNilai} onChange={(e) => setFormData({ ...formData, moqNilai: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Satuan</label>
                  <div className="flex gap-1">
                    <select className="select select-bordered select-sm flex-1 text-gray-800 bg-white" value={formData.moqSatuan} onChange={(e) => setFormData({ ...formData, moqSatuan: e.target.value })}>
                      {satuanMoqList.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowSatuanBaru(!showSatuanBaru)} title="Tambah satuan baru"><Plus size={14} /></button>
                  </div>
                  {showSatuanBaru && (
                    <div className="flex gap-1 mt-1">
                      <input type="text" className="input input-bordered input-xs flex-1 text-gray-800 bg-white" placeholder="Satuan baru" value={newSatuanInline} onChange={(e) => setNewSatuanInline(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTambahSatuanInline()} autoFocus />
                      <button className="btn btn-primary btn-xs" onClick={handleTambahSatuanInline}><Save size={12} /></button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">HPP (Rp)</label>
                  <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="15000" value={formData.hpp} onChange={(e) => setFormData({ ...formData, hpp: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Status</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {STATUS_VENDOR.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan Umum</label>
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" placeholder="Catatan tentang vendor ini..." value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
              </div>

              <div className="bg-stone-50 rounded p-3 border border-stone-200 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-stone-700 flex items-center gap-1"><List size={14}/> Pertanyaan Awal Vendor</p>
                  <button className="btn btn-ghost btn-xs text-stone-700" onClick={handleTambahPertanyaanInline}><Plus size={12} className="mr-1"/> Tambah Pertanyaan</button>
                </div>
                {formData.pertanyaanAwal.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada pertanyaan.</p>}
                {formData.pertanyaanAwal.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded p-2 border border-gray-200 space-y-2">
                    <div className="flex gap-1 items-center">
                      <select className="select select-bordered select-xs text-gray-800 bg-white" value={q.tipe} onChange={(e) => handleUpdateTipePertanyaan(idx, e.target.value)} title="Tipe pertanyaan">
                        <option value="checkbox">Checkbox</option><option value="short">Pendek</option><option value="long">Panjang</option>
                      </select>
                      <input type="text" className="input input-bordered input-xs flex-1 text-gray-800 bg-white" placeholder="Tulis pertanyaan..." value={q.pertanyaan} onChange={(e) => handleUpdatePertanyaanText(idx, e.target.value)} />
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={() => handleHapusPertanyaanInline(idx)} title="Hapus pertanyaan"><Trash2 size={14} /></button>
                    </div>
                    {q.tipe === "checkbox" && (
                      <div className="flex gap-1">
                        <button className={`btn btn-xs flex-1 ${q.jawaban === true ? "btn-success" : "btn-outline"}`} onClick={() => handleUpdateJawaban(idx, true)}><Check size={12} className="mr-1"/> Ya</button>
                        <button className={`btn btn-xs flex-1 ${q.jawaban === false ? "btn-error" : "btn-outline"}`} onClick={() => handleUpdateJawaban(idx, false)}><X size={12} className="mr-1"/> Tidak</button>
                      </div>
                    )}
                    {q.tipe === "short" && <input type="text" className="input input-bordered input-xs w-full text-gray-800 bg-white" placeholder="Jawaban pendek..." value={q.jawaban || ""} onChange={(e) => handleUpdateJawaban(idx, e.target.value)} />}
                    {q.tipe === "long" && <textarea className="textarea textarea-bordered w-full text-xs text-gray-800 bg-white" rows="2" placeholder="Jawaban panjang..." value={q.jawaban || ""} onChange={(e) => handleUpdateJawaban(idx, e.target.value)} />}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahVendor}><Plus size={16} className="mr-1"/> Tambah Vendor</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredVendor.length === 0 ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <Factory size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada vendor. Klik &quot;+ Tambah Vendor&quot; untuk mulai.</p>
          </div>
        </div>
      ) : modeTampilan === "daftar" ? (
        renderDaftar()
      ) : (
        <div className={kelasGrid}>
          {filteredVendor.map((vendor) => renderKartu(vendor))}
        </div>
      )}

      {/* MODAL KELOLA KATEGORI */}
      {showKelolaKategori && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={16}/> Kelola Kategori Vendor</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaKategori(false)}><X size={18} /></button>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {kategoriVendorList.map((k) => (
                  <div key={k.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <span className="text-sm text-gray-700">{k.label}</span>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditKategori(k)} title="Edit Kategori"><Pencil size={14}/></button>
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={() => handleHapusKategori(k.id)} title="Hapus Kategori"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input 
                  type="text" 
                  className="input input-bordered input-sm flex-1 text-gray-800 bg-white" 
                  placeholder={editingKategoriId ? "Edit nama kategori..." : "Nama kategori baru"} 
                  value={newKategori} 
                  onChange={(e) => setNewKategori(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleSimpanKategori()} 
                />
                {editingKategoriId ? (
                  <>
                    <button className="btn btn-success btn-sm text-white" onClick={handleSimpanKategori}><Save size={16}/></button>
                    <button className="btn btn-ghost btn-sm text-gray-600" onClick={handleBatalEditKategori}><X size={16}/></button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={handleSimpanKategori}><Plus size={16}/></button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA PERTANYAAN (DENGAN EDIT) */}
      {showKelolaPertanyaan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={16}/> Kelola Pertanyaan Default Vendor</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaPertanyaan(false)}><X size={18} /></button>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {pertanyaanVendorList.map((q) => (
                  <div key={q.id} className="flex justify-between items-start bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">{q.pertanyaan}</p>
                      <span className="text-[10px] text-gray-500">Tipe: {q.tipe}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditPertanyaan(q)} title="Edit Pertanyaan"><Pencil size={14}/></button>
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={() => handleHapusPertanyaan(q.id)} title="Hapus Pertanyaan"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <input 
                  type="text" 
                  className="input input-bordered input-sm w-full text-gray-800 bg-white" 
                  placeholder={editingPertanyaanId ? "Edit pertanyaan..." : "Pertanyaan baru"} 
                  value={newPertanyaan.pertanyaan} 
                  onChange={(e) => setNewPertanyaan({ ...newPertanyaan, pertanyaan: e.target.value })} 
                  onKeyDown={(e) => e.key === "Enter" && handleSimpanPertanyaan()}
                />
                <div className="flex gap-2">
                  <select className="select select-bordered select-sm flex-1 text-gray-800 bg-white" value={newPertanyaan.tipe} onChange={(e) => setNewPertanyaan({ ...newPertanyaan, tipe: e.target.value })}>
                    {TIPE_PERTANYAAN.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  {editingPertanyaanId ? (
                    <>
                      <button className="btn btn-success btn-sm text-white" onClick={handleSimpanPertanyaan}><Save size={16}/></button>
                      <button className="btn btn-ghost btn-sm text-gray-600" onClick={handleBatalEditPertanyaan}><X size={16}/></button>
                    </>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={handleSimpanPertanyaan}><Plus size={16} className="mr-1"/> Tambah</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA TUJUAN KUNJUNGAN */}
      {showKelolaTujuan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Target size={16}/> Kelola Tujuan Kunjungan</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaTujuan(false)}><X size={18} /></button>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {(tujuanKunjunganList || []).length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada tujuan.</p>}
                {(tujuanKunjunganList || []).map((t) => (
                  <div key={t.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <span className="text-sm text-gray-700 flex-1">{t.label}</span>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditTujuan(t)} title="Edit Tujuan"><Pencil size={14}/></button>
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={() => handleHapusTujuan(t.id)} title="Hapus Tujuan"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                  placeholder={editingTujuanId ? "Edit tujuan..." : "Tujuan baru (misal: Cek kualitas barang)"}
                  value={newTujuan}
                  onChange={(e) => setNewTujuan(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSimpanTujuan()}
                />
                {editingTujuanId ? (
                  <>
                    <button className="btn btn-success btn-sm text-white" onClick={handleSimpanTujuan}><Save size={16}/></button>
                    <button className="btn btn-ghost btn-sm text-gray-600" onClick={handleBatalEditTujuan}><X size={16}/></button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={handleSimpanTujuan}><Plus size={16}/></button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}