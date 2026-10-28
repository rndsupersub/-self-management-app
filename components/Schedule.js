// components/Schedule.js
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Play, CheckCircle2, Settings, X, Plus, Save, Trash2 } from "lucide-react";

export default function Schedule({
  jadwalUser = { kerja: [], minggu: [] },
  onUpdateJadwal,
  progress = {},
  onUpdateProgress,
  selectedDate,
  setSelectedDate,
  userData,
}) {
  const [showKelolaJadwal, setShowKelolaJadwal] = useState(false);
  
  // State buat Edit Jadwal
  const [editKerja, setEditKerja] = useState([]);
  const [editMinggu, setEditMinggu] = useState([]);
  const [activeTab, setActiveTab] = useState("kerja");
  const [formBaru, setFormBaru] = useState({ label: "", unit: "" });

  // Load data ke state edit pas modal kebuka
  useEffect(() => {
    if (showKelolaJadwal) {
      setEditKerja([...(jadwalUser?.kerja || [])]);
      setEditMinggu([...(jadwalUser?.minggu || [])]);
    }
  }, [showKelolaJadwal, jadwalUser]);

  const getHariIni = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 ? "minggu" : "kerja";
  };

  const hariIni = selectedDate ? getHariIni(selectedDate) : "kerja";
  const jadwalHariIni = jadwalUser?.[hariIni] || [];
  const progressHariIni = progress[selectedDate] || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleToggleSelesai = (actId) => {
    if (!onUpdateProgress) return;
    const current = progressHariIni[actId]?.selesai || false;
    onUpdateProgress(selectedDate, actId, { selesai: !current });
  };

  // Fungsi Simpan Kelola Jadwal
  const handleSimpanJadwal = async () => {
    if (onUpdateJadwal) {
      await onUpdateJadwal({ kerja: editKerja, minggu: editMinggu });
    }
    setShowKelolaJadwal(false);
  };

  const handleTambahItem = () => {
    if (!formBaru.label.trim()) return;
    const newItem = {
      id: `jadwal_${Date.now()}`,
      label: formBaru.label,
      unit: formBaru.unit || ""
    };
    if (activeTab === "kerja") setEditKerja([...editKerja, newItem]);
    else setEditMinggu([...editMinggu, newItem]);
    setFormBaru({ label: "", unit: "" });
  };

  const handleHapusItem = (id) => {
    if (activeTab === "kerja") setEditKerja(editKerja.filter((item) => item.id !== id));
    else setEditMinggu(editMinggu.filter((item) => item.id !== id));
  };

  // REGEX SAKTI PENGHAPUS EMOJI (Nangkep emoji di manapun)
  const cleanLabel = (text) => {
    if (!text) return "";
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  return (
    <div className="card bg-white shadow border border-gray-200">
      <div className="card-body p-4">
        
        {/* HEADER NAVIGASI TANGGAL */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={handlePrevDay}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center flex items-center justify-center gap-2">
              <Calendar size={16} /> {formatDate(selectedDate)}
            </h3>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleNextDay}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input input-bordered input-sm text-gray-800 bg-white"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button className="btn btn-outline btn-xs text-gray-700" onClick={handleToday}>
              Hari Ini
            </button>
          </div>
        </div>

        {/* BADGE HARI & TOMBOL KELOLA */}
        <div className="mb-3 flex justify-between items-center">
          <span className="badge badge-primary text-white font-semibold px-3 py-3">
            {hariIni === "kerja" ? "Hari Kerja" : "Hari Minggu"}
          </span>
          <button
            className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1"
            onClick={() => setShowKelolaJadwal(true)}
            data-html2canvas-ignore="true"
          >
            <Settings size={14} /> Kelola Jadwal
          </button>
        </div>

        {/* LIST JADWAL */}
        {jadwalHariIni.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada jadwal untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jadwalHariIni.map((act) => {
              const isSelesai = progressHariIni[act.id]?.selesai || false;
              const labelBersih = cleanLabel(act.label);

              return (
                <div
                  key={act.id}
                  className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border transition ${
                    isSelesai ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <p className={`text-sm font-semibold ${isSelesai ? "text-green-800 line-through opacity-70" : "text-gray-800"}`}>
                      {labelBersih}
                    </p>
                    {act.unit && <span className="text-xs text-gray-500">({act.unit})</span>}
                  </div>

                  <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                    {act.tipe === "pilihan" && act.pilihanList && (
                      <div className="flex flex-wrap gap-1 mr-2">
                        {act.pilihanList.map((pil) => (
                          <button
                            key={pil.id}
                            className="btn btn-xs btn-outline border-gray-300 text-gray-700 hover:bg-gray-200"
                            onClick={() => alert(`Masuk ke fitur ${pil.label}`)}
                          >
                            {pil.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      className={`btn btn-xs flex items-center gap-1 ${
                        isSelesai ? "btn-success text-white" : "btn-outline text-gray-700"
                      }`}
                      onClick={() => handleToggleSelesai(act.id)}
                    >
                      {isSelesai ? <CheckCircle2 size={14} /> : <Play size={14} />}
                      {isSelesai ? "Selesai" : "Mulai"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL KELOLA JADWAL */}
      {showKelolaJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-html2canvas-ignore="true">
          <div className="card bg-white shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">Kelola Jadwal</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaJadwal(false)}><X size={18} /></button>
              </div>

              <div className="tabs tabs-boxed bg-gray-50 border border-gray-200 p-1 w-fit mb-3">
                <button className={`tab ${activeTab === "kerja" ? "tab-active bg-primary text-white" : ""}`} onClick={() => setActiveTab("kerja")}>Hari Kerja</button>
                <button className={`tab ${activeTab === "minggu" ? "tab-active bg-primary text-white" : ""}`} onClick={() => setActiveTab("minggu")}>Hari Minggu</button>
              </div>

              <div className="space-y-2 mb-4">
                {(activeTab === "kerja" ? editKerja : editMinggu).map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cleanLabel(item.label)}</p>
                      {item.unit && <p className="text-xs text-gray-500">({item.unit})</p>}
                    </div>
                    <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusItem(item.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><Plus size={14} /> Tambah Item Baru</p>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama kegiatan (misal: Olahraga)" value={formBaru.label} onChange={(e) => setFormBaru({ ...formBaru, label: e.target.value })} />
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Keterangan (misal: 60 menit)" value={formBaru.unit} onChange={(e) => setFormBaru({ ...formBaru, unit: e.target.value })} />
                <button className="btn btn-primary btn-sm w-full" onClick={handleTambahItem} disabled={!formBaru.label.trim()}>Tambah</button>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="btn btn-success btn-sm flex-1 text-white" onClick={handleSimpanJadwal}><Save size={16} className="mr-1" /> Simpan Perubahan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}