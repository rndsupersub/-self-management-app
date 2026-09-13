// app/(dashboard)/dashboard/olahraga/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderOlahraga from "@/components/KalenderOlahraga";
import EvaluasiMingguan from "@/components/EvaluasiMingguan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_OLAHRAGA,
  DEFAULT_FIELD_EVALUASI,
} from "@/lib/olahragaData";

export default function OlahragaPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender");

  // Data olahraga dari Firestore
  const [olahraga, setOlahraga] = useState(DEFAULT_OLAHRAGA);

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

        // Load activities
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Load olahraga
        if (data.olahraga && typeof data.olahraga === "object") {
          setOlahraga({
            minggu: data.olahraga.minggu || [],
            harian: data.olahraga.harian || {},
            fieldEvaluasi:
              data.olahraga.fieldEvaluasi || DEFAULT_FIELD_EVALUASI,
          });
        } else {
          await setDoc(docRef, { olahraga: DEFAULT_OLAHRAGA }, { merge: true });
          setOlahraga(DEFAULT_OLAHRAGA);
        }
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          olahraga: DEFAULT_OLAHRAGA,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setOlahraga(DEFAULT_OLAHRAGA);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanOlahraga = async (newOlahraga) => {
    setOlahraga(newOlahraga);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { olahraga: newOlahraga }, { merge: true });
  };

  // ========== UPDATE HARIAN ==========
  const handleUpdateHarian = async (updatedHarian) => {
    const newOlahraga = { ...olahraga, harian: updatedHarian };
    await simpanOlahraga(newOlahraga);
  };

  // ========== UPDATE MINGGU ==========
  const handleUpdateMinggu = async (updatedMinggu) => {
    const newOlahraga = { ...olahraga, minggu: updatedMinggu };
    await simpanOlahraga(newOlahraga);
  };

  // ========== UPDATE FIELD EVALUASI ==========
  const handleUpdateFieldEvaluasi = async (updatedFields) => {
    const newOlahraga = { ...olahraga, fieldEvaluasi: updatedFields };
    await simpanOlahraga(newOlahraga);
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
              <li>🏃 Olahraga</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">🏃 Olahraga</h1>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("kalender")}
            >
              📅 Kalender
            </button>
            <button
              className={`tab ${
                activeTab === "evaluasi" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("evaluasi")}
            >
              📊 Evaluasi Mingguan
            </button>
          </div>

          {/* Content */}
          {activeTab === "kalender" && (
            <KalenderOlahraga
              harian={olahraga.harian || {}}
              onUpdateHarian={handleUpdateHarian}
            />
          )}

          {activeTab === "evaluasi" && (
            <EvaluasiMingguan
              minggu={olahraga.minggu || []}
              fieldEvaluasi={olahraga.fieldEvaluasi || DEFAULT_FIELD_EVALUASI}
              onUpdateMinggu={handleUpdateMinggu}
              onUpdateFieldEvaluasi={handleUpdateFieldEvaluasi}
            />
          )}
        </div>
      </div>
    </div>
  );
}