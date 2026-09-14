// components/KalenderPekerjaan.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import {
  generateId,
  DEFAULT_KATEGORI_KEGIATAN,
  WARNA_OPTIONS,
  getKategoriStyle,
} from "@/lib/pekerjaanData";

// ========== WARNA OPTIONS UNTUK PICKER ==========
// Ini cuma preview palet buat dipilih. Logic warna diambil dari getKategoriStyle().

export default function KalenderPekerjaan({
  kegiatan = [],
  onAdd,
  onClickKegiatan,
  prioritasList = [],
  sumberList = [],
  kategoriList = DEFAULT_KATEGORI_KEGIATAN,
  onUpdateKategoriList,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectStart, setSelectStart] = useState(null);
  const [selectEnd, setSelectEnd] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filter
  const [filterPrioritas, setFilterPrioritas] = useState("all");
  const [filterSumber, setFilterSumber] = useState("all");
  const [filterKategori, setFilterKategori] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    judul: "",
    kategori: kategoriList[0]?.id || "design",
    prioritas: prioritasList[0]?.id || "utama",
    sumber: sumberList[0]?.id || "gua",
    catatan: "",
  });

  // ========== KELOLA KATEGORI STATE ==========
  const [showKelolaKategori, setShowKelolaKategori] = useState(false);
  const [editingKategoriId, setEditingKategoriId] = useState(null);
  const [kategoriForm, setKategoriForm] = useState({
    label: "",
    emoji: "📌",
    warna: "gray",
    customHex: "",
  });

  // ========== FILTER KEGIATAN ==========
  const filteredKegiatan = useMemo(() => {
    return kegiatan.filter((k) => {
      if (filterPrioritas !== "all" && k.prioritas !== filterPrioritas) return false;
      if (filterSumber !== "all" && k.sumber !== filterSumber) return false;
      if (filterKategori !== "all" && k.kategori !== filterKategori) return false;
      return true;
    });
  }, [kegiatan, filterPrioritas, filterSumber, filterKategori]);

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
  };
  const handleMonthChange = (e) =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) =>
    setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  // ========== HELPER: KEGIATAN DI TANGGAL ==========
  const getKegiatanDiTanggal = (date) => {
    return filteredKegiatan.filter((k) => {
      const mulai = k.tanggalMulai || k.tanggal;
      const selesai = k.tanggalSelesai || k.tanggal || k.tanggalMulai;
      if (!mulai || !selesai) return false;
      return date >= mulai && date <= selesai;
    });
  };

  // ========== CEK SELECT RANGE ==========
  const isInSelectRange = (date) => {
    if (!selectStart) return false;
    if (!selectEnd) return date === selectStart;
    const start = selectStart < selectEnd ? selectStart : selectEnd;
    const end = selectStart < selectEnd ? selectEnd : selectStart;
    return date >= start && date <= end;
  };

  // ========== KLIK TANGGAL ==========
  const handleDateClick = (date) => {
    if (!selectStart) {
      setSelectStart(date);
      setSelectEnd(null);
      setShowForm(false);
      return;
    }
    if (!selectEnd && date === selectStart) {
      setSelectEnd(date);
      setShowForm(true);
      return;
    }
    if (!selectEnd) {
      setSelectEnd(date);
      setShowForm(true);
      return;
    }
    setSelectStart(date);
    setSelectEnd(null);
    setShowForm(false);
  };

  // ========== TAMBAH KEGIATAN ==========
  const handleAdd = () => {
    if (!formData.judul.trim() || !selectStart) return;

    const tanggalMulai = selectStart < (selectEnd || selectStart) ? selectStart : (selectEnd || selectStart);
    const tanggalSelesai = selectStart < (selectEnd || selectStart) ? (selectEnd || selectStart) : selectStart;

    const newKegiatan = {
      id: generateId("keg"),
      judul: formData.judul,
      kategori: formData.kategori,
      prioritas: formData.prioritas,
      sumber: formData.sumber,
      catatan: formData.catatan,
      tanggalMulai,
      tanggalSelesai,
      tanggal: tanggalMulai,
      status: "belum",
      sections: { analisis: [], desain: [], vendor: [], lainnya: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(newKegiatan);
    setFormData({
      judul: "",
      kategori: kategoriList[0]?.id || "design",
      prioritas: prioritasList[0]?.id || "utama",
      sumber: sumberList[0]?.id || "gua",
      catatan: "",
    });
    setSelectStart(null);
    setSelectEnd(null);
    setShowForm(false);
  };

  const handleBatalSelect = () => {
    setSelectStart(null);
    setSelectEnd(null);
    setShowForm(false);
  };

  // ========== FORMAT TANGGAL RANGE ==========
  const formatTanggalRange = (mulai, selesai) => {
    if (!selesai || mulai === selesai) {
      return new Date(mulai).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    const d1 = new Date(mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const d2 = new Date(selesai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    return `${d1} – ${d2}`;
  };

  // ========== HELPER: LABEL ==========
  const getKategoriData = (kategoriId) =>
    kategoriList.find((k) => k.id === kategoriId) || kategoriList[0];

  const getPrioritasData = (prioritasId) =>
    prioritasList.find((p) => p.id === prioritasId);

  const getSumberData = (sumberId) => sumberList.find((s) => s.id === sumberId);

  const getBadgeClass = (warna) => {
    const map = {
      red: "bg-red-100 text-red-700 border-red-300",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      green: "bg-green-100 text-green-700 border-green-300",
      brown: "bg-amber-100 text-amber-700 border-amber-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
      teal: "bg-teal-100 text-teal-700 border-teal-300",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
    };
    return map[warna] || map.gray;
  };

  // ========== KELOLA KATEGORI HANDLERS ==========
  const handleBukaTambahKategori = () => {
    setKategoriForm({
      label: "",
      emoji: "📌",
      warna: "gray",
      customHex: "",
    });
    setEditingKategoriId(null);
  };

  const handleBukaEditKategori = (kat) => {
    // Extract emoji dan text dari label
    const parts = kat.label.trim().split(" ");
    const emoji = parts[0] || "📌";
    const nama = parts.slice(1).join(" ") || "";
    setKategoriForm({
      label: nama,
      emoji,
      warna: kat.warna || "gray",
      customHex: kat.customHex || "",
    });
    setEditingKategoriId(kat.id);
  };

  const handleSimpanKategori = () => {
    if (!kategoriForm.label.trim()) return;

    const fullLabel = `${kategoriForm.emoji} ${kategoriForm.label}`.trim();
    const newKategori = {
      id: editingKategoriId || generateId("kat_keg"),
      label: fullLabel,
      warna: kategoriForm.customHex ? "" : kategoriForm.warna,
      customHex: kategoriForm.customHex || "",
    };

    let updated;
    if (editingKategoriId) {
      updated = kategoriList.map((k) => (k.id === editingKategoriId ? newKategori : k));
    } else {
      updated = [...kategoriList, newKategori];
    }

    onUpdateKategoriList(updated);
    handleBukaTambahKategori();
  };

  const handleHapusKategori = (id) => {
    if (!confirm("Hapus kategori ini? Kegiatan yang pakai kategori ini nggak kehapus, tapi kategorinya ilang.")) return;
    const updated = kategoriList.filter((k) => k.id !== id);
    onUpdateKategoriList(updated);
  };

  // ========== KONSTANTA ==========
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* FILTER + KELOLA KATEGORI */}
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
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-xs text-gray-800 bg-white"
              value={filterPrioritas}
              onChange={(e) => setFilterPrioritas(e.target.value)}
            >
              <option value="all">Semua Prioritas</option>
              {prioritasList.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-xs text-gray-800 bg-white"
              value={filterSumber}
              onChange={(e) => setFilterSumber(e.target.value)}
            >
              <option value="all">Semua Sumber</option>
              {sumberList.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            {(filterPrioritas !== "all" || filterSumber !== "all" || filterKategori !== "all") && (
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setFilterPrioritas("all");
                  setFilterSumber("all");
                  setFilterKategori("all");
                }}
              >
                ✕ Reset
              </button>
            )}
            <button
              className="btn btn-ghost btn-xs text-gray-600 ml-auto"
              onClick={() => setShowKelolaKategori(true)}
              title="Kelola Kategori"
            >
              ⚙️ Kelola Kategori
            </button>
            <span className="text-xs text-gray-400">
              {filteredKegiatan.length} kegiatan
            </span>
          </div>
        </div>
      </div>

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
              <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;

              const kegiatanHariIni = getKegiatanDiTanggal(item.date);
              const isSelected = isInSelectRange(item.date);
              const isToday = item.date === todayStr;
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
                boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-1 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`rounded border ${boxClass} relative transition text-left p-1 min-h-[100px] flex flex-col`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="text-xs font-semibold mb-1">{item.day}</span>

                  <div className="space-y-0.5 flex-1 overflow-hidden">
                    {kegiatanHariIni.slice(0, 3).map((k) => {
                      const mulai = k.tanggalMulai || k.tanggal;
                      const selesai = k.tanggalSelesai || k.tanggal || k.tanggalMulai;
                      const isStart = item.date === mulai;
                      const isEnd = item.date === selesai;
                      const kategoriData = getKategoriData(k.kategori);
                      const style = getKategoriStyle(kategoriData);

                      // Gabungin class + inline style
                      const barClass = style.isCustom
                        ? `text-[10px] px-1 py-0.5 truncate text-white ${isStart && isEnd ? "rounded" : isStart ? "rounded-l" : isEnd ? "rounded-r" : ""}`
                        : `${style.bg} ${style.text} text-[10px] px-1 py-0.5 truncate ${isStart && isEnd ? "rounded" : isStart ? "rounded-l" : isEnd ? "rounded-r" : ""}`;

                      return (
                        <div
                          key={k.id}
                          className={barClass}
                          style={style.isCustom ? style.inlineStyle : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickKegiatan(k.id);
                          }}
                          title={k.judul}
                        >
                          {isStart ? k.judul : "\u00A0"}
                        </div>
                      );
                    })}
                    {kegiatanHariIni.length > 3 && (
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        +{kegiatanHariIni.length - 3} lagi
                      </p>
                    )}
                  </div>
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
            {kategoriList.map((k) => {
              const style = getKategoriStyle(k);
              return (
                <div key={k.id} className="flex items-center gap-1">
                  <span
                    className={`w-4 h-4 rounded ${style.isCustom ? "" : style.bg}`}
                    style={style.isCustom ? style.inlineStyle : {}}
                  />
                  <span>{k.label}</span>
                </div>
              );
            })}
          </div>

          {/* Hint select */}
          {selectStart && !selectEnd && (
            <div className="mt-3 alert alert-info py-2 text-xs">
              <span>
                📌 Tanggal mulai: <strong>{selectStart}</strong>. Klik tanggal akhir, atau klik tanggal yang sama buat 1 hari.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FORM INPUT KEGIATAN */}
      {showForm && selectStart && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800">✏️ Tambah Kegiatan</h3>
              <button className="btn btn-ghost btn-xs text-gray-500" onClick={handleBatalSelect}>✕</button>
            </div>

            <div className="bg-blue-50 rounded p-2 mb-3 border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold">
                📅 {formatTanggalRange(selectStart, selectEnd || selectStart)}
              </p>
            </div>

            <div className="space-y-3">
              {/* Judul */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Judul Kegiatan</label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Misal: Handgrips"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                >
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Mau tambah kategori baru? Klik ⚙️ Kelola Kategori di atas kalender.
                </p>
              </div>

              {/* Prioritas & Sumber */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Prioritas</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.prioritas}
                    onChange={(e) => setFormData({ ...formData, prioritas: e.target.value })}
                  >
                    {prioritasList.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sumber</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.sumber}
                    onChange={(e) => setFormData({ ...formData, sumber: e.target.value })}
                  >
                    {sumberList.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan</label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="2"
                  placeholder="Catatan (opsional)"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleAdd}>➕ Tambah</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBatalSelect}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIST KEGIATAN */}
      {filteredKegiatan.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              📋 Semua Kegiatan ({filteredKegiatan.length})
            </h3>
            <div className="space-y-2">
              {filteredKegiatan
                .slice()
                .sort((a, b) => {
                  const aTgl = a.tanggalMulai || a.tanggal || "";
                  const bTgl = b.tanggalMulai || b.tanggal || "";
                  return aTgl.localeCompare(bTgl);
                })
                .map((keg) => {
                  const kategoriData = getKategoriData(keg.kategori);
                  const style = getKategoriStyle(kategoriData);
                  const mulai = keg.tanggalMulai || keg.tanggal;
                  const selesai = keg.tanggalSelesai || keg.tanggal || keg.tanggalMulai;

                  return (
                    <div
                      key={keg.id}
                      className="flex items-start gap-3 p-3 rounded border bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => onClickKegiatan(keg.id)}
                    >
                      <div
                        className={`w-1 self-stretch rounded ${style.isCustom ? "" : style.bg}`}
                        style={style.isCustom ? style.inlineStyle : {}}
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold text-gray-800 ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>
                          {keg.judul}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          📅 {formatTanggalRange(mulai, selesai)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(kategoriData?.warna || "gray")}`}>
                            {kategoriData?.label || keg.kategori}
                          </span>
                          {getPrioritasData(keg.prioritas) && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(getPrioritasData(keg.prioritas)?.warna)}`}>
                              {getPrioritasData(keg.prioritas)?.label}
                            </span>
                          )}
                          {getSumberData(keg.sumber) && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(getSumberData(keg.sumber)?.warna)}`}>
                              {getSumberData(keg.sumber)?.label}
                            </span>
                          )}
                          {keg.status === "selesai" && (
                            <span className="text-xs px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-300">
                              ✅ Selesai
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">→</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA KATEGORI */}
      {showKelolaKategori && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">⚙️ Kelola Kategori Kegiatan</h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaKategori(false)}
                >
                  ✕
                </button>
              </div>

              {/* List Kategori */}
              <div className="space-y-1 mb-4">
                {kategoriList.map((k) => {
                  const style = getKategoriStyle(k);
                  return (
                    <div
                      key={k.id}
                      className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded ${style.isCustom ? "" : style.bg}`}
                          style={style.isCustom ? style.inlineStyle : {}}
                        />
                        <span className="text-sm text-gray-700">{k.label}</span>
                        {k.customHex && (
                          <span className="text-[10px] text-gray-400">({k.customHex})</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs text-gray-600"
                          onClick={() => handleBukaEditKategori(k)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleHapusKategori(k.id)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Tambah/Edit */}
              <div className="bg-purple-50 rounded p-3 border border-purple-200 space-y-2">
                <p className="text-xs font-semibold text-purple-700">
                  {editingKategoriId ? "✏️ Edit Kategori" : "➕ Tambah Kategori Baru"}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-16 text-center text-gray-800 bg-white"
                    placeholder="📌"
                    value={kategoriForm.emoji}
                    onChange={(e) => setKategoriForm({ ...kategoriForm, emoji: e.target.value })}
                    title="Emoji"
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                    placeholder="Nama kategori (misal: Industrial Manufaktur)"
                    value={kategoriForm.label}
                    onChange={(e) => setKategoriForm({ ...kategoriForm, label: e.target.value })}
                  />
                </div>

                {/* Pilih Warna: 10 Palet */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Warna (pilih dari palet):</p>
                  <div className="flex flex-wrap gap-1">
                    {WARNA_OPTIONS.map((w) => (
                      <button
                        key={w.id}
                        className={`w-7 h-7 rounded ${w.bg} border-2 ${
                          kategoriForm.warna === w.id && !kategoriForm.customHex
                            ? "border-gray-800 ring-2 ring-gray-400"
                            : "border-white"
                        }`}
                        onClick={() =>
                          setKategoriForm({ ...kategoriForm, warna: w.id, customHex: "" })
                        }
                        title={w.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Hex */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    Atau custom warna sendiri (hex):
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-32 text-gray-800 bg-white"
                      placeholder="#FF5733"
                      value={kategoriForm.customHex}
                      onChange={(e) =>
                        setKategoriForm({ ...kategoriForm, customHex: e.target.value })
                      }
                    />
                    {kategoriForm.customHex && (
                      <span
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: kategoriForm.customHex }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanKategori}
                    disabled={!kategoriForm.label.trim()}
                  >
                    {editingKategoriId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  {editingKategoriId && (
                    <button
                      className="btn btn-ghost btn-sm text-gray-700"
                      onClick={handleBukaTambahKategori}
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}