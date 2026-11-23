// components/Schedule.js
"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Play,
  CheckCircle2,
  Settings,
  X,
  Plus,
  Save,
  Trash2,
  Clock,
  Pencil,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MoveRight,
} from "lucide-react";
import {
  bersihkanLabel,
  formatJamJadwal,
  getJadwalHarian,
  namaHari,
  parseJamJadwal,
  urutkanJadwal,
} from "@/lib/jadwalHarian";

// FUNGSI SAKTI UNTUK DAPET TANGGAL LOKAL (BUKAN UTC)
const getLocalDateStr = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTanggal = (tanggal) => {
  if (!tanggal) return "";
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Schedule({
  jadwalUser = { kerja: [], minggu: [] },
  onUpdateJadwal,
  jadwalOverride = {},
  onUpdateJadwalOverride,
  progress = {},
  onUpdateProgress,
  selectedDate,
  setSelectedDate,
  userData,
}) {
  const [showKelolaJadwal, setShowKelolaJadwal] = useState(false);

  const [editKerja, setEditKerja] = useState([]);
  const [editMinggu, setEditMinggu] = useState([]);
  const [activeTab, setActiveTab] = useState("kerja");

  const [formBaru, setFormBaru] = useState({
    label: "",
    unit: "",
    jamMulai: "",
    jamSelesai: "",
  });
  const [editingItem, setEditingItem] = useState(null);

  const tanggalAktif = selectedDate || getLocalDateStr();

  // SATU SUMBER JADWAL: jadwal dasar + perubahan harian (kalau ada).
  const infoHari = getJadwalHarian(
    jadwalUser,
    jadwalOverride?.[tanggalAktif],
    tanggalAktif
  );
  const jadwalHariIni = infoHari.daftar || [];
  const ditampilkan = urutkanJadwal(jadwalHariIni);
  const progressHariIni = progress[tanggalAktif] || {};
  const jumlahDipindah = jadwalHariIni.filter((item) => item._dipindah).length;

  const sekarang = new Date();
  const isHariIni = tanggalAktif === getLocalDateStr(sekarang);
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
  const jamKeMenit = (jam) => {
    const cocok = String(jam || "").match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    return cocok ? Number(cocok[1]) * 60 + Number(cocok[2]) : null;
  };

  const geserTanggal = (selisih) => {
    const d = new Date(`${tanggalAktif}T00:00:00`);
    d.setDate(d.getDate() + selisih);
    setSelectedDate(getLocalDateStr(d));
  };

  const handleToggleSelesai = (actId) => {
    if (!onUpdateProgress) return;
    const current = progressHariIni[actId]?.selesai || false;
    onUpdateProgress(tanggalAktif, actId, { selesai: !current });
  };

  const handleKembalikan = async (act) => {
    if (!onUpdateJadwalOverride) return;
    await onUpdateJadwalOverride(tanggalAktif, act._kunci, null);
  };

  const handleSimpanJadwal = async () => {
    if (onUpdateJadwal) {
      await onUpdateJadwal({ kerja: editKerja, minggu: editMinggu });
    }
    setShowKelolaJadwal(false);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    if (activeTab === "kerja") {
      setEditKerja(
        editKerja.map((item) => (item.id === editingItem.id ? editingItem : item))
      );
    } else {
      setEditMinggu(
        editMinggu.map((item) => (item.id === editingItem.id ? editingItem : item))
      );
    }
    setEditingItem(null);
  };

  const handleHapusItem = (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    if (activeTab === "kerja") setEditKerja(editKerja.filter((item) => item.id !== id));
    else setEditMinggu(editMinggu.filter((item) => item.id !== id));
  };

  const handleTambahItem = () => {
    if (!formBaru.label.trim()) return;
    const newItem = {
      id: `jadwal_${Date.now()}`,
      label: formBaru.label,
      unit: formBaru.unit || "",
      jam:
        formBaru.jamMulai && formBaru.jamSelesai
          ? `${formBaru.jamMulai} - ${formBaru.jamSelesai}`
          : "",
    };
    if (activeTab === "kerja") setEditKerja([...editKerja, newItem]);
    else setEditMinggu([...editMinggu, newItem]);
    setFormBaru({ label: "", unit: "", jamMulai: "", jamSelesai: "" });
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const list = activeTab === "kerja" ? [...editKerja] : [...editMinggu];
    [list[index - 1], list[index]] = [list[index], list[index - 1]];
    if (activeTab === "kerja") setEditKerja(list);
    else setEditMinggu(list);
  };

  const handleMoveDown = (index) => {
    const list = activeTab === "kerja" ? [...editKerja] : [...editMinggu];
    if (index === list.length - 1) return;
    [list[index + 1], list[index]] = [list[index], list[index + 1]];
    if (activeTab === "kerja") setEditKerja(list);
    else setEditMinggu(list);
  };

  const bukaKelolaJadwal = () => {
    // Salin jadwal terbaru ke editor pas modalnya dibuka.
    setEditKerja(JSON.parse(JSON.stringify(jadwalUser?.kerja || [])));
    setEditMinggu(JSON.parse(JSON.stringify(jadwalUser?.minggu || [])));
    setEditingItem(null);
    setShowKelolaJadwal(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 py-4 md:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            onClick={() => geserTanggal(-1)}
            aria-label="Hari sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="min-w-[190px] text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-stone-800">
              <Calendar size={15} className="text-stone-500" />
              {formatTanggal(tanggalAktif)}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              {infoHari.labelHari}
              {jumlahDipindah > 0 ? ` · ${jumlahDipindah} dipindah` : ""}
            </p>
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            onClick={() => geserTanggal(1)}
            aria-label="Hari berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
            value={tanggalAktif}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            aria-label="Pilih tanggal"
          />
          <button
            type="button"
            className="h-9 rounded-xl border border-stone-200 px-3 text-xs font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-100 hover:text-stone-900"
            onClick={() => setSelectedDate(getLocalDateStr())}
          >
            Hari ini
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 sm:px-3"
            onClick={bukaKelolaJadwal}
            aria-label="Kelola jadwal"
            data-html2canvas-ignore="true"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Kelola</span>
          </button>
        </div>
      </div>

      {/* LIST JADWAL */}
      <div className="px-3 py-3 md:px-4">
        {ditampilkan.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 px-6 py-10 text-center">
            <p className="text-sm font-medium text-stone-600">
              Belum ada jadwal untuk hari ini.
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Tambahkan aktivitas lewat Kelola Jadwal.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
              onClick={bukaKelolaJadwal}
              data-html2canvas-ignore="true"
            >
              <Plus size={14} /> Kelola Jadwal
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {ditampilkan.map((act, index) => {
              // Item lama bisa nggak punya `id` (cuma _kunci), jadi pakai
              // kunci yang sama dengan tombol Mulai — dulu centangnya nggak muncul.
              const kunciProgress = act.id || act._kunci;
              const isSelesai = progressHariIni[kunciProgress]?.selesai || false;
              const labelBersih = bersihkanLabel(act.label);
              const { mulai, selesai } = parseJamJadwal(act);
              const a = jamKeMenit(mulai);
              const b = jamKeMenit(selesai);
              const sedangBerlangsung =
                isHariIni &&
                a !== null &&
                !isSelesai &&
                menitSekarang >= a &&
                menitSekarang <= (b !== null && b > a ? b : a + 60);

              return (
                <div
                  key={act._kunci || act.id || index}
                  className={`group flex gap-3 rounded-xl px-2 py-2.5 transition ${
                    sedangBerlangsung ? "bg-stone-100/70" : "hover:bg-stone-100"
                  }`}
                >
                  {/* JAM */}
                  <div className="w-12 shrink-0 pt-0.5 text-right">
                    <p className="text-[12px] font-semibold tabular-nums text-stone-700">
                      {mulai || "—"}
                    </p>
                    {selesai && (
                      <p className="text-[10px] tabular-nums text-stone-400">{selesai}</p>
                    )}
                  </div>

                  {/* TIMELINE */}
                  <div className="relative flex w-3 shrink-0 justify-center">
                    {index < ditampilkan.length - 1 && (
                      <span className="absolute inset-y-0 mt-3 w-px bg-stone-200" />
                    )}
                    <span
                      className={`relative mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ${
                        isSelesai
                          ? "bg-emerald-500 ring-emerald-100"
                          : sedangBerlangsung
                            ? "bg-stone-700 ring-stone-200"
                            : "bg-stone-300 ring-stone-200"
                      }`}
                    />
                  </div>

                  {/* ISI */}
                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 pb-1">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`truncate text-sm font-semibold ${
                            isSelesai
                              ? "text-stone-400 line-through"
                              : "text-stone-800"
                          }`}
                        >
                          {labelBersih || act.label || "Tanpa nama"}
                        </p>

                        {act._dipindah && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200/70">
                            <MoveRight size={11} /> dipindah
                          </span>
                        )}

                        {sedangBerlangsung && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                            sekarang
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-400">
                        {act.unit && <span>{act.unit}</span>}
                        {act._dipindah && (
                          <span className="inline-flex items-center gap-1 text-amber-600/80">
                            <Clock size={11} /> asal {act._jamAsli || "-"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      data-html2canvas-ignore="true"
                    >
                      {act._dipindah && onUpdateJadwalOverride && (
                        <button
                          type="button"
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-stone-500 transition hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => handleKembalikan(act)}
                          title="Kembalikan ke jam semula (jadwal asli nggak berubah)"
                        >
                          <RotateCcw size={13} /> Kembalikan
                        </button>
                      )}

                      <button
                        type="button"
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition ${
                          isSelesai
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "border border-stone-200 text-stone-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                        onClick={() => handleToggleSelesai(act.id || act._kunci)}
                      >
                        {isSelesai ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Play size={13} />
                        )}
                        {isSelesai ? "Selesai" : "Mulai"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {jumlahDipindah > 0 && (
        <div className="border-t border-stone-200 bg-amber-50/50 px-4 py-2.5 text-[11px] text-amber-700">
          Perubahan ini berlaku untuk <b>{namaHari(tanggalAktif)}</b>,{" "}
          {formatTanggal(tanggalAktif)} saja. Jadwal asli tetap aman dan dipakai lagi
          besok.
        </div>
      )}

      {/* MODAL KELOLA JADWAL */}
      {showKelolaJadwal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
          data-html2canvas-ignore="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <h3 className="text-base font-bold text-stone-800">Kelola Jadwal</h3>
                <p className="text-[11px] text-stone-400">
                  Perubahan di sini jadi jadwal tetap (semua hari).
                </p>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-stone-100"
                onClick={() => setShowKelolaJadwal(false)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="inline-flex rounded-xl bg-stone-200 p-1">
                {[
                  { id: "kerja", label: "Hari Kerja" },
                  { id: "minggu", label: "Hari Minggu" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setEditingItem(null);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {(activeTab === "kerja" ? editKerja : editMinggu).map(
                  (item, index, arr) => {
                    const { mulai, selesai } = parseJamJadwal(item);

                    if (editingItem && editingItem.id === item.id) {
                      const parseEdit = parseJamJadwal(editingItem);
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 p-3"
                        >
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              className="h-8 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                              value={parseEdit.mulai || ""}
                              onChange={(e) => {
                                const newJam = `${e.target.value} - ${
                                  parseEdit.selesai || "00:00"
                                }`;
                                setEditingItem({
                                  ...editingItem,
                                  jam: newJam,
                                  waktu: newJam,
                                  jamMulai: e.target.value,
                                });
                              }}
                              title="Jam Mulai"
                            />
                            <span className="text-stone-400">–</span>
                            <input
                              type="time"
                              className="h-8 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                              value={parseEdit.selesai || ""}
                              onChange={(e) => {
                                const newJam = `${
                                  parseEdit.mulai || "00:00"
                                } - ${e.target.value}`;
                                setEditingItem({
                                  ...editingItem,
                                  jam: newJam,
                                  waktu: newJam,
                                  jamSelesai: e.target.value,
                                });
                              }}
                              title="Jam Selesai"
                            />
                          </div>
                          <input
                            type="text"
                            className="h-8 min-w-[140px] flex-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-800"
                            value={editingItem.label}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, label: e.target.value })
                            }
                            placeholder="Nama Kegiatan"
                          />
                          <input
                            type="text"
                            className="h-8 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                            value={editingItem.unit || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, unit: e.target.value })
                            }
                            placeholder="Unit"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600"
                              onClick={handleSaveEdit}
                              aria-label="Simpan item"
                            >
                              <Save size={15} />
                            </button>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100"
                              onClick={() => setEditingItem(null)}
                              aria-label="Batal edit"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3 transition hover:border-stone-300"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              className={`grid h-5 w-5 place-items-center rounded text-stone-500 transition hover:bg-stone-100 ${
                                index === 0 ? "opacity-30" : ""
                              }`}
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              aria-label="Geser ke atas"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className={`grid h-5 w-5 place-items-center rounded text-stone-500 transition hover:bg-stone-100 ${
                                index === arr.length - 1 ? "opacity-30" : ""
                              }`}
                              onClick={() => handleMoveDown(index)}
                              disabled={index === arr.length - 1}
                              aria-label="Geser ke bawah"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-stone-800">
                              {bersihkanLabel(item.label)}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-stone-400">
                              {(mulai || selesai) && (
                                <span className="inline-flex items-center gap-1 tabular-nums">
                                  <Clock size={11} /> {formatJamJadwal(mulai, selesai)}
                                </span>
                              )}
                              {item.unit && <span>{item.unit}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100"
                            onClick={() =>
                              setEditingItem(JSON.parse(JSON.stringify(item)))
                            }
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                            onClick={() => handleHapusItem(item.id)}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}

                {(activeTab === "kerja" ? editKerja : editMinggu).length === 0 && (
                  <p className="rounded-xl border border-dashed border-stone-200 py-6 text-center text-xs italic text-stone-400">
                    Belum ada jadwal.
                  </p>
                )}
              </div>

              {/* FORM TAMBAH BARU */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Plus size={14} /> Tambah Item Baru
                </p>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="time"
                    className="h-9 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                    value={formBaru.jamMulai}
                    onChange={(e) =>
                      setFormBaru({ ...formBaru, jamMulai: e.target.value })
                    }
                    title="Jam Mulai"
                  />
                  <span className="self-center text-stone-400">–</span>
                  <input
                    type="time"
                    className="h-9 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                    value={formBaru.jamSelesai}
                    onChange={(e) =>
                      setFormBaru({ ...formBaru, jamSelesai: e.target.value })
                    }
                    title="Jam Selesai"
                  />
                  <input
                    type="text"
                    className="h-9 min-w-[150px] flex-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-800"
                    placeholder="Nama Kegiatan (misal: Olahraga)"
                    value={formBaru.label}
                    onChange={(e) => setFormBaru({ ...formBaru, label: e.target.value })}
                  />
                  <input
                    type="text"
                    className="h-9 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800"
                    placeholder="Unit"
                    value={formBaru.unit}
                    onChange={(e) => setFormBaru({ ...formBaru, unit: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleTambahItem}
                  disabled={!formBaru.label.trim()}
                >
                  Tambah ke Daftar
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                  onClick={handleSimpanJadwal}
                >
                  <Save size={16} /> Simpan Semua Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
