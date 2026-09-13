// app/(dashboard)/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import Schedule from "@/components/Schedule";
import Finance from "@/components/Finance";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_JADWAL } from "@/lib/jadwalData";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [jadwalUser, setJadwalUser] = useState(DEFAULT_JADWAL);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        if (data.jadwalUser && data.jadwalUser.kerja && data.jadwalUser.minggu) {
          setJadwalUser(data.jadwalUser);
        } else {
          await setDoc(docRef, { jadwalUser: DEFAULT_JADWAL }, { merge: true });
          setJadwalUser(DEFAULT_JADWAL);
        }

        if (typeof data.dailyProgress === "object" && !Array.isArray(data.dailyProgress)) {
          setProgress(data.dailyProgress || {});
        } else {
          await setDoc(docRef, { dailyProgress: {} }, { merge: true });
          setProgress({});
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          jadwalUser: DEFAULT_JADWAL,
          dailyProgress: {},
        });
        setActivities(DEFAULT_ACTIVITIES);
        setJadwalUser(DEFAULT_JADWAL);
        setProgress({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== UPDATE PROGRESS ==========
  const updateProgress = async (date, field, value) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const dayData = progress[date] || {};
    dayData[field] = { ...dayData[field], ...value };
    const newProgress = { ...progress, [date]: dayData };
    await setDoc(docRef, { dailyProgress: newProgress }, { merge: true });
    setProgress(newProgress);
  };

  // ========== UPDATE JADWAL ==========
  const updateJadwal = async (newJadwal) => {
    if (!user) return;
    setJadwalUser(newJadwal);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { jadwalUser: newJadwal }, { merge: true });
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
          className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}
        >
          <Sidebar
            activities={activities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Jadwal */}
          <Schedule
            jadwalUser={jadwalUser}
            onUpdateJadwal={updateJadwal}
            progress={progress}
            onUpdateProgress={updateProgress}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <div className="text-center text-base-content/50 mt-10">
            <p className="text-2xl mb-2">📋</p>
            <p>Pilih aktivitas dari sidebar</p>
          </div>

          {/* Keuangan */}
          <Finance />
        </div>
      </div>
    </div>
  );
}