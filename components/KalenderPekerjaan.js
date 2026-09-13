// components/KalenderPekerjaan.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import { generateId } from "@/lib/pekerjaanData";

export default function KalenderPekerjaan({
  kegiatan = [],
  onAdd,
  onClickKegiatan,
  prioritasList = [],
  sumberList = [],
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterPrioritas, setFilterPrioritas] = useState("all");
  const [filterSumber, setFilterSumber] = useState("all");
  const [formData, setFormData] = useState({
    judul: "",
    prioritas: prioritasList[0]?.id || "utama",
    sumber: sumberList[0]?.id || "gua",
    catatan: "",
  });

  // ========== FILTER KEGIATAN ==========
  const filteredKegiatan = useMemo(() => {
    return kegiatan.filter((k) => {
      if (filterPrioritas !== "all" && k.prioritas !== filterPrioritas) return false;
      if (filterSumber !== "all" && k.sumber !== filterSumber) return false;
      return true;
    });
  }, [kegiatan, filterPrioritas, filterSumber]);

  // ========== HELPER: CARI LABEL ==========
  const getPrioritasLabel = (id) => {
    return prioritasList.find((p) => p.id === id)?.label || id;
  };
  const getPrioritasWarna = (id) => {
    return prioritasList.find((p) => p.id === id)?.warna || "gray";
  };
  const getSumberLabel = (id) => {
    return sumberList.find((s) => s.id === id)?.label || id;
  };
  const getSumberWarna = (id) => {
    return sumberList.find((s) => s.id === id)?.warna || "gray";
  };

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

  // ========== KLIK TANGGAL ==========
  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
    } else {
      setSelectedDate(date);
      setShowForm(true);
      setFormData({
        judul: "",
        prioritas: prioritasList[0]?.id || "utama",
        sumber: sumberList[0]?.id || "gua",
        catatan: "",
      });
    }
  };

  // ========== TAMBAH KEGIATAN ==========
  const handleAdd = () => {
    if (!formData.judul.trim() || !selectedDate) return;
    const newKegiatan = {
      id: generateId("keg"),
      judul: formData.judul,
      prioritas: formData.prioritas,
      sumber: formData.sumber,
      catatan: formData.catatan,
      tanggal: selectedDate,
      status: "belum",
      sections: {
        analisis: [],
        desain: [],
        vendor: [],
        lainnya: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(newKegiatan);
    setFormData({
      judul: "",
      prioritas: prioritasList[0]?.id || "utama",
      sumber: sumberList[0]?.id || "gua",
      catatan: "",
    });
    setShowForm(false);
  };

  // ========== HELPER: WARNA BADGE ==========
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
    };
    return map[warna] || map.gray;
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);

  const todayStr = new Date().toISOString().split("T")[0];

  // Kegiatan di tanggal yang dipilih (setelah filter)
  const selectedKegiatan = selectedDate
    ? filteredKegiatan.filter((k) => k.tanggal === selectedDate)
    : [];

  // Kegiatan per tanggal (buat dot di kalender)
  const kegiatanPerTanggal = useMemo(() => {
    const map = {};
    filteredKegiatan.forEach((k) => {
      if (!map[k.tanggal]) map[k.tanggal] = 0;
      map[k.tanggal] += 1;
    });
    return map;
  }, [filteredKegiatan]);

  return (
    <div className="space-y-4">
      {/* FILTER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">Filter:</span>
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
            {(filterPrioritas !== "all" || filterSumber !== "all") && (
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setFilterPrioritas("all");
                  setFilterSumber("all");
                }}
              >
                ✕ Reset
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">
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
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>📅 Hari Ini</button>
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
              const hasKegiatan = kegiatanPerTanggal[item.date] > 0;
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
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {hasKegiatan && (
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
              <span>Ada Kegiatan</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL TANGGAL + KEGIATAN */}
      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              📌{" "}
              {new Date(selectedDate).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>

            {/* Form Tambah */}
            {showForm && (
              <div className="bg-blue-50 rounded p-3 mb-3 space-y-2 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700">
                  ✏️ Tambah kegiatan baru
                </p>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Judul kegiatan (misal: Handgrips)"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  autoFocus
                />
                <div className="flex gap-2">
                  <select
                    className="select select-bordered select-sm flex-1 text-gray-800 bg-white"
                    value={formData.prioritas}
                    onChange={(e) =>
                      setFormData({ ...formData, prioritas: e.target.value })
                    }
                  >
                    {prioritasList.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered select-sm flex-1 text-gray-800 bg-white"
                    value={formData.sumber}
                    onChange={(e) =>
                      setFormData({ ...formData, sumber: e.target.value })
                    }
                  >
                    {sumberList.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="2"
                  placeholder="Catatan (opsional)"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleAdd}
                  >
                    ➕ Tambah
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Daftar Kegiatan */}
            {selectedKegiatan.length === 0 && !showForm ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">Belum ada kegiatan di tanggal ini.</p>
                <button
                  className="btn btn-outline btn-sm mt-3 text-gray-700"
                  onClick={() => {
                    setShowForm(true);
                    setFormData({
                      judul: "",
                      prioritas: prioritasList[0]?.id || "utama",
                      sumber: sumberList[0]?.id || "gua",
                      catatan: "",
                    });
                  }}
                >
                  + Tambah Kegiatan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedKegiatan.map((keg) => (
                  <div
                    key={keg.id}
                    className="flex items-start gap-3 p-3 rounded border bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => onClickKegiatan(keg.id)}
                  >
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold text-gray-800 ${
                          keg.status === "selesai" ? "line-through opacity-60" : ""
                        }`}
                      >
                        {keg.judul}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(
                            getPrioritasWarna(keg.prioritas)
                          )}`}
                        >
                          {getPrioritasLabel(keg.prioritas)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(
                            getSumberWarna(keg.sumber)
                          )}`}
                        >
                          {getSumberLabel(keg.sumber)}
                        </span>
                        {keg.status === "selesai" && (
                          <span className="text-xs px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-300">
                            ✅ Selesai
                          </span>
                        )}
                      </div>
                      {keg.catatan && (
                        <p className="text-xs text-gray-500 mt-1">{keg.catatan}</p>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                ))}

                {!showForm && (
                  <button
                    className="btn btn-outline btn-sm w-full text-gray-700"
                    onClick={() => {
                      setShowForm(true);
                      setFormData({
                        judul: "",
                        prioritas: prioritasList[0]?.id || "utama",
                        sumber: sumberList[0]?.id || "gua",
                        catatan: "",
                      });
                    }}
                  >
                    + Tambah Kegiatan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm">
              Klik salah satu tanggal di kalender untuk melihat / tambah kegiatan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}