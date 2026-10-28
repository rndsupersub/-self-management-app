// app/(dashboard)/dashboard/hafalan/[juzId]/[suratId]/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_JENIS_KESALAHAN, formatTanggal, formatTanggalPendek, getTotalKesalahan, formatKesalahan } from "@/lib/hafalanData";
import { BookOpen, Home, Library, FileText, Play, Square, Mic, Trash2, CheckCircle2, Clock, Pencil, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"; // <-- RefreshCw UDAH DITAMBAHIN

export default function HafalanSuratPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hafalanMembaca, setHafalanMembaca] = useState({});
  const [hafalanMurajaah, setHafalanMurajaah] = useState({});
  const [hafalanVoiceNotes, setHafalanVoiceNotes] = useState({});
  const [jenisKesalahanList, setJenisKesalahanList] = useState(DEFAULT_JENIS_KESALAHAN);
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
  const suratNext = suratIndex < suratList.length - 1 ? suratList[suratIndex + 1] : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hafalanMembaca) setHafalanMembaca(data.hafalanMembaca);
        if (data.hafalanMurajaah) setHafalanMurajaah(data.hafalanMurajaah);
        if (data.hafalanVoiceNotes) setHafalanVoiceNotes(data.hafalanVoiceNotes);
        if (data.hafalanJenisKesalahan) setJenisKesalahanList(data.hafalanJenisKesalahan);
        const catatanMap = data.hafalanCatatanSurat || {};
        setCatatanSurat(catatanMap[suratId] || "");
        setCatatanInput(catatanMap[suratId] || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, suratId]);

  const simpanSettings = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const handleSimpanCatatan = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const catatanMap = docSnap.data().hafalanCatatanSurat || {};
    catatanMap[suratId] = catatanInput;
    await setDoc(docRef, { hafalanCatatanSurat: catatanMap }, { merge: true });
    setCatatanSurat(catatanInput);
    setEditCatatan(false);
  };

  const handleToggleHafal = async () => {
    const entries = Object.entries(hafalanMembaca || {});
    const found = entries.find((e) => e[1]?.suratId === suratId && e[1]?.sudah === true);
    const updated = { ...hafalanMembaca };
    if (found) {
      updated[found[0]] = { ...found[1], sudah: false };
    } else {
      const today = new Date().toISOString().split("T")[0];
      updated[today] = updated[today] ? { ...updated[today], suratId, juzId, sudah: true } : { juzId, suratId, halamanMulai: 0, halamanSelesai: 0, sudah: true, catatan: "", updatedAt: new Date().toISOString() };
    }
    setHafalanMembaca(updated);
    await simpanSettings({ hafalanMembaca: updated });
  };

  const handleHapusVN = async (vnId) => {
    if (!confirm("Hapus rekaman VN ini?")) return;
    const current = hafalanVoiceNotes?.[suratId] || [];
    const updated = current.filter((v) => v.id !== vnId);
    const newVoiceNotes = { ...hafalanVoiceNotes, [suratId]: updated };
    await simpanSettings({ hafalanVoiceNotes: newVoiceNotes });
    setHafalanVoiceNotes(newVoiceNotes);
  };

  const handlePlayVoiceNote = async (vn) => {
    if (playingId === vn.id) { setPlayingId(null); return; }
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
      alert("Error: " + err.message);
    }
    setLoadingFileId(null);
  };

  const sudahHafal = useMemo(() => Object.values(hafalanMembaca || {}).some((e) => e.suratId === suratId && e.sudah === true), [hafalanMembaca, suratId]);
  const riwayatMembaca = useMemo(() => Object.entries(hafalanMembaca || {}).map(([tgl, e]) => ({ tanggal: tgl, ...e })).filter((e) => e.suratId === suratId).sort((a, b) => b.tanggal.localeCompare(a.tanggal)), [hafalanMembaca, suratId]);
  const riwayatMurajaah = useMemo(() => Object.entries(hafalanMurajaah || {}).map(([tgl, e]) => ({ tanggal: tgl, ...e })).filter((e) => e.suratId === suratId).sort((a, b) => b.tanggal.localeCompare(a.tanggal)), [hafalanMurajaah, suratId]);
  const voiceNotesSuratIni = hafalanVoiceNotes?.[suratId] || [];

  if (loading) return <div className="p-6">Loading...</div>;
  if (!juzData || !suratData) return <div className="p-6 text-center">Surat tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/hafalan")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><BookOpen size={14} /> Hafalan</a></li>
          <li><a onClick={() => router.push(`/dashboard/hafalan/${juzId}`)} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Library size={14} /> {juzData.label}</a></li>
          <li className="flex items-center gap-1"><FileText size={14} /> {suratData.label}</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => suratPrev && router.push(`/dashboard/hafalan/${juzId}/${suratPrev.id}`)} disabled={!suratPrev}><ChevronLeft size={18} /></button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-primary" size={24} /> {suratData.label}</h1>
          <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => suratNext && router.push(`/dashboard/hafalan/${juzId}/${suratNext.id}`)} disabled={!suratNext}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200 mb-4">
        <div className="card-body p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><BookOpen size={16} /> Status Hafalan</h3>
            <span className={`badge badge-sm ${sudahHafal ? "badge-success" : "badge-ghost"}`}>{sudahHafal ? "✅ Sudah Hafal" : "⏳ Belum"}</span>
          </div>
          <button className={`btn btn-sm mt-3 ${sudahHafal ? "btn-ghost text-gray-700" : "btn-primary"}`} onClick={handleToggleHafal}>
            {sudahHafal ? <><Clock size={16} className="mr-2"/> Batalkan Status Hafal</> : <><CheckCircle2 size={16} className="mr-2"/> Tandai Sudah Hafal</>}
          </button>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200 mb-4">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText size={16} /> Catatan</h3>
            {!editCatatan && <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => { setCatatanInput(catatanSurat); setEditCatatan(true); }}>{catatanSurat ? <Pencil size={14} /> : "Tambah"}</button>}
          </div>
          {!editCatatan ? (
            catatanSurat ? <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">{catatanSurat}</p> : <p className="text-xs text-gray-400 italic">Belum ada catatan untuk surat ini.</p>
          ) : (
            <div className="space-y-2">
              <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="4" placeholder="Misal: ayat 3 masih lupa..." value={catatanInput} onChange={(e) => setCatatanInput(e.target.value)} autoFocus />
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanCatatan}>Simpan</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setEditCatatan(false)}>Batal</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Membaca */}
      <div className="card bg-white shadow border border-gray-200 mb-4">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> Riwayat Membaca ({riwayatMembaca.length})</h3>
          {riwayatMembaca.length === 0 ? <p className="text-xs text-gray-400 italic text-center py-4">Belum ada riwayat membaca.</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {riwayatMembaca.map((entry) => (
                <div key={entry.tanggal} className="p-2 rounded border border-gray-200 bg-gray-50 flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Clock size={14} /> {formatTanggalPendek(entry.tanggal)}</p>
                      <span className={`badge badge-xs ${entry.sudah ? "badge-success" : "badge-warning"}`}>{entry.sudah ? "Sudah" : "Belum"}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Halaman {entry.halamanMulai}--{entry.halamanSelesai}</p>
                    {entry.catatan && <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{entry.catatan}</p>}
                  </div>
                  <button className="btn btn-ghost btn-xs text-red-500" onClick={() => { if(confirm("Hapus?")) { const up = {...hafalanMembaca}; delete up[entry.tanggal]; setHafalanMembaca(up); simpanSettings({hafalanMembaca: up}); } }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Murajaah */}
      <div className="card bg-white shadow border border-gray-200 mb-4">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><RefreshCw size={16} /> Riwayat Murajaah ({riwayatMurajaah.length})</h3>
          {riwayatMurajaah.length === 0 ? <p className="text-xs text-gray-400 italic text-center py-4">Belum ada riwayat murajaah.</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {riwayatMurajaah.map((entry) => (
                <div key={entry.tanggal} className="p-2 rounded border border-gray-200 bg-gray-50 flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Clock size={14} /> {formatTanggalPendek(entry.tanggal)}</p>
                    <p className="text-xs text-gray-600 mt-1">Halaman {entry.halamanMulai}--{entry.halamanSelesai}</p>
                    {getTotalKesalahan(entry.kesalahan) > 0 && <p className="text-xs text-red-600 mt-1">{formatKesalahan(entry.kesalahan)}</p>}
                  </div>
                  <button className="btn btn-ghost btn-xs text-red-500" onClick={() => { if(confirm("Hapus?")) { const up = {...hafalanMurajaah}; delete up[entry.tanggal]; setHafalanMurajaah(up); simpanSettings({hafalanMurajaah: up}); } }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VN Telegram */}
      <div className="card bg-white shadow border border-dashed border-2 border-gray-300 mb-4">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Mic size={16} /> Rekaman Hafalan (Telegram) ({voiceNotesSuratIni.length})</h3>
          {voiceNotesSuratIni.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Mic size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs italic">Belum ada rekaman. Kirim voice note lewat Bot Telegram.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {voiceNotesSuratIni.map((vn) => (
                <div key={vn.id} className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50">
                  <button className={`btn btn-circle btn-sm ${playingId === vn.id ? "btn-error" : "btn-primary"}`} onClick={() => handlePlayVoiceNote(vn)} disabled={loadingFileId === vn.id}>
                    {loadingFileId === vn.id ? "..." : playingId === vn.id ? <Square size={14} /> : <Play size={14} />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 flex items-center gap-1"><Clock size={14} /> {formatTanggalPendek(vn.tanggal)} • {vn.duration} detik</p>
                  </div>
                  <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusVN(vn.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}