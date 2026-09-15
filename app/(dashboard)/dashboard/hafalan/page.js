// app/(dashboard)/dashboard/hafalan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderMembaca from "@/components/KalenderMembaca";
import MurajaahMingguan from "@/components/MurajaahMingguan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_TARGET_HARIAN,
  DEFAULT_JENIS_KESALAHAN,
  hitungProgressSemuaJuz,
  hitungTotalHalamanJuz,
} from "@/lib/hafalanData";

export default function HafalanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("membaca");

  // Hafalan data
  const [targetHarian, setTargetHarian] = useState(DEFAULT_TARGET_HARIAN);
  const [juzAktif, setJuzAktif] = useState("juz_1");
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanTalaqy, setHafalanTalaqy] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(
    DEFAULT_JENIS_KESALAHAN
  );

  // Edit target state
  const [editTarget, setEditTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGET_HARIAN);

  const router = useRouter();

  // Ambil daftar semua juz
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];

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

        // Target Harian
        if (data.hafalanTargetHarian) {
          setTargetHarian(data.hafalanTargetHarian);
          setTargetInput(data.hafalanTargetHarian);
        } else {
          await setDoc(
            docRef,
            { hafalanTargetHarian: DEFAULT_TARGET_HARIAN },
            { merge: true }
          );
        }

        // Juz Aktif
        if (data.hafalanJuzAktif) {
          setJuzAktif(data.hafalanJuzAktif);
        } else {
          await setDoc(
            docRef,
            { hafalanJuzAktif: "juz_1" },
            { merge: true }
          );
        }

        // Hafalan Membaca
        if (
          data.hafalanMembaca &&
          typeof data.hafalanMembaca === "object" &&
          !Array.isArray(data.hafalanMembaca)
        ) {
          setHafalanMembaca(data.hafalanMembaca);
        } else {
          await setDoc(docRef, { hafalanMembaca: {} }, { merge: true });
          setHafalanMembaca({});
        }

        // Hafalan Murajaah
        if (
          data.hafalanMurajaah &&
          typeof data.hafalanMurajaah === "object" &&
          !Array.isArray(data.hafalanMurajaah)
        ) {
          setHafalanMurajaah(data.hafalanMurajaah);
        } else {
          await setDoc(docRef, { hafalanMurajaah: {} }, { merge: true });
          setHafalanMurajaah({});
        }

        // Hafalan Talaqy
        if (
          data.hafalanTalaqy &&
          typeof data.hafalanTalaqy === "object" &&
          !Array.isArray(data.hafalanTalaqy)
        ) {
          setHafalanTalaqy(data.hafalanTalaqy);
        } else {
          await setDoc(docRef, { hafalanTalaqy: {} }, { merge: true });
          setHafalanTalaqy({});
        }

        // Jenis Kesalahan
        if (
          data.hafalanJenisKesalahan &&
          Array.isArray(data.hafalanJenisKesalahan)
        ) {
          setJenisKesalahanList(data.hafalanJenisKesalahan);
        } else {
          await setDoc(
            docRef,
            { hafalanJenisKesalahan: DEFAULT_JENIS_KESALAHAN },
            { merge: true }
          );
        }
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          hafalanTargetHarian: DEFAULT_TARGET_HARIAN,
          hafalanJuzAktif: "juz_1",
          hafalanMembaca: {},
          hafalanMurajaah: {},
          hafalanTalaqy: {},
          hafalanJenisKesalahan: DEFAULT_JENIS_KESALAHAN,
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
  const simpanSettings = async (updates) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  // ========== UPDATE TARGET HARIAN ==========
  const handleSimpanTarget = async () => {
    const t = parseInt(targetInput);
    if (!t || t <= 0) return;
    setTargetHarian(t);
    await simpanSettings({ hafalanTargetHarian: t });
    setEditTarget(false);
  };

  // ========== UPDATE MEMBACA ==========
  const handleUpdateMembaca = async (updated) => {
    setHafalanMembaca(updated);
    await simpanSettings({ hafalanMembaca: updated });
  };

  // ========== UPDATE MURAJAAN ==========
  const handleUpdateMurajaah = async (updated) => {
    setHafalanMurajaah(updated);
    await simpanSettings({ hafalanMurajaah: updated });
  };

  // ========== UPDATE JUZ AKTIF ==========
  const handleSetJuzAktif = async (juzId) => {
    setJuzAktif(juzId);
    await simpanSettings({ hafalanJuzAktif: juzId });
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

  // ========== HITUNG PROGRESS SEMUA JUZ ==========
  const progressSemuaJuz = hitungProgressSemuaJuz(hafalanMembaca);

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
              <li>📖 Hafalan Qur'an</li>
            </ul>
          </div>

          {/* Header + Target */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              📖 Hafalan Qur'an
            </h1>
            <div className="flex items-center gap-2 bg-white rounded px-3 py-2 shadow border border-gray-200">
              <span className="text-xs font-semibold text-gray-600">
                🎯 Target Harian:
              </span>
              {!editTarget ? (
                <>
                  <span className="text-sm font-bold text-gray-800">
                    {targetHarian} halaman
                  </span>
                  <button
                    className="btn btn-ghost btn-xs text-gray-500"
                    onClick={() => {
                      setTargetInput(targetHarian);
                      setEditTarget(true);
                    }}
                    title="Edit target"
                  >
                    ✏️
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered input-xs w-16 text-gray-800 bg-white"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={handleSimpanTarget}
                  >
                    ✓
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditTarget(false)}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "membaca"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("membaca")}
            >
              📖 Kalender Membaca
            </button>
            <button
              className={`tab ${
                activeTab === "murajaah"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("murajaah")}
            >
              🔄 Murajaah Mingguan
            </button>
          </div>

          {/* Content */}
          {activeTab === "membaca" && (
            <KalenderMembaca
              hafalanMembaca={hafalanMembaca}
              targetHarian={targetHarian}
              juzAktif={juzAktif}
              onUpdateMembaca={handleUpdateMembaca}
            />
          )}

          {activeTab === "murajaah" && (
            <MurajaahMingguan
              hafalanMurajaah={hafalanMurajaah}
              jenisKesalahanList={jenisKesalahanList}
              onUpdateMurajaah={handleUpdateMurajaah}
            />
          )}

          {/* Daftar Juz */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              📚 Daftar Juz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allJuz.map((juz) => {
                const halamanSelesai = progressSemuaJuz[juz.id] || 0;
                const totalHalaman = hitungTotalHalamanJuz(juz.id);
                const pct =
                  totalHalaman > 0
                    ? Math.min(
                        100,
                        Math.round((halamanSelesai / totalHalaman) * 100)
                      )
                    : 0;
                const isAktif = juz.id === juzAktif;

                return (
                  <div
                    key={juz.id}
                    className={`card bg-white shadow border hover:shadow-lg transition cursor-pointer ${
                      isAktif ? "border-2 border-blue-600" : "border-gray-200"
                    }`}
                    onClick={() => {
                      handleSetJuzAktif(juz.id);
                      router.push(`/dashboard/hafalan/${juz.id}`);
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="card-title text-base text-gray-800">
                          {juz.label}
                        </h3>
                        {isAktif && (
                          <span className="badge badge-primary badge-sm">
                            Aktif
                          </span>
                        )}
                      </div>
                      <progress
                        className="progress progress-primary w-full h-2"
                        value={pct}
                        max="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {halamanSelesai} / {totalHalaman} halaman ({pct}%)
                      </p>
                      <p className="text-xs text-gray-500">
                        {juz.children?.length || 0} bagian
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}