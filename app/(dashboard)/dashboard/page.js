// app/(dashboard)/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Schedule from "@/components/Schedule";
import RingkasanKeuangan from "@/components/RingkasanKeuangan";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_ACTIVITIES, DEFAULT_MENUS } from "@/lib/defaultData";
import { DEFAULT_JADWAL } from "@/lib/jadwalData";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING } from "@/lib/keuanganData";
import { migrasiStatusVendorPekerjaan, migrasiStatusVendorBisnis } from "@/lib/vendorData";

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
          activities: DEFAULT_ACTIVITIES,
          menus: DEFAULT_MENUS,
          menusArsip: [],
          menusCustom: {},
          menusCustomLogHarian: {},
          menusCustomTargetHarian: {},
          jadwalUser: DEFAULT_JADWAL,
          dailyProgress: {},
          keuanganDompet: DEFAULT_DOMPET,
          keuanganGoals: DEFAULT_GOALS,
          keuanganTransaksi: {},
          keuanganSetting: DEFAULT_SETTING,
        };
        await setDoc(docRef, initialData);
        setUserData({ ...initialData, _uid: user.uid });
        setActivities(DEFAULT_ACTIVITIES);
        setMenus(DEFAULT_MENUS);
        setMenusCustom({});
        setMenusCustomLogHarian({});
        setMenusCustomTargetHarian({});
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
        <ExportPDFButton
          targetId="export-area"
          fileName={`Dashboard_${today}.pdf`}
          title="Dashboard Self Management"
        />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <Schedule
          jadwalUser={jadwalUser}
          onUpdateJadwal={updateJadwal}
          progress={progress}
          onUpdateProgress={updateProgress}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          userData={userData}
        />

        <RingkasanKeuangan
          dompetList={dompetList}
          goalsList={goalsList}
          keuanganTransaksi={keuanganTransaksi}
          setting={keuanganSetting}
          onClickDetail={() => router.push("/dashboard/keuangan")}
        />
      </div>
    </>
  );
}