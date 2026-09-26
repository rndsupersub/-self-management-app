// app/(dashboard)/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Sidebar from "@/components/Sidebar";
import Schedule from "@/components/Schedule";
import RingkasanKeuangan from "@/components/RingkasanKeuangan";
import MenuManager from "@/components/MenuManager";

import { DEFAULT_ACTIVITIES, DEFAULT_MENUS } from "@/lib/defaultData";
import { DEFAULT_JADWAL } from "@/lib/jadwalData";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING } from "@/lib/keuanganData";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [jadwalUser, setJadwalUser] = useState(DEFAULT_JADWAL);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [dompetList, setDompetList] = useState(DEFAULT_DOMPET);
  const [goalsList, setGoalsList] = useState(DEFAULT_GOALS);
  const [keuanganTransaksi, setKeuanganTransaksi] = useState({});
  const [keuanganSetting, setKeuanganSetting] = useState(DEFAULT_SETTING);

  const router = useRouter();

  // ========== BUILD MENUS DARI OLD DATA ==========
  const buildMenusFromOldData = (activitiesLama) => {
    const menusBaru = DEFAULT_MENUS.map((m) => ({ ...m }));
    (activitiesLama || []).forEach((act) => {
      if (!menusBaru.find((m) => m.id === act.id)) {
        menusBaru.push({
          id: act.id,
          label: act.label,
          type: "standard",
          required: false,
          visible: true,
          order: menusBaru.length,
        });
      }
    });
    return menusBaru;
  };

  // ========== MIGRASI NPD → BEDAH BUKU + HAPUS MANDARIN ==========
  const runMigrasi = (data) => {
    let perluSimpan = false;
    const updates = {};

    let activitiesBaru = data.activities;
    if (Array.isArray(activitiesBaru)) {
      const adaNpd = activitiesBaru.some((a) => a.id === "npd");
      const adaMandarin = activitiesBaru.some((a) => a.id === "mandarin");
      if (adaNpd || adaMandarin) {
        activitiesBaru = activitiesBaru.filter(
          (a) => a.id !== "npd" && a.id !== "mandarin"
        );
        updates.activities = activitiesBaru;
        perluSimpan = true;
      }
    }

    let jadwalBaru = data.jadwalUser;
    if (jadwalBaru?.kerja && Array.isArray(jadwalBaru.kerja)) {
      const adaNpdJadwal = jadwalBaru.kerja.some((item) => item.id === "npd");
      if (adaNpdJadwal) {
        jadwalBaru = {
          ...jadwalBaru,
          kerja: jadwalBaru.kerja.map((item) =>
            item.id === "npd"
              ? { ...item, id: "bedah-buku", label: "📚 Bedah Buku", unit: "10 halaman" }
              : item
          ),
        };
        updates.jadwalUser = jadwalBaru;
        perluSimpan = true;
      }
    }

    let progressBaru = data.dailyProgress;
    if (progressBaru && typeof progressBaru === "object") {
      let adaNpdProgress = false;
      const progressUpdated = { ...progressBaru };
      Object.keys(progressUpdated).forEach((tanggal) => {
        const dayData = progressUpdated[tanggal];
        if (dayData && dayData.npd) {
          adaNpdProgress = true;
          const newDayData = { ...dayData };
          if (!newDayData["bedah-buku"]) newDayData["bedah-buku"] = newDayData.npd;
          delete newDayData.npd;
          progressUpdated[tanggal] = newDayData;
        }
      });
      if (adaNpdProgress) {
        updates.dailyProgress = progressUpdated;
        progressBaru = progressUpdated;
        perluSimpan = true;
      }
    }

    // === MIGRASI MENUS ===
    let menusBaru = data.menus;
    if (!Array.isArray(menusBaru) || menusBaru.length === 0) {
      menusBaru = buildMenusFromOldData(activitiesBaru);
      updates.menus = menusBaru;
      perluSimpan = true;
    }

    // === MENUS ARSIP (default empty) ===
    let menusArsip = data.menusArsip;
    if (!Array.isArray(menusArsip)) {
      menusArsip = [];
      updates.menusArsip = menusArsip;
      perluSimpan = true;
    }

    return {
      perluSimpan,
      updates,
      activitiesBaru,
      jadwalBaru,
      progressBaru,
      menusBaru,
      menusArsip,
    };
  };

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
        const {
          perluSimpan,
          updates,
          activitiesBaru,
          jadwalBaru,
          progressBaru,
          menusBaru,
        } = runMigrasi(data);

        if (perluSimpan) await setDoc(docRef, updates, { merge: true });

        if (Array.isArray(activitiesBaru)) setActivities(activitiesBaru);
        else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        if (Array.isArray(menusBaru)) setMenus(menusBaru);
        else {
          await setDoc(docRef, { menus: DEFAULT_MENUS }, { merge: true });
          setMenus(DEFAULT_MENUS);
        }

        if (jadwalBaru?.kerja && jadwalBaru?.minggu) setJadwalUser(jadwalBaru);
        else {
          await setDoc(docRef, { jadwalUser: DEFAULT_JADWAL }, { merge: true });
          setJadwalUser(DEFAULT_JADWAL);
        }

        if (progressBaru && typeof progressBaru === "object" && !Array.isArray(progressBaru))
          setProgress(progressBaru || {});
        else {
          await setDoc(docRef, { dailyProgress: {} }, { merge: true });
          setProgress({});
        }

        if (data.keuanganDompet && Array.isArray(data.keuanganDompet)) setDompetList(data.keuanganDompet);
        else {
          await setDoc(docRef, { keuanganDompet: DEFAULT_DOMPET }, { merge: true });
          setDompetList(DEFAULT_DOMPET);
        }

        if (data.keuanganGoals && Array.isArray(data.keuanganGoals)) setGoalsList(data.keuanganGoals);
        else {
          await setDoc(docRef, { keuanganGoals: DEFAULT_GOALS }, { merge: true });
          setGoalsList(DEFAULT_GOALS);
        }

        if (data.keuanganTransaksi && typeof data.keuanganTransaksi === "object" && !Array.isArray(data.keuanganTransaksi))
          setKeuanganTransaksi(data.keuanganTransaksi);
        else {
          await setDoc(docRef, { keuanganTransaksi: {} }, { merge: true });
          setKeuanganTransaksi({});
        }

        if (data.keuanganSetting && typeof data.keuanganSetting === "object")
          setKeuanganSetting({ ...DEFAULT_SETTING, ...data.keuanganSetting });
        else {
          await setDoc(docRef, { keuanganSetting: DEFAULT_SETTING }, { merge: true });
          setKeuanganSetting(DEFAULT_SETTING);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          menus: DEFAULT_MENUS,
          menusArsip: [],
          jadwalUser: DEFAULT_JADWAL,
          dailyProgress: {},
          keuanganDompet: DEFAULT_DOMPET,
          keuanganGoals: DEFAULT_GOALS,
          keuanganTransaksi: {},
          keuanganSetting: DEFAULT_SETTING,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setMenus(DEFAULT_MENUS);
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

  // ========== UPDATE MENUS ==========
  const handleUpdateMenus = async (newMenus, newArsip) => {
    setMenus(newMenus);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const updates = { menus: newMenus };
    if (newArsip) updates.menusArsip = newArsip;
    await setDoc(docRef, updates, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <MenuManager
            menus={menus}
            activities={activities}
            user={user}
            onUpdate={handleUpdateMenus}
          />
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}>
          <Sidebar
            menus={menus}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Schedule
            jadwalUser={jadwalUser}
            onUpdateJadwal={updateJadwal}
            progress={progress}
            onUpdateProgress={updateProgress}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <div className="text-center text-base-content/50 mt-10 mb-6">
            <p className="text-2xl mb-2">📋</p>
            <p>Pilih menu dari sidebar</p>
          </div>

          <RingkasanKeuangan
            dompetList={dompetList}
            goalsList={goalsList}
            keuanganTransaksi={keuanganTransaksi}
            setting={keuanganSetting}
            onClickDetail={() => router.push("/dashboard/keuangan")}
          />
        </div>
      </div>
    </div>
  );
}