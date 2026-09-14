// components/VendorManager.js
"use client";

import { useState } from "react";
import {
  DEFAULT_KATEGORI_VENDOR,
  DEFAULT_PERTANYAAN_VENDOR,
  STATUS_VENDOR,
  SATUAN_MOQ,
  TIPE_PERTANYAAN,
  generateId,
  formatRupiah,
  getBadgeClass,
  getWarnaStatus,
  getLabelStatus,
} from "@/lib/vendorData";

export default function VendorManager({
  vendorList = [],
  kategoriVendorList = DEFAULT_KATEGORI_VENDOR,
  pertanyaanVendorList = DEFAULT_PERTANYAAN_VENDOR,
  satuanMoqList = SATUAN_MOQ,
  onAddVendor,
  onDeleteVendor,
  onClickVendor,
  onUpdateKategoriVendor,
  onUpdatePertanyaanVendor,
  onUpdateSatuanMoq,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showKelolaKategori, setShowKelolaKategori] = useState(false);
  const [showKelolaPertanyaan, setShowKelolaPertanyaan] = useState(false);

  // Filter
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    kategoriId: kategoriVendorList[0]?.id || "lainnya",
    kontakNama: "",
    kontakTelp: "",
    kontakEmail: "",
    alamat: "",
    moqNilai: "",
    moqSatuan: "pcs",
    hpp: "",
    status: "netral",
    catatan: "",
    pertanyaanAwal: [],
  });

  // Form kelola kategori
  const [newKategori, setNewKategori] = useState("");

  // Form kelola pertanyaan
  const [newPertanyaan, setNewPertanyaan] = useState({
    pertanyaan: "",
    tipe: "checkbox",
  });

  // ========== FILTER VENDOR ==========
  const filteredVendor = vendorList.filter((v) => {
    if (filterKategori !== "all" && v.kategoriId !== filterKategori) return false;
    if (filterStatus !== "all" && v.status !== filterStatus) return false;
    return true;
  });

  // ========== RESET FORM ==========
  const resetForm = () => {
    setFormData({
      nama: "",
      kategoriId: kategoriVendorList[0]?.id || "lainnya",
      kontakNama: "",
      kontakTelp: "",
      kontakEmail: "",
      alamat: "",
      moqNilai: "",
      moqSatuan: "pcs",
      hpp: "",
      status: "netral",
      catatan: "",
      pertanyaanAwal: pertanyaanVendorList.map((q) => ({
        id: q.id,
        pertanyaan: q.pertanyaan,
        tipe: q.tipe,
        jawaban: q.tipe === "checkbox" ? false : "",
      })),
    });
  };

  // ========== BUKA FORM ==========
  const handleBukaForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ========== TAMBAH VENDOR ==========
  const handleTambahVendor = () => {
    if (!formData.nama.trim()) return;

    const newVendor = {
      id: generateId("vendor"),
      nama: formData.nama,
      kategoriId: formData.kategoriId,
      kontak: {
        nama: formData.kontakNama,
        telp: formData.kontakTelp,
        email: formData.kontakEmail,
      },
      alamat: formData.alamat,
      moq: {
        nilai: parseInt(formData.moqNilai) || 0,
        satuan: formData.moqSatuan,
      },
      hpp: parseInt(formData.hpp) || 0,
      status: formData.status,
      catatan: formData.catatan,
      pertanyaanAwal: formData.pertanyaanAwal,
      logKunjungan: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddVendor(newVendor);
    setShowForm(false);
  };

  // ========== UPDATE PERTANYAAN JAWABAN ==========
  const handleUpdateJawaban = (index, jawaban) => {
    const updated = [...formData.pertanyaanAwal];
    updated[index] = { ...updated[index], jawaban };
    setFormData({ ...formData, pertanyaanAwal: updated });
  };

  // ========== KELOLA KATEGORI ==========
  const handleTambahKategori = () => {
    if (!newKategori.trim()) return;
    const updated = [
      ...kategoriVendorList,
      { id: generateId("kat_vendor"), label: newKategori },
    ];
    onUpdateKategoriVendor(updated);
    setNewKategori("");
  };

  const handleHapusKategori = (id) => {
    if (!confirm("Hapus kategori ini?")) return;
    const updated = kategoriVendorList.filter((k) => k.id !== id);
    onUpdateKategoriVendor(updated);
  };

  // ========== KELOLA PERTANYAAN DEFAULT ==========
  const handleTambahPertanyaan = () => {
    if (!newPertanyaan.pertanyaan.trim()) return;
    const updated = [
      ...pertanyaanVendorList,
      {
        id: generateId("q"),
        pertanyaan: newPertanyaan.pertanyaan,
        tipe: newPertanyaan.tipe,
      },
    ];
    onUpdatePertanyaanVendor(updated);
    setNewPertanyaan({ pertanyaan: "", tipe: "checkbox" });
  };

  const handleHapusPertanyaan = (id) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    const updated = pertanyaanVendorList.filter((q) => q.id !== id);
    onUpdatePertanyaanVendor(updated);
  };

  return (
    <div className="space-y-4">
      {/* HEADER + TOMBOL */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-bold text-gray-800">
          🏭 Vendor ({vendorList.length})
        </h2>
        <div className="flex gap-1">
          <button
            className="btn btn-ghost btn-xs text-gray-600"
            onClick={() => setShowKelolaKategori(true)}
            title="Kelola Kategori Vendor"
          >
            ⚙️ Kategori
          </button>
          <button
            className="btn btn-ghost btn-xs text-gray-600"
            onClick={() => setShowKelolaPertanyaan(true)}
            title="Kelola Pertanyaan Default"
          >
            ⚙️ Pertanyaan
          </button>
          <button className="btn btn-primary btn-xs" onClick={handleBukaForm}>
            + Tambah Vendor
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">Filter:</span>
            <select
              className="select select-bordered select-xs text-gray-800 bg-white"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {kategoriVendorList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-xs text-gray-800 bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              {STATUS_VENDOR.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {(filterKategori !== "all" || filterStatus !== "all") && (
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setFilterKategori("all");
                  setFilterStatus("all");
                }}
              >
                ✕ Reset
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {filteredVendor.length} vendor
            </span>
          </div>
        </div>
      </div>

      {/* FORM TAMBAH VENDOR */}
      {showForm && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              ✏️ Tambah Vendor Baru
            </h3>

            <div className="space-y-3">
              {/* Nama + Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Nama Vendor *
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="PT ABC"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Kategori
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.kategoriId}
                    onChange={(e) =>
                      setFormData({ ...formData, kategoriId: e.target.value })
                    }
                  >
                    {kategoriVendorList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kontak */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Nama kontak (Budi)"
                  value={formData.kontakNama}
                  onChange={(e) =>
                    setFormData({ ...formData, kontakNama: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="No. Telp / WA"
                  value={formData.kontakTelp}
                  onChange={(e) =>
                    setFormData({ ...formData, kontakTelp: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Email"
                  value={formData.kontakEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, kontakEmail: e.target.value })
                  }
                />
              </div>

              {/* Alamat */}
              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Alamat lengkap"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
              />

              {/* MOQ + HPP + Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    MOQ (nilai)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="100"
                    value={formData.moqNilai}
                    onChange={(e) =>
                      setFormData({ ...formData, moqNilai: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Satuan
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.moqSatuan}
                    onChange={(e) =>
                      setFormData({ ...formData, moqSatuan: e.target.value })
                    }
                  >
                    {satuanMoqList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    HPP (Rp)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="15000"
                    value={formData.hpp}
                    onChange={(e) =>
                      setFormData({ ...formData, hpp: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Status
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    {STATUS_VENDOR.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Catatan Umum
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="2"
                  placeholder="Catatan tentang vendor ini..."
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
              </div>

              {/* PERTANYAAN AWAL */}
              <div className="bg-purple-50 rounded p-3 border border-purple-200">
                <p className="text-xs font-semibold text-purple-700 mb-2">
                  📋 Pertanyaan Awal Vendor
                </p>
                <div className="space-y-2">
                  {formData.pertanyaanAwal.map((q, idx) => (
                    <div key={q.id} className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-700 mb-1">{q.pertanyaan}</p>
                      {q.tipe === "checkbox" && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={q.jawaban || false}
                            onChange={(e) =>
                              handleUpdateJawaban(idx, e.target.checked)
                            }
                          />
                          <span className="text-xs text-gray-600">
                            {q.jawaban ? "✅ Ya" : "❌ Tidak"}
                          </span>
                        </label>
                      )}
                      {q.tipe === "short" && (
                        <input
                          type="text"
                          className="input input-bordered input-xs w-full text-gray-800 bg-white"
                          placeholder="Jawaban pendek..."
                          value={q.jawaban || ""}
                          onChange={(e) =>
                            handleUpdateJawaban(idx, e.target.value)
                          }
                        />
                      )}
                      {q.tipe === "long" && (
                        <textarea
                          className="textarea textarea-bordered w-full text-xs text-gray-800 bg-white"
                          rows="2"
                          placeholder="Jawaban panjang..."
                          value={q.jawaban || ""}
                          onChange={(e) =>
                            handleUpdateJawaban(idx, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleTambahVendor}
                >
                  ➕ Tambah Vendor
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIST VENDOR */}
      {filteredVendor.length === 0 ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">🏭</p>
            <p className="text-sm">
              Belum ada vendor. Klik "+ Tambah Vendor" untuk mulai.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendor.map((vendor) => {
            const kategoriData = kategoriVendorList.find(
              (k) => k.id === vendor.kategoriId
            );
            return (
              <div
                key={vendor.id}
                className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                onClick={() => onClickVendor(vendor.id)}
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800">
                        🏭 {vendor.nama}
                      </h3>
                      {kategoriData && (
                        <span className="text-xs text-gray-500">
                          {kategoriData.label}
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Hapus vendor ini?")) {
                          onDeleteVendor(vendor.id);
                        }
                      }}
                      title="Hapus vendor"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-wrap gap-1 my-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(
                        getWarnaStatus(vendor.status)
                      )}`}
                    >
                      {getLabelStatus(vendor.status)}
                    </span>
                  </div>

                  {/* Info ringkas */}
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {vendor.kontak?.nama && (
                      <p>👤 {vendor.kontak.nama}</p>
                    )}
                    {vendor.kontak?.telp && (
                      <p>📞 {vendor.kontak.telp}</p>
                    )}
                    {vendor.moq?.nilai > 0 && (
                      <p>
                        📦 MOQ: {vendor.moq.nilai} {vendor.moq.satuan}
                      </p>
                    )}
                    {vendor.hpp > 0 && (
                      <p>💰 HPP: {formatRupiah(vendor.hpp)}</p>
                    )}
                    <p>📅 {vendor.logKunjungan?.length || 0} kunjungan</p>
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <span className="text-gray-400 text-xs">Buka →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL KELOLA KATEGORI */}
      {showKelolaKategori && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Kategori Vendor
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaKategori(false)}
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {kategoriVendorList.map((k) => (
                  <div
                    key={k.id}
                    className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{k.label}</span>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleHapusKategori(k.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                  placeholder="Nama kategori baru"
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleTambahKategori}
                >
                  ➕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA PERTANYAAN */}
      {showKelolaPertanyaan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Pertanyaan Default Vendor
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaPertanyaan(false)}
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {pertanyaanVendorList.map((q) => (
                  <div
                    key={q.id}
                    className="flex justify-between items-start bg-gray-50 rounded px-2 py-1 border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">{q.pertanyaan}</p>
                      <span className="text-[10px] text-gray-500">
                        Tipe: {q.tipe}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleHapusPertanyaan(q.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Pertanyaan baru"
                  value={newPertanyaan.pertanyaan}
                  onChange={(e) =>
                    setNewPertanyaan({
                      ...newPertanyaan,
                      pertanyaan: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="select select-bordered select-sm flex-1 text-gray-800 bg-white"
                    value={newPertanyaan.tipe}
                    onChange={(e) =>
                      setNewPertanyaan({
                        ...newPertanyaan,
                        tipe: e.target.value,
                      })
                    }
                  >
                    {TIPE_PERTANYAAN.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleTambahPertanyaan}
                  >
                    ➕ Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}