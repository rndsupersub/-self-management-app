// components/Schedule.js
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Play, CheckCircle2, Settings, X, Plus, Save, Trash2, Clock, Pencil } from "lucide-react";

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
  
  const [editKerja, setEditKerja] = useState([]);
  const [editMinggu, setEditMinggu] = useState([]);
  const [activeTab, setActiveTab] = useState("kerja");

  // State untuk form tambah item baru
  const [formBaru, setFormBaru] = useState({ label: "", unit: "", jamMulai: "", jamSelesai: "" });

  // State untuk edit item yang udah ada
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (showKelolaJadwal) {
      setEditKerja(JSON.parse(JSON.stringify(jadwalUser?.kerja || [])));
      setEditMinggu(JSON.parse(JSON.stringify(jadwalUser?.minggu || [])));
      setEditingItem(null); // Reset state edit pas modal dibuka
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

  const handleSimpanJadwal = async () => {
    if (onUpdateJadwal) {
      await onUpdateJadwal({ kerja: editKerja, minggu: editMinggu });
    }
    setShowKelolaJadwal(false);
  };

  // --- LOGIC EDIT ITEM YANG UDAH ADA ---
  const handleSaveEdit = () => {
    if (!editingItem) return;
    if (activeTab === "kerja") {
      setEditKerja(editKerja.map(item => item.id === editingItem.id ? editingItem : item));
    } else {
      setEditMinggu(editMinggu.map(item => item.id === editingItem.id ? editingItem : item));
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
      jamMulai: formBaru.jamMulai || "",
      jamSelesai: formBaru.jamSelesai || "",
    };
    if (activeTab === "kerja") setEditKerja([...editKerja, newItem]);
    else setEditMinggu([...editMinggu, newItem]);
    setFormBaru({ label: "", unit: "", jamMulai: "", jamSelesai: "" });
  };

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

        {/* LIST JADWAL DI DASHBOARD */}
        {jadwalHariIni.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada jadwal untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jadwalHariIni.map((act) => {
              const isSelesai = progressHariIni[act.id]?.selesai || false;
              const labelBersih = cleanLabel(act.label);
              // READ-ONLY TAMPILAN JAM (Sesuai data asli)
              const jMulai = act.jamMulai || "";
              const jSelesai = act.jamSelesai || "";

              return (
                <div
                  key={act.id}
                  className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border transition ${
                    isSelesai ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {(jMulai || jSelesai) && (
                      <span className="text-xs font-mono text-gray-500 w-28 shrink-0 flex items-center gap-1">
                        <Clock size={12} /> {jMulai} - {jSelesai}
                      </span>
                    )}
                    <p className={`text-sm font-semibold ${isSelesai ? "text-green-800 line-through opacity-70" : "text-gray-800"}`}>
                      {labelBersih}
                    </p>
                    {act.unit && <span className="text-xs text-gray-500">({act.unit})</span>}
                  </div>

                  <div className="flex items-center gap-2" data-html2canvas-ignore="true">
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
          <div className="card bg-white shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">Kelola Jadwal</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaJadwal(false)}><X size={18} /></button>
              </div>

              <div className="tabs tabs-boxed bg-gray-50 border border-gray-200 p-1 w-fit mb-4">
                <button className={`tab ${activeTab === "kerja" ? "tab-active bg-primary text-white" : ""}`} onClick={() => {setActiveTab("kerja"); setEditingItem(null);}}>Hari Kerja</button>
                <button className={`tab ${activeTab === "minggu" ? "tab-active bg-primary text-white" : ""}`} onClick={() => {setActiveTab("minggu"); setEditingItem(null);}}>Hari Minggu</button>
              </div>

              {/* LIST ITEM DENGAN FITUR EDIT & DELETE */}
              <div className="space-y-3 mb-6">
                {(activeTab === "kerja" ? editKerja : editMinggu).map((item) => {
                  
                  // JIKA SEDANG EDIT ITEM INI
                  if (editingItem && editingItem.id === item.id) {
                    return (
                      <div key={item.id} className="flex flex-wrap items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-300">
                        <div className="flex items-center gap-1">
                          <input type="time" className="input input-bordered input-sm w-28 text-gray-800 bg-white" value={editingItem.jamMulai || ""} onChange={(e) => setEditingItem({...editingItem, jamMulai: e.target.value})} title="Jam Mulai" />
                          <span className="text-gray-500">-</span>
                          <input type="time" className="input input-bordered input-sm w-28 text-gray-800 bg-white" value={editingItem.jamSelesai || ""} onChange={(e) => setEditingItem({...editingItem, jamSelesai: e.target.value})} title="Jam Selesai" />
                        </div>
                        <input type="text" className="input input-bordered input-sm flex-1 min-w-[150px] text-gray-800 bg-white" value={editingItem.label} onChange={(e) => setEditingItem({...editingItem, label: e.target.value})} placeholder="Nama Kegiatan" />
                        <input type="text" className="input input-bordered input-sm w-24 text-gray-800 bg-white" value={editingItem.unit || ""} onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})} placeholder="Unit" />
                        
                        <div className="flex gap-1">
                          <button className="btn btn-success btn-sm text-white" onClick={handleSaveEdit}><Save size={16} /></button>
                          <button className="btn btn-ghost btn-sm text-gray-600" onClick={() => setEditingItem(null)}><X size={16} /></button>
                        </div>
                      </div>
                    );
                  }

                  // TAMPILAN NORMAL (READ ONLY DENGAN TOMBOL EDIT/HAPUS)
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        {(item.jamMulai || item.jamSelesai) && (
                          <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {item.jamMulai} - {item.jamSelesai}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cleanLabel(item.label)}</p>
                          {item.unit && <p className="text-xs text-gray-500">({item.unit})</p>}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm btn-square text-blue-500" onClick={() => setEditingItem(JSON.parse(JSON.stringify(item)))} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-square text-red-500" onClick={() => handleHapusItem(item.id)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(activeTab === "kerja" ? editKerja : editMinggu).length === 0 && (
                  <p className="text-sm text-center text-gray-500 italic py-4">Belum ada jadwal.</p>
                )}
              </div>

              {/* FORM TAMBAH BARU */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                <p className="text-sm font-bold text-blue-700 flex items-center gap-2"><Plus size={16} /> Tambah Item Baru</p>
                
                <div className="flex flex-wrap gap-2">
                  <input type="time" className="input input-bordered input-sm w-28 text-gray-800 bg-white" value={formBaru.jamMulai} onChange={(e) => setFormBaru({ ...formBaru, jamMulai: e.target.value })} title="Jam Mulai" />
                  <span className="text-gray-500 self-center">-</span>
                  <input type="time" className="input input-bordered input-sm w-28 text-gray-800 bg-white" value={formBaru.jamSelesai} onChange={(e) => setFormBaru({ ...formBaru, jamSelesai: e.target.value })} title="Jam Selesai" />
                  <input type="text" className="input input-bordered input-sm flex-1 min-w-[150px] text-gray-800 bg-white" placeholder="Nama Kegiatan (misal: Olahraga)" value={formBaru.label} onChange={(e) => setFormBaru({ ...formBaru, label: e.target.value })} />
                  <input type="text" className="input input-bordered input-sm w-24 text-gray-800 bg-white" placeholder="Unit (misal: 60 menit)" value={formBaru.unit} onChange={(e) => setFormBaru({ ...formBaru, unit: e.target.value })} />
                </div>
                
                <button className="btn btn-outline btn-sm w-full border-blue-400 text-blue-700 hover:bg-blue-100" onClick={handleTambahItem} disabled={!formBaru.label.trim()}>Tambah ke Daftar</button>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="btn btn-primary btn-block md:w-auto" onClick={handleSimpanJadwal}><Save size={18} className="mr-2" /> Simpan Semua Perubahan</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}