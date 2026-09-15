// app/(dashboard)/dashboard/hafalan/[juzId]/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import MurajaahMingguan from "@/components/MurajaahMingguan";
import TalaqyMilestone from "@/components/TalaqyMilestone";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_TARGET_HARIAN,
  DEFAULT_JENIS_KESALAHAN,
  hitungProgressJuz,
  hitungTotalHalamanJuz,
} from "@/lib/hafalanData";

export default function HafalanJuzPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("surat");

  // Hafalan data
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanTalaqy, setHafalanTalaqy] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(
    DEFAULT_JENIS_KESALAHAN
  );

  const router = useRouter();
  const params = useParams();
  const juzId = params.juzId;

  // Ambil daftar semua juz
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];
  const juzIndex = allJuz.findIndex((j) => j.id === juzId);
  const juzData = allJuz[juzIndex];
  const suratList = juzData?.children || [];

  // Juz sebelumnya & berikutnya
  const juzPrev = juzIndex > 0 ? allJuz[juzIndex - 1] : null;
  const juzNext = juzIndex < allJuz.length - 1 ? allJuz[juzIndex + 1] : null;

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

        if (
          data.hafalanMembaca &&
          typeof data.hafalanMembaca === "object" &&
          !Array.isArray(data.hafalanMembaca)
        ) {
          setHafalanMembaca(data.hafalanMembaca);
        }

        if (
          data.hafalanMurajaah &&
          typeof data.hafalanMurajaah === "object" &&
          !Array.isArray(data.hafalanMurajaah)
        ) {
          setHafalanMurajaah(data.hafalanMurajaah);
        }

        if (
          data.hafalanTalaqy &&
          typeof data.hafalanTalaqy === "object" &&
          !Array.isArray(data.hafalanTalaqy)
        ) {
          setHafalanTalaqy(data.hafalanTalaqy);
        }

        if (
          data.hafalanJenisKesalahan &&
          Array.isArray(data.hafalanJenisKesalahan)
        ) {
          setJenisKesalahanList(data.hafalanJenisKesalahan);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [juzId]);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanSettings = async (updates) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  const handleUpdateMurajaah = async (updated) => {
    setHafalanMurajaah(updated);
    await simpanSettings({ hafalanMurajaah: updated });
  };

  const handleUpdateTalaqy = async (updated) => {
    setHafalanTalaqy(updated);
    await simpanSettings({ hafalanTalaqy: updated });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ========== HITUNG PROGRESS JUZ ==========
  const halamanSelesai = useMemo(() => {
    return hitungProgressJuz(hafalanMembaca, juzId);
  }, [hafalanMembaca, juzId]);

  const totalHalaman = hitungTotalHalamanJuz(juzId);
  const persen =
    totalHalaman > 0
      ? Math.min(100, Math.round((halamanSelesai / totalHalaman) * 100))
      : 0;

  // ========== CEK STATUS SURAT ==========
  const getStatusSurat = (suratId) => {
    // Cek dari hafalanMembaca - cari entry yang suratId-nya ini dan sudah=true
    const entries = Object.values(hafalanMembaca || {});
    const found = entries.find(
      (e) => e.suratId === suratId && e.sudah === true
    );
    return !!found;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!juzData) {
    return (
      <div className="h-screen flex flex-col bg-base-200">
        <div className="navbar bg-base-100 shadow px-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">🌙 Self Management</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm mb-4">Juz tidak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push("/dashboard/hafalan")}
              >
                ← Balik ke Hafalan
              </button>
            </div>
          </div>
        </div>
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
              <li>
                <a
                  onClick={() => router.push("/dashboard/hafalan")}
                  className="cursor-pointer"
                >
                  📖 Hafalan
                </a>
              </li>
              <li>{juzData.label}</li>
            </ul>
          </div>

          {/* Header Juz + Navigasi */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() => juzPrev && router.push(`/dashboard/hafalan/${juzPrev.id}`)}
                disabled={!juzPrev}
                title={juzPrev ? `Ke ${juzPrev.label}` : "Juz pertama"}
              >
                ‹
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {juzData.label}
              </h1>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() => juzNext && router.push(`/dashboard/hafalan/${juzNext.id}`)}
                disabled={!juzNext}
                title={juzNext ? `Ke ${juzNext.label}` : "Juz terakhir"}
              >
                ›
              </button>
            </div>

            {/* Dropdown pilih juz */}
            <select
              className="select select-bordered select-sm text-gray-800 bg-white"
              value={juzId}
              onChange={(e) =>
                router.push(`/dashboard/hafalan/${e.target.value}`)
              }
            >
              {allJuz.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Juz */}
          <div className="card bg-white shadow border border-gray-200 mb-4">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-800">
                  📊 Progress Juz
                </h3>
                <span className="badge badge-primary badge-sm font-bold">
                  {persen}%
                </span>
              </div>
              <progress
                className="progress progress-primary w-full h-3"
                value={persen}
                max="100"
              />
              <p className="text-xs text-gray-500 mt-2">
                {halamanSelesai} / {totalHalaman} halaman
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "surat"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("surat")}
            >
              📋 Surat ({suratList.length})
            </button>
            <button
              className={`tab ${
                activeTab === "murajaah"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("murajaah")}
            >
              🔄 Murajaah
            </button>
            <button
              className={`tab ${
                activeTab === "talaqy"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("talaqy")}
            >
              🎯 Talaqy
            </button>
          </div>

          {/* ========== TAB SURAT ========== */}
          {activeTab === "surat" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suratList.map((surat) => {
                const sudah = getStatusSurat(surat.id);
                return (
                  <div
                    key={surat.id}
                    className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/hafalan/${juzId}/${surat.id}`)
                    }
                  >
                    <div className="card-body p-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
                          {surat.label}
                        </h3>
                        <span
                          className={`badge badge-sm flex-shrink-0 ${
                            sudah ? "badge-success" : "badge-ghost"
                          }`}
                        >
                          {sudah ? "✅" : "⏳"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========== TAB MURAJAAN ========== */}
          {activeTab === "murajaah" && (
            <MurajaahMingguan
              hafalanMurajaah={hafalanMurajaah}
              jenisKesalahanList={jenisKesalahanList}
              onUpdateMurajaah={handleUpdateMurajaah}
            />
          )}

          {/* ========== TAB TALAQY ========== */}
          {activeTab === "talaqy" && (
            <TalaqyMilestone
              juzId={juzId}
              hafalanMembaca={hafalanMembaca}
              hafalanTalaqy={hafalanTalaqy}
              jenisKesalahanList={jenisKesalahanList}
              onUpdateTalaqy={handleUpdateTalaqy}
            />
          )}
        </div>
      </div>
    </div>
  );
}