// app/(dashboard)/dashboard/keuangan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Sidebar from "@/components/Sidebar";
import DashboardKeuangan from "@/components/DashboardKeuangan";
import KalenderTransaksi from "@/components/KalenderTransaksi";
import WalletManager from "@/components/WalletManager";
import GoalsManager from "@/components/GoalsManager";
import SettingKeuangan from "@/components/SettingKeuangan";

import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_DOMPET,
  DEFAULT_GOALS,
  DEFAULT_SETTING,
  DEFAULT_SUMBER_PEMASUKAN,
  DEFAULT_KATEGORI,
} from "@/lib/keuanganData";

export default function KeuanganPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Keuangan data
  const [dompetList, setDompetList] = useState(DEFAULT_DOMPET);
  const [goalsList, setGoalsList] = useState(DEFAULT_GOALS);
  const [keuanganTransaksi, setKeuanganTransaksi] = useState({});
  const [setting, setSetting] = useState(DEFAULT_SETTING);
  const [sumberPemasukanList, setSumberPemasukanList] = useState(
    DEFAULT_SUMBER_PEMASUKAN
  );
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI);

  const router = useRouter();

  // ========== LOAD USER DATA ==========
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

        // Activities
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(
            docRef,
            { activities: DEFAULT_ACTIVITIES },
            { merge: true }
          );
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Dompet
        if (data.keuanganDompet && Array.isArray(data.keuanganDompet)) {
          setDompetList(data.keuanganDompet);
        } else {
          await setDoc(
            docRef,
            { keuanganDompet: DEFAULT_DOMPET },
            { merge: true }
          );
          setDompetList(DEFAULT_DOMPET);
        }

        // Goals
        if (data.keuanganGoals && Array.isArray(data.keuanganGoals)) {
          setGoalsList(data.keuanganGoals);
        } else {
          await setDoc(
            docRef,
            { keuanganGoals: DEFAULT_GOALS },
            { merge: true }
          );
          setGoalsList(DEFAULT_GOALS);
        }

        // Transaksi
        if (
          data.keuanganTransaksi &&
          typeof data.keuanganTransaksi === "object" &&
          !Array.isArray(data.keuanganTransaksi)
        ) {
          setKeuanganTransaksi(data.keuanganTransaksi);
        } else {
          await setDoc(
            docRef,
            { keuanganTransaksi: {} },
            { merge: true }
          );
          setKeuanganTransaksi({});
        }

        // Setting
        if (
          data.keuanganSetting &&
          typeof data.keuanganSetting === "object"
        ) {
          setSetting({
            ...DEFAULT_SETTING,
            ...data.keuanganSetting,
          });
        } else {
          await setDoc(
            docRef,
            { keuanganSetting: DEFAULT_SETTING },
            { merge: true }
          );
          setSetting(DEFAULT_SETTING);
        }

        // Sumber Pemasukan
        if (
          data.keuanganSumberPemasukan &&
          Array.isArray(data.keuanganSumberPemasukan)
        ) {
          setSumberPemasukanList(data.keuanganSumberPemasukan);
        } else {
          await setDoc(
            docRef,
            { keuanganSumberPemasukan: DEFAULT_SUMBER_PEMASUKAN },
            { merge: true }
          );
          setSumberPemasukanList(DEFAULT_SUMBER_PEMASUKAN);
        }

        // Kategori
        if (
          data.keuanganKategori &&
          typeof data.keuanganKategori === "object"
        ) {
          setKategoriList({
            ...DEFAULT_KATEGORI,
            ...data.keuanganKategori,
          });
        } else {
          await setDoc(
            docRef,
            { keuanganKategori: DEFAULT_KATEGORI },
            { merge: true }
          );
          setKategoriList(DEFAULT_KATEGORI);
        }
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          keuanganDompet: DEFAULT_DOMPET,
          keuanganGoals: DEFAULT_GOALS,
          keuanganTransaksi: {},
          keuanganSetting: DEFAULT_SETTING,
          keuanganSumberPemasukan: DEFAULT_SUMBER_PEMASUKAN,
          keuanganKategori: DEFAULT_KATEGORI,
        });
        setActivities(DEFAULT_ACTIVITIES);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanKeuangan = async (updates) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  // ========== HANDLER DOMPET ==========
  const handleUpdateDompet = async (updated) => {
    setDompetList(updated);
    await simpanKeuangan({ keuanganDompet: updated });
  };

  // ========== HANDLER GOALS ==========
  const handleUpdateGoals = async (updated) => {
    setGoalsList(updated);
    await simpanKeuangan({ keuanganGoals: updated });
  };

  // ========== HANDLER TRANSAKSI ==========
  const handleUpdateTransaksi = async (updated) => {
    setKeuanganTransaksi(updated);
    await simpanKeuangan({ keuanganTransaksi: updated });
  };

  // ========== HANDLER SETTING ==========
  const handleUpdateSetting = async (updated) => {
    setSetting(updated);
    await simpanKeuangan({ keuanganSetting: updated });
  };

  // ========== HANDLER SUMBER PEMASUKAN ==========
  const handleUpdateSumberPemasukan = async (updated) => {
    setSumberPemasukanList(updated);
    await simpanKeuangan({ keuanganSumberPemasukan: updated });
  };

  // ========== HANDLER KATEGORI ==========
  const handleUpdateKategori = async (updated) => {
    setKategoriList(updated);
    await simpanKeuangan({ keuanganKategori: updated });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? "w-12" : "w-64"
          } transition-all duration-300 bg-base-100`}
        >
          <Sidebar
            activities={activities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li>
                <a
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  🏠 Dashboard
                </a>
              </li>
              <li>💰 Keuangan</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h1 className="text-2xl font-bold text-gray-800">💰 Keuangan</h1>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit flex-wrap">
            <button
              className={`tab ${
                activeTab === "dashboard"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`tab ${
                activeTab === "transaksi"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("transaksi")}
            >
              📝 Input Transaksi
            </button>
            <button
              className={`tab ${
                activeTab === "dompet"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("dompet")}
            >
              👛 Kelola Dompet
            </button>
            <button
              className={`tab ${
                activeTab === "goals"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("goals")}
            >
              🎯 Kelola Goals
            </button>
            <button
              className={`tab ${
                activeTab === "setting"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("setting")}
            >
              ⚙️ Setting
            </button>
          </div>

          {/* ========== TAB DASHBOARD ========== */}
          {activeTab === "dashboard" && (
            <DashboardKeuangan
              dompetList={dompetList}
              goalsList={goalsList}
              keuanganTransaksi={keuanganTransaksi}
              setting={setting}
            />
          )}

          {/* ========== TAB INPUT TRANSAKSI ========== */}
          {activeTab === "transaksi" && (
            <KalenderTransaksi
              keuanganTransaksi={keuanganTransaksi}
              dompetList={dompetList}
              kategoriList={kategoriList}
              onUpdateTransaksi={handleUpdateTransaksi}
            />
          )}

          {/* ========== TAB KELOLA DOMPET ========== */}
          {activeTab === "dompet" && (
            <WalletManager
              dompetList={dompetList}
              onUpdateDompetList={handleUpdateDompet}
            />
          )}

          {/* ========== TAB KELOLA GOALS ========== */}
          {activeTab === "goals" && (
            <GoalsManager
              goalsList={goalsList}
              dompetList={dompetList}
              keuanganTransaksi={keuanganTransaksi}
              onUpdateGoalsList={handleUpdateGoals}
            />
          )}

          {/* ========== TAB SETTING ========== */}
          {activeTab === "setting" && (
            <SettingKeuangan
              setting={setting}
              sumberPemasukanList={sumberPemasukanList}
              kategoriList={kategoriList}
              onUpdateSetting={handleUpdateSetting}
              onUpdateSumberPemasukan={handleUpdateSumberPemasukan}
              onUpdateKategori={handleUpdateKategori}
            />
          )}
        </div>
      </div>
    </div>
  );
}