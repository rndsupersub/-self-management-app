// components/KaryaMingguan.js
"use client";

import { useState } from "react";
import { Video, Lightbulb, Plus, Trash2, Link as LinkIcon, X, Save } from "lucide-react";

export default function KaryaMingguan({ karyaMingguan = [], onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ judul: "", link: "" });

  const handleTambah = () => {
    if (!formData.judul.trim() || !formData.link.trim()) return;
    const newKarya = {
      id: `karya_${Date.now()}`,
      judul: formData.judul,
      link: formData.link,
      tanggal: new Date().toISOString(),
    };
    onUpdate([...karyaMingguan, newKarya]);
    setFormData({ judul: "", link: "" });
    setShowForm(false);
  };

  const handleHapus = (id) => {
    if (!confirm("Hapus karya ini?")) return;
    onUpdate(karyaMingguan.filter((k) => k.id !== id));
  };

  return (
    <div className="card bg-white shadow border border-gray-200 mt-6">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2"><Video size={18} /> Karya Mingguan</h3>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-1" /> Tambah Karya
            </button>
          )}
        </div>

        <div className="alert alert-info py-2 text-xs flex items-center gap-2 mb-3">
          <Lightbulb size={16} /> Upload karya lo tiap minggu ke TikTok, terus paste link-nya di sini. Ini jadi portofolio lo.
        </div>

        {showForm && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700">Tambah Karya Baru</p>
            <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Judul Karya (misal: Review SolidWorks)" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
            <input type="url" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Link TikTok (https://tiktok.com/...)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambah} disabled={!formData.judul.trim() || !formData.link.trim()}><Save size={14} className="mr-1" /> Simpan</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        )}

        {karyaMingguan.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Video size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada karya mingguan. Klik "+ Tambah Karya" untuk mulai.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {karyaMingguan.map((karya) => (
              <div key={karya.id} className="flex justify-between items-center p-3 rounded border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{karya.judul}</p>
                  <a href={karya.link} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary flex items-center gap-1 mt-1">
                    <LinkIcon size={12} /> Lihat Karya
                  </a>
                </div>
                <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(karya.id)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}