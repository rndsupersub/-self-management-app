// app/(dashboard)/dashboard/keuangan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, runTransaction, deleteField } from "firebase/firestore";
import DashboardKeuangan from "@/components/DashboardKeuangan";
import RiwayatKeuangan from "@/components/RiwayatKeuangan";
import KalenderTransaksi from "@/components/KalenderTransaksi";
import WalletManager from "@/components/WalletManager";
import GoalsManager from "@/components/GoalsManager";
import SettingKeuangan from "@/components/SettingKeuangan";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING, DEFAULT_SUMBER_PEMASUKAN, DEFAULT_KATEGORI, getKategoriList, terapkanAksiTransaksi } from "@/lib/keuanganData";
import { Home, Wallet, BarChart3, Pencil, Target, Settings, History } from "lucide-react";

export default function KeuanganPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Tanggal lokal (bukan toISOString) — di WIB malam, UTC sudah ganti hari.
  const [today] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  const [dompetList, setDompetList] = useState(DEFAULT_DOMPET);
  const [goalsList, setGoalsList] = useState(DEFAULT_GOALS);
  const [keuanganTransaksi, setKeuanganTransaksi] = useState({});
  const [setting, setSetting] = useState(DEFAULT_SETTING);
  const [sumberPemasukanList, setSumberPemasukanList] = useState(DEFAULT_SUMBER_PEMASUKAN);
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI);

  const router = useRouter();

  useEffect(() => {
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
        if (data.keuanganKategori) setKategoriList(getKategoriList(data.keuanganKategori));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanKeuangan = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  // Transaksi disimpan sebagai aksi di dalam transaksi Firestore, dibaca dari
  // data TERBARU server. Ini yang bikin edit/hapus nggak balik ke angka lama:
  // `merge: true` biasa mempertahankan key tanggal yang kita hapus, dan
  // menulis peta penuh dari prop bisa menimpa perubahan yang lebih baru.
  const simpanAksiTransaksi = async (aksi) => {
    if (!user) return false;
    const docRef = doc(db, "users", user.uid);
    try {
      let hasil = null;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);
        const lama = snap.data()?.keuanganTransaksi || {};
        hasil = terapkanAksiTransaksi(lama, aksi);

        // Key tanggal yang jadi kosong harus dihapus eksplisit, karena merge
        // cuma memperbarui field yang dikirim.
        const payload = { ...hasil };
        Object.keys(lama).forEach((tanggal) => {
          if (!(tanggal in hasil)) payload[tanggal] = deleteField();
        });

        tx.set(docRef, { keuanganTransaksi: payload }, { merge: true });
      });

      if (hasil) setKeuanganTransaksi(hasil);
      return true;
    } catch (err) {
      console.error("[keuangan] gagal simpan transaksi:", err);
      // Jangan biarkan layar beda dengan server: tarik ulang data aslinya.
      try {
        const snap = await getDoc(docRef);
        setKeuanganTransaksi(snap.data()?.keuanganTransaksi || {});
      } catch (e) {
        console.error("[keuangan] gagal ambil ulang data:", e);
      }
      alert(
        `Transaksi gagal disimpan: ${err?.message || "koneksi bermasalah"}.\nData di layar sudah disamakan lagi dengan server.`
      );
      return false;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Wallet size={14} /> Keuangan</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Wallet className="text-primary" size={24}/> Keuangan</h1>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit flex-wrap" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "dashboard" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("dashboard")}><BarChart3 size={14} className="mr-1"/> Dashboard</button>
        <button className={`tab ${activeTab === "transaksi" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("transaksi")}><Pencil size={14} className="mr-1"/> Input Transaksi</button>
        <button className={`tab ${activeTab === "dompet" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("dompet")}><Wallet size={14} className="mr-1"/> Kelola Dompet</button>
        <button className={`tab ${activeTab === "goals" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("goals")}><Target size={14} className="mr-1"/> Kelola Goals</button>
        <button className={`tab ${activeTab === "riwayat" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("riwayat")}><History size={14} className="mr-1"/> Riwayat</button>
        <button className={`tab ${activeTab === "setting" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("setting")}><Settings size={14} className="mr-1"/> Setting</button>
      </div>

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`Keuangan_${activeTab}_${today}.pdf`} title={`Keuangan - ${activeTab}`} />
        </div>

        {activeTab === "dashboard" && <DashboardKeuangan dompetList={dompetList} goalsList={goalsList} keuanganTransaksi={keuanganTransaksi} setting={setting} kategoriList={kategoriList} />}
        {activeTab === "transaksi" && <KalenderTransaksi keuanganTransaksi={keuanganTransaksi} dompetList={dompetList} kategoriList={kategoriList} onSimpanTransaksi={simpanAksiTransaksi} />}
        {activeTab === "riwayat" && <RiwayatKeuangan keuanganTransaksi={keuanganTransaksi} kategoriList={kategoriList} dompetList={dompetList} />}
        {activeTab === "dompet" && <WalletManager dompetList={dompetList} onUpdateDompetList={(u) => { setDompetList(u); simpanKeuangan({ keuanganDompet: u }); }} />}
        {activeTab === "goals" && <GoalsManager goalsList={goalsList} dompetList={dompetList} keuanganTransaksi={keuanganTransaksi} onUpdateGoalsList={(u) => { setGoalsList(u); simpanKeuangan({ keuanganGoals: u }); }} />}
        {activeTab === "setting" && <SettingKeuangan setting={setting} sumberPemasukanList={sumberPemasukanList} kategoriList={kategoriList} onUpdateSetting={(u) => { setSetting(u); simpanKeuangan({ keuanganSetting: u }); }} onUpdateSumberPemasukan={(u) => { setSumberPemasukanList(u); simpanKeuangan({ keuanganSumberPemasukan: u }); }} onUpdateKategori={(u) => { setKategoriList(u); simpanKeuangan({ keuanganKategori: u }); }} />}
      </div>
    </div>
  );
}