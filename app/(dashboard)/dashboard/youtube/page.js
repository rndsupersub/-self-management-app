// app/(dashboard)/dashboard/youtube/page.js
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  YOUTUBE_CHANNELS, 
  KONTEN_STATUS, 
  generateYoutubeId,
  getTargetHarian,
  getWeekDates
} from "@/lib/youtubeData";

export default function YouTubeDashboard() {
  const [user, setUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState("gua");
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tanggal yang sedang diklik di kalender (Default: Hari ini)
  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Form State
  const [form, setForm] = useState({
    id: "", judul: "", tanggal: today, status: "idea", linkYoutube: "", gdriveUrl: "", catatan: ""
  });

  // Cek Login & Ambil Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchData(currentUser.uid);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update tanggal form kalau kalender diklik
  useEffect(() => {
    if (!form.id) setForm(prev => ({ ...prev, tanggal: selectedDate }));
  }, [selectedDate]);

  const fetchData = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().youtube_logs) {
      setLogs(docSnap.data().youtube_logs);
    }
  };

  const saveToFirestore = async (newLogs) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    try {
      await updateDoc(docRef, { youtube_logs: newLogs });
    } catch (error) {
      await setDoc(docRef, { youtube_logs: newLogs }, { merge: true });
    }
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!form.judul.trim()) return alert("Judul wajib diisi!");

    let updatedLogs;
    if (form.id) {
      updatedLogs = logs.map((log) => (log.id === form.id ? { ...form, channel: activeChannel } : log));
    } else {
      const newLog = { ...form, id: generateYoutubeId(), channel: activeChannel };
      updatedLogs = [...logs, newLog];
    }

    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
    setForm({ id: "", judul: "", tanggal: selectedDate, status: "idea", linkYoutube: "", gdriveUrl: "", catatan: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini? (Sesuai prinsip Editable Total)")) return;
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
  };

  const handleEdit = (log) => {
    setSelectedDate(log.tanggal);
    setForm(log);
  };

  if (isLoading) return <div className="p-8 text-center font-bold">Memuat Tracker YouTube...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-bold">Silakan login dulu!</div>;

  // Data Filtering
  const channelLogs = logs.filter(log => log.channel === activeChannel);
  const selectedDateLogs = channelLogs.filter(log => log.tanggal === selectedDate);
  const stokReadyLogs = channelLogs.filter(log => log.status === "ready" && log.tanggal !== selectedDate); // Bank Stok dari hari lain

  const weekDates = getWeekDates(selectedDate);
  const targetInfo = getTargetHarian(selectedDate);
  
  // Hitung progress hari yang dipilih
  const progressCount = selectedDateLogs.filter(l => l.status === "ready" || l.status === "publish").length;
  const isTargetAchieved = progressCount >= targetInfo.target;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📺 YouTube Tracker</h1>
      </div>

      {/* Tabs Channel */}
      <div className="flex space-x-4 border-b">
        {YOUTUBE_CHANNELS.map((ch) => (
          <button key={ch.id} onClick={() => {setActiveChannel(ch.id); setForm(prev => ({...prev, id: ""}));}}
            className={`px-4 py-3 font-bold rounded-t-lg transition-colors ${activeChannel === ch.id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {ch.nama}
          </button>
        ))}
      </div>

      {/* KALENDER MINGGUAN */}
      <div className="bg-white p-4 rounded-xl shadow border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">📅 Jadwal Mingguan</h2>
          <div className={`px-4 py-1 rounded-full text-sm font-bold ${isTargetAchieved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {targetInfo.label} ({progressCount}/{targetInfo.target})
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map(dateStr => {
            const dateObj = new Date(dateStr);
            const namaHari = dateObj.toLocaleDateString("id-ID", { weekday: "short" });
            const tgl = dateObj.getDate();
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const hasItems = channelLogs.some(l => l.tanggal === dateStr);

            return (
              <div key={dateStr} onClick={() => setSelectedDate(dateStr)}
                className={`cursor-pointer border rounded-lg p-2 text-center transition-all ${isSelected ? "ring-2 ring-red-500 bg-red-50" : "hover:bg-gray-100"} ${isToday && !isSelected ? "bg-yellow-50 border-yellow-300" : ""}`}
              >
                <div className="text-xs text-gray-500 font-semibold">{namaHari}</div>
                <div className={`text-xl font-bold ${isSelected ? "text-red-600" : ""}`}>{tgl}</div>
                <div className="mt-1 h-2 flex justify-center">
                  {hasItems && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM INPUT (KIRI) */}
        <div className="col-span-1 bg-white p-5 rounded-xl shadow border h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">{form.id ? "✏️ Edit Konten" : `➕ Tambah (${selectedDate})`}</h2>
          <form onSubmit={handleSaveContent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Judul / Ide</label>
              <input type="text" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} className="w-full border p-2 rounded focus:ring-red-500" placeholder="Contoh: Vlog Motor" required />
            </div>
            
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded font-medium">
                  {KONTEN_STATUS.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">Pindah Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Link GDrive (Thumbnail / Aset)</label>
              <input type="url" value={form.gdriveUrl} onChange={(e) => setForm({...form, gdriveUrl: e.target.value})} className="w-full border p-2 rounded" placeholder="https://drive.google.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Link YouTube (Kalau udah publish)</label>
              <input type="url" value={form.linkYoutube} onChange={(e) => setForm({...form, linkYoutube: e.target.value})} className="w-full border p-2 rounded" placeholder="https://youtu.be/..." />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Catatan Tambahan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({...form, catatan: e.target.value})} className="w-full border p-2 rounded h-20" placeholder="Hashtag atau notes khusus..."></textarea>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold w-full hover:bg-red-700">Simpan</button>
              {form.id && (
                <button type="button" onClick={() => setForm({id: "", judul: "", tanggal: selectedDate, status: "idea", linkYoutube: "", gdriveUrl: "", catatan: ""})} className="bg-gray-400 text-white px-4 py-2 rounded font-bold hover:bg-gray-500">Batal</button>
              )}
            </div>
          </form>
        </div>

        {/* LIST KONTEN & BANK STOK (KANAN) */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* List Sesuai Tanggal Klik */}
          <div className="bg-white p-5 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">📋 Aktivitas Tanggal: {selectedDate}</h2>
            {selectedDateLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">Kosong. Hari ini mau produksi atau upload konten apa?</p>
            ) : (
              <div className="space-y-3">
                {selectedDateLogs.map(log => {
                  const statusObj = KONTEN_STATUS.find(s => s.id === log.status);
                  return (
                    <div key={log.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{log.judul}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white font-bold ${statusObj?.color || "bg-gray-500"}`}>
                            {statusObj?.nama}
                          </span>
                        </div>
                        {(log.linkYoutube || log.gdriveUrl) && (
                          <div className="flex gap-4 text-sm mt-2">
                            {log.gdriveUrl && <a href={log.gdriveUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">📁 Buka GDrive</a>}
                            {log.linkYoutube && <a href={log.linkYoutube} target="_blank" rel="noreferrer" className="text-red-600 font-bold hover:underline">📺 Buka YouTube</a>}
                          </div>
                        )}
                        {log.catatan && <p className="text-sm text-gray-700 bg-gray-200 p-2 rounded mt-2">{log.catatan}</p>}
                      </div>
                      <div className="flex flex-col ml-4 gap-2">
                        <button onClick={() => handleEdit(log)} className="bg-yellow-400 text-white p-2 rounded shadow hover:bg-yellow-500 text-sm">✏️</button>
                        <button onClick={() => handleDelete(log.id)} className="bg-red-500 text-white p-2 rounded shadow hover:bg-red-600 text-sm">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BANK STOK READY (Hasil Kerja Hari Minggu) */}
          {stokReadyLogs.length > 0 && (
            <div className="bg-blue-50 p-5 rounded-xl shadow border border-blue-200">
              <h2 className="text-xl font-bold mb-4 text-blue-800">📦 Bank Stok (Tinggal Publish)</h2>
              <p className="text-sm text-blue-600 mb-3">Klik ikon pensil ✏️ untuk narik stok ini ke jadwal hari ini (ubah tanggal & set ke Publish).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stokReadyLogs.map(log => (
                  <div key={log.id} className="border border-blue-300 bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                    <div className="truncate pr-2">
                      <p className="font-bold text-sm truncate">{log.judul}</p>
                      <p className="text-xs text-gray-500">Tgl Asli: {log.tanggal}</p>
                    </div>
                    <button onClick={() => {
                        setSelectedDate(today); // Arahin kalender ke hari ini
                        setForm({...log, tanggal: today, status: "publish"}); // Siap publish
                      }} 
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 shrink-0"
                    >
                      Pilih ✏️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}