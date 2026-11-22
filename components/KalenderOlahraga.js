// components/KalenderOlahraga.js
"use client";

import { useMemo, useState } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import {
  DEFAULT_JENIS_OLAHRAGA,
  SATUAN_OLAHRAGA,
  adaKegiatan,
  bacaEntri,
  bacaPace,
  formatTanggal,
  normalisasiJenis,
  tanggalLokal,
  tulisEntri,
} from "@/lib/olahragaData";
import {
  Activity, Calendar, Pencil, Save, Trash2, MessageSquare, Dumbbell,
  Timer, Footprints, Bike, Waves, Plus, X, Settings,
} from "lucide-react";

const IKON_JENIS = {
  footprints: Footprints,
  dumbbell: Dumbbell,
  activity: Activity,
  timer: Timer,
  bike: Bike,
  waves: Waves,
};
const ikonUntuk = (jenis) => IKON_JENIS[jenis?.ikon] || Dumbbell;

const idBaru = (label) =>
  `jenis_${String(label || "olahraga").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20)}_${Date.now().toString(36).slice(-4)}`;

export default function KalenderOlahraga({
  harian = {},
  jenisOlahraga = DEFAULT_JENIS_OLAHRAGA,
  onUpdateHarian,
  onUpdateJenis,
}) {
  const jenisList = useMemo(() => normalisasiJenis(jenisOlahraga), [jenisOlahraga]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ nilai: {}, pace: {}, catatan: "" });
  const [showJenis, setShowJenis] = useState(false);
  const [jenisBaru, setJenisBaru] = useState({ label: "", satuan: "reps" });

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        day: d,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(tanggalLokal(now));
  };

  const muatDraft = (data) => {
    const nilai = {};
    const pace = {};
    for (const jenis of jenisList) {
      const angka = bacaEntri(data || {}, jenis);
      nilai[jenis.id] = angka > 0 ? String(angka) : "";
      if (jenis.field2) {
        const p = bacaPace(data || {}, jenis);
        pace[jenis.id] = p > 0 ? String(p) : "";
      }
    }
    return { nilai, pace, catatan: data?.catatan || "" };
  };

  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
      return;
    }
    setSelectedDate(date);
    setShowForm(true);
    setDraft(muatDraft(harian[date]));
  };

  const handleSimpan = () => {
    if (!selectedDate) return;
    let baru = { ...(harian[selectedDate] || {}) };
    for (const jenis of jenisList) {
      baru = tulisEntri(baru, jenis, draft.nilai[jenis.id], draft.pace[jenis.id]);
    }
    baru.catatan = draft.catatan || "";
    baru.updatedAt = new Date().toISOString();
    const updated = { ...harian };
    if (!adaKegiatan(baru, jenisList)) delete updated[selectedDate];
    else updated[selectedDate] = baru;
    onUpdateHarian(updated);
    setShowForm(false);
  };

  const handleHapus = () => {
    if (!selectedDate) return;
    if (!confirm("Hapus data olahraga di tanggal ini?")) return;
    const updated = { ...harian };
    delete updated[selectedDate];
    onUpdateHarian(updated);
    setShowForm(false);
    setSelectedDate(null);
  };

  const ubahJenis = (id, patch) => {
    if (typeof onUpdateJenis !== "function") return;
    onUpdateJenis(jenisList.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const tambahJenis = () => {
    if (!jenisBaru.label.trim() || typeof onUpdateJenis !== "function") return;
    onUpdateJenis([
      ...jenisList,
      { id: idBaru(jenisBaru.label), label: jenisBaru.label.trim(), satuan: jenisBaru.satuan, ikon: "dumbbell" },
    ]);
    setJenisBaru({ label: "", satuan: "reps" });
  };

  const hapusJenis = (jenis) => {
    if (jenisList.length <= 1) {
      alert("Minimal satu jenis olahraga. Tambah jenis lain dulu sebelum menghapus.");
      return;
    }
    const dipakai = Object.values(harian).filter((d) => bacaEntri(d || {}, jenis) > 0).length;
    const pesan = dipakai > 0
      ? `Hapus "${jenis.label}" dari daftar? Catatan ${dipakai} hari yang sudah ada tetap tersimpan, tapi tidak tampil lagi di form.`
      : `Hapus "${jenis.label}" dari daftar?`;
    if (!confirm(pesan)) return;
    if (typeof onUpdateJenis === "function") onUpdateJenis(jenisList.filter((j) => j.id !== jenis.id));
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = tanggalLokal();

  const selectedData = selectedDate ? harian[selectedDate] : null;
  const jumlahJenisHari = (data) => jenisList.filter((j) => bacaEntri(data || {}, j) > 0).length;

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear} aria-label="Tahun sebelumnya">«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth} aria-label="Bulan sebelumnya">‹</button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                aria-label="Pilih bulan"
              >
                {monthNames.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
              </select>
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getFullYear()}
                onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                aria-label="Pilih tahun"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth} aria-label="Bulan berikutnya">›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear} aria-label="Tahun berikutnya">»</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>
              <Calendar size={14} className="mr-1" /> Hari Ini
            </button>
            <button
              className="btn btn-ghost btn-xs text-stone-600"
              onClick={() => setShowJenis((v) => !v)}
              aria-expanded={showJenis}
            >
              <Settings size={14} className="mr-1" /> Atur jenis olahraga
            </button>
          </div>

          {showJenis && (
            <div className="rounded border border-stone-200 bg-stone-50 p-3 space-y-2 mb-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Settings size={14} /> Jenis olahraga kamu
                </p>
                <button className="btn btn-ghost btn-xs text-stone-500" onClick={() => setShowJenis(false)} aria-label="Tutup pengaturan jenis olahraga">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Edit nama atau satuannya langsung di bawah. Yang dihapus tidak menghapus catatan lama.
              </p>

              <div className="space-y-1.5">
                {jenisList.map((jenis) => {
                  const Ikon = ikonUntuk(jenis);
                  return (
                    <div key={jenis.id} className="flex flex-wrap items-center gap-1.5">
                      <Ikon size={14} className="text-stone-500 shrink-0" />
                      <input
                        className="input input-bordered input-xs flex-1 min-w-[120px] text-stone-800 bg-white"
                        value={jenis.label}
                        onChange={(e) => ubahJenis(jenis.id, { label: e.target.value })}
                        aria-label={`Nama jenis ${jenis.label}`}
                      />
                      <select
                        className="select select-bordered select-xs w-32 text-stone-800 bg-white"
                        value={jenis.satuan}
                        onChange={(e) => ubahJenis(jenis.id, { satuan: e.target.value })}
                        aria-label={`Satuan ${jenis.label}`}
                      >
                        {SATUAN_OLAHRAGA.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <button
                        className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
                        onClick={() => hapusJenis(jenis)}
                        title={`Hapus ${jenis.label}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-end gap-1.5 pt-1 border-t border-stone-200">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] text-stone-500 block mb-0.5">Jenis baru</label>
                  <input
                    className="input input-bordered input-xs w-full text-stone-800 bg-white"
                    placeholder="mis. Bersepeda, Renang, Squat"
                    value={jenisBaru.label}
                    onChange={(e) => setJenisBaru({ ...jenisBaru, label: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") tambahJenis(); }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Satuan</label>
                  <select
                    className="select select-bordered select-xs w-32 text-stone-800 bg-white"
                    value={jenisBaru.satuan}
                    onChange={(e) => setJenisBaru({ ...jenisBaru, satuan: e.target.value })}
                    aria-label="Satuan jenis baru"
                  >
                    {SATUAN_OLAHRAGA.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-xs" onClick={tambahJenis} disabled={!jenisBaru.label.trim()}>
                  <Plus size={13} className="mr-1" /> Tambah
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const ada = adaKegiatan(harian[item.date], jenisList);
              const jumlah = jumlahJenisHari(harian[item.date]);
              const holiday = HOLIDAYS[item.date];

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !holiday) boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              if (holiday && !isSelected) boxClass = "bg-error text-white border-error font-bold";
              if (isSelected) boxClass = "bg-stone-200 text-stone-900 border-2 border-stone-800 font-bold ring-2 ring-stone-300";

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {ada && (
                    <span className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-0.5">
                      {Array.from({ length: Math.min(3, jumlah) }).map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-error border border-error" /><span>Libur Nasional</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" /><span>Hari Ini</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-stone-200 border-2 border-stone-800" /><span>Tanggal Dipilih</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /><span>Ada Olahraga</span></div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={16} /> {formatTanggal(selectedDate)}
              </h3>
              {selectedData && (
                <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={handleHapus} title="Hapus data hari ini">
                  <Trash2 size={14} className="mr-1" /> Hapus
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-stone-50 rounded p-3 space-y-3 border border-stone-200">
                <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Pencil size={14} /> Input Olahraga
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {jenisList.map((jenis) => {
                    const Ikon = ikonUntuk(jenis);
                    return (
                      <div key={jenis.id}>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">
                          <span className="flex items-center gap-1"><Ikon size={13} /> {jenis.label}</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="input input-bordered input-sm flex-1 min-w-0 text-gray-800 bg-white"
                            placeholder={jenis.satuan}
                            value={draft.nilai[jenis.id] || ""}
                            onChange={(e) => setDraft({ ...draft, nilai: { ...draft.nilai, [jenis.id]: e.target.value } })}
                            aria-label={`${jenis.label} (${jenis.satuan})`}
                          />
                          {jenis.field2 && (
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              className="input input-bordered input-sm flex-1 min-w-0 text-gray-800 bg-white"
                              placeholder={jenis.field2.label}
                              value={draft.pace[jenis.id] || ""}
                              onChange={(e) => setDraft({ ...draft, pace: { ...draft.pace, [jenis.id]: e.target.value } })}
                              aria-label={`${jenis.label} ${jenis.field2.label}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <MessageSquare size={14} /> Catatan Harian
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="2"
                    placeholder="Catatan olahraga hari ini..."
                    value={draft.catatan}
                    onChange={(e) => setDraft({ ...draft, catatan: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
                    <Save size={16} className="mr-1" /> Simpan
                  </button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
                </div>
              </div>
            )}

            {!showForm && selectedData && (
              <div className="space-y-2">
                {jenisList.map((jenis) => {
                  const nilai = bacaEntri(selectedData, jenis);
                  if (nilai <= 0) return null;
                  const Ikon = ikonUntuk(jenis);
                  const pace = bacaPace(selectedData, jenis);
                  return (
                    <div key={jenis.id} className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-600 w-32 flex items-center gap-1">
                        <Ikon size={14} /> {jenis.label}:
                      </span>
                      <span className="text-gray-800">
                        {nilai} {jenis.satuan}
                        {jenis.field2 && pace > 0 ? ` • ${jenis.field2.label} ${pace}` : ""}
                      </span>
                    </div>
                  );
                })}
                {selectedData.catatan && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                      <MessageSquare size={14} /> Catatan:
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                      {selectedData.catatan}
                    </p>
                  </div>
                )}
                <button
                  className="btn btn-ghost btn-xs text-gray-600 mt-2"
                  onClick={() => { setShowForm(true); setDraft(muatDraft(selectedData)); }}
                >
                  <Pencil size={14} className="mr-1" /> Edit
                </button>
              </div>
            )}

            {!showForm && !selectedData && (
              <div className="text-center py-6 text-gray-400">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada olahraga di tanggal ini.</p>
                <button
                  className="btn btn-outline btn-sm mt-3 text-gray-700"
                  onClick={() => { setDraft(muatDraft(null)); setShowForm(true); }}
                >
                  <Plus size={16} className="mr-1" /> Input Olahraga
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Klik salah satu tanggal di kalender untuk input olahraga.</p>
            <p className="text-xs mt-1">Jenis olahraga bisa ditambah atau diedit lewat &quot;Atur jenis olahraga&quot;.</p>
          </div>
        </div>
      )}
    </div>
  );
}
