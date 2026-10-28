// components/EvaluasiMingguan.js
"use client";

import { useState, useEffect } from "react";
import { generateId, getMingguIni, hitungTanggalSelesai, formatMinggu, getSaranKeputusan, hitungTargetNaik, DEFAULT_TARGET_MINGGU_1, DEFAULT_FIELD_EVALUASI } from "@/lib/olahragaData";
import { BarChart3, Settings, Plus, X, Pencil, Trash2, Footprints, Timer, Dumbbell, Activity, MessageSquare, Target, ArrowUp, ArrowDown, Pause, Save, List, Calendar } from "lucide-react";

export default function EvaluasiMingguan({ minggu = [], fieldEvaluasi = DEFAULT_FIELD_EVALUASI, onUpdateMinggu, onUpdateFieldEvaluasi }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  const [formData, setFormData] = useState({ mingguKe: 1, tanggalMulai: "", tanggalSelesai: "", target: { ...DEFAULT_TARGET_MINGGU_1 }, evaluasi: {}, keputusan: "stay", catatanMingguan: "" });

  useEffect(() => {
    if (minggu.length === 0) {
      setFormData((prev) => ({ ...prev, mingguKe: 1, tanggalMulai: getMingguIni(), tanggalSelesai: hitungTanggalSelesai(getMingguIni()), target: { ...DEFAULT_TARGET_MINGGU_1 } }));
    } else {
      const maxMinggu = Math.max(...minggu.map((m) => m.mingguKe || 0));
      const lastMinggu = minggu.find((m) => m.mingguKe === maxMinggu);
      let nextTanggalMulai = getMingguIni();
      if (lastMinggu?.tanggalSelesai) {
        const d = new Date(lastMinggu.tanggalSelesai); d.setDate(d.getDate() + 1); nextTanggalMulai = d.toISOString().split("T")[0];
      }
      let nextTarget = { ...DEFAULT_TARGET_MINGGU_1 };
      if (lastMinggu?.keputusan === "naik") nextTarget = hitungTargetNaik(lastMinggu.target);
      else if (lastMinggu?.target) nextTarget = { ...lastMinggu.target };
      setFormData((prev) => ({ ...prev, mingguKe: maxMinggu + 1, tanggalMulai: nextTanggalMulai, tanggalSelesai: hitungTanggalSelesai(nextTanggalMulai), target: nextTarget }));
    }
  }, [minggu.length]);

  const handleSimpan = () => {
    if (!formData.tanggalMulai) return;
    const newMinggu = { id: editingId || generateId("minggu"), mingguKe: parseInt(formData.mingguKe) || 1, tanggalMulai: formData.tanggalMulai, tanggalSelesai: formData.tanggalSelesai || hitungTanggalSelesai(formData.tanggalMulai), target: formData.target, evaluasi: formData.evaluasi, keputusan: formData.keputusan, catatanMingguan: formData.catatanMingguan, createdAt: new Date().toISOString() };
    let updated = editingId ? minggu.map((m) => (m.id === editingId ? { ...m, ...newMinggu } : m)) : [...minggu, newMinggu];
    updated.sort((a, b) => (a.mingguKe || 0) - (b.mingguKe || 0));
    onUpdateMinggu(updated); resetForm();
  };

  const handleHapus = (id) => { if (!confirm("Hapus minggu ini? Data evaluasi akan hilang.")) return; onUpdateMinggu(minggu.filter((m) => m.id !== id)); };
  const handleEdit = (m) => { setFormData({ mingguKe: m.mingguKe, tanggalMulai: m.tanggalMulai, tanggalSelesai: m.tanggalSelesai, target: m.target || { ...DEFAULT_TARGET_MINGGU_1 }, evaluasi: m.evaluasi || {}, keputusan: m.keputusan || "stay", catatanMingguan: m.catatanMingguan || "" }); setEditingId(m.id); setShowForm(true); };
  const resetForm = () => { setShowForm(false); setEditingId(null); setFormData({ mingguKe: minggu.length + 1, tanggalMulai: "", tanggalSelesai: "", target: { ...DEFAULT_TARGET_MINGGU_1 }, evaluasi: {}, keputusan: "stay", catatanMingguan: "" }); };
  
  const updateTarget = (field, key, value) => { setFormData({ ...formData, target: { ...formData.target, [field]: { ...formData.target[field], [key]: parseFloat(value) || 0 } } }); };
  const updateEvaluasi = (fieldId, value) => { setFormData({ ...formData, evaluasi: { ...formData.evaluasi, [fieldId]: value } }); };

  const handleTambahField = () => {
    if (!newFieldLabel.trim()) return;
    onUpdateFieldEvaluasi([...fieldEvaluasi, { id: generateId("field"), label: newFieldLabel }]);
    setNewFieldLabel(""); setShowFieldForm(false);
  };

  const handleHapusField = (fieldId) => { if (!confirm("Hapus field evaluasi ini? Data evaluasi di field ini akan hilang.")) return; onUpdateFieldEvaluasi(fieldEvaluasi.filter((f) => f.id !== fieldId)); };

  const saran = getSaranKeputusan(formData.evaluasi);

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><BarChart3 size={16}/> Evaluasi Mingguan</h3>
            <div className="flex gap-1">
              <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowFieldForm(!showFieldForm)} title="Kelola Field Evaluasi"><Settings size={14}/> Field</button>
              <button className="btn btn-primary btn-xs flex items-center gap-1" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>{showForm ? <><X size={14}/> Batal</> : <><Plus size={14}/> Tambah Minggu</>}</button>
            </div>
          </div>

          {showFieldForm && (
            <div className="bg-purple-50 rounded p-3 mb-3 space-y-2 border border-purple-200">
              <p className="text-xs font-semibold text-purple-700 flex items-center gap-1"><Settings size={14}/> Kelola Field Evaluasi</p>
              <div className="space-y-1">
                {fieldEvaluasi.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-white rounded px-2 py-1 border border-gray-200"><span className="text-xs text-gray-700">{f.label}</span><button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusField(f.id)}><Trash2 size={14}/></button></div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" className="input input-bordered input-xs flex-1 text-gray-800 bg-white" placeholder="Nama field baru" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} />
                <button className="btn btn-primary btn-xs" onClick={handleTambahField} disabled={!newFieldLabel.trim()}><Plus size={14}/></button>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">{editingId ? <><Pencil size={14}/> Edit Minggu</> : <><Plus size={14}/> Tambah Minggu Baru</>}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div><label className="text-xs text-gray-600 mb-1 block">Minggu ke-</label><input type="number" min="1" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.mingguKe} onChange={(e) => setFormData({ ...formData, mingguKe: e.target.value })} /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Tanggal Mulai</label><input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.tanggalMulai} onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value, tanggalSelesai: hitungTanggalSelesai(e.target.value) })} /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Tanggal Selesai</label><input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.tanggalSelesai} onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })} /></div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><Target size={14}/> Target Minggu Ini</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><label className="text-[10px] text-gray-600 mb-1 block flex items-center gap-1"><Footprints size={10}/> Jogging (km)</label><input type="number" step="0.1" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.target.jogging?.km || ""} onChange={(e) => updateTarget("jogging", "km", e.target.value)} /></div>
                  <div><label className="text-[10px] text-gray-600 mb-1 block flex items-center gap-1"><Timer size={10}/> Pace</label><input type="number" step="0.1" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.target.jogging?.pace || ""} onChange={(e) => updateTarget("jogging", "pace", e.target.value)} /></div>
                  <div><label className="text-[10px] text-gray-600 mb-1 block flex items-center gap-1"><Dumbbell size={10}/> Push Up (reps)</label><input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.target.pushUp?.reps || ""} onChange={(e) => updateTarget("pushUp", "reps", e.target.value)} /></div>
                  <div><label className="text-[10px] text-gray-600 mb-1 block flex items-center gap-1"><Activity size={10}/> Leg Raise (reps)</label><input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.target.legRaise?.reps || ""} onChange={(e) => updateTarget("legRaise", "reps", e.target.value)} /></div>
                  <div><label className="text-[10px] text-gray-600 mb-1 block flex items-center gap-1"><Timer size={10}/> Plank (detik)</label><input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.target.plank?.detik || ""} onChange={(e) => updateTarget("plank", "detik", e.target.value)} /></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><MessageSquare size={14}/> Evaluasi</p>
                <div className="space-y-2">
                  {fieldEvaluasi.map((f) => (
                    <div key={f.id}><label className="text-xs text-gray-600 mb-1 block">{f.label}</label><textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" placeholder="Tulis evaluasi..." value={formData.evaluasi[f.id] || ""} onChange={(e) => updateEvaluasi(f.id, e.target.value)} /></div>
                  ))}
                </div>
              </div>

              <div className={`rounded p-2 border ${saran.saran === "naik" ? "bg-green-50 border-green-200" : saran.saran === "turun" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="text-xs font-semibold flex items-center gap-1">
                  {saran.saran === "naik" && <><ArrowUp size={14} className="text-green-600"/> Saran: NAIK level</>}
                  {saran.saran === "turun" && <><ArrowDown size={14} className="text-red-600"/> Saran: TURUN level</>}
                  {saran.saran === "stay" && <><Pause size={14} className="text-yellow-600"/> Saran: STAY level</>}
                </p>
                <p className="text-xs text-gray-600 mt-1">{saran.alasan}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1"><Target size={14}/> Keputusan Lo</label>
                <div className="flex gap-2">
                  <button className={`btn btn-sm flex-1 flex items-center justify-center gap-1 ${formData.keputusan === "naik" ? "btn-primary" : "btn-outline"}`} onClick={() => setFormData({ ...formData, keputusan: "naik" })}><ArrowUp size={14}/> Naik</button>
                  <button className={`btn btn-sm flex-1 flex items-center justify-center gap-1 ${formData.keputusan === "stay" ? "btn-primary" : "btn-outline"}`} onClick={() => setFormData({ ...formData, keputusan: "stay" })}><Pause size={14}/> Stay</button>
                  <button className={`btn btn-sm flex-1 flex items-center justify-center gap-1 ${formData.keputusan === "turun" ? "btn-primary" : "btn-outline"}`} onClick={() => setFormData({ ...formData, keputusan: "turun" })}><ArrowDown size={14}/> Turun</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><MessageSquare size={14}/> Catatan Mingguan (akumulasi)</label>
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="3" placeholder="Catatan akumulasi minggu ini..." value={formData.catatanMingguan} onChange={(e) => setFormData({ ...formData, catatanMingguan: e.target.value })} />
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpan}>{editingId ? <><Save size={16}/> Simpan</> : <><Plus size={16}/> Tambah</>}</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={resetForm}>Batal</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {minggu.length === 0 && !showForm ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada minggu. Klik "+ Tambah Minggu" untuk mulai.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {minggu.slice().sort((a, b) => (a.mingguKe || 0) - (b.mingguKe || 0)).map((m) => (
            <div key={m.id} className="card bg-white shadow border border-gray-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Calendar size={16}/> {formatMinggu(m.mingguKe, m.tanggalMulai, m.tanggalSelesai)}</h3>
                    <div className="flex gap-1 mt-1">
                      <span className={`badge badge-sm flex items-center gap-1 ${m.keputusan === "naik" ? "badge-success" : m.keputusan === "turun" ? "badge-error" : "badge-warning"}`}>
                        {m.keputusan === "naik" && <><ArrowUp size={12}/> Naik</>}
                        {m.keputusan === "stay" && <><Pause size={12}/> Stay</>}
                        {m.keputusan === "turun" && <><ArrowDown size={12}/> Turun</>}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(m)} title="Edit"><Pencil size={14}/></button>
                    <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(m.id)} title="Hapus"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-2 mb-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Target size={12}/> Target</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                    {m.target?.jogging?.km > 0 && <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1"><Footprints size={12}/> {m.target.jogging.km} km{m.target.jogging.pace > 0 && ` • pace ${m.target.jogging.pace}`}</span>}
                    {m.target?.pushUp?.reps > 0 && <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1"><Dumbbell size={12}/> {m.target.pushUp.reps} reps</span>}
                    {m.target?.legRaise?.reps > 0 && <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1"><Activity size={12}/> {m.target.legRaise.reps} reps</span>}
                    {m.target?.plank?.detik > 0 && <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1"><Timer size={12}/> {m.target.plank.detik} detik</span>}
                  </div>
                </div>

                {m.evaluasi && Object.keys(m.evaluasi).length > 0 && (
                  <div className="space-y-1 mb-2">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1"><MessageSquare size={12}/> Evaluasi</p>
                    {Object.entries(m.evaluasi).map(([fieldId, value]) => {
                      if (!value) return null;
                      const field = fieldEvaluasi.find((f) => f.id === fieldId);
                      return (<div key={fieldId} className="text-xs text-gray-700 bg-gray-50 rounded p-2 border border-gray-200"><span className="font-semibold">{field?.label || fieldId}: </span><span className="whitespace-pre-wrap">{value}</span></div>);
                    })}
                  </div>
                )}

                {m.catatanMingguan && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><MessageSquare size={12}/> Catatan Mingguan</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">{m.catatanMingguan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}