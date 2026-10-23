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
import SyncSheetsButton from "@/components/SyncSheetsButton";
import TelegramSetting from "@/components/TelegramSetting";
import ViewerManager from "@/components/ViewerManager";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_ACTIVITIES, DEFAULT_MENUS } from "@/lib/defaultData";
import { DEFAULT_JADWAL } from "@/lib/jadwalData";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING } from "@/lib/keuanganData";
import { migrasiStatusVendorPekerjaan, migrasiStatusVendorBisnis } from "@/lib/vendorData";
import { Menu, LogOut, CalendarDays } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [menusCustom, setMenusCustom] = useState({});
  const [menusCustomLogHarian, setMenusCustomLogHarian] = useState({});
  const [menusCustomTargetHarian, setMenusCustomTargetHarian] = useState({});
  const [jadwalUser, setJadwalUser] = useState(DEFAULT_JADWAL);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [userData, setUserData] = useState(null);
  const [dompetList, setDompetList] = useState(DEFAULT_DOMPET);
  const [goalsList, setGoalsList] = useState(DEFAULT_GOALS);
  const [keuanganTransaksi, setKeuanganTransaksi] = useState({});
  const [keuanganSetting, setKeuanganSetting] = useState(DEFAULT_SETTING);

  const router = useRouter();

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

  const runMigrasi = (data) => {
    let perluSimpan = false;
    const updates = {};

    let activitiesBaru = data.activities;
    if (Array.isArray(activitiesBaru)) {
      const adaNpd = activitiesBaru.some((a) => a.id === "npd");
      const adaMandarin = activitiesBaru.some((a) => a.id === "mandarin");
      if (adaNpd || adaMandarin) {
        activitiesBaru = activitiesBaru.filter((a) => a.id !== "npd" && a.id !== "mandarin");
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

    let menusBaru = data.menus;
    if (!Array.isArray(menusBaru) || menusBaru.length === 0) {
      menusBaru = buildMenusFromOldData(activitiesBaru);
      updates.menus = menusBaru;
      perluSimpan = true;
    }

    let menusArsip = data.menusArsip;
    if (!Array.isArray(menusArsip)) {
      menusArsip = [];
      updates.menusArsip = menusArsip;
      perluSimpan = true;
    }

    let menusCustomBaru = data.menusCustom;
    if (!menusCustomBaru || typeof menusCustomBaru !== "object" || Array.isArray(menusCustomBaru)) {
      menusCustomBaru = {};
      updates.menusCustom = menusCustomBaru;
      perluSimpan = true;
    }

    let logCustomBaru = data.menusCustomLogHarian;
    if (!logCustomBaru || typeof logCustomBaru !== "object" || Array.isArray(logCustomBaru)) {
      logCustomBaru = {};
      updates.menusCustomLogHarian = logCustomBaru;
      perluSimpan = true;
    }

    let targetCustomBaru = data.menusCustomTargetHarian;
    if (!targetCustomBaru || typeof targetCustomBaru !== "object" || Array.isArray(targetCustomBaru)) {
      targetCustomBaru = {};
      updates.menusCustomTargetHarian = targetCustomBaru;
      perluSimpan = true;
    }

    let pekerjaanBaru = data.pekerjaan;
    if (Array.isArray(pekerjaanBaru)) {
      const migrated = migrasiStatusVendorPekerjaan(pekerjaanBaru);
      if (migrated !== pekerjaanBaru) {
        pekerjaanBaru = migrated;
        updates.pekerjaan = pekerjaanBaru;
        perluSimpan = true;
      }
    }

    let bisnisBrandsBaru = data.bisnisBrands;
    if (Array.isArray(bisnisBrandsBaru)) {
      const migrated = migrasiStatusVendorBisnis(bisnisBrandsBaru);
      if (migrated !== bisnisBrandsBaru) {
        bisnisBrandsBaru = migrated;
        updates.bisnisBrands = bisnisBrandsBaru;
        perluSimpan = true;
      }
    }

    return { perluSimpan, updates, activitiesBaru, jadwalBaru, progressBaru, menusBaru, menusCustomBaru, logCustomBaru, targetCustomBaru };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      try {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (viewerSnap.exists() && viewerSnap.data().passwordHash) {
          router.push("/viewer");
          return;
        }
      } catch (err) {
        console.error("[dashboard] Cek viewer error:", err);
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({ ...data, _uid: user.uid });

        const { perluSimpan, updates, activitiesBaru, jadwalBaru, progressBaru, menusBaru, menusCustomBaru, logCustomBaru, targetCustomBaru } = runMigrasi(data);

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

        setMenusCustom(menusCustomBaru || {});
        setMenusCustomLogHarian(logCustomBaru || {});
        setMenusCustomTargetHarian(targetCustomBaru || {});

        if (jadwalBaru?.kerja && jadwalBaru?.minggu) setJadwalUser(jadwalBaru);
        else {
          await setDoc(docRef, { jadwalUser: DEFAULT_JADWAL }, { merge: true });
          setJadwalUser(DEFAULT_JADWAL);
        }

        if (progressBaru && typeof progressBaru === "object" && !Array.isArray(progressBaru)) setProgress(progressBaru || {});
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

        if (data.keuanganTransaksi && typeof data.keuanganTransaksi === "object" && !Array.isArray(data.keuanganTransaksi)) setKeuanganTransaksi(data.keuanganTransaksi);
        else {
          await setDoc(docRef, { keuanganTransaksi: {} }, { merge: true });
          setKeuanganTransaksi({});
        }

        if (data.keuanganSetting && typeof data.keuanganSetting === "object") setKeuanganSetting({ ...DEFAULT_SETTING, ...data.keuanganSetting });
        else {
          await setDoc(docRef, { keuanganSetting: DEFAULT_SETTING }, { merge: true });
          setKeuanganSetting(DEFAULT_SETTING);
        }
      } else {
        const initialData = {
          activities: DEFAULT_ACTIVITIES, menus: DEFAULT_MENUS, menusArsip: [], menusCustom: {}, menusCustomLogHarian: {}, menusCustomTargetHarian: {}, jadwalUser: DEFAULT_JADWAL, dailyProgress: {}, keuanganDompet: DEFAULT_DOMPET, keuanganGoals: DEFAULT_GOALS, keuanganTransaksi: {}, keuanganSetting: DEFAULT_SETTING,
        };
        await setDoc(docRef, initialData);
        setUserData({ ...initialData, _uid: user.uid });
        setActivities(DEFAULT_ACTIVITIES); setMenus(DEFAULT_MENUS); setMenusCustom({}); setMenusCustomLogHarian({}); setMenusCustomTargetHarian({}); setJadwalUser(DEFAULT_JADWAL); setProgress({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { setToday(new Date().toISOString().split("T")[0]); }, []);

  const updateProgress = async (date, field, value) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const dayData = progress[date] || {};
    dayData[field] = { ...dayData[field], ...value };
    const newProgress = { ...progress, [date]: dayData };
    await setDoc(docRef, { dailyProgress: newProgress }, { merge: true });
    setProgress(newProgress);
    setUserData((prev) => ({ ...prev, dailyProgress: newProgress }));
  };

  const updateJadwal = async (newJadwal) => {
    if (!user) return;
    setJadwalUser(newJadwal);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { jadwalUser: newJadwal }, { merge: true });
  };

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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar yang udah di-rapihin */}
      <div className="navbar bg-base-100 shadow-sm px-4 md:px-6 flex-wrap gap-2 z-20 relative" data-html2canvas-ignore="true">
        <div className="flex-1 flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm btn-square md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            🌙 Self Management
          </h1>
        </div>
        
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <MenuManager
            menus={menus} activities={activities} menusCustom={menusCustom} user={user} onUpdate={handleUpdateMenus} onUpdateCustom={async (newCustom) => { setMenusCustom(newCustom); if (!user) return; await setDoc(doc(db, "users", user.uid), { menusCustom: newCustom }, { merge: true }); }}
          />
          <SyncSheetsButton user={user} />
          <ViewerManager user={user} />
          <TelegramSetting user={user} />
          
          <div className="hidden md:flex items-center gap-2 text-sm font-mono text-gray-500 bg-base-200 px-3 py-1.5 rounded-lg">
            <CalendarDays size={16} />
            {today}
          </div>
          <button className="btn btn-ghost btn-sm text-error hover:bg-error/10" onClick={handleLogout}>
            <LogOut size={16} className="md:mr-1" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Drawer Animasi */}
        <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${mobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setMobileSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-100 shadow-xl md:hidden transform transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar menus={menus} collapsed={false} setCollapsed={() => {}} onCloseMobile={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Desktop Sidebar */}
        <div
          className={`hidden md:block ${sidebarCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-base-100 z-10`}
          data-html2canvas-ignore="true"
        >
          <Sidebar menus={menus} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>

        {/* Main Content */}
        <div id="export-area" className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200">
          <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
            <ExportPDFButton targetId="export-area" fileName={`Dashboard_${today}.pdf`} title="Dashboard Self Management" />
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            <Schedule
              jadwalUser={jadwalUser} onUpdateJadwal={updateJadwal} progress={progress} onUpdateProgress={updateProgress} selectedDate={selectedDate} setSelectedDate={setSelectedDate} userData={userData}
            />

            <RingkasanKeuangan
              dompetList={dompetList} goalsList={goalsList} keuanganTransaksi={keuanganTransaksi} setting={keuanganSetting} onClickDetail={() => router.push("/dashboard/keuangan")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}