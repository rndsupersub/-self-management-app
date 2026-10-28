// app/(dashboard)/dashboard/olahraga/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KalenderOlahraga from "@/components/KalenderOlahraga";
import EvaluasiMingguan from "@/components/EvaluasiMingguan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_OLAHRAGA, DEFAULT_FIELD_EVALUASI } from "@/lib/olahragaData";

export default function OlahragaPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kalender");
  const [olahraga, setOlahraga] = useState(DEFAULT_OLAHRAGA);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.olahraga && typeof data.olahraga === "object") {
          setOlahraga({
            minggu: data.olahraga.minggu || [],
            harian: data.olahraga.harian || {},
            fieldEvaluasi: data.olahraga.fieldEvaluasi || DEFAULT_FIELD_EVALUASI,
          });
        } else {
          await setDoc(docRef, { olahraga: DEFAULT_OLAHRAGA }, { merge: true });
          setOlahraga(DEFAULT_OLAHRAGA);
        }
      } else {
        await setDoc(docRef, { olahraga: DEFAULT_OLAHRAGA });
        setOlahraga(DEFAULT_OLAHRAGA);
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

  const handleUpdateHarian = async (updatedHarian) => await simpanOlahraga({ ...olahraga, harian: updatedHarian });
  const handleUpdateMinggu = async (updatedMinggu) => await simpanOlahraga({ ...olahraga, minggu: updatedMinggu });
  const handleUpdateFieldEvaluasi = async (updatedFields) => await simpanOlahraga({ ...olahraga, fieldEvaluasi: updatedFields });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a></li>
          <li>🏃 Olahraga</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-4" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800">🏃 Olahraga</h1>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("kalender")}>📅 Kalender</button>
        <button className={`tab ${activeTab === "evaluasi" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("evaluasi")}>📊 Evaluasi Mingguan</button>
      </div>

      {activeTab === "kalender" && <KalenderOlahraga harian={olahraga.harian || {}} onUpdateHarian={handleUpdateHarian} />}
      {activeTab === "evaluasi" && (
        <EvaluasiMingguan
          minggu={olahraga.minggu || []}
          fieldEvaluasi={olahraga.fieldEvaluasi || DEFAULT_FIELD_EVALUASI}
          onUpdateMinggu={handleUpdateMinggu}
          onUpdateFieldEvaluasi={handleUpdateFieldEvaluasi}
        />
      )}
    </div>
  );
}