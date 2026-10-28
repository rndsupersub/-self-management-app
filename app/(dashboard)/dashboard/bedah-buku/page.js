// app/(dashboard)/dashboard/bedah-buku/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KalenderBedahBuku from "@/components/KalenderBedahBuku";
import { DEFAULT_BEDAH_BUKU, DEFAULT_KATEGORI, generateId, getProgressBuku, getStreak, getTotalHalamanBuku, cekBukuSelesai } from "@/lib/bedahBukuData";
import { BookOpen, Library, Home, Pencil, Trash2, Calendar, Plus, FileText, Target, Flame, CheckCircle2, User, X, Save } from "lucide-react";

export default function BedahBukuPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kalender");
  const [bedahBuku, setBedahBuku] = useState(DEFAULT_BEDAH_BUKU);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    judul: "",
    penulis: "",
    kategoriId: "belajar",
    totalHalaman: "",
    targetPerHari: 10,
    tanggalMulai: new Date().toISOString().split("T")[0],
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bedahBuku) {
          setBedahBuku({ kategori: data.bedahBuku.kategori || DEFAULT_KATEGORI, buku: data.bedahBuku.buku || [] });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanBedahBuku = async (newBedahBuku) => {
    setBedahBuku(newBedahBuku);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { bedahBuku: newBedahBuku }, { merge: true });
  };

  const handleTambahBuku = async () => {
    if (!formData.judul.trim() || !formData.totalHalaman) return;
    
    const newBuku = { 
      id: generateId("buku"), 
      ...formData, 
      totalHalaman: parseInt(formData.totalHalaman) || 0, 
      targetPerHari: parseInt(formData.targetPerHari) || 10, 
      halamanSelesai: [], 
      progressHarian: {}, 
      createdAt: new Date().toISOString() 
    };
    
    await simpanBedahBuku({ ...bedahBuku, buku: [...bedahBuku.buku, newBuku] });
    setShowForm(false);
    setFormData({ judul: "", penulis: "", kategoriId: "belajar", totalHalaman: "", targetPerHari: 10, tanggalMulai: new Date().toISOString().split("T")[0] });
  };

  const handleHapusBuku = async (bukuId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus buku ini?")) return;
    await simpanBedahBuku({ ...bedahBuku, buku: bedahBuku.buku.filter((b) => b.id !== bukuId) });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Library size={14} /> Bedah Buku</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-4" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Library className="text-primary" size={24} /> Bedah Buku
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" /> Tambah Buku</button>
      </div>

      {/* FORM TAMBAH BUKU */}
      {showForm && (
        <div className="card bg-white shadow border border-blue-300 mb-4" data-html2canvas-ignore="true">
          <div className="card-body p-4 space-y-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-blue-700">Tambah Buku Baru</p>
              <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Judul Buku *</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Judul buku" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Penulis</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama penulis" value={formData.penulis} onChange={(e) => setFormData({ ...formData, penulis: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.kategoriId} onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}>
                  {bedahBuku.kategori.map((k) => <option key={k.id} value={k.id}>{k.nama.replace(/^[^\w\s]+\s/, '')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Total Halaman *</label>
                <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Misal: 292" value={formData.totalHalaman} onChange={(e) => setFormData({ ...formData, totalHalaman: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Target / Hari</label>
                <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.targetPerHari} onChange={(e) => setFormData({ ...formData, targetPerHari: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Tanggal Mulai</label>
              <input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={formData.tanggalMulai} onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })} />
            </div>

            <div className="flex gap-2 pt-2">
              <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleTambahBuku} disabled={!formData.judul.trim() || !formData.totalHalaman}><Save size={16}/> Simpan Buku</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("kalender")}><Calendar size={16} className="mr-2" /> Kalender</button>
        <button className={`tab ${activeTab === "daftar" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("daftar")}><Library size={16} className="mr-2" /> Daftar Buku</button>
      </div>

      {activeTab === "kalender" && <KalenderBedahBuku bukuList={bedahBuku.buku} onUpdateBuku={(id, u) => simpanBedahBuku({ ...bedahBuku, buku: bedahBuku.buku.map((b) => b.id === id ? u : b) })} />}

      {activeTab === "daftar" && (
        <div className="space-y-6">
          {bedahBuku.kategori.map((kategori) => {
            const bukuKategori = bedahBuku.buku.filter((b) => b.kategoriId === kategori.id);
            const cleanName = kategori.nama.replace(/^[^\w\s]+\s/, ''); 
            return (
              <div key={kategori.id}>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Library size={18} /> {cleanName} ({bukuKategori.length})</h2>
                {bukuKategori.length === 0 ? (
                  <div className="card bg-white shadow border border-gray-200"><div className="card-body p-6 text-center text-gray-400"><p className="text-sm">Belum ada buku di kategori ini.</p></div></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bukuKategori.map((buku) => {
                      const progress = getProgressBuku(buku);
                      const streak = getStreak(buku);
                      const totalHal = getTotalHalamanBuku(buku);
                      const selesai = cekBukuSelesai(buku);
                      return (
                        <div key={buku.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/bedah-buku/${buku.id}`)}>
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-800 leading-tight flex items-start gap-1"><BookOpen size={16} className="text-blue-500 shrink-0 mt-0.5" /> {buku.judul}</h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><User size={12} /> {buku.penulis}</p>
                              </div>
                              <div className="flex gap-1 shrink-0" data-html2canvas-ignore="true">
                                <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusBuku(buku.id, e)} title="Hapus buku"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Progress</span><span className="font-semibold flex items-center gap-1">{progress}% {selesai && <CheckCircle2 size={12} className="text-success" />}</span></div>
                              <progress className={`progress ${selesai ? "progress-success" : "progress-primary"} w-full h-2`} value={progress} max="100" />
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                              <span className="flex items-center gap-1"><FileText size={12} /> {totalHal} hal</span>
                              <span className="flex items-center gap-1"><Target size={12} /> {buku.targetPerHari}/hari</span>
                              {streak > 0 && <span className="text-orange-600 font-semibold flex items-center gap-1"><Flame size={12} /> {streak} hari</span>}
                            </div>
                            <div className="card-actions justify-end mt-2"><span className="text-gray-400 text-xs">Buka →</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}