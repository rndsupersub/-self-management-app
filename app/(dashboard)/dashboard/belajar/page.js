// app/(dashboard)/dashboard/belajar/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_KATEGORI, generateId } from "@/lib/belajarData";
import { BookOpen, Home, Pencil, Trash2, ArrowRight } from "lucide-react";

export default function BelajarPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState(DEFAULT_KATEGORI);
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
        if (data.belajar && Array.isArray(data.belajar.kategori)) {
          setKategori(data.belajar.kategori);
        } else {
          await setDoc(docRef, { belajar: { kategori: DEFAULT_KATEGORI } }, { merge: true });
          setKategori(DEFAULT_KATEGORI);
        }
      } else {
        await setDoc(docRef, { belajar: { kategori: DEFAULT_KATEGORI } });
        setKategori(DEFAULT_KATEGORI);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanKategori = async (newKategori) => {
    setKategori(newKategori);
    await setDoc(doc(db, "users", user.uid), { belajar: { kategori: newKategori } }, { merge: true });
  };

  const handleTambahKategori = async () => {
    if (!formData.nama.trim()) return;
    const newKategoriItem = { id: generateId("kat"), nama: formData.nama, subKategori: [] };
    await simpanKategori([...kategori, newKategoriItem]);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  const handleHapusKategori = async (katId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus kategori ini? Semua sub-kategori dan kegiatan di dalamnya akan hilang.")) return;
    await simpanKategori(kategori.filter((k) => k.id !== katId));
  };

  const handleRenameKategori = async (katId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama kategori jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    await simpanKategori(kategori.map((k) => k.id === katId ? { ...k, nama: newNama.trim() } : k));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const hitungStat = (kat) => {
    const totalSub = kat.subKategori?.length || 0;
    const totalTool = kat.subKategori?.reduce((sum, sk) => sum + (sk.tools?.length || 0), 0) || 0;
    return { totalSub, totalTool };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><BookOpen size={14} /> Belajar</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-6" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-primary" size={24} /> Belajar
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Kategori</button>
      </div>

      {showForm && (
        <div className="card bg-white shadow border border-gray-200 mb-4" data-html2canvas-ignore="true">
          <div className="card-body p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">Tambah kategori baru</p>
            <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama kategori (misal: Belajar Musik)" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahKategori}>Simpan</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {kategori.length === 0 ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada kategori. Klik "+ Tambah Kategori" untuk mulai.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategori.map((kat) => {
            const { totalSub, totalTool } = hitungStat(kat);
            return (
              <div key={kat.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/belajar/${kat.id}`)}>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="card-title text-base text-gray-800 flex items-center gap-2 flex-1">
                      <BookOpen size={18} className="text-blue-500" /> {kat.nama}
                    </h2>
                    <div className="flex gap-1 shrink-0" data-html2canvas-ignore="true">
                      <button className="btn btn-ghost btn-xs text-blue-500" onClick={(e) => handleRenameKategori(kat.id, kat.nama, e)} title="Rename"><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusKategori(kat.id, e)} title="Hapus"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{totalSub} Sub-kategori • {totalTool} Tool</p>
                  <div className="card-actions justify-end mt-2">
                    <span className="text-gray-400 text-xs flex items-center gap-1 hover:text-primary transition">Buka <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}