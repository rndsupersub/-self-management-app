// components/VendorDetail.js
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  METODE_KUNJUNGAN,
  HASIL_KUNJUNGAN,
  STATUS_VENDOR,
  SATUAN_MOQ,
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
import {
  DEFAULT_FIELD_EVALUASI_VENDOR,
  DEFAULT_PERIODE_EVALUASI,
  getPeriodeRange,
  formatTanggalPendek,
  autoGenerateVendorSummary,
} from "@/lib/evaluasiData";

export default function VendorDetail({
  vendor,
  kategoriVendorList = [],
  tujuanKunjunganList = [],
  fieldEvaluasiVendorList = DEFAULT_FIELD_EVALUASI_VENDOR,
  periodeEvaluasiList = DEFAULT_PERIODE_EVALUASI,
  onUpdateVendor,
  onDeleteVendor,
  onBack,
}) {
  const [showFormKunjungan, setShowFormKunjungan] = useState(false);
  const [editingKunjunganId, setEditingKunjunganId] = useState(null);
  const [filterTujuan, setFilterTujuan] = useState("all");
  const [confirmHapusVendor, setConfirmHapusVendor] = useState(false);

  // State Edit Profil
  const [showEditProfil, setShowEditProfil] = useState(false);
  const [formProfil, setFormProfil] = useState({
    nama: "",
    kategoriId: "",
    kontakNama: "",
    kontakTelp: "",
    kontakEmail: "",
    alamat: "",
    moqNilai: "",
    moqSatuan: "pcs",
    hpp: "",
    catatan: "",
  });

  // Form Kunjungan
  const [formKunjungan, setFormKunjungan] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    tujuanId: tujuanKunjunganList[0]?.id || "scanning",
    metode: "offline",
    hasil: "on_track",
    catatan: "",
    gdriveUrl: "",
  });

  // Evaluasi Vendor State
  const [activePeriode, setActivePeriode] = useState(
    periodeEvaluasiList[0]?.id || "bulanan"
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [evalValues, setEvalValues] = useState({});
  const [showHistoryEval, setShowHistoryEval] = useState(true); // Default open biar langsung keliatan
  const [savedEvalNotif, setSavedEvalNotif] = useState(false);
  const [showEvalSection, setShowEvalSection] = useState(true);
  
  // State Baru: Mode Edit Evaluasi (Default: false / mode lihat)
  const [isEditingEval, setIsEditingEval] = useState(false);

  // Sync data vendor ke form edit
  useEffect(() => {
    if (vendor) {
      setFormProfil({
        nama: vendor.nama || "",
        kategoriId: vendor.kategoriId || "",
        kontakNama: vendor.kontak?.nama || "",
        kontakTelp: vendor.kontak?.telp || "",
        kontakEmail: vendor.kontak?.email || "",
        alamat: vendor.alamat || "",
        moqNilai: vendor.moq?.nilai || "",
        moqSatuan: vendor.moq?.satuan || "pcs",
        hpp: vendor.hpp || "",
        catatan: vendor.catatan || "",
      });
    }
  }, [vendor]);

  // Periode Aktif
  const periodeAktif = useMemo(() => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return null;
    return getPeriodeRange(def.tipe, selectedDate, def);
  }, [activePeriode, selectedDate, periodeEvaluasiList]);

  const evalKey = periodeAktif?.key;

  // Ambil data tersimpan
  const evalTersimpan = useMemo(() => {
    if (!evalKey) return null;
    return vendor?.evaluasi?.[activePeriode]?.[evalKey] || null;
  }, [vendor, activePeriode, evalKey]);

  // Load ke form
  useEffect(() => {
    if (evalTersimpan?.fields) {
      setEvalValues(evalTersimpan.fields);
      setIsEditingEval(false); // Kalau udah ada data, default ke mode Lihat
    } else {
      const empty = {};
      fieldEvaluasiVendorList.forEach((f) => {
        empty[f.id] = f.tipe === "score" ? 5 : "";
      });
      setEvalValues(empty);
      setIsEditingEval(true); // Kalau belum ada data, paksa mode Edit
    }
  }, [evalTersimpan, fieldEvaluasiVendorList]);

  // Filter log
  const filteredLog = (vendor?.logKunjungan || []).filter((log) => {
    if (filterTujuan !== "all" && log.tujuanId !== filterTujuan) return false;
    return true;
  });

  // Simpan profil
  const handleSimpanProfil = () => {
    if (!formProfil.nama.trim()) {
      alert("Nama vendor tidak boleh kosong.");
      return;
    }
    onUpdateVendor({
      ...vendor,
      nama: formProfil.nama,
      kategoriId: formProfil.kategoriId,
      kontak: {
        nama: formProfil.kontakNama,
        telp: formProfil.kontakTelp,
        email: formProfil.kontakEmail,
      },
      alamat: formProfil.alamat,
      moq: {
        nilai: parseInt(formProfil.moqNilai) || 0,
        satuan: formProfil.moqSatuan,
      },
      hpp: parseInt(formProfil.hpp) || 0,
      catatan: formProfil.catatan,
      updatedAt: new Date().toISOString(),
    });
    setShowEditProfil(false);
  };

  // Reset form kunjungan
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

  // Simpan kunjungan
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

  const handleHapusKunjungan = (id) => {
    if (!confirm("Hapus kunjungan ini?")) return;
    onUpdateVendor({
      ...vendor,
      logKunjungan: (vendor.logKunjungan || []).filter((log) => log.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

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

  // Ubah status
  const handleUbahStatus = (newStatus) => {
    onUpdateVendor({
      ...vendor,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Navigasi Periode Evaluasi
  const handlePrevEval = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    const d = new Date(selectedDate);
    if (def.tipe === "bulanan") d.setMonth(d.getMonth() - 1);
    else if (def.tipe === "triwulan") d.setMonth(d.getMonth() - 3);
    else if (def.tipe === "semester") d.setMonth(d.getMonth() - 6);
    else if (def.tipe === "tahunan") d.setFullYear(d.getFullYear() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextEval = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    const d = new Date(selectedDate);
    if (def.tipe === "bulanan") d.setMonth(d.getMonth() + 1);
    else if (def.tipe === "triwulan") d.setMonth(d.getMonth() + 3);
    else if (def.tipe === "semester") d.setMonth(d.getMonth() + 6);
    else if (def.tipe === "tahunan") d.setFullYear(d.getFullYear() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Update Eval Field
  const handleUpdateEvalValue = (fieldId, value) => {
    setEvalValues({ ...evalValues, [fieldId]: value });
  };

  // Auto Generate dari Log Kunjungan
  const handleAutoGenerateEval = () => {
    if (!periodeAktif) return;
    const summary = autoGenerateVendorSummary(
      vendor,
      periodeAktif.periodeMulai,
      periodeAktif.periodeSelesai
    );
    const targetField = fieldEvaluasiVendorList[0];
    if (targetField) {
      setEvalValues({ ...evalValues, [targetField.id]: summary });
    }
  };

  // Simpan Evaluasi Vendor
  const handleSimpanEval = () => {
    if (!periodeAktif || !onUpdateVendor) return;
    const newEvaluasi = JSON.parse(JSON.stringify(vendor.evaluasi || {}));
    if (!newEvaluasi[activePeriode]) newEvaluasi[activePeriode] = {};
    newEvaluasi[activePeriode][periodeAktif.key] = {
      periodeMulai: periodeAktif.periodeMulai,
      periodeSelesai: periodeAktif.periodeSelesai,
      label: periodeAktif.label,
      tipe: periodeAktif.tipe,
      fields: evalValues,
      updatedAt: new Date().toISOString(),
    };
    onUpdateVendor({
      ...vendor,
      evaluasi: newEvaluasi,
      updatedAt: new Date().toISOString(),
    });
    setSavedEvalNotif(true);
    setIsEditingEval(false); // Kembali ke mode Lihat setelah simpan
    setTimeout(() => setSavedEvalNotif(false), 2000);
  };

  // Hapus History Evaluasi
  const handleHapusHistoryEval = (periodeKey) => {
    if (!confirm("Hapus history evaluasi periode ini? Tindakan ini tidak bisa dibatalkan.")) return;
    
    const newEvaluasi = JSON.parse(JSON.stringify(vendor.evaluasi || {}));
    if (newEvaluasi[activePeriode] && newEvaluasi[activePeriode][periodeKey]) {
      delete newEvaluasi[activePeriode][periodeKey];
      
      onUpdateVendor({
        ...vendor,
        evaluasi: newEvaluasi,
        updatedAt: new Date().toISOString(),
      });

      // Kalau yang dihapus adalah periode yang lagi aktif dilihat, reset form
      if (periodeKey === evalKey) {
        const empty = {};
        fieldEvaluasiVendorList.forEach((f) => {
          empty[f.id] = f.tipe === "score" ? 5 : "";
        });
        setEvalValues(empty);
        setIsEditingEval(true);
      }
    }
  };

  // History Eval
  const historyEval = useMemo(() => {
    const data = vendor?.evaluasi?.[activePeriode] || {};
    return Object.entries(data)
      .map(([k, val]) => ({ key: k, ...val }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [vendor, activePeriode]);

  if (!vendor) return null;

  const kategoriData = kategoriVendorList.find(
    (k) => k.id === vendor.kategoriId
  );

  return (
    <div className="space-y-4">
      {/* TOMBOL KEMBALI */}
      <div className="flex items-center gap-2" data-html2canvas-ignore="true">
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
            <div className="flex gap-1" data-html2canvas-ignore="true">
              <button
                className="btn btn-ghost btn-xs text-blue-500"
                onClick={() => setShowEditProfil(true)}
                title="Edit Profil Vendor"
              >
                ✏️
              </button>
              <button
                className="btn btn-ghost btn-xs text-red-500"
                onClick={() => setConfirmHapusVendor(true)}
                title="Hapus vendor"
              >
                🗑️
              </button>
            </div>
          </div>

          {confirmHapusVendor && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3" data-html2canvas-ignore="true">
              <p className="text-sm text-red-700 mb-2">
                Yakin mau hapus vendor ini? Semua log kunjungan dan evaluasi bakal hilang.
              </p>
              <div className="flex gap-2">
                <button className="btn btn-error btn-sm" onClick={() => { onDeleteVendor(vendor.id); setConfirmHapusVendor(false); }}>
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

          <div className="mt-3" data-html2canvas-ignore="true">
            <p className="text-xs font-semibold text-gray-600 mb-1">Ubah Status:</p>
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

      {/* FORM EDIT PROFIL VENDOR - IGNORE */}
      {showEditProfil && (
        <div className="card bg-white shadow border border-blue-300" data-html2canvas-ignore="true">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-blue-700 mb-3">✏️ Edit Profil Vendor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Vendor</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.nama} onChange={(e) => setFormProfil({ ...formProfil, nama: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formProfil.kategoriId} onChange={(e) => setFormProfil({ ...formProfil, kategoriId: e.target.value })}>
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriVendorList.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Kontak</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.kontakNama} onChange={(e) => setFormProfil({ ...formProfil, kontakNama: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">No. Telp / HP</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.kontakTelp} onChange={(e) => setFormProfil({ ...formProfil, kontakTelp: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                <input type="email" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.kontakEmail} onChange={(e) => setFormProfil({ ...formProfil, kontakEmail: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.alamat} onChange={(e) => setFormProfil({ ...formProfil, alamat: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">MOQ</label>
                <div className="flex gap-2">
                  <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.moqNilai} onChange={(e) => setFormProfil({ ...formProfil, moqNilai: e.target.value })} />
                  <select className="select select-bordered select-sm text-gray-800 bg-white" value={formProfil.moqSatuan} onChange={(e) => setFormProfil({ ...formProfil, moqSatuan: e.target.value })}>
                    {SATUAN_MOQ.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">HPP (Rp)</label>
                <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formProfil.hpp} onChange={(e) => setFormProfil({ ...formProfil, hpp: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan</label>
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" value={formProfil.catatan} onChange={(e) => setFormProfil({ ...formProfil, catatan: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanProfil}>💾 Simpan Perubahan</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowEditProfil(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">📞 Kontak</h3>
            <div className="text-sm text-gray-700 space-y-1">
              {vendor.kontak?.nama && <p>👤 {vendor.kontak.nama}</p>}
              {vendor.kontak?.telp && <p>📱 {vendor.kontak.telp}</p>}
              {vendor.kontak?.email && <p>✉️ {vendor.kontak.email}</p>}
              {vendor.alamat && <p>📍 {vendor.alamat}</p>}
              {!vendor.kontak?.nama && !vendor.kontak?.telp && !vendor.kontak?.email && !vendor.alamat && (
                  <p className="text-gray-400 italic text-xs">Belum ada info kontak.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">💰 MOQ & HPP</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📦 MOQ: {vendor.moq?.nilai > 0 ? <strong>{vendor.moq.nilai} {vendor.moq.satuan}</strong> : <span className="text-gray-400 italic">Belum diisi</span>}</p>
              <p>💵 HPP: {vendor.hpp > 0 ? <strong>{formatRupiah(vendor.hpp)}</strong> : <span className="text-gray-400 italic">Belum diisi</span>}</p>
            </div>
            {vendor.catatan && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">📝 Catatan:</p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">{vendor.catatan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION EVALUASI VENDOR */}
      <div className="card bg-white shadow border border-purple-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">📊 Evaluasi Kinerja Vendor</h3>
            
            <div className="flex gap-1" data-html2canvas-ignore="true">
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setShowEvalSection(!showEvalSection)}
              >
                {showEvalSection ? "▲ Sembunyikan" : "▼ Tampilkan"}
              </button>
              {!isEditingEval && evalTersimpan && (
                <button
                  className="btn btn-outline btn-xs text-blue-600 border-blue-600"
                  onClick={() => setIsEditingEval(true)}
                >
                  ✏️ Edit Evaluasi
                </button>
              )}
            </div>
          </div>

          {showEvalSection && periodeAktif && (
            <>
              {/* TAB FREKUENSI & NAVIGASI PERIODE - IGNORE */}
              <div className="tabs tabs-boxed bg-gray-50 border border-gray-200 p-1 w-fit mb-3" data-html2canvas-ignore="true">
                {periodeEvaluasiList.map((freq) => (
                  <button
                    key={freq.id}
                    className={`tab ${activePeriode === freq.id ? "tab-active bg-purple-600 text-white" : ""}`}
                    onClick={() => setActivePeriode(freq.id)}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded p-3 border border-gray-200 mb-3" data-html2canvas-ignore="true">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-xs text-gray-700" onClick={handlePrevEval}>‹</button>
                    <h4 className="text-xs font-bold text-gray-800 min-w-[180px] text-center">{periodeAktif.label}</h4>
                    <button className="btn btn-ghost btn-xs text-gray-700" onClick={handleNextEval}>›</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="date" className="input input-bordered input-xs text-gray-800 bg-white" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">📅 {formatTanggalPendek(periodeAktif.periodeMulai)} -- {formatTanggalPendek(periodeAktif.periodeSelesai)}</p>
              </div>

              {/* TOMBOL AUTO GENERATE - IGNORE */}
              {isEditingEval && (
                <div className="flex justify-end mb-2" data-html2canvas-ignore="true">
                  <button
                    className="btn btn-outline btn-xs text-gray-700"
                    onClick={handleAutoGenerateEval}
                    title="Isi dari log kunjungan vendor di periode ini"
                  >
                    🔄 Auto-generate dari Log Kunjungan
                  </button>
                </div>
              )}

              {/* AREA FORM VS VIEW */}
              {!isEditingEval && evalTersimpan ? (
                // MODE LIHAT (READ ONLY - MASUK KE PDF)
                <div className="space-y-3 bg-gray-50 p-3 rounded border border-gray-200">
                  {fieldEvaluasiVendorList.map((field) => (
                    <div key={field.id}>
                      <p className="text-xs font-semibold text-gray-600 mb-1">{field.label}</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {evalValues[field.id] || "-"}
                      </p>
                    </div>
                  ))}
                  {evalTersimpan?.updatedAt && (
                    <p className="text-[10px] text-gray-500 mt-2 italic">
                      Terakhir disimpan: {new Date(evalTersimpan.updatedAt).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              ) : (
                // MODE EDIT (INPUT - DI-IGNORE SAAT PDF)
                <div className="space-y-2" data-html2canvas-ignore="true">
                  {fieldEvaluasiVendorList.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        {field.label}
                      </label>
                      {field.tipe === "score" ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="range" min="1" max="10" step="1"
                            className="range range-primary range-sm flex-1"
                            value={evalValues[field.id] || 5}
                            onChange={(e) => handleUpdateEvalValue(field.id, parseInt(e.target.value))}
                          />
                          <span className="badge badge-primary badge-sm font-bold w-10 text-center">
                            {evalValues[field.id] || 5}
                          </span>
                        </div>
                      ) : field.tipe === "text" ? (
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full text-gray-800 bg-white"
                          placeholder={`Isi ${field.label}...`}
                          value={evalValues[field.id] || ""}
                          onChange={(e) => handleUpdateEvalValue(field.id, e.target.value)}
                        />
                      ) : (
                        <textarea
                          className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                          rows="2"
                          placeholder={`Isi ${field.label}...`}
                          value={evalValues[field.id] || ""}
                          onChange={(e) => handleUpdateEvalValue(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4" data-html2canvas-ignore="true">
                    <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanEval}>
                      💾 Simpan Evaluasi
                    </button>
                    {evalTersimpan && (
                      <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setIsEditingEval(false)}>
                        Batal
                      </button>
                    )}
                  </div>
                  {savedEvalNotif && (
                    <div className="alert alert-success py-2 mt-2 text-xs" data-html2canvas-ignore="true">
                      <span>✅ Evaluasi vendor berhasil disimpan!</span>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORY EVAL - FIX max-h & TAMBAH TOMBOL HAPUS */}
              <div className="mt-4 border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-2" data-html2canvas-ignore="true">
                  <p className="text-xs font-semibold text-gray-700">📚 History Evaluasi Vendor ({historyEval.length})</p>
                  <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowHistoryEval(!showHistoryEval)}>
                    {showHistoryEval ? "▲ Sembunyikan" : "▼ Tampilkan"}
                  </button>
                </div>
                
                {/* Bagian ini harus muncul di PDF jika showHistoryEval true */}
                {showHistoryEval && (
                  <div className="space-y-2">
                    {historyEval.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">Belum ada history.</p>
                    ) : (
                      // max-h-64 overflow-y-auto DIHAPUS BIAR SEMUA KELIHATAN
                      <div className="space-y-2">
                        {historyEval.map((ev) => (
                          <details key={ev.key} className="border border-gray-200 rounded p-2 bg-white">
                            <summary className="text-sm font-semibold text-gray-800 cursor-pointer flex justify-between items-center">
                              <span>📅 {ev.label || ev.key}</span>
                              {/* Tombol Hapus History */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); // Biar details-nya nggak kebuka/tutup
                                  handleHapusHistoryEval(ev.key);
                                }}
                                className="btn btn-ghost btn-xs text-red-500"
                                title="Hapus History Periode Ini"
                                data-html2canvas-ignore="true"
                              >
                                🗑️
                              </button>
                            </summary>
                            <div className="mt-2 space-y-2">
                              {fieldEvaluasiVendorList.map((f) => {
                                const val = ev.fields?.[f.id];
                                if (!val) return null;
                                return (
                                  <div key={f.id} className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <p className="text-[10px] font-semibold text-gray-600">{f.label}</p>
                                    <p className="text-xs text-gray-800 whitespace-pre-wrap">{val}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* LOG KUNJUNGAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">📅 Log Kunjungan ({vendor.logKunjungan?.length || 0})</h3>
            
            <div className="flex gap-1" data-html2canvas-ignore="true">
              <select className="select select-bordered select-xs text-gray-800 bg-white" value={filterTujuan} onChange={(e) => setFilterTujuan(e.target.value)}>
                <option value="all">Semua Tujuan</option>
                {tujuanKunjunganList.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <button className="btn btn-primary btn-xs" onClick={() => { resetFormKunjungan(); setShowFormKunjungan(true); }}>
                + Tambah
              </button>
            </div>
          </div>

          {/* Form Kunjungan - IGNORE */}
          {showFormKunjungan && (
            <div className="bg-blue-50 rounded p-3 mb-3 space-y-3 border border-blue-200" data-html2canvas-ignore="true">
              <p className="text-xs font-semibold text-blue-700">
                {editingKunjunganId ? "✏️ Edit Kunjungan" : "✏️ Tambah Kunjungan"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">📅 Tanggal</label>
                  <input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formKunjungan.tanggal} onChange={(e) => setFormKunjungan({ ...formKunjungan, tanggal: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">🎯 Tujuan</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formKunjungan.tujuanId} onChange={(e) => setFormKunjungan({ ...formKunjungan, tujuanId: e.target.value })}>
                    {tujuanKunjunganList.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">💻 Metode</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formKunjungan.metode} onChange={(e) => setFormKunjungan({ ...formKunjungan, metode: e.target.value })}>
                    {METODE_KUNJUNGAN.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">✅ Hasil</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formKunjungan.hasil} onChange={(e) => setFormKunjungan({ ...formKunjungan, hasil: e.target.value })}>
                    {HASIL_KUNJUNGAN.map((h) => (
                      <option key={h.id} value={h.id}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">📝 Catatan</label>
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" placeholder="Catatan hasil kunjungan..." value={formKunjungan.catatan} onChange={(e) => setFormKunjungan({ ...formKunjungan, catatan: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanKunjungan}>
                  {editingKunjunganId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={resetFormKunjungan}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {filteredLog.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">Belum ada kunjungan. Klik "+ Tambah" untuk mulai.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLog.slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map((log) => {
                  const tujuanData = tujuanKunjunganList.find((t) => t.id === log.tujuanId);
                  return (
                    <div key={log.id} className="p-3 rounded border border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">📅 {formatTanggal(log.tanggal, "pendek")}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-300">{tujuanData?.label || log.tujuanId}</span>
                            <span className="text-xs px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-300">{getLabelMetode(log.metode)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(getWarnaHasil(log.hasil))}`}>{getLabelHasil(log.hasil)}</span>
                          </div>
                        </div>
                        {/* Tombol aksi di-ignore */}
                        <div className="flex gap-1" data-html2canvas-ignore="true">
                          <button className="btn btn-ghost btn-xs" onClick={() => handleEditKunjungan(log)} title="Edit">✏️</button>
                          <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusKunjungan(log.id)} title="Hapus">🗑️</button>
                        </div>
                      </div>
                      {log.catatan && (
                        <p className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border border-gray-200 mt-2">📝 {log.catatan}</p>
                      )}
                      {log.gdriveUrl && (
                        <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-block">📁 GDrive</a>
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