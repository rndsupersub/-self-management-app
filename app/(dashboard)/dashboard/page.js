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
import { DEFAULT_JADWAL, deteksiJadwalOtomatis } from "@/lib/jadwalData";
import { getJadwalHarian, namaHari } from "@/lib/jadwalHarian";
import { DEFAULT_DOMPET, DEFAULT_GOALS, DEFAULT_SETTING } from "@/lib/keuanganData";
import { migrasiStatusVendorPekerjaan, migrasiStatusVendorBisnis } from "@/lib/vendorData";

// FUNGSI SAKTI UNTUK DAPET TANGGAL LOKAL (BUKAN UTC)
const getLocalDateStr = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today] = useState(getLocalDateStr());
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [menusCustom, setMenusCustom] = useState({});
  const [menusCustomLogHarian, setMenusCustomLogHarian] = useState({});
  const [menusCustomTargetHarian, setMenusCustomTargetHarian] = useState({});
  const [jadwalUser, setJadwalUser] = useState(DEFAULT_JADWAL);
  // Perubahan jadwal harian (mis. dipindah dari Telegram) — jadwal asli aman.
  const [jadwalOverride, setJadwalOverride] = useState({});
  
  // PERBAIKAN: Pakai getLocalDateStr() bukan toISOString()
  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
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
        menusBaru.push({ id: act.id, label: act.label, type: "standard", required: false, visible: true, order: menusBaru.length });
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
    if (!jadwalBaru || !jadwalBaru.kerja || !jadwalBaru.minggu) {
      jadwalBaru = { ...DEFAULT_JADWAL, ...(jadwalBaru || {}) };
      updates.jadwalUser = jadwalBaru;
      perluSimpan = true;
    } else {
      if (Array.isArray(jadwalBaru.kerja)) {
        const adaNpdJadwal = jadwalBaru.kerja.some((item) => item.id === "npd");
        if (adaNpdJadwal) {
          jadwalBaru = { ...jadwalBaru, kerja: jadwalBaru.kerja.map((item) => item.id === "npd" ? { ...item, id: "bedah-buku", label: "📚 Bedah Buku", unit: "10 halaman" } : item) };
          updates.jadwalUser = jadwalBaru;
          perluSimpan = true;
        }
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
      if (adaNpdProgress) { updates.dailyProgress = progressUpdated; progressBaru = progressUpdated; perluSimpan = true; }
    }

    let menusBaru = data.menus;
    if (!Array.isArray(menusBaru) || menusBaru.length === 0) { menusBaru = buildMenusFromOldData(activitiesBaru); updates.menus = menusBaru; perluSimpan = true; }

    let menusArsip = data.menusArsip;
    if (!Array.isArray(menusArsip)) { menusArsip = []; updates.menusArsip = menusArsip; perluSimpan = true; }

    let menusCustomBaru = data.menusCustom;
    if (!menusCustomBaru || typeof menusCustomBaru !== "object" || Array.isArray(menusCustomBaru)) { menusCustomBaru = {}; updates.menusCustom = menusCustomBaru; perluSimpan = true; }

    let logCustomBaru = data.menusCustomLogHarian;
    if (!logCustomBaru || typeof logCustomBaru !== "object" || Array.isArray(logCustomBaru)) { logCustomBaru = {}; updates.menusCustomLogHarian = logCustomBaru; perluSimpan = true; }

    let targetCustomBaru = data.menusCustomTargetHarian;
    if (!targetCustomBaru || typeof targetCustomBaru !== "object" || Array.isArray(targetCustomBaru)) { targetCustomBaru = {}; updates.menusCustomTargetHarian = targetCustomBaru; perluSimpan = true; }

    let pekerjaanBaru = data.pekerjaan;
    if (Array.isArray(pekerjaanBaru)) {
      const migrated = migrasiStatusVendorPekerjaan(pekerjaanBaru);
      if (migrated !== pekerjaanBaru) { pekerjaanBaru = migrated; updates.pekerjaan = pekerjaanBaru; perluSimpan = true; }
    }

    let bisnisBrandsBaru = data.bisnisBrands;
    if (Array.isArray(bisnisBrandsBaru)) {
      const migrated = migrasiStatusVendorBisnis(bisnisBrandsBaru);
      if (migrated !== bisnisBrandsBaru) { bisnisBrandsBaru = migrated; updates.bisnisBrands = bisnisBrandsBaru; perluSimpan = true; }
    }

    return { perluSimpan, updates, activitiesBaru, jadwalBaru, progressBaru, menusBaru, menusCustomBaru, logCustomBaru, targetCustomBaru };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);

      try {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (viewerSnap.exists() && viewerSnap.data().passwordHash) { router.push("/viewer"); return; }
      } catch (err) {}

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({ ...data, _uid: user.uid });

        const { perluSimpan, updates, activitiesBaru, jadwalBaru, progressBaru, menusBaru, menusCustomBaru, logCustomBaru, targetCustomBaru } = runMigrasi(data);
        if (perluSimpan) await setDoc(docRef, updates, { merge: true });

        if (Array.isArray(activitiesBaru)) setActivities(activitiesBaru); else { await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true }); setActivities(DEFAULT_ACTIVITIES); }
        if (Array.isArray(menusBaru)) setMenus(menusBaru); else { await setDoc(docRef, { menus: DEFAULT_MENUS }, { merge: true }); setMenus(DEFAULT_MENUS); }

        setMenusCustom(menusCustomBaru || {});
        setMenusCustomLogHarian(logCustomBaru || {});
        setMenusCustomTargetHarian(targetCustomBaru || {});

        setJadwalUser(jadwalBaru);
        setJadwalOverride(
          data.jadwalOverride &&
            typeof data.jadwalOverride === "object" &&
            !Array.isArray(data.jadwalOverride)
            ? data.jadwalOverride
            : {}
        );
        if (progressBaru && typeof progressBaru === "object" && !Array.isArray(progressBaru)) setProgress(progressBaru || {}); else { await setDoc(docRef, { dailyProgress: {} }, { merge: true }); setProgress({}); }

        if (data.keuanganDompet && Array.isArray(data.keuanganDompet)) setDompetList(data.keuanganDompet); else { await setDoc(docRef, { keuanganDompet: DEFAULT_DOMPET }, { merge: true }); setDompetList(DEFAULT_DOMPET); }
        if (data.keuanganGoals && Array.isArray(data.keuanganGoals)) setGoalsList(data.keuanganGoals); else { await setDoc(docRef, { keuanganGoals: DEFAULT_GOALS }, { merge: true }); setGoalsList(DEFAULT_GOALS); }
        // Jangan timpa data: kalau field-nya cuma belum ada, baru diinisialisasi.
        // (Versi lama menimpa jadi {} setiap tipe datanya aneh → transaksi bisa hilang.)
        if (data.keuanganTransaksi && typeof data.keuanganTransaksi === "object" && !Array.isArray(data.keuanganTransaksi)) setKeuanganTransaksi(data.keuanganTransaksi);
        else if (data.keuanganTransaksi === undefined || data.keuanganTransaksi === null) { await setDoc(docRef, { keuanganTransaksi: {} }, { merge: true }); setKeuanganTransaksi({}); }
        else setKeuanganTransaksi({});
        if (data.keuanganSetting && typeof data.keuanganSetting === "object") setKeuanganSetting({ ...DEFAULT_SETTING, ...data.keuanganSetting }); else { await setDoc(docRef, { keuanganSetting: DEFAULT_SETTING }, { merge: true }); setKeuanganSetting(DEFAULT_SETTING); }

      } else {
        const initialData = { activities: DEFAULT_ACTIVITIES, menus: DEFAULT_MENUS, menusArsip: [], menusCustom: {}, menusCustomLogHarian: {}, menusCustomTargetHarian: {}, jadwalUser: DEFAULT_JADWAL, jadwalOverride: {}, dailyProgress: {}, keuanganDompet: DEFAULT_DOMPET, keuanganGoals: DEFAULT_GOALS, keuanganTransaksi: {}, keuanganSetting: DEFAULT_SETTING };
        await setDoc(docRef, initialData);
        setUserData({ ...initialData, _uid: user.uid });
        setActivities(DEFAULT_ACTIVITIES); setMenus(DEFAULT_MENUS); setMenusCustom({}); setMenusCustomLogHarian({}); setMenusCustomTargetHarian({});         setJadwalUser(DEFAULT_JADWAL); setJadwalOverride({}); setProgress({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateProgress = async (date, field, value) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    // Tanpa mutasi objek dari state (dulu `dayData[field] = ...`).
    const dayData = progress[date] || {};
    const newProgress = {
      ...progress,
      [date]: { ...dayData, [field]: { ...dayData[field], ...value } },
    };
    await setDoc(docRef, { dailyProgress: newProgress }, { merge: true });
    setProgress(newProgress); setUserData((prev) => ({ ...prev, dailyProgress: newProgress }));
  };

  const updateJadwal = async (newJadwal) => {
    if (!user) return;
    const mergedJadwal = { ...jadwalUser, ...newJadwal };
    setJadwalUser(mergedJadwal);
    
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { jadwalUser: mergedJadwal }, { merge: true });
  };

  // Pindahkan satu item jadwal untuk SATU tanggal saja.
  // `slot = null` artinya kembalikan ke jam semula (hapus perubahan harian).
  const updateJadwalOverride = async (tanggal, kunci, slot) => {
    if (!user || !tanggal || !kunci) return;

    const hari = { ...(jadwalOverride[tanggal] || {}) };
    if (slot) {
      hari[kunci] = { ...slot, at: new Date().toISOString() };
    } else {
      delete hari[kunci];
    }

    const baru = { ...jadwalOverride };
    if (Object.keys(hari).length === 0) delete baru[tanggal];
    else baru[tanggal] = hari;

    setJadwalOverride(baru);
    setUserData((prev) => (prev ? { ...prev, jadwalOverride: baru } : prev));
    await setDoc(doc(db, "users", user.uid), { jadwalOverride: baru }, { merge: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-sm text-gray-500">
        Memuat dashboard...
      </div>
    );
  }

  const infoHari = getJadwalHarian(
    jadwalUser,
    jadwalOverride[selectedDate],
    selectedDate
  );
  const jumlahHari = infoHari.daftar.length;
  const progressHari = progress[selectedDate] || {};
  const selesaiHari = infoHari.daftar.filter((item) => {
    if (
      progressHari[item.id]?.selesai === true ||
      progressHari[item._kunci]?.selesai === true
    ) {
      return true;
    }
    // Sumber yang sama dengan web/Telegram: aktivitas yang datanya udah diisi
    // juga dihitung selesai, bukan cuma yang diklik manual.
    try {
      return deteksiJadwalOtomatis(item.id, selectedDate, userData)?.auto === true;
    } catch (err) {
      return false;
    }
  }).length;
  const persenHari = jumlahHari ? Math.round((selesaiHari / jumlahHari) * 100) : 0;

  const jamSekarang = new Date().getHours();
  const sapaan =
    jamSekarang < 11
      ? "Selamat pagi"
      : jamSekarang < 15
        ? "Selamat siang"
        : jamSekarang < 18
          ? "Selamat sore"
          : "Selamat malam";

  const tanggalPanjang = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
      {/* HERO / RINGKASAN HARI INI */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-500 px-6 py-7 md:px-8 md:py-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-violet-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100/90">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              {sapaan} 👋
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              {namaHari(selectedDate)}, {tanggalPanjang}
              <span className="mx-2 text-indigo-200/60">•</span>
              {infoHari.labelHari}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                ✅ {selesaiHari} dari {jumlahHari} selesai
              </span>
              {Object.keys(jadwalOverride[selectedDate] || {}).length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/20 px-3 py-1.5 text-amber-50">
                  🕒 Ada jadwal yang dipindah
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-white/10">
              <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(persenHari / 100) * 97.4} 97.4`}
                />
              </svg>
              <div className="text-center">
                <p className="text-xl font-bold leading-none">{persenHari}%</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-indigo-100">selesai</p>
              </div>
            </div>
            <div className="hidden sm:block" data-html2canvas-ignore="true">
              <ExportPDFButton
                targetId="export-area"
                fileName={`Dashboard_${today}.pdf`}
                title="Dashboard Self Management"
                variant="light"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="sm:hidden flex justify-end" data-html2canvas-ignore="true">
        <ExportPDFButton
          targetId="export-area"
          fileName={`Dashboard_${today}.pdf`}
          title="Dashboard Self Management"
        />
      </div>

      <Schedule
        jadwalUser={jadwalUser}
        onUpdateJadwal={updateJadwal}
        jadwalOverride={jadwalOverride}
        onUpdateJadwalOverride={updateJadwalOverride}
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
  );
}