// components/KalenderBedahBuku.js
"use client";

import { useState } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import {
  formatTanggal,
  getHalamanRange,
  validasiRange,
  getHalamanBerikutnya,
} from "@/lib/bedahBukuData";

export default function KalenderBedahBuku({ bukuList = [], onUpdateBuku }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ========== FORM STATE ==========
  const [formData, setFormData] = useState({
    bukuId: "",
    halamanMulai: "",
    halamanAkhir: "",
    catatan: "",
    gdriveUrl: "",
    tiktokUrl: "",
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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };
  const handleMonthChange = (e) =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) =>
    setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  // ========== GET ENTRY DI TANGGAL ==========
  // Cari semua entry (dari semua buku) di tanggal tertentu
  const getEntriesDiTanggal = (date) => {
    const entries = [];
    bukuList.forEach((buku) => {
      const entry = buku.progressHarian?.[date];
      if (entry) {
        entries.push({
          bukuId: buku.id,
          bukuJudul: buku.judul,
          kategoriId: buku.kategoriId,
          ...entry,
        });
      }
    });
    return entries;
  };

  // ========== KLIK TANGGAL ==========
  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
      return;
    }

    setSelectedDate(date);
    setShowForm(true);
    setErrorMsg("");

    // Auto-pilih buku pertama yang belum selesai
    const bukuAktif = bukuList.find((b) => {
      const total = b.totalHalaman - (b.halamanMulai || 1) + 1;
      return (b.halamanSelesai?.length || 0) < total;
    });

    const defaultBukuId = bukuAktif?.id || bukuList[0]?.id || "";
    const halamanNext = bukuAktif ? getHalamanBerikutnya(bukuAktif) : "";

    setFormData({
      bukuId: defaultBukuId,
      halamanMulai: halamanNext || "",
      halamanAkhir: "",
      catatan: "",
      gdriveUrl: "",
      tiktokUrl: "",
    });
  };

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    setErrorMsg("");

    if (!formData.bukuId) {
      setErrorMsg("Pilih buku dulu.");
      return;
    }
    const buku = bukuList.find((b) => b.id === formData.bukuId);
    if (!buku) {
      setErrorMsg("Buku nggak ketemu.");
      return;
    }

    const mulai = parseInt(formData.halamanMulai);
    const akhir = parseInt(formData.halamanAkhir);

    if (!mulai || !akhir) {
      setErrorMsg("Isi halaman mulai dan halaman akhir.");
      return;
    }

    // Validasi range
    const validasi = validasiRange(buku, mulai, akhir);
    if (!validasi.valid) {
      setErrorMsg(validasi.pesan);
      return;
    }

    // Bikin halaman list
    const halamanList = getHalamanRange(mulai, akhir);

    // Update buku: tambah ke halamanSelesai + progressHarian
    const halamanSelesaiBaru = Array.from(
      new Set([...(buku.halamanSelesai || []), ...halamanList])
    ).sort((a, b) => a - b);

    const progressHarianBaru = {
      ...(buku.progressHarian || {}),
      [selectedDate]: {
        halamanMulai: mulai,
        halamanAkhir: akhir,
        halamanList,
        catatan: formData.catatan,
        gdriveUrl: formData.gdriveUrl,
        tiktokUrl: formData.tiktokUrl,
        createdAt: new Date().toISOString(),
      },
    };

    const updatedBuku = {
      ...buku,
      halamanSelesai: halamanSelesaiBaru,
      progressHarian: progressHarianBaru,
    };

    onUpdateBuku(buku.id, updatedBuku);

    // Reset form tapi tetap buka (biar bisa tambah buku lain di tanggal sama)
    const halamanNext = getHalamanBerikutnya(updatedBuku);
    setFormData({
      bukuId: buku.id,
      halamanMulai: halamanNext || "",
      halamanAkhir: "",
      catatan: "",
      gdriveUrl: "",
      tiktokUrl: "",
    });
  };

  // ========== HAPUS ENTRY ==========
  const handleHapusEntry = (bukuId, date) => {
    if (!confirm("Hapus entry ini? Halaman yang udah di-mark selesai bakal di-unmark.")) return;

    const buku = bukuList.find((b) => b.id === bukuId);
    if (!buku) return;

    const entry = buku.progressHarian?.[date];
    if (!entry) return;

    // Hapus halaman dari halamanSelesai
    const halamanDihapus = entry.halamanList || [];
    const halamanSelesaiBaru = (buku.halamanSelesai || []).filter(
      (h) => !halamanDihapus.includes(h)
    );

    // Hapus entry dari progressHarian
    const progressHarianBaru = { ...buku.progressHarian };
    delete progressHarianBaru[date];

    const updatedBuku = {
      ...buku,
      halamanSelesai: halamanSelesaiBaru,
      progressHarian: progressHarianBaru,
    };

    onUpdateBuku(buku.id, updatedBuku);
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

  const todayStr = new Date().toISOString().split("T")[0];

  const hasKegiatan = (date) => {
    return getEntriesDiTanggal(date).length > 0;
  };

  // ========== BUKU YANG DIPILIH (untuk info target) ==========
  const bukuDipilih = bukuList.find((b) => b.id === formData.bukuId);
  const halamanNextBukuDipilih = bukuDipilih ? getHalamanBerikutnya(bukuDipilih) : null;

  const entriesSelected = selectedDate ? getEntriesDiTanggal(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* KALENDER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {/* Navigasi */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear} title="Tahun sebelumnya">«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth} title="Bulan sebelumnya">‹</button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth} title="Bulan berikutnya">›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear} title="Tahun berikutnya">»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>
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
              const adaKegiatan = hasKegiatan(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) {
                boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              }
              if (isHolidayDate && !isSelected) {
                boxClass = "bg-red-600 text-white border-red-700 font-bold";
              }
              if (isSelected) {
                boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-2 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {adaKegiatan && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-600 border border-red-700" />
              <span>Libur Nasional</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" />
              <span>Hari Ini</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600" />
              <span>Tanggal Dipilih</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Ada Baca</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL TANGGAL */}
      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              📌 {formatTanggal(selectedDate)}
            </h3>

            {/* FORM INPUT */}
            {showForm && (
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200 mb-4">
                <p className="text-xs font-semibold text-blue-700">
                  ✏️ Input Baca Hari Ini
                </p>

                {/* Pilih Buku */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📖 Pilih Buku
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.bukuId}
                    onChange={(e) => {
                      const bukuId = e.target.value;
                      const buku = bukuList.find((b) => b.id === bukuId);
                      const next = buku ? getHalamanBerikutnya(buku) : "";
                      setFormData({
                        ...formData,
                        bukuId,
                        halamanMulai: next || "",
                        halamanAkhir: "",
                      });
                      setErrorMsg("");
                    }}
                  >
                    <option value="">-- Pilih Buku --</option>
                    {bukuList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.judul}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info buku */}
                {bukuDipilih && (
                  <div className="bg-white rounded p-2 border border-gray-200 text-xs text-gray-600">
                    <p>
                      📊 Target: <strong>{bukuDipilih.targetPerHari} halaman/hari</strong>
                    </p>
                    <p>
                      📄 Halaman berikutnya: <strong>{halamanNextBukuDipilih || "Selesai"}</strong>
                    </p>
                    <p>
                      📚 Total: <strong>{bukuDipilih.totalHalaman}</strong> halaman
                    </p>
                  </div>
                )}

                {/* Range Halaman */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📄 Halaman (Range)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                      placeholder="Mulai"
                      value={formData.halamanMulai}
                      onChange={(e) => {
                        setFormData({ ...formData, halamanMulai: e.target.value });
                        setErrorMsg("");
                      }}
                    />
                    <span className="text-gray-600">sampai</span>
                    <input
                      type="number"
                      className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                      placeholder="Akhir"
                      value={formData.halamanAkhir}
                      onChange={(e) => {
                        setFormData({ ...formData, halamanAkhir: e.target.value });
                        setErrorMsg("");
                      }}
                    />
                  </div>
                  {formData.halamanMulai && formData.halamanAkhir && (
                    <p className="text-xs text-gray-500 mt-1">
                      = {parseInt(formData.halamanAkhir) - parseInt(formData.halamanMulai) + 1} halaman
                    </p>
                  )}
                </div>

                {/* Catatan */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📝 Catatan (opsional)
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="3"
                    placeholder="Misal: paham konsep SWOT, PESTLE, BMC. Belum paham bagian portofolio."
                    value={formData.catatan}
                    onChange={(e) =>
                      setFormData({ ...formData, catatan: e.target.value })
                    }
                  />
                </div>

                {/* Link GDrive */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📁 Link Google Drive (opsional)
                  </label>
                  <input
                    type="url"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="https://drive.google.com/..."
                    value={formData.gdriveUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, gdriveUrl: e.target.value })
                    }
                  />
                </div>

                {/* Link TikTok */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    🎬 Link TikTok (opsional)
                  </label>
                  <input
                    type="url"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="https://tiktok.com/@user/video/..."
                    value={formData.tiktokUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, tiktokUrl: e.target.value })
                    }
                  />
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="alert alert-error py-2 text-xs">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                {/* Tombol */}
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpan}
                  >
                    💾 Simpan
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => setShowForm(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* LIST ENTRY DI TANGGAL INI */}
            {entriesSelected.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📖</p>
                <p className="text-sm">Belum ada kegiatan baca di tanggal ini.</p>
                {!showForm && (
                  <button
                    className="btn btn-outline btn-sm mt-3 text-gray-700"
                    onClick={() => setShowForm(true)}
                  >
                    + Input Baca
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {entriesSelected.map((entry, idx) => (
                  <div
                    key={`${entry.bukuId}_${idx}`}
                    className="p-3 rounded border bg-gray-50 border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          📖 {entry.bukuJudul}
                        </p>
                        <p className="text-xs text-gray-600">
                          Halaman {entry.halamanMulai}–{entry.halamanAkhir} (
                          {entry.halamanList?.length || 0} hal)
                        </p>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusEntry(entry.bukuId, selectedDate)}
                        title="Hapus entry"
                      >
                        🗑️
                      </button>
                    </div>

                    {entry.catatan && (
                      <p className="text-xs text-gray-700 whitespace-pre-wrap mb-1 bg-white p-2 rounded border border-gray-200">
                        📝 {entry.catatan}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-1">
                      {entry.gdriveUrl && (
                        <a
                          href={entry.gdriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs link link-primary"
                        >
                          📁 GDrive
                        </a>
                      )}
                      {entry.tiktokUrl && (
                        <a
                          href={entry.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs link link-primary"
                        >
                          🎬 TikTok
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {!showForm && (
                  <button
                    className="btn btn-outline btn-sm w-full text-gray-700"
                    onClick={() => setShowForm(true)}
                  >
                    + Tambah Entry Buku Lain
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PLACEHOLDER */}
      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm">
              Klik salah satu tanggal di kalender untuk input baca.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}