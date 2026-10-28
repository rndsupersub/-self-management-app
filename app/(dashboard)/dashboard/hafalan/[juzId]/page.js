// app/(dashboard)/dashboard/hafalan/[juzId]/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import MurajaahMingguan from "@/components/MurajaahMingguan";
import TalaqyMilestone from "@/components/TalaqyMilestone";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_JENIS_KESALAHAN, hitungProgressJuz, hitungTotalHalamanJuz } from "@/lib/hafalanData";
import { BookOpen, Home, Library, Target, RefreshCw, List, ChevronLeft, ChevronRight } from "lucide-react";

export default function HafalanJuzPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("surat");
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanTalaqy, setHafalanTalaqy] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(DEFAULT_JENIS_KESALAHAN);

  const router = useRouter();
  const params = useParams();
  const juzId = params.juzId;

  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];
  const juzIndex = allJuz.findIndex((j) => j.id === juzId);
  const juzData = allJuz[juzIndex];
  const suratList = juzData?.children || [];
  const juzPrev = juzIndex > 0 ? allJuz[juzIndex - 1] : null;
  const juzNext = juzIndex < allJuz.length - 1 ? allJuz[juzIndex + 1] : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hafalanMembaca) setHafalanMembaca(data.hafalanMembaca);
        if (data.hafalanMurajaah) setHafalanMurajaah(data.hafalanMurajaah);
        if (data.hafalanTalaqy) setHafalanTalaqy(data.hafalanTalaqy);
        if (data.hafalanJenisKesalahan) setJenisKesalahanList(data.hafalanJenisKesalahan);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanSettings = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const halamanSelesai = useMemo(() => hitungProgressJuz(hafalanMembaca, juzId), [hafalanMembaca, juzId]);
  const totalHalaman = hitungTotalHalamanJuz(juzId);
  const persen = totalHalaman > 0 ? Math.min(100, Math.round((halamanSelesai / totalHalaman) * 100)) : 0;

  const getStatusSurat = (suratId) => {
    const entries = Object.values(hafalanMembaca || {});
    return !!entries.find((e) => e.suratId === suratId && e.sudah === true);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!juzData) return <div className="p-6 text-center">Juz tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/hafalan")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><BookOpen size={14} /> Hafalan</a></li>
          <li className="flex items-center gap-1"><Library size={14} /> {juzData.label}</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2" data-html2canvas-ignore="true">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => juzPrev && router.push(`/dashboard/hafalan/${juzPrev.id}`)} disabled={!juzPrev}><ChevronLeft size={18} /></button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Library className="text-primary" size={24} /> {juzData.label}</h1>
          <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => juzNext && router.push(`/dashboard/hafalan/${juzNext.id}`)} disabled={!juzNext}><ChevronRight size={18} /></button>
        </div>
        <select className="select select-bordered select-sm text-gray-800 bg-white" value={juzId} onChange={(e) => router.push(`/dashboard/hafalan/${e.target.value}`)}>
          {allJuz.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
        </select>
      </div>

      <div className="card bg-white shadow border border-gray-200 mb-4">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800">Progress Juz</h3>
            <span className="badge badge-primary badge-sm font-bold">{persen}%</span>
          </div>
          <progress className="progress progress-primary w-full h-3" value={persen} max="100" />
          <p className="text-xs text-gray-500 mt-2">{halamanSelesai} / {totalHalaman} halaman</p>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "surat" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("surat")}><List size={16} className="mr-2" /> Surat ({suratList.length})</button>
        <button className={`tab ${activeTab === "murajaah" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("murajaah")}><RefreshCw size={16} className="mr-2" /> Murajaah</button>
        <button className={`tab ${activeTab === "talaqy" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("talaqy")}><Target size={16} className="mr-2" /> Talaqy</button>
      </div>

      {activeTab === "surat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suratList.map((surat) => {
            const sudah = getStatusSurat(surat.id);
            return (
              <div key={surat.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/hafalan/${juzId}/${surat.id}`)}>
                <div className="card-body p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">{surat.label}</h3>
                    <span className={`badge badge-sm flex-shrink-0 ${sudah ? "badge-success" : "badge-ghost"}`}>{sudah ? "✅" : "⏳"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === "murajaah" && <MurajaahMingguan hafalanMurajaah={hafalanMurajaah} jenisKesalahanList={jenisKesalahanList} onUpdateMurajaah={(u) => { setHafalanMurajaah(u); simpanSettings({ hafalanMurajaah: u }); }} />}
      {activeTab === "talaqy" && <TalaqyMilestone juzId={juzId} hafalanMembaca={hafalanMembaca} hafalanTalaqy={hafalanTalaqy} jenisKesalahanList={jenisKesalahanList} onUpdateTalaqy={(u) => { setHafalanTalaqy(u); simpanSettings({ hafalanTalaqy: u }); }} />}
    </div>
  );
}