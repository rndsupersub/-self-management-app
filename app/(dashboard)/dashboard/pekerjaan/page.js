// app/(dashboard)/dashboard/pekerjaan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_PT, generateId } from "@/lib/pekerjaanData";
import { Building2, Briefcase, Pencil, Trash2, ArrowRight, Home } from "lucide-react";

export default function PekerjaanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pekerjaan) setPekerjaan(data.pekerjaan);
        else { await setDoc(docRef, { pekerjaan: DEFAULT_PT }, { merge: true }); setPekerjaan(DEFAULT_PT); }
      } else {
        await setDoc(docRef, { pekerjaan: DEFAULT_PT });
        setPekerjaan(DEFAULT_PT);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanPekerjaan = async (updated) => {
    setPekerjaan(updated);
    await setDoc(doc(db, "users", user.uid), { pekerjaan: updated }, { merge: true });
  };

  const handleTambahPT = async () => {
    if (!formData.nama.trim()) return;
    const newPT = { id: generateId("pt"), nama: formData.nama, brands: [] };
    await simpanPekerjaan([...pekerjaan, newPT]);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  const handleHapusPT = async (ptId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus PT ini? Semua brand dan kegiatan akan hilang.")) return;
    await simpanPekerjaan(pekerjaan.filter((p) => p.id !== ptId));
  };

  const handleRenamePT = async (ptId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama PT jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    await simpanPekerjaan(pekerjaan.map((p) => p.id === ptId ? { ...p, nama: newNama.trim() } : p));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Briefcase size={14} /> Pekerjaan</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-6" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase className="text-primary" size={24} /> Pekerjaan
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah PT</button>
      </div>

      {showForm && (
        <div className="card bg-white shadow border border-gray-200 mb-4" data-html2canvas-ignore="true">
          <div className="card-body p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">Tambah PT baru</p>
            <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama PT (misal: PT Elfiqa)" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahPT}>Simpan</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {pekerjaan.length === 0 ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <Building2 size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada PT. Klik "+ Tambah PT" untuk mulai.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pekerjaan.map((pt) => (
            <div key={pt.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/pekerjaan/${pt.id}`)}>
              <div className="card-body p-4">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="card-title text-base text-gray-800 flex items-center gap-2 flex-1">
                    <Building2 size={18} className="text-gray-500" /> {pt.nama}
                  </h2>
                  <div className="flex gap-1 shrink-0" data-html2canvas-ignore="true">
                    <button className="btn btn-ghost btn-xs text-blue-500" onClick={(e) => handleRenamePT(pt.id, pt.nama, e)} title="Edit"><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusPT(pt.id, e)} title="Hapus"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{pt.brands?.length || 0} Brand • {pt.brands?.reduce((sum, b) => sum + (b.kegiatan?.length || 0), 0) || 0} Kegiatan</p>
                <div className="card-actions justify-end mt-2">
                  <span className="text-gray-400 text-xs flex items-center gap-1 group-hover:text-primary transition">Buka <ArrowRight size={12} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}