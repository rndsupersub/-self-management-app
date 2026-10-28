// app/(dashboard)/dashboard/olahraga/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KalenderOlahraga from "@/components/KalenderOlahraga";
import EvaluasiMingguan from "@/components/EvaluasiMingguan";
import { Activity, Home, Briefcase, Calendar } from "lucide-react";

export default function OlahragaPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kalender");
  const [olahraga, setOlahraga] = useState({ minggu: [], harian: {}, fieldEvaluasi: [] });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.olahraga) {
          setOlahraga({
            minggu: data.olahraga.minggu || [],
            harian: data.olahraga.harian || {},
            fieldEvaluasi: data.olahraga.fieldEvaluasi || [],
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanOlahraga = async (newOlahraga) => {
    setOlahraga(newOlahraga);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { olahraga: newOlahraga }, { merge: true });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Activity size={14} /> Olahraga</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-4" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-primary" size={24} /> Olahraga
        </h1>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("kalender")}>
          <Calendar size={16} className="mr-2" /> Kalender
        </button>
        <button className={`tab ${activeTab === "evaluasi" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("evaluasi")}>
          <Activity size={16} className="mr-2" /> Evaluasi Mingguan
        </button>
      </div>

      {activeTab === "kalender" && (
        <KalenderOlahraga 
          harian={olahraga.harian || {}} 
          onUpdateHarian={(u) => simpanOlahraga({ ...olahraga, harian: u })} 
        />
      )}
      {activeTab === "evaluasi" && (
        <EvaluasiMingguan 
          minggu={olahraga.minggu || []} 
          fieldEvaluasi={olahraga.fieldEvaluasi || []} 
          onUpdateMinggu={(u) => simpanOlahraga({ ...olahraga, minggu: u })} 
          onUpdateFieldEvaluasi={(u) => simpanOlahraga({ ...olahraga, fieldEvaluasi: u })} 
        />
      )}
    </div>
  );
}