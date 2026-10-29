// components/LaporanPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { formatTanggalPanjang, formatTanggalPendek, getMingguRange, getBulanRange, generateLaporanHarian, generateLaporanMingguan, generateLaporanBulanan } from "@/lib/laporanData";
import { Info, Calendar, Eye, EyeOff, CheckCircle2, Clock, RefreshCw, X, Save, List, FileText, ClipboardList, FolderOpen, Loader2, Link as LinkIcon, Settings, Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";

const DEFAULT_FIELDS = [
  { id: "ringkasan", label: "Ringkasan Pekerjaan", tipe: "long" },
  { id: "kendala", label: "Kendala", tipe: "long" },
  { id: "solusi", label: "Solusi", tipe: "long" },
];

// Fungsi pembantu untuk dapetin tanggal hari ini (Waktu Lokal)
const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Fungsi pembantu untuk geser tanggal/bulan/tahun tanpa kena timezone UTC
const adjustDate = (dateStr, type, amount) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  
  if (type === "days") dateObj.setDate(dateObj.getDate() + amount);
  else if (type === "months") dateObj.setMonth(dateObj.getMonth() + amount);
  else if (type === "years") dateObj.setFullYear(dateObj.getFullYear() + amount);

  const newY = dateObj.getFullYear();
  const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
  const newD = String(dateObj.getDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
};

export default function LaporanPekerjaan({ kegiatanList = [], vendorList = [], laporanData = {}, onUpdateLaporan }) {
  const [activeTab, setActiveTab] = useState("harian");
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [formValues, setFormValues] = useState({});
  const [gdriveUrl, setGdriveUrl] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);
  const [showLaporanSection, setShowLaporanSection] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Kelola Field
  const [showKelolaField, setShowKelolaField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({ label: "", tipe: "long" });

  const fields = useMemo(() => laporanData?.fields || DEFAULT_FIELDS, [laporanData]);

  const periodeHarian = useMemo(() => ({ tanggal: selectedDate }), [selectedDate]);
  const periodeMingguan = useMemo(() => getMingguRange(selectedDate), [selectedDate]);
  const periodeBulanan = useMemo(() => getBulanRange(selectedDate), [selectedDate]);

  const keyHarian = selectedDate;
  const keyMingguan = periodeMingguan.tanggalMulai;
  const keyBulanan = `${periodeBulanan.tahun}-${String(periodeBulanan.bulan).padStart(2, "0")}`;

  const laporanTersimpan = useMemo(() => {
    if (activeTab === "harian") return laporanData?.harian?.[keyHarian] || null;
    if (activeTab === "mingguan") return laporanData?.mingguan?.[keyMingguan] || null;
    return laporanData?.bulanan?.[keyBulanan] || null;
  }, [activeTab, laporanData, keyHarian, keyMingguan, keyBulanan]);

  // Load data & Migrasi data lama
  useEffect(() => {
    let initialValues = {};
    if (laporanTersimpan?.fields) {
      initialValues = laporanTersimpan.fields;
    } else if (laporanTersimpan?.konten) {
      const firstFieldId = fields[0]?.id || "ringkasan";
      initialValues[firstFieldId] = laporanTersimpan.konten;
    } else {
      fields.forEach(f => initialValues[f.id] = "");
    }
    setFormValues(initialValues);
    setGdriveUrl(laporanTersimpan?.gdriveUrl || "");
  }, [laporanTersimpan, activeTab, selectedDate, fields]);

  // AUTO-GENERATE: Narik data dari kegiatan & log vendor
  const handleAutoGenerate = () => {
    const start = activeTab === "harian" ? selectedDate : activeTab === "mingguan" ? periodeMingguan.tanggalMulai : periodeBulanan.tanggalMulai;
    const end = activeTab === "harian" ? selectedDate : activeTab === "mingguan" ? periodeMingguan.tanggalSelesai : periodeBulanan.tanggalSelesai;

    let kegiatanDiPeriode = [];
    if (activeTab === "harian") kegiatanDiPeriode = generateLaporanHarian(kegiatanList, selectedDate);
    else if (activeTab === "mingguan") kegiatanDiPeriode = generateLaporanMingguan(kegiatanList, periodeMingguan.tanggalMulai, periodeMingguan.tanggalSelesai);
    else kegiatanDiPeriode = generateLaporanBulanan(kegiatanList, periodeBulanan.tanggalMulai, periodeBulanan.tanggalSelesai);

    let textKegiatan = `Total: ${kegiatanDiPeriode.length} Kegiatan\n`;
    kegiatanDiPeriode.forEach((k) => { textKegiatan += `${k.status === "selesai" ? "[x]" : "[ ]"} ${k.judul}\n`; });

    let textVendor = "";
    (vendorList || []).forEach((vendor) => {
      const logs = (vendor.logKunjungan || []).filter((log) => log.tanggal >= start && log.tanggal <= end);
      if (logs.length > 0) {
        textVendor += `Vendor: ${vendor.nama}\n`;
        logs.forEach((log) => {
          textVendor += `- ${log.tanggal} | Hasil: ${log.hasil} ${log.catatan ? `| Catatan: ${log.catatan}` : ""}\n`;
        });
        textVendor += "\n";
      }
    });

    const newVals = { ...formValues };
    
    const ringkasanField = fields.find(f => f.id === "ringkasan" || f.label.toLowerCase().includes("ringkasan"));
    if (ringkasanField) newVals[ringkasanField.id] = textKegiatan;
    
    const kendalaField = fields.find(f => f.id === "kendala" || f.label.toLowerCase().includes("kendala"));
    if (kendalaField && textVendor) newVals[kendalaField.id] = textVendor;

    setFormValues(newVals);
  };

  const handleSimpan = async () => {
    if (!onUpdateLaporan) return;
    setIsSaving(true);
    
    const newLaporanData = JSON.parse(JSON.stringify(laporanData || {}));
    newLaporanData.fields = fields; 
    
    const payload = { fields: formValues, gdriveUrl: gdriveUrl, updatedAt: new Date().toISOString() };

    if (activeTab === "harian") {
      if (!newLaporanData.harian) newLaporanData.harian = {};
      newLaporanData.harian[keyHarian] = { tanggal: keyHarian, ...payload };
    } else if (activeTab === "mingguan") {
      if (!newLaporanData.mingguan) newLaporanData.mingguan = {};
      newLaporanData.mingguan[keyMingguan] = { tanggalMulai: periodeMingguan.tanggalMulai, tanggalSelesai: periodeMingguan.tanggalSelesai, mingguKe: periodeMingguan.mingguKe, tahun: periodeMingguan.tahun, ...payload };
    } else {
      if (!newLaporanData.bulanan) newLaporanData.bulanan = {};
      newLaporanData.bulanan[keyBulanan] = { tahun: periodeBulanan.tahun, bulan: periodeBulanan.bulan, namaBulan: periodeBulanan.namaBulan, ...payload };
    }

    await onUpdateLaporan(newLaporanData);
    setIsSaving(false);
    setSavedNotif(true); 
    setTimeout(() => setSavedNotif(false), 3000);
  };

  // HANDLER EDIT & HAPUS LAPORAN
  const handleEditLaporan = (lap) => {
    const dateToSet = lap.tanggal || lap.tanggalMulai || lap.key;
    if (dateToSet) setSelectedDate(dateToSet);
    if (lap.fields) {
      setFormValues(lap.fields);
    } else if (lap.konten) {
      setFormValues({ [fields[0]?.id || "ringkasan"]: lap.konten });
    }
    setGdriveUrl(lap.gdriveUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHapusLaporan = (key) => {
    if (!confirm("Hapus laporan ini?")) return;
    const newLaporanData = JSON.parse(JSON.stringify(laporanData || {}));
    if (newLaporanData[activeTab] && newLaporanData[activeTab][key]) {
      delete newLaporanData[activeTab][key];
      onUpdateLaporan(newLaporanData);
    }
  };

  // Handler Kelola Field
  const handleBukaTambahField = () => { setFieldForm({ label: "", tipe: "long" }); setEditingFieldId(null); };
  const handleBukaEditField = (f) => { setFieldForm({ label: f.label, tipe: f.tipe }); setEditingFieldId(f.id); };
  const handleSimpanField = async () => {
    if (!fieldForm.label.trim()) return;
    const newField = { id: editingFieldId || `field_${Date.now()}`, label: fieldForm.label, tipe: fieldForm.tipe };
    let updatedFields = editingFieldId ? fields.map(f => f.id === editingFieldId ? newField : f) : [...fields, newField];
    
    const newLaporanData = { ...laporanData, fields: updatedFields };
    await onUpdateLaporan(newLaporanData);
    if (!editingFieldId) setFormValues(prev => ({ ...prev, [newField.id]: "" }));
    handleBukaTambahField();
  };
  const handleHapusField = async (id) => {
    if (!confirm("Hapus field ini? Data laporan yang udah keisi bakal ilang dari tampilan.")) return;
    const updatedFields = fields.filter(f => f.id !== id);
    const newLaporanData = { ...laporanData, fields: updatedFields };
    await onUpdateLaporan(newLaporanData);
  };

  const handlePrev = () => {
    if (activeTab === "harian") setSelectedDate(adjustDate(selectedDate, "days", -1));
    else if (activeTab === "mingguan") setSelectedDate(adjustDate(selectedDate, "days", -7));
    else setSelectedDate(adjustDate(selectedDate, "months", -1));
  };

  const handleNext = () => {
    if (activeTab === "harian") setSelectedDate(adjustDate(selectedDate, "days", 1));
    else if (activeTab === "mingguan") setSelectedDate(adjustDate(selectedDate, "days", 7));
    else setSelectedDate(adjustDate(selectedDate, "months", 1));
  };

  const labelPeriode = useMemo(() => {
    if (activeTab === "harian") return formatTanggalPanjang(selectedDate);
    if (activeTab === "mingguan") return periodeMingguan.label;
    return periodeBulanan.label;
  }, [activeTab, selectedDate, periodeMingguan, periodeBulanan]);

  const historyList = useMemo(() => {
    const data = laporanData?.[activeTab] || {};
    return Object.entries(data).map(([key, val]) => ({ key, ...val })).sort((a, b) => {
      const aDate = a.tanggal || a.tanggalMulai || `${a.tahun}-${String(a.bulan || 1).padStart(2, "0")}-01`;
      const bDate = b.tanggal || b.tanggalMulai || `${b.tahun}-${String(b.bulan || 1).padStart(2, "0")}-01`;
      return bDate.localeCompare(aDate);
    });
  }, [laporanData, activeTab]);

  return (
    <div className="space-y-4">
      <div className="alert alert-info py-2 text-xs flex items-center gap-1">
        <Info size={14}/> Laporan diisi setiap <strong>hari kerja jam 17:00–18:00</strong>.
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
          <button className={`tab ${activeTab === "harian" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("harian")}><Calendar size={14} className="mr-1"/> Harian</button>
          <button className={`tab ${activeTab === "mingguan" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("mingguan")}><Calendar size={14} className="mr-1"/> Mingguan</button>
          <button className={`tab ${activeTab === "bulanan" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("bulanan")}><Calendar size={14} className="mr-1"/> Bulanan</button>
        </div>
        <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowKelolaField(true)}>
          <Settings size={14}/> Kelola Field Laporan
        </button>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handlePrev}>‹</button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">{labelPeriode}</h3>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleNext}>›</button>
            </div>
            <div className="flex items-center gap-2">
              <input type="date" className="input input-bordered input-sm text-gray-800 bg-white" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button className="btn btn-outline btn-xs text-gray-700" onClick={() => setSelectedDate(getTodayLocalDate())}><Calendar size={14} className="mr-1"/> {activeTab === "harian" ? "Hari Ini" : activeTab === "mingguan" ? "Minggu Ini" : "Bulan Ini"}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><ClipboardList size={16}/> Form Laporan {activeTab === "harian" ? "Harian" : activeTab === "mingguan" ? "Mingguan" : "Bulanan"}</h3>
            <div className="flex gap-1">
              <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowLaporanSection(!showLaporanSection)}>{showLaporanSection ? <><EyeOff size={14} className="mr-1"/> Sembunyikan</> : <><Eye size={14} className="mr-1"/> Tampilkan</>}</button>
              {showLaporanSection && (
                <>
                  <button className="btn btn-outline btn-xs text-gray-700" onClick={handleAutoGenerate} title="Isi otomatis dari kegiatan & vendor di periode ini"><RefreshCw size={14} className="mr-1"/> Auto-generate</button>
                  <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => {
                    const cleared = {}; fields.forEach(f => cleared[f.id] = ""); setFormValues(cleared); setGdriveUrl("");
                  }} title="Kosongin form"><X size={14} className="mr-1"/> Clear</button>
                </>
              )}
            </div>
          </div>
          
          {showLaporanSection && (
            <>
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.id}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{field.label}</label>
                    {field.tipe === "text" ? (
                      <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formValues[field.id] || ""} onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })} />
                    ) : (
                      <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono" rows="4" value={formValues[field.id] || ""} onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><FolderOpen size={14}/> Link Google Drive (opsional)</label>
                <input type="url" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="https://drive.google.com/..." value={gdriveUrl} onChange={(e) => setGdriveUrl(e.target.value)} />
              </div>

              {laporanTersimpan?.updatedAt && <p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><Clock size={14}/> Terakhir disimpan: {new Date(laporanTersimpan.updatedAt).toLocaleString("id-ID")}</p>}
              
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="animate-spin mr-2" size={16}/> Menyimpan...</> : <><Save size={16} className="mr-1"/> Simpan Laporan</>}
                </button>
              </div>
              {savedNotif && <div className="alert alert-success py-2 mt-3 text-xs flex items-center gap-1"><CheckCircle2 size={14}/> Laporan berhasil disimpan!</div>}
            </>
          )}
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><List size={16}/> History Laporan ({historyList.length})</h3>
            <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowHistory(!showHistory)}>{showHistory ? <><EyeOff size={14} className="mr-1"/> Sembunyikan</> : <><Eye size={14} className="mr-1"/> Tampilkan</>}</button>
          </div>
          {showHistory && (
            <>
              {historyList.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Belum ada laporan {activeTab} tersimpan.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {historyList.map((lap) => {
                    const labelHarian = formatTanggalPanjang(lap.tanggal);
                    const labelMingguan = lap.tanggalMulai ? `Minggu ${lap.mingguKe} (${formatTanggalPendek(lap.tanggalMulai)} – ${formatTanggalPendek(lap.tanggalSelesai)})` : "-";
                    const labelBulanan = lap.namaBulan ? `${lap.namaBulan} ${lap.tahun}` : "-";
                    const label = activeTab === "harian" ? labelHarian : activeTab === "mingguan" ? labelMingguan : labelBulanan;
                    return (
                      <details key={lap.key} className="border border-gray-200 rounded p-2 bg-gray-50">
                        <summary className="text-sm font-semibold text-gray-800 cursor-pointer flex justify-between items-center">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {label}</span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => handleEditLaporan(lap)} className="btn btn-ghost btn-xs text-blue-500" title="Edit Laporan"><Pencil size={14}/></button>
                            <button type="button" onClick={() => handleHapusLaporan(lap.key)} className="btn btn-ghost btn-xs text-red-500" title="Hapus Laporan"><Trash2 size={14}/></button>
                          </div>
                        </summary>
                        <div className="mt-2 bg-white p-3 rounded border border-gray-200 space-y-2">
                          {fields.map(f => {
                            const val = lap.fields?.[f.id] || (f.id === "ringkasan" ? lap.konten : null);
                            if (!val) return null;
                            return (
                              <div key={f.id}>
                                <p className="text-[10px] font-semibold text-gray-500">{f.label}</p>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{val}</p>
                              </div>
                            );
                          })}
                          {lap.gdriveUrl && <a href={lap.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-2 flex items-center gap-1"><LinkIcon size={12}/> Lihat GDrive</a>}
                          {lap.updatedAt && <p className="text-[10px] text-gray-400 mt-2">Disimpan: {new Date(lap.updatedAt).toLocaleString("id-ID")}</p>}
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

      {showKelolaField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={18}/> Kelola Field Laporan</h3>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaField(false)}><X size={18}/></button>
              </div>
              <div className="space-y-1 mb-4">
                {fields.map((f) => (
                  <div key={f.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <div className="flex-1"><p className="text-sm text-gray-700">{f.label}</p><span className="text-[10px] text-gray-500">Tipe: {f.tipe}</span></div>
                    <div className="flex gap-1"><button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditField(f)}><Pencil size={14}/></button><button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusField(f.id)}><Trash2 size={14}/></button></div>
                  </div>
                ))}
              </div>
              <div className="bg-purple-50 rounded p-3 border border-purple-200 space-y-2">
                <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">{editingFieldId ? <><Pencil size={14}/> Edit Field</> : <><Plus size={14}/> Tambah Field Baru</>}</p>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama field (misal: Kendala)" value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })} />
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={fieldForm.tipe} onChange={(e) => setFieldForm({ ...fieldForm, tipe: e.target.value })}>
                  <option value="long">Teks Panjang</option>
                  <option value="text">Teks Pendek</option>
                </select>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpanField} disabled={!fieldForm.label.trim()}>{editingFieldId ? <><Save size={14}/> Simpan</> : <><Plus size={14}/> Tambah</>}</button>
                  {editingFieldId && <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBukaTambahField}>Batal</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}