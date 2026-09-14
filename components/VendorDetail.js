// components/VendorDetail.js
"use client";

import { useState } from "react";
import {
  METODE_KUNJUNGAN,
  HASIL_KUNJUNGAN,
  STATUS_VENDOR,
  generateId,
  formatTanggal,
  formatRupiah,
  getBadgeClass,
  getWarnaStatus,
  getLabelStatus,
  getLabelMetode,
  getLabelHasil,
  getWarnaHasil,
} from "@/lib/vendorData";

export default function VendorDetail({
  vendor,
  kategoriVendorList = [],
  tujuanKunjunganList = [],
  onUpdateVendor,
  onDeleteVendor,
  onBack,
}) {
  const [showFormKunjungan, setShowFormKunjungan] = useState(false);
  const [editingKunjunganId, setEditingKunjunganId] = useState(null);
  const [filterTujuan, setFilterTujuan] = useState("all");
  const [confirmHapusVendor, setConfirmHapusVendor] = useState(false);

  // Form kunjungan state
  const [formKunjungan, setFormKunjungan] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    tujuanId: tujuanKunjunganList[0]?.id || "scanning",
    metode: "offline",
    hasil: "on_track",
    catatan: "",
    gdriveUrl: "",
  });

  // ========== FILTER LOG ==========
  const filteredLog = (vendor.logKunjungan || []).filter((log) => {
    if (filterTujuan !== "all" && log.tujuanId !== filterTujuan) return false;
    return true;
  });

  // ========== RESET FORM ==========
  const resetFormKunjungan = () => {
    setFormKunjungan({
      tanggal: new Date().toISOString().split("T")[0],
      tujuanId: tujuanKunjunganList[0]?.id || "scanning",
      metode: "offline",
      hasil: "on_track",
      catatan: "",
      gdriveUrl: "",
    });
    setEditingKunjunganId(null);
    setShowFormKunjungan(false);
  };

  // ========== TAMBAH/EDIT KUNJUNGAN ==========
  const handleSimpanKunjungan = () => {
    if (!formKunjungan.tanggal) return;

    let updatedLog;
    if (editingKunjunganId) {
      updatedLog = (vendor.logKunjungan || []).map((log) =>
        log.id === editingKunjunganId
          ? { ...log, ...formKunjungan, updatedAt: new Date().toISOString() }
          : log
      );
    } else {
      const newLog = {
        id: generateId("kunjungan"),
        ...formKunjungan,
        createdAt: new Date().toISOString(),
      };
      updatedLog = [...(vendor.logKunjungan || []), newLog];
    }

    onUpdateVendor({
      ...vendor,
      logKunjungan: updatedLog,
      updatedAt: new Date().toISOString(),
    });

    resetFormKunjungan();
  };

  // ========== HAPUS KUNJUNGAN ==========
  const handleHapusKunjungan = (id) => {
    if (!confirm("Hapus kunjungan ini?")) return;
    const updatedLog = (vendor.logKunjungan || []).filter(
      (log) => log.id !== id
    );
    onUpdateVendor({
      ...vendor,
      logKunjungan: updatedLog,
      updatedAt: new Date().toISOString(),
    });
  };

  // ========== EDIT KUNJUNGAN ==========
  const handleEditKunjungan = (log) => {
    setFormKunjungan({
      tanggal: log.tanggal,
      tujuanId: log.tujuanId,
      metode: log.metode,
      hasil: log.hasil,
      catatan: log.catatan || "",
      gdriveUrl: log.gdriveUrl || "",
    });
    setEditingKunjunganId(log.id);
    setShowFormKunjungan(true);
  };

  // ========== UBAH STATUS VENDOR ==========
  const handleUbahStatus = (newStatus) => {
    onUpdateVendor({
      ...vendor,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // ========== HAPUS VENDOR ==========
  const handleHapusVendor = () => {
    onDeleteVendor(vendor.id);
    setConfirmHapusVendor(false);
  };

  const kategoriData = kategoriVendorList.find(
    (k) => k.id === vendor.kategoriId
  );

  return (
    <div className="space-y-4">
      {/* TOMBOL KEMBALI */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-sm text-gray-600"
          onClick={onBack}
        >
          ← Kembali ke List Vendor
        </button>
      </div>

      {/* HEADER VENDOR */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-gray-800">
                  🏭 {vendor.nama}
                </h1>
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(
                    getWarnaStatus(vendor.status)
                  )}`}
                >
                  {getLabelStatus(vendor.status)}
                </span>
              </div>
              {kategoriData && (
                <p className="text-sm text-gray-500">{kategoriData.label}</p>
              )}
            </div>

            <div className="flex gap-1">
              <button
                className="btn btn-ghost btn-xs text-red-500"
                onClick={() => setConfirmHapusVendor(true)}
                title="Hapus vendor"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Konfirmasi Hapus Vendor */}
          {confirmHapusVendor && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700 mb-2">
                Yakin mau hapus vendor ini? Semua log kunjungan bakal hilang.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={handleHapusVendor}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapusVendor(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Ubah Status */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Ubah Status:
            </p>
            <div className="flex flex-wrap gap-1">
              {STATUS_VENDOR.map((s) => (
                <button
                  key={s.id}
                  className={`btn btn-xs ${
                    vendor.status === s.id ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => handleUbahStatus(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INFO CARDS: KONTAK, MOQ, HPP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kontak */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              📞 Kontak
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              {vendor.kontak?.nama && <p>👤 {vendor.kontak.nama}</p>}
              {vendor.kontak?.telp && <p>📱 {vendor.kontak.telp}</p>}
              {vendor.kontak?.email && <p>✉️ {vendor.kontak.email}</p>}
              {vendor.alamat && <p>📍 {vendor.alamat}</p>}
              {!vendor.kontak?.nama &&
                !vendor.kontak?.telp &&
                !vendor.kontak?.email &&
                !vendor.alamat && (
                  <p className="text-gray-400 italic text-xs">
                    Belum ada info kontak.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* MOQ & HPP */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              💰 MOQ & HPP
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                📦 MOQ:{" "}
                {vendor.moq?.nilai > 0 ? (
                  <strong>
                    {vendor.moq.nilai} {vendor.moq.satuan}
                  </strong>
                ) : (
                  <span className="text-gray-400 italic">Belum diisi</span>
                )}
              </p>
              <p>
                💵 HPP:{" "}
                {vendor.hpp > 0 ? (
                  <strong>{formatRupiah(vendor.hpp)}</strong>
                ) : (
                  <span className="text-gray-400 italic">Belum diisi</span>
                )}
              </p>
            </div>

            {vendor.catatan && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  📝 Catatan:
                </p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                  {vendor.catatan}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PERTANYAAN AWAL */}
      {vendor.pertanyaanAwal && vendor.pertanyaanAwal.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              📋 Pertanyaan Awal Vendor
            </h3>
            <div className="space-y-2">
              {vendor.pertanyaanAwal.map((q) => (
                <div
                  key={q.id}
                  className="bg-gray-50 rounded p-2 border border-gray-200"
                >
                  <p className="text-xs text-gray-700 mb-1">{q.pertanyaan}</p>
                  {q.tipe === "checkbox" && (
                    <p className="text-sm font-semibold text-gray-800">
                      {q.jawaban ? "✅ Ya" : "❌ Tidak"}
                    </p>
                  )}
                  {q.tipe === "short" && (
                    <p className="text-sm text-gray-800">
                      {q.jawaban || "-"}
                    </p>
                  )}
                  {q.tipe === "long" && (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {q.jawaban || "-"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOG KUNJUNGAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              📅 Log Kunjungan ({vendor.logKunjungan?.length || 0})
            </h3>
            <div className="flex gap-1">
              <select
                className="select select-bordered select-xs text-gray-800 bg-white"
                value={filterTujuan}
                onChange={(e) => setFilterTujuan(e.target.value)}
              >
                <option value="all">Semua Tujuan</option>
                {tujuanKunjunganList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-xs"
                onClick={() => {
                  resetFormKunjungan();
                  setShowFormKunjungan(true);
                }}
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* FORM KUNJUNGAN */}
          {showFormKunjungan && (
            <div className="bg-blue-50 rounded p-3 mb-3 space-y-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                {editingKunjunganId ? "✏️ Edit Kunjungan" : "✏️ Tambah Kunjungan"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    📅 Tanggal
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={formKunjungan.tanggal}
                    onChange={(e) =>
                      setFormKunjungan({
                        ...formKunjungan,
                        tanggal: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    🎯 Tujuan
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formKunjungan.tujuanId}
                    onChange={(e) =>
                      setFormKunjungan({
                        ...formKunjungan,
                        tujuanId: e.target.value,
                      })
                    }
                  >
                    {tujuanKunjunganList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    💻 Metode
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formKunjungan.metode}
                    onChange={(e) =>
                      setFormKunjungan({
                        ...formKunjungan,
                        metode: e.target.value,
                      })
                    }
                  >
                    {METODE_KUNJUNGAN.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    ✅ Hasil
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formKunjungan.hasil}
                    onChange={(e) =>
                      setFormKunjungan({
                        ...formKunjungan,
                        hasil: e.target.value,
                      })
                    }
                  >
                    {HASIL_KUNJUNGAN.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  📝 Catatan
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="3"
                  placeholder="Catatan hasil kunjungan..."
                  value={formKunjungan.catatan}
                  onChange={(e) =>
                    setFormKunjungan({
                      ...formKunjungan,
                      catatan: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  📁 Link Google Drive (opsional)
                </label>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="https://drive.google.com/..."
                  value={formKunjungan.gdriveUrl}
                  onChange={(e) =>
                    setFormKunjungan({
                      ...formKunjungan,
                      gdriveUrl: e.target.value,
                    })
                  }
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  📸 Foto Telegram akan otomatis masuk ke sini nanti.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpanKunjungan}
                >
                  {editingKunjunganId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={resetFormKunjungan}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* LIST LOG */}
          {filteredLog.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">
                Belum ada kunjungan. Klik "+ Tambah" untuk mulai.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLog
                .slice()
                .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                .map((log) => {
                  const tujuanData = tujuanKunjunganList.find(
                    (t) => t.id === log.tujuanId
                  );
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded border border-gray-200 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            📅 {formatTanggal(log.tanggal, "pendek")}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-300">
                              {tujuanData?.label || log.tujuanId}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-300">
                              {getLabelMetode(log.metode)}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(
                                getWarnaHasil(log.hasil)
                              )}`}
                            >
                              {getLabelHasil(log.hasil)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditKunjungan(log)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-red-500"
                            onClick={() => handleHapusKunjungan(log.id)}
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {log.catatan && (
                        <p className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border border-gray-200 mt-2">
                          📝 {log.catatan}
                        </p>
                      )}

                      {log.gdriveUrl && (
                        <a
                          href={log.gdriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs link link-primary mt-1 inline-block"
                        >
                          📁 GDrive
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}