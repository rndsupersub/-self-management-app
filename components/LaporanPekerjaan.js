// components/LaporanPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  getTanggalHariIni,
  formatTanggalPanjang,
  formatTanggalPendek,
  tambahHari,
  getMingguRange,
  getBulanRange,
  generateLaporanHarian,
  generateLaporanMingguan,
  generateLaporanBulanan,
  hitungStatistikKegiatan,
  autoGenerateSummary,
} from "@/lib/laporanData";

export default function LaporanPekerjaan({
  kegiatanList = [],
  laporanData = {},
  onUpdateLaporan,
  prioritasList = [],
  sumberList = [],
}) {
  const [activeTab, setActiveTab] = useState("harian");
  const [selectedDate, setSelectedDate] = useState(getTanggalHariIni());
  const [kontenText, setKontenText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showKegiatanList, setShowKegiatanList] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);

  // ========== HITUNG PERIODE ==========
  const periodeHarian = useMemo(() => {
    return { tanggal: selectedDate };
  }, [selectedDate]);

  const periodeMingguan = useMemo(() => {
    return getMingguRange(selectedDate);
  }, [selectedDate]);

  const periodeBulanan = useMemo(() => {
    return getBulanRange(selectedDate);
  }, [selectedDate]);

  // ========== KEY UNTUK FIRESTORE ==========
  const keyHarian = selectedDate;
  const keyMingguan = periodeMingguan.tanggalMulai;
  const keyBulanan = `${periodeBulanan.tahun}-${String(periodeBulanan.bulan).padStart(2, "0")}`;

  // ========== AMBIL LAPORAN YANG UDAH ADA ==========
  const laporanTersimpan = useMemo(() => {
    if (activeTab === "harian") {
      return laporanData?.harian?.[keyHarian] || null;
    }
    if (activeTab === "mingguan") {
      return laporanData?.mingguan?.[keyMingguan] || null;
    }
    return laporanData?.bulanan?.[keyBulanan] || null;
  }, [activeTab, laporanData, keyHarian, keyMingguan, keyBulanan]);

  // ========== LOAD LAPORAN TERSIMPAN KE TEXTAREA ==========
  useEffect(() => {
    setKontenText(laporanTersimpan?.konten || "");
  }, [laporanTersimpan, activeTab, selectedDate]);

  // ========== FILTER KEGIATAN PER PERIODE ==========
  const kegiatanDiPeriode = useMemo(() => {
    if (activeTab === "harian") {
      return generateLaporanHarian(kegiatanList, selectedDate);
    }
    if (activeTab === "mingguan") {
      return generateLaporanMingguan(
        kegiatanList,
        periodeMingguan.tanggalMulai,
        periodeMingguan.tanggalSelesai
      );
    }
    return generateLaporanBulanan(
      kegiatanList,
      periodeBulanan.tanggalMulai,
      periodeBulanan.tanggalSelesai
    );
  }, [activeTab, kegiatanList, selectedDate, periodeMingguan, periodeBulanan]);

  const statistik = useMemo(() => {
    return hitungStatistikKegiatan(kegiatanDiPeriode);
  }, [kegiatanDiPeriode]);

  // ========== HANDLE AUTO-GENERATE ==========
  const handleAutoGenerate = () => {
    const summary = autoGenerateSummary(kegiatanDiPeriode);
    setKontenText(summary);
  };

  // ========== HANDLE SIMPAN ==========
  const handleSimpan = () => {
    if (!onUpdateLaporan) return;

    const newLaporanData = JSON.parse(JSON.stringify(laporanData || {}));

    if (activeTab === "harian") {
      if (!newLaporanData.harian) newLaporanData.harian = {};
      newLaporanData.harian[keyHarian] = {
        tanggal: keyHarian,
        konten: kontenText,
        updatedAt: new Date().toISOString(),
      };
    } else if (activeTab === "mingguan") {
      if (!newLaporanData.mingguan) newLaporanData.mingguan = {};
      newLaporanData.mingguan[keyMingguan] = {
        tanggalMulai: periodeMingguan.tanggalMulai,
        tanggalSelesai: periodeMingguan.tanggalSelesai,
        mingguKe: periodeMingguan.mingguKe,
        tahun: periodeMingguan.tahun,
        konten: kontenText,
        updatedAt: new Date().toISOString(),
      };
    } else {
      if (!newLaporanData.bulanan) newLaporanData.bulanan = {};
      newLaporanData.bulanan[keyBulanan] = {
        tahun: periodeBulanan.tahun,
        bulan: periodeBulanan.bulan,
        namaBulan: periodeBulanan.namaBulan,
        konten: kontenText,
        updatedAt: new Date().toISOString(),
      };
    }

    onUpdateLaporan(newLaporanData);

    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 2000);
  };

  // ========== NAVIGASI PERIODE ==========
  const handlePrev = () => {
    if (activeTab === "harian") {
      setSelectedDate(tambahHari(selectedDate, -1));
    } else if (activeTab === "mingguan") {
      setSelectedDate(tambahHari(selectedDate, -7));
    } else {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    }
  };

  const handleNext = () => {
    if (activeTab === "harian") {
      setSelectedDate(tambahHari(selectedDate, 1));
    } else if (activeTab === "mingguan") {
      setSelectedDate(tambahHari(selectedDate, 7));
    } else {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    }
  };

  const handleToday = () => {
    setSelectedDate(getTanggalHariIni());
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // ========== HELPER: LABEL PERIODE ==========
  const labelPeriode = useMemo(() => {
    if (activeTab === "harian") return formatTanggalPanjang(selectedDate);
    if (activeTab === "mingguan") return periodeMingguan.label;
    return periodeBulanan.label;
  }, [activeTab, selectedDate, periodeMingguan, periodeBulanan]);

  // ========== HELPER: BADGE ==========
  const getBadgeClass = (warna) => {
    const map = {
      red: "bg-red-100 text-red-700 border-red-300",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      green: "bg-green-100 text-green-700 border-green-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
    };
    return map[warna] || map.gray;
  };

  const getPrioritasData = (id) => prioritasList.find((p) => p.id === id);
  const getSumberData = (id) => sumberList.find((s) => s.id === id);

  // ========== HISTORY LIST ==========
  const historyList = useMemo(() => {
    const data = laporanData?.[activeTab] || {};
    return Object.entries(data)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => {
        const aDate = a.tanggal || a.tanggalMulai || `${a.tahun}-${String(a.bulan || 1).padStart(2, "0")}-01`;
        const bDate = b.tanggal || b.tanggalMulai || `${b.tahun}-${String(b.bulan || 1).padStart(2, "0")}-01`;
        return bDate.localeCompare(aDate);
      });
  }, [laporanData, activeTab]);

  return (
    <div className="space-y-4">
      {/* REMINDER INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          📌 Laporan diisi setiap <strong>hari kerja jam 17:00–18:00</strong>.
          {activeTab === "harian" && " Laporan harian diisi setiap hari (Senin–Sabtu)."}
          {activeTab === "mingguan" && " Laporan mingguan diisi setiap hari Sabtu."}
          {activeTab === "bulanan" && " Laporan bulanan diisi di akhir bulan (tgl 28/29/30/31)."}
        </span>
      </div>

      {/* TAB NAVIGATION */}
      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
        <button
          className={`tab ${activeTab === "harian" ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab("harian")}
        >
          📋 Harian
        </button>
        <button
          className={`tab ${activeTab === "mingguan" ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab("mingguan")}
        >
          📅 Mingguan
        </button>
        <button
          className={`tab ${activeTab === "bulanan" ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab("bulanan")}
        >
          📆 Bulanan
        </button>
      </div>

      {/* NAVIGASI PERIODE */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handlePrev}>
                ‹
              </button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">
                {labelPeriode}
              </h3>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleNext}>
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input input-bordered input-sm text-gray-800 bg-white"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <button className="btn btn-outline btn-xs text-gray-700" onClick={handleToday}>
                📅 {activeTab === "harian" ? "Hari Ini" : activeTab === "mingguan" ? "Minggu Ini" : "Bulan Ini"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN KEGIATAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              📊 Ringkasan Kegiatan ({statistik.total})
            </h3>
            <button
              className="btn btn-ghost btn-xs text-gray-600"
              onClick={() => setShowKegiatanList(!showKegiatanList)}
            >
              {showKegiatanList ? "▲ Sembunyikan" : "▼ Lihat Detail"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">{statistik.total}</p>
            </div>
            <div className="bg-green-50 rounded p-2 border border-green-200">
              <p className="text-xs text-gray-500">Selesai</p>
              <p className="text-lg font-bold text-green-700">{statistik.selesai}</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
              <p className="text-xs text-gray-500">Belum</p>
              <p className="text-lg font-bold text-yellow-700">{statistik.belum}</p>
            </div>
            <div className="bg-blue-50 rounded p-2 border border-blue-200">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-lg font-bold text-blue-700">{statistik.persen}%</p>
            </div>
          </div>

          {/* DETAIL KEGIATAN */}
          {showKegiatanList && (
            <div className="mt-3 space-y-2">
              {kegiatanDiPeriode.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-3">
                  Tidak ada kegiatan di periode ini.
                </p>
              ) : (
                kegiatanDiPeriode.map((keg) => {
                  const prio = getPrioritasData(keg.prioritas);
                  const sum = getSumberData(keg.sumber);
                  return (
                    <div
                      key={keg.id}
                      className="p-2 rounded border border-gray-200 bg-gray-50"
                    >
                      <p
                        className={`text-sm font-semibold text-gray-800 ${
                          keg.status === "selesai" ? "line-through opacity-60" : ""
                        }`}
                      >
                        {keg.judul}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prio && (
                          <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(prio.warna)}`}>
                            {prio.label}
                          </span>
                        )}
                        {sum && (
                          <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(sum.warna)}`}>
                            {sum.label}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-300">
                          {keg.status === "selesai" ? "✅ Selesai" : "⏳ Belum"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDITOR LAPORAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              ✏️ Laporan {activeTab === "harian" ? "Harian" : activeTab === "mingguan" ? "Mingguan" : "Bulanan"}
            </h3>
            <div className="flex gap-1">
              <button
                className="btn btn-outline btn-xs text-gray-700"
                onClick={handleAutoGenerate}
                title="Isi otomatis dari kegiatan di periode ini"
              >
                🔄 Auto-generate dari Kegiatan
              </button>
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => setKontenText("")}
                title="Kosongin textarea"
              >
                ✕ Clear
              </button>
            </div>
          </div>

          <textarea
            className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono"
            rows="12"
            placeholder="Tulis laporan di sini...&#10;&#10;Bisa klik 'Auto-generate dari Kegiatan' buat isi otomatis dari kegiatan di periode ini, terus lo edit manual sesuai kebutuhan.&#10;&#10;Contoh isi laporan:&#10;- Kegiatan apa yang dikerjain&#10;- Progress / hasil&#10;- Kendala&#10;- Solusi / rencana berikutnya"
            value={kontenText}
            onChange={(e) => setKontenText(e.target.value)}
          />

          {laporanTersimpan?.updatedAt && (
            <p className="text-xs text-gray-500 mt-2">
              📅 Terakhir disimpan:{" "}
              {new Date(laporanTersimpan.updatedAt).toLocaleString("id-ID")}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={handleSimpan}
              disabled={!kontenText.trim()}
            >
              💾 Simpan Laporan
            </button>
          </div>

          {savedNotif && (
            <div className="alert alert-success py-2 mt-3 text-xs">
              <span>✅ Laporan berhasil disimpan!</span>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY LAPORAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              📚 History Laporan {activeTab === "harian" ? "Harian" : activeTab === "mingguan" ? "Mingguan" : "Bulanan"} ({historyList.length})
            </h3>
            <button
              className="btn btn-ghost btn-xs text-gray-600"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "▲ Sembunyikan" : "▼ Tampilkan"}
            </button>
          </div>

          {showHistory && (
            <>
              {historyList.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada laporan {activeTab} tersimpan.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {historyList.map((lap) => {
                    const labelHarian = formatTanggalPanjang(lap.tanggal);
                    const labelMingguan = lap.tanggalMulai
                      ? `Minggu ${lap.mingguKe} (${formatTanggalPendek(lap.tanggalMulai)} – ${formatTanggalPendek(lap.tanggalSelesai)})`
                      : "-";
                    const labelBulanan = lap.namaBulan
                      ? `${lap.namaBulan} ${lap.tahun}`
                      : "-";
                    const label =
                      activeTab === "harian"
                        ? labelHarian
                        : activeTab === "mingguan"
                        ? labelMingguan
                        : labelBulanan;

                    return (
                      <details
                        key={lap.key}
                        className="border border-gray-200 rounded p-2 bg-gray-50"
                      >
                        <summary className="text-sm font-semibold text-gray-800 cursor-pointer">
                          📅 {label}
                        </summary>
                        <div className="mt-2 bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {lap.konten || "(kosong)"}
                          </p>
                          {lap.updatedAt && (
                            <p className="text-[10px] text-gray-400 mt-2">
                              Disimpan:{" "}
                              {new Date(lap.updatedAt).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}