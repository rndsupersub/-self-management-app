// app/(dashboard)/dashboard/keuangan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DashboardKeuangan from "@/components/DashboardKeuangan";
import KalenderTransaksi from "@/components/KalenderTransaksi";
import WalletManager from "@/components/WalletManager";
import GoalsManager from "@/components/GoalsManager";
import SettingKeuangan from "@/components/SettingKeuangan";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING, DEFAULT_SUMBER_PEMASUKAN, DEFAULT_KATEGORI } from "@/lib/keuanganData";

export default function KeuanganPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [dompetList, setDompetList] = useState(DEFAULT_DOMPET);
  const [goalsList, setGoalsList] = useState(DEFAULT_GOALS);
  const [keuanganTransaksi, setKeuanganTransaksi] = useState({});
  const [setting, setSetting] = useState(DEFAULT_SETTING);
  const [sumberPemasukanList, setSumberPemasukanList] = useState(DEFAULT_SUMBER_PEMASUKAN);
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI);

  const router = useRouter();

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.keuanganDompet) setDompetList(data.keuanganDompet);
        if (data.keuanganGoals) setGoalsList(data.keuanganGoals);
        if (data.keuanganTransaksi) setKeuanganTransaksi(data.keuanganTransaksi);
        if (data.keuanganSetting) setSetting({ ...DEFAULT_SETTING, ...data.keuanganSetting });
        if (data.keuanganSumberPemasukan) setSumberPemasukanList(data.keuanganSumberPemasukan);
        if (data.keuanganKategori) setKategoriList({ ...DEFAULT_KATEGORI, ...data.keuanganKategori });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanKeuangan = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-sm breadcrumbs mb-4" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a></li>
          <li>💰 Keuangan</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800">💰 Keuangan</h1>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit flex-wrap" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "dashboard" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
        <button className={`tab ${activeTab === "transaksi" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("transaksi")}>📝 Input Transaksi</button>
        <button className={`tab ${activeTab === "dompet" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("dompet")}>👛 Kelola Dompet</button>
        <button className={`tab ${activeTab === "goals" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("goals")}>🎯 Kelola Goals</button>
        <button className={`tab ${activeTab === "setting" ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab("setting")}>⚙️ Setting</button>
      </div>

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`Keuangan_${activeTab}_${today}.pdf`} title={`Keuangan - ${activeTab}`} />
        </div>

        {activeTab === "dashboard" && <DashboardKeuangan dompetList={dompetList} goalsList={goalsList} keuanganTransaksi={keuanganTransaksi} setting={setting} />}
        {activeTab === "transaksi" && <KalenderTransaksi keuanganTransaksi={keuanganTransaksi} dompetList={dompetList} kategoriList={kategoriList} onUpdateTransaksi={(u) => { setKeuanganTransaksi(u); simpanKeuangan({ keuanganTransaksi: u }); }} />}
        {activeTab === "dompet" && <WalletManager dompetList={dompetList} onUpdateDompetList={(u) => { setDompetList(u); simpanKeuangan({ keuanganDompet: u }); }} />}
        {activeTab === "goals" && <GoalsManager goalsList={goalsList} dompetList={dompetList} keuanganTransaksi={keuanganTransaksi} onUpdateGoalsList={(u) => { setGoalsList(u); simpanKeuangan({ keuanganGoals: u }); }} />}
        {activeTab === "setting" && <SettingKeuangan setting={setting} sumberPemasukanList={sumberPemasukanList} kategoriList={kategoriList} onUpdateSetting={(u) => { setSetting(u); simpanKeuangan({ keuanganSetting: u }); }} onUpdateSumberPemasukan={(u) => { setSumberPemasukanList(u); simpanKeuangan({ keuanganSumberPemasukan: u }); }} onUpdateKategori={(u) => { setKategoriList(u); simpanKeuangan({ keuanganKategori: u }); }} />}
      </div>
    </div>
  );
}