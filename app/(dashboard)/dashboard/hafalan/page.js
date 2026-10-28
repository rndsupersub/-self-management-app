// app/(dashboard)/dashboard/hafalan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KalenderMembaca from "@/components/KalenderMembaca";
import MurajaahMingguan from "@/components/MurajaahMingguan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_TARGET_HARIAN, DEFAULT_JENIS_KESALAHAN, hitungProgressSemuaJuz, hitungTotalHalamanJuz } from "@/lib/hafalanData";
import { BookOpen, Home, Target, Calendar, RefreshCw, Library } from "lucide-react";

export default function HafalanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("membaca");
  const [targetHarian, setTargetHarian] = useState(DEFAULT_TARGET_HARIAN);
  const [juzAktif, setJuzAktif] = useState("juz_1");
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanTalaqy, setHafalanTalaqy] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(DEFAULT_JENIS_KESALAHAN);
  const [editTarget, setEditTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGET_HARIAN);

  const router = useRouter();
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hafalanTargetHarian) { setTargetHarian(data.hafalanTargetHarian); setTargetInput(data.hafalanTargetHarian); }
        if (data.hafalanJuzAktif) setJuzAktif(data.hafalanJuzAktif);
        if (data.hafalanMembaca) setHafalanMembaca(data.hafalanMembaca);
        if (data.hafalanMurajaah) setHafalanMurajaah(data.hafalanMurajaah);
        if (data.hafalanTalaqy) setHafalanTalaqy(data.hafalanTalaqy);
        if (data.hafalanJenisKesalahan) setJenisKesalahanList(data.hafalanJenisKesalahan);
      } else {
        await setDoc(docRef, { hafalanTargetHarian: DEFAULT_TARGET_HARIAN, hafalanJuzAktif: "juz_1", hafalanMembaca: {}, hafalanMurajaah: {}, hafalanTalaqy: {}, hafalanJenisKesalahan: DEFAULT_JENIS_KESALAHAN });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanSettings = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const handleSimpanTarget = async () => {
    const t = parseInt(targetInput);
    if (!t || t <= 0) return;
    setTargetHarian(t);
    await simpanSettings({ hafalanTargetHarian: t });
    setEditTarget(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  const progressSemuaJuz = hitungProgressSemuaJuz(hafalanMembaca);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><BookOpen size={14} /> Hafalan Qur'an</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-2" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BookOpen className="text-primary" size={24} /> Hafalan Qur'an</h1>
        <div className="flex items-center gap-2 bg-white rounded px-3 py-2 shadow border border-gray-200">
          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Target size={14} /> Target Harian:</span>
          {!editTarget ? (
            <>
              <span className="text-sm font-bold text-gray-800">{targetHarian} halaman</span>
              <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => { setTargetInput(targetHarian); setEditTarget(true); }}>✏️</button>
            </>
          ) : (
            <>
              <input type="number" min="1" className="input input-bordered input-xs w-16 text-gray-800 bg-white" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} autoFocus />
              <button className="btn btn-primary btn-xs" onClick={handleSimpanTarget}>✓</button>
              <button className="btn btn-ghost btn-xs" onClick={() => setEditTarget(false)}>✕</button>
            </>
          )}
        </div>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "membaca" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("membaca")}><Calendar size={16} className="mr-2" /> Kalender Membaca</button>
        <button className={`tab ${activeTab === "murajaah" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("murajaah")}><RefreshCw size={16} className="mr-2" /> Murajaah Mingguan</button>
      </div>

      {activeTab === "membaca" && <KalenderMembaca hafalanMembaca={hafalanMembaca} targetHarian={targetHarian} juzAktif={juzAktif} onUpdateMembaca={(u) => { setHafalanMembaca(u); simpanSettings({ hafalanMembaca: u }); }} />}
      {activeTab === "murajaah" && <MurajaahMingguan hafalanMurajaah={hafalanMurajaah} jenisKesalahanList={jenisKesalahanList} onUpdateMurajaah={(u) => { setHafalanMurajaah(u); simpanSettings({ hafalanMurajaah: u }); }} />}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Library size={18} /> Daftar Juz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allJuz.map((juz) => {
            const halamanSelesai = progressSemuaJuz[juz.id] || 0;
            const totalHalaman = hitungTotalHalamanJuz(juz.id);
            const pct = totalHalaman > 0 ? Math.min(100, Math.round((halamanSelesai / totalHalaman) * 100)) : 0;
            const isAktif = juz.id === juzAktif;

            return (
              <div key={juz.id} className={`card bg-white shadow border hover:shadow-lg transition cursor-pointer ${isAktif ? "border-2 border-blue-600" : "border-gray-200"}`} onClick={() => { setJuzAktif(juz.id); simpanSettings({ hafalanJuzAktif: juz.id }); router.push(`/dashboard/hafalan/${juz.id}`); }}>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="card-title text-base text-gray-800">{juz.label}</h3>
                    {isAktif && <span className="badge badge-primary badge-sm">Aktif</span>}
                  </div>
                  <progress className="progress progress-primary w-full h-2" value={pct} max="100" />
                  <p className="text-xs text-gray-500 mt-1">{halamanSelesai} / {totalHalaman} halaman ({pct}%)</p>
                  <p className="text-xs text-gray-500">{juz.children?.length || 0} bagian</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}