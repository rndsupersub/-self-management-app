// components/KalenderTransaksi.js
"use client";

import { useState, useMemo } from "react";
import {
  DEFAULT_DOMPET,
  DEFAULT_KATEGORI,
  formatRupiah,
  formatTanggal,
  generateId,
  getTanggalHariIni,
} from "@/lib/keuanganData";
import { HOLIDAYS } from "@/lib/holidays";

export default function KalenderTransaksi({
  keuanganTransaksi = {},
  dompetList = DEFAULT_DOMPET,
  kategoriList = DEFAULT_KATEGORI,
  onUpdateTransaksi,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTanggalHariIni());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    jenis: "keluar",
    kategori: "",
    subkategori: "",
    nominal: "",
    metode: "Cash",
    catatan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ========== GENERATE KALENDER ==========
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  };

  // ========== NAVIGASI ==========
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextYear = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1)
    );
  const prevYear = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1)
    );
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(getTanggalHariIni());
  };
  const handleMonthChange = (e) =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1)
    );
  const handleYearChange = (e) =>
    setCurrentMonth(
      new Date(parseInt(e.target.value), currentMonth.getMonth(), 1)
    );

  // ========== TRANSAKSI DI TANGGAL ==========
  const transaksiHariIni = keuanganTransaksi[selectedDate] || [];

  // ========== AUTO-ASSIGN WALLET ==========
  const getWalletId = (jenis, kategoriId) => {
    const kategoriObj = (kategoriList[jenis] || []).find(
      (k) => k.id === kategoriId
    );
    if (!kategoriObj) return null;

    // Cari dompet berdasarkan nama kategori
    const namaKat = kategoriObj.nama.toLowerCase();

    // Kategori khusus → wallet khusus
    if (namaKat.includes("dana darurat")) return "dana_darurat";
    if (namaKat.includes("tabungan") || namaKat.includes("laptop") || namaKat.includes("mobil") || namaKat.includes("rumah")) return "tabungan";
    if (namaKat.includes("kurban")) return "kurban";
    if (namaKat.includes("emas")) return "investasi_emas";
    if (namaKat.includes("modal bisnis") || namaKat.includes("modal clothing")) return "modal_bisnis";
    if (namaKat.includes("operasional") || namaKat.includes("bensin")) return "operasional";
    if (namaKat.includes("lifestyle")) return "lifestyle";
    if (namaKat.includes("keluarga")) return "keluarga";
    if (namaKat.includes("survey")) return "survey";
    if (namaKat.includes("dana main")) return "dana_main";
    if (namaKat.includes("sedekah")) return "sedekah";

    return null;
  };

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaForm = () => {
    setFormData({
      jenis: "keluar",
      kategori: "",
      subkategori: "",
      nominal: "",
      metode: "Cash",
      catatan: "",
    });
    setEditingId(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleBukaEdit = (trx) => {
    setFormData({
      jenis: trx.jenis,
      kategori: trx.kategoriId || "",
      subkategori: trx.subkategori || "",
      nominal: trx.nominal || "",
      metode: trx.metode || "Cash",
      catatan: trx.catatan || "",
    });
    setEditingId(trx.id);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== SIMPAN TRANSAKSI ==========
  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.kategori) {
      setErrorMsg("Pilih kategori dulu.");
      return;
    }
    const nominal = parseInt(formData.nominal);
    if (!nominal || nominal <= 0) {
      setErrorMsg("Nominal harus lebih dari 0.");
      return;
    }

    const walletId = getWalletId(formData.jenis, formData.kategori);
    const updated = JSON.parse(JSON.stringify(keuanganTransaksi || {}));
    if (!updated[selectedDate]) updated[selectedDate] = [];

    const newTrx = {
      id: editingId || generateId("trx"),
      jenis: formData.jenis,
      kategoriId: formData.kategori,
      subkategori: formData.subkategori,
      nominal,
      metode: formData.metode,
      catatan: formData.catatan,
      walletId,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updated[selectedDate] = updated[selectedDate].map((t) =>
        t.id === editingId ? { ...t, ...newTrx } : t
      );
    } else {
      updated[selectedDate].push(newTrx);
    }

    onUpdateTransaksi(updated);
    setShowForm(false);
    setEditingId(null);
  };

  // ========== HAPUS ==========
  const handleHapus = (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    const updated = JSON.parse(JSON.stringify(keuanganTransaksi || {}));
    if (updated[selectedDate]) {
      updated[selectedDate] = updated[selectedDate].filter((t) => t.id !== id);
      if (updated[selectedDate].length === 0) delete updated[selectedDate];
    }
    onUpdateTransaksi(updated);
  };

  // ========== HELPER ==========
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = getTanggalHariIni();

  const getTransaksiByDate = (date) => keuanganTransaksi[date] || [];

  const getDotColor = (trxList) => {
    if (!trxList || trxList.length === 0) return null;
    // Prioritaskan jenis
    if (trxList.some((t) => t.jenis === "masuk")) return "bg-green-500";
    if (trxList.some((t) => t.jenis === "keluar")) return "bg-red-500";
    if (trxList.some((t) => t.jenis === "tabungan")) return "bg-blue-500";
    if (trxList.some((t) => t.jenis === "sedekah")) return "bg-orange-500";
    return "bg-gray-400";
  };

  const getKategoriObj = (jenis, kategoriId) => {
    return (kategoriList[jenis] || []).find((k) => k.id === kategoriId);
  };

  const jenisList = [
    { id: "masuk", label: "💰 Masuk" },
    { id: "keluar", label: "📤 Keluar" },
    { id: "tabungan", label: "🏦 Tabungan" },
    { id: "sedekah", label: "🤲 Sedekah" },
  ];

  const getJenisLabel = (id) =>
    jenisList.find((j) => j.id === id)?.label || id;

  const getJenisColor = (id) => {
    if (id === "masuk") return "text-green-700 bg-green-50 border-green-200";
    if (id === "keluar") return "text-red-700 bg-red-50 border-red-200";
    if (id === "tabungan") return "text-blue-700 bg-blue-50 border-blue-200";
    if (id === "sedekah") return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  // Total per jenis hari ini
  const totalHariIni = useMemo(() => {
    const total = { masuk: 0, keluar: 0, tabungan: 0, sedekah: 0 };
    transaksiHariIni.forEach((t) => {
      if (total[t.jenis] !== undefined) {
        total[t.jenis] += parseInt(t.nominal) || 0;
      }
    });
    return total;
  }, [transaksiHariIni]);

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          📌 Klik tanggal di kalender buat input / liat transaksi. Dot = ada
          transaksi.
        </span>
      </div>

      {/* KALENDER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {/* Navigasi */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear}>
                «
              </button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth}>
                ‹
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>
                ›
              </button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear}>
                »
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button
              className="btn btn-outline btn-xs text-gray-700"
              onClick={goToToday}
            >
              📅 Hari Ini
            </button>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const trxList = getTransaksiByDate(item.date);
              const dotColor = getDotColor(trxList);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass =
                "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) {
                boxClass =
                  "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              }
              if (isHolidayDate && !isSelected) {
                boxClass = "bg-red-600 text-white border-red-700 font-bold";
              }
              if (isSelected) {
                boxClass =
                  "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-1 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => setSelectedDate(item.date)}
                  title={holiday || ""}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {dotColor && (
                    <span
                      className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${dotColor}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Masuk</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Keluar</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Tabungan</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Sedekah</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSAKSI TANGGAL */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                📌 {formatTanggal(selectedDate, "hari")}
              </h3>
              <p className="text-xs text-gray-500">
                Total: 💰 {formatRupiah(totalHariIni.masuk)} masuk • 📤{" "}
                {formatRupiah(totalHariIni.keluar)} keluar
              </p>
            </div>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={handleBukaForm}>
                + Tambah Transaksi
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200 mb-3">
              <p className="text-xs font-semibold text-blue-700">
                {editingId ? "✏️ Edit Transaksi" : "✏️ Tambah Transaksi"}
              </p>

              {/* Jenis */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Jenis
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {jenisList.map((j) => (
                    <button
                      key={j.id}
                      className={`btn btn-xs ${
                        formData.jenis === j.id ? "btn-primary" : "btn-outline"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, jenis: j.id, kategori: "" })
                      }
                    >
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Kategori
                </label>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                >
                  <option value="">-- Pilih Kategori --</option>
                  {(kategoriList[formData.jenis] || []).map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subkategori */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Subkategori (opsional)
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Misal: Rokok Magnum"
                  value={formData.subkategori}
                  onChange={(e) =>
                    setFormData({ ...formData, subkategori: e.target.value })
                  }
                />
              </div>

              {/* Nominal + Metode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="30000"
                    value={formData.nominal}
                    onChange={(e) =>
                      setFormData({ ...formData, nominal: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Metode
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.metode}
                    onChange={(e) =>
                      setFormData({ ...formData, metode: e.target.value })
                    }
                  >
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Catatan
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Catatan (opsional)"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
              </div>

              {errorMsg && (
                <div className="alert alert-error py-2 text-xs">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpan}
                >
                  {editingId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* LIST TRANSAKSI */}
          {transaksiHariIni.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-sm">Belum ada transaksi di tanggal ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transaksiHariIni
                .slice()
                .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
                .map((trx) => {
                  const kategori = getKategoriObj(trx.jenis, trx.kategoriId);
                  return (
                    <div
                      key={trx.id}
                      className={`flex items-start gap-3 p-3 rounded border ${getJenisColor(
                        trx.jenis
                      )}`}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold">
                            {getJenisLabel(trx.jenis)}
                          </p>
                          <p className="text-sm font-bold">
                            {trx.jenis === "masuk" ? "+" : "-"}
                            {formatRupiah(trx.nominal)}
                          </p>
                        </div>
                        <p className="text-xs mt-0.5">
                          {kategori?.nama || trx.kategoriId}
                          {trx.subkategori && ` • ${trx.subkategori}`}
                        </p>
                        {trx.catatan && (
                          <p className="text-xs mt-1 italic opacity-80">
                            💬 {trx.catatan}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleBukaEdit(trx)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleHapus(trx.id)}
                        >
                          🗑️
                        </button>
                      </div>
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