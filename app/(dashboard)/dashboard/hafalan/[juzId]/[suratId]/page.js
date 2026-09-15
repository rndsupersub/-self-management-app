// app/(dashboard)/dashboard/hafalan/[juzId]/[suratId]/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_JENIS_KESALAHAN,
  formatTanggal,
  formatTanggalPendek,
  getTotalKesalahan,
  formatKesalahan,
} from "@/lib/hafalanData";

export default function HafalanSuratPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hafalan data
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(
    DEFAULT_JENIS_KESALAHAN
  );

  // Catatan surat (disimpan di field hafalanCatatanSurat)
  const [catatanSurat, setCatatanSurat] = useState("");
  const [editCatatan, setEditCatatan] = useState(false);
  const [catatanInput, setCatatanInput] = useState("");

  const router = useRouter();
  const params = useParams();
  const juzId = params.juzId;
  const suratId = params.suratId;

  // Ambil data juz & surat
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];
  const juzData = allJuz.find((j) => j.id === juzId);
  const suratList = juzData?.children || [];
  const suratIndex = suratList.findIndex((s) => s.id === suratId);
  const suratData = suratList[suratIndex];

  // Surat sebelum & sesudah
  const suratPrev = suratIndex > 0 ? suratList[suratIndex - 1] : null;
  const suratNext =
    suratIndex < suratList.length - 1 ? suratList[suratIndex + 1] : null;

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
          data.hafalanJenisKesalahan &&
          Array.isArray(data.hafalanJenisKesalahan)
        ) {
          setJenisKesalahanList(data.hafalanJenisKesalahan);
        }

        // Catatan surat
        const catatanMap = data.hafalanCatatanSurat || {};
        const cat = catatanMap[suratId] || "";
        setCatatanSurat(cat);
        setCatatanInput(cat);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [suratId]);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanSettings = async (updates) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  // ========== SIMPAN CATATAN SURAT ==========
  const handleSimpanCatatan = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const catatanMap = data.hafalanCatatanSurat || {};
    catatanMap[suratId] = catatanInput;
    await setDoc(
      docRef,
      { hafalanCatatanSurat: catatanMap },
      { merge: true }
    );
    setCatatanSurat(catatanInput);
    setEditCatatan(false);
  };

  // ========== TOGGLE STATUS HAFAL ==========
  const handleToggleHafal = async () => {
    const entries = Object.entries(hafalanMembaca || {});
    const found = entries.find(
      (e) => e[1]?.suratId === suratId && e[1]?.sudah === true
    );
    const updated = { ...hafalanMembaca };

    if (found) {
      // Batalkan - hapus tanda sudah, tapi tetep simpan entry
      const [tanggal, entry] = found;
      updated[tanggal] = { ...entry, sudah: false };
    } else {
      // Tandai sudah hafal
      const today = new Date().toISOString().split("T")[0];
      if (updated[today]) {
        updated[today] = {
          ...updated[today],
          suratId,
          juzId,
          sudah: true,
        };
      } else {
        updated[today] = {
          juzId,
          suratId,
          halamanMulai: 0,
          halamanSelesai: 0,
          sudah: true,
          catatan: "",
          updatedAt: new Date().toISOString(),
        };
      }
    }

    setHafalanMembaca(updated);
    await simpanSettings({ hafalanMembaca: updated });
  };

  // ========== CEK STATUS HAFAL ==========
  const sudahHafal = useMemo(() => {
    const entries = Object.values(hafalanMembaca || {});
    return entries.some((e) => e.suratId === suratId && e.sudah === true);
  }, [hafalanMembaca, suratId]);

  // ========== RIWAYAT MEMBACA ==========
  const riwayatMembaca = useMemo(() => {
    return Object.entries(hafalanMembaca || {})
      .map(([tanggal, entry]) => ({ tanggal, ...entry }))
      .filter((e) => e.suratId === suratId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [hafalanMembaca, suratId]);

  // ========== RIWAYAT MURAJAAN ==========
  const riwayatMurajaah = useMemo(() => {
    return Object.entries(hafalanMurajaah || {})
      .map(([tanggal, entry]) => ({ tanggal, ...entry }))
      .filter((e) => e.suratId === suratId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [hafalanMurajaah, suratId]);

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

  if (!juzData || !suratData) {
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
              <p className="text-3xl mb-2">📖</p>
              <p className="text-sm mb-4">Surat tidak ditemukan.</p>
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
              <li>
                <a
                  onClick={() =>
                    router.push(`/dashboard/hafalan/${juzId}`)
                  }
                  className="cursor-pointer"
                >
                  📚 {juzData.label}
                </a>
              </li>
              <li>{suratData.label}</li>
            </ul>
          </div>

          {/* Header Surat + Navigasi */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() =>
                  suratPrev &&
                  router.push(`/dashboard/hafalan/${juzId}/${suratPrev.id}`)
                }
                disabled={!suratPrev}
                title={suratPrev ? `Ke ${suratPrev.label}` : "Surat pertama"}
              >
                ‹
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {suratData.label}
              </h1>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() =>
                  suratNext &&
                  router.push(`/dashboard/hafalan/${juzId}/${suratNext.id}`)
                }
                disabled={!suratNext}
                title={suratNext ? `Ke ${suratNext.label}` : "Surat terakhir"}
              >
                ›
              </button>
            </div>
          </div>

          {/* ========== STATUS HAFALAN ========== */}
          <div className="card bg-white shadow border border-gray-200 mb-4">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">
                  📖 Status Hafalan
                </h3>
                <span
                  className={`badge badge-sm ${
                    sudahHafal ? "badge-success" : "badge-ghost"
                  }`}
                >
                  {sudahHafal ? "✅ Sudah Hafal" : "⏳ Belum"}
                </span>
              </div>
              <button
                className={`btn btn-sm mt-3 ${
                  sudahHafal ? "btn-ghost text-gray-700" : "btn-primary"
                }`}
                onClick={handleToggleHafal}
              >
                {sudahHafal
                  ? "↩️ Batalkan Status Hafal"
                  : "✅ Tandai Sudah Hafal"}
              </button>
            </div>
          </div>

          {/* ========== CATATAN ========== */}
          <div className="card bg-white shadow border border-gray-200 mb-4">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-800">📝 Catatan</h3>
                {!editCatatan && (
                  <button
                    className="btn btn-ghost btn-xs text-gray-500"
                    onClick={() => {
                      setCatatanInput(catatanSurat);
                      setEditCatatan(true);
                    }}
                  >
                    {catatanSurat ? "✏️ Edit" : "➕ Tambah"}
                  </button>
                )}
              </div>
              {!editCatatan ? (
                catatanSurat ? (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                    {catatanSurat}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Belum ada catatan untuk surat ini.
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="4"
                    placeholder="Misal: ayat 3 masih lupa, perlu diulang..."
                    value={catatanInput}
                    onChange={(e) => setCatatanInput(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-sm flex-1"
                      onClick={handleSimpanCatatan}
                    >
                      💾 Simpan
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-gray-700"
                      onClick={() => setEditCatatan(false)}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========== RIWAYAT MEMBACA ========== */}
          <div className="card bg-white shadow border border-gray-200 mb-4">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                📅 Riwayat Membaca ({riwayatMembaca.length})
              </h3>
              {riwayatMembaca.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada riwayat membaca. Input dari kalender di halaman
                  utama.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {riwayatMembaca.map((entry) => (
                    <div
                      key={entry.tanggal}
                      className="p-2 rounded border border-gray-200 bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-800">
                          📅 {formatTanggalPendek(entry.tanggal)}
                        </p>
                        <span
                          className={`badge badge-xs ${
                            entry.sudah ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {entry.sudah ? "Sudah" : "Belum"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        📄 Halaman {entry.halamanMulai}--{entry.halamanSelesai}
                      </p>
                      {entry.catatan && (
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                          📝 {entry.catatan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========== RIWAYAT MURAJAAN ========== */}
          <div className="card bg-white shadow border border-gray-200 mb-4">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                🔄 Riwayat Murajaah ({riwayatMurajaah.length})
              </h3>
              {riwayatMurajaah.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada riwayat murajaah. Input dari tab Murajaah.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {riwayatMurajaah.map((entry) => (
                    <div
                      key={entry.tanggal}
                      className="p-2 rounded border border-gray-200 bg-gray-50"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        📅 {formatTanggalPendek(entry.tanggal)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        📄 Halaman {entry.halamanMulai}--{entry.halamanSelesai}
                      </p>
                      {getTotalKesalahan(entry.kesalahan) > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ {formatKesalahan(entry.kesalahan)}
                        </p>
                      )}
                      {entry.catatan && (
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                          📝 {entry.catatan}
                        </p>
                      )}
                      {entry.voiceNoteUrl && (
                        <a
                          href={entry.voiceNoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs link link-primary mt-1 inline-block"
                        >
                          🎙️ Voice Note
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========== VOICE NOTE PLACEHOLDER ========== */}
          <div className="card bg-white shadow border border-dashed border-2 border-gray-300">
            <div className="card-body p-4 text-center">
              <h3 className="text-sm font-bold text-gray-800 justify-center">
                🎙️ Rekaman Hafalan (Telegram)
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Kirim voice note hafalan lewat Telegram Bot, nanti otomatis
                muncul di sini.
              </p>
              <p className="text-xs text-gray-400 italic mt-1">
                (Fitur ini segera hadir)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}