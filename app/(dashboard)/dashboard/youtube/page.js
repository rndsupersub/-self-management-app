"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  YOUTUBE_CHANNELS, 
  KONTEN_TIPE, 
  KONTEN_STATUS, 
  generateYoutubeId 
} from "@/lib/youtubeData";

export default function YouTubeDashboard() {
  const [user, setUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState("gua");
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    id: "",
    judul: "",
    tipe: "short",
    tanggal: new Date().toISOString().split("T")[0],
    linkYoutube: "",
    gdriveUrl: "",
    status: "idea",
    catatan: ""
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

  const fetchData = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setLogs(data.youtube_logs || []);
    }
  };

  const saveToFirestore = async (newLogs) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    try {
      await updateDoc(docRef, { youtube_logs: newLogs });
    } catch (error) {
      // Jika dokumen belum ada, bikin baru (prinsip template awal)
      await setDoc(docRef, { youtube_logs: newLogs }, { merge: true });
    }
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!form.judul.trim()) return alert("Judul wajib diisi!");

    let updatedLogs;
    if (form.id) {
      // Mode Edit
      updatedLogs = logs.map((log) => (log.id === form.id ? { ...form, channel: activeChannel } : log));
    } else {
      // Mode Tambah Baru
      const newLog = { ...form, id: generateYoutubeId(), channel: activeChannel };
      updatedLogs = [...logs, newLog];
    }

    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
    
    // Reset form
    setForm({
      id: "", judul: "", tipe: "short", tanggal: new Date().toISOString().split("T")[0],
      linkYoutube: "", gdriveUrl: "", status: "idea", catatan: ""
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini? (Prinsip lo: data bisa dihapus total)")) return;
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
  };

  const handleEdit = (log) => {
    setForm(log);
  };

  if (isLoading) return <div className="p-8 text-center">Loading YouTube Tracker...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">Silakan login dulu!</div>;

  const currentLogs = logs.filter(log => log.channel === activeChannel).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">📺 YouTube Tracker</h1>

      {/* Tabs Channel */}
      <div className="flex space-x-4 border-b pb-2">
        {YOUTUBE_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-4 py-2 font-bold rounded-t-lg ${activeChannel === ch.id ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {ch.nama}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Input (Sebelah Kiri) */}
        <div className="col-span-1 bg-white p-4 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">{form.id ? "✏️ Edit Konten" : "➕ Tambah Konten"}</h2>
          <form onSubmit={handleSaveContent} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold">Judul / Ide</label>
              <input type="text" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} className="w-full border p-2 rounded" placeholder="Contoh: Vlog Motor" required />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-semibold">Tipe</label>
                <select value={form.tipe} onChange={(e) => setForm({...form, tipe: e.target.value})} className="w-full border p-2 rounded">
                  {KONTEN_TIPE.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded">
                {KONTEN_STATUS.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">Link YouTube (Short/Video)</label>
              <input type="url" value={form.linkYoutube} onChange={(e) => setForm({...form, linkYoutube: e.target.value})} className="w-full border p-2 rounded" placeholder="https://youtu.be/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold">Link GDrive (Thumbnail / Aset)</label>
              <input type="url" value={form.gdriveUrl} onChange={(e) => setForm({...form, gdriveUrl: e.target.value})} className="w-full border p-2 rounded" placeholder="https://drive.google.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold">Catatan Tambahan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({...form, catatan: e.target.value})} className="w-full border p-2 rounded h-20" placeholder="Hashtag atau notes..."></textarea>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold w-full hover:bg-red-700">Simpan Konten</button>
              {form.id && (
                <button type="button" onClick={() => setForm({id: "", judul: "", tipe: "short", tanggal: new Date().toISOString().split("T")[0], linkYoutube: "", gdriveUrl: "", status: "idea", catatan: ""})} className="bg-gray-400 text-white px-4 py-2 rounded font-bold hover:bg-gray-500">Batal</button>
              )}
            </div>
          </form>
        </div>

        {/* List / Kalender Konten (Sebelah Kanan) */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4">📋 List Konten ({YOUTUBE_CHANNELS.find(c => c.id === activeChannel)?.nama})</h2>
            {currentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Belum ada data konten. Yuk tambahin!</p>
            ) : (
              <div className="space-y-3">
                {currentLogs.map(log => {
                  const statusObj = KONTEN_STATUS.find(s => s.id === log.status);
                  const tipeObj = KONTEN_TIPE.find(t => t.id === log.tipe);
                  return (
                    <div key={log.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-gray-50 flex justify-between items-start">
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{log.judul}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${statusObj?.color || "bg-gray-500"}`}>
                            {statusObj?.nama}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">📅 {log.tanggal} | {tipeObj?.nama}</p>
                        
                        {(log.linkYoutube || log.gdriveUrl) && (
                          <div className="flex gap-4 text-sm mt-2">
                            {log.linkYoutube && <a href={log.linkYoutube} target="_blank" rel="noreferrer" className="text-red-500 font-semibold hover:underline">📺 Buka YouTube</a>}
                            {log.gdriveUrl && <a href={log.gdriveUrl} target="_blank" rel="noreferrer" className="text-blue-500 font-semibold hover:underline">📁 Buka GDrive</a>}
                          </div>
                        )}
                        {log.catatan && <p className="text-sm text-gray-700 bg-gray-200 p-2 rounded mt-2 whitespace-pre-wrap">{log.catatan}</p>}
                      </div>
                      <div className="flex flex-col ml-4 gap-2">
                        <button onClick={() => handleEdit(log)} className="bg-yellow-400 text-white p-2 rounded shadow hover:bg-yellow-500">✏️</button>
                        <button onClick={() => handleDelete(log.id)} className="bg-red-500 text-white p-2 rounded shadow hover:bg-red-600">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}