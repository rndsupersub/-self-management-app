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

  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanVoiceNotes, setHafalanVoiceNotes] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(
    DEFAULT_JENIS_KESALAHAN
  );

  const [catatanSurat, setCatatanSurat] = useState("");
  const [editCatatan, setEditCatatan] = useState(false);
  const [catatanInput, setCatatanInput] = useState("");

  const [playingId, setPlayingId] = useState(null);
  const [loadingFileId, setLoadingFileId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const juzId = params.juzId;
  const suratId = params.suratId;

  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];
  const juzData = allJuz.find((j) => j.id === juzId);
  const suratList = juzData?.children || [];
  const suratIndex = suratList.findIndex((s) => s.id === suratId);
  const suratData = suratList[suratIndex];

  const suratPrev = suratIndex > 0 ? suratList[suratIndex - 1] : null;
  const suratNext =
    suratIndex < suratList.length - 1 ? suratList[suratIndex + 1] : null;

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

        if (data.hafalanVoiceNotes && typeof data.hafalanVoiceNotes === "object") {
          setHafalanVoiceNotes(data.hafalanVoiceNotes);
        }

        if (
          data.hafalanJenisKesalahan &&
          Array.isArray(data.hafalanJenisKesalahan)
        ) {
          setJenisKesalahanList(data.hafalanJenisKesalahan);
        }

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

  const simpanSettings = async (updates) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

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

  const handleToggleHafal = async () => {
    const entries = Object.entries(hafalanMembaca || {});
    const found = entries.find(
      (e) => e[1]?.suratId === suratId && e[1]?.sudah === true
    );
    const updated = { ...hafalanMembaca };

    if (found) {
      const [tanggal, entry] = found;
      updated[tanggal] = { ...entry, sudah: false };
    } else {
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

  const handleHapusRiwayatMembaca = async (tanggal) => {
    if (!confirm("Hapus riwayat membaca ini?")) return;
    const updated = { ...hafalanMembaca };
    delete updated[tanggal];
    setHafalanMembaca(updated);
    await simpanSettings({ hafalanMembaca: updated });
  };

  const handleHapusRiwayatMurajaah = async (tanggal) => {
    if (!confirm("Hapus riwayat murajaah ini?")) return;
    const updated = { ...hafalanMurajaah };
    delete updated[tanggal];
    setHafalanMurajaah(updated);
    await simpanSettings({ hafalanMurajaah: updated });
  };

  const sudahHafal = useMemo(() => {
    const entries = Object.values(hafalanMembaca || {});
    return entries.some((e) => e.suratId === suratId && e.sudah === true);
  }, [hafalanMembaca, suratId]);

  const riwayatMembaca = useMemo(() => {
    return Object.entries(hafalanMembaca || {})
      .map(([tanggal, entry]) => ({ tanggal, ...entry }))
      .filter((e) => e.suratId === suratId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [hafalanMembaca, suratId]);

  const riwayatMurajaah = useMemo(() => {
    return Object.entries(hafalanMurajaah || {})
      .map(([tanggal, entry]) => ({ tanggal, ...entry }))
      .filter((e) => e.suratId === suratId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [hafalanMurajaah, suratId]);

  const voiceNotesSuratIni = useMemo(() => {
    return hafalanVoiceNotes?.[suratId] || [];
  }, [hafalanVoiceNotes, suratId]);

  const handlePlayVoiceNote = async (vn) => {
    if (playingId === vn.id) {
      setPlayingId(null);
      return;
    }

    setLoadingFileId(vn.id);
    try {
      const res = await fetch(`/api/telegram/get-file-url?fileId=${encodeURIComponent(vn.fileId)}`);
      const data = await res.json();

      if (data.ok && data.fileUrl) {
        setPlayingId(vn.id);
        const audio = new Audio(data.fileUrl);
        audio.play();
        audio.onended = () => setPlayingId(null);
      } else {
        alert("Gagal ambil link file: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error("[playVN] Error:", err);
      alert("Error: " + err.message);
    }
    setLoadingFileId(null);
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

        <div className="flex-1 overflow-y-auto p-6">
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
                      className="p-2 rounded border border-gray-200 bg-gray-50 flex items-start gap-2"
                    >
                      <div className="flex-1">
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
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusRiwayatMembaca(entry.tanggal)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
                      className="p-2 rounded border border-gray-200 bg-gray-50 flex items-start gap-2"
                    >
                      <div className="flex-1">
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
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusRiwayatMurajaah(entry.tanggal)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-white shadow border border-dashed border-2 border-gray-300 mb-4">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                🎙️ Rekaman Hafalan (Telegram) ({voiceNotesSuratIni.length})
              </h3>

              {voiceNotesSuratIni.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-2xl mb-2">🎙️</p>
                  <p className="text-xs italic">
                    Belum ada rekaman. Kirim voice note hafalan lewat Telegram Bot.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    (Ketik /vn di bot, pilih surat, lalu kirim VN)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {voiceNotesSuratIni.map((vn) => (
                    <div
                      key={vn.id}
                      className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50"
                    >
                      <button
                        className={`btn btn-circle btn-sm ${
                          playingId === vn.id ? "btn-error" : "btn-primary"
                        }`}
                        onClick={() => handlePlayVoiceNote(vn)}
                        disabled={loadingFileId === vn.id}
                      >
                        {loadingFileId === vn.id
                          ? "..."
                          : playingId === vn.id
                          ? "■"
                          : "▶"}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          {formatTanggalPendek(vn.tanggal)} • {vn.duration} detik
                        </p>
                        <p className="text-[10px] text-gray-500">
                          ID: {vn.fileId.substring(0, 20)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}