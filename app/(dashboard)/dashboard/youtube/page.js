// app/(dashboard)/dashboard/youtube/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";

// Gunakan DEFAULT_ACTIVITIES persis kayak di halaman Belajar lo
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData"; 

// Data YouTube yang udah kita buat di langkah sebelumnya
import { 
  YOUTUBE_CHANNELS, 
  KONTEN_STATUS, 
  generateYoutubeId,
  getTargetHarian
} from "@/lib/youtubeData";

export default function YouTubeDashboard() {
  const router = useRouter();
  
  // State Global & Layout (Mengikuti standar BelajarPage)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State YouTube
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("kalender"); // 'kalender' | 'daftar'
  const [activeChannel, setActiveChannel] = useState("gua"); 

  // State Kalender
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State Form & Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [form, setForm] = useState({
    id: "", channel: "gua", judul: "", tipe: "short", tanggal: "", status: "idea", linkYoutube: "", gdriveUrl: "", catatan: ""
  });

  // ========== INIT DATA ==========
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Load sidebar activities
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }
        // Load YouTube logs
        if (data.youtube_logs) {
          setLogs(data.youtube_logs);
        }
      } else {
        await setDoc(docRef, { activities: DEFAULT_ACTIVITIES, youtube_logs: [] }, { merge: true });
        setActivities(DEFAULT_ACTIVITIES);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
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

  // ========== CALENDAR LOGIC ==========
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const listTahun = Array.from({ length: 11 }, (_, i) => year - 5 + i);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Minggu
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getLocalDateString = (y, m, d) => {
    const date = new Date(y, m, d);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  };

  const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split("T")[0];

  // ========== MODAL & FORM HANDLERS ==========
  const openModal = (dateStr = todayStr, logData = null) => {
    setSelectedDateStr(dateStr);
    if (logData) {
      setForm(logData);
    } else {
      setForm({ id: "", channel: activeChannel, judul: "", tipe: "short", tanggal: dateStr, status: "idea", linkYoutube: "", gdriveUrl: "", catatan: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.judul.trim()) return alert("Judul wajib diisi!");

    let updatedLogs;
    if (form.id) {
      updatedLogs = logs.map((log) => (log.id === form.id ? form : log));
    } else {
      updatedLogs = [...logs, { ...form, id: generateYoutubeId() }];
    }

    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus konten ini secara permanen?")) return;
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    await saveToFirestore(updatedLogs);
    closeModal();
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-base-200">Loading...</div>;

  const filteredLogs = logs.filter(log => log.channel === activeChannel);
  const isSunday = selectedDateStr ? new Date(selectedDateStr).getDay() === 0 : false;
  const targetInfo = getTargetHarian(selectedDateStr || todayStr);

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar Sama Persis Kayak Belajar */}
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
        {/* Sidebar Sama Persis Kayak Belajar */}
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100 border-r border-gray-200`}>
          <Sidebar activities={activities} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a></li>
              <li>📺 YouTube</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">📺 YouTube Tracker</h1>
          </div>

          {/* Channel Selectors (Pill buttons kayak Belajar) */}
          <div className="flex gap-2 mb-6">
            {YOUTUBE_CHANNELS.map(ch => (
              <button 
                key={ch.id} 
                onClick={() => setActiveChannel(ch.id)}
                className={`btn btn-sm rounded-full ${activeChannel === ch.id ? "btn-primary" : "btn-outline"}`}
              >
                {ch.nama}
              </button>
            ))}
          </div>

          {/* TABS (Gaya kotak putih nyala biru, persis kayak Belajar) */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-bold" : "text-gray-600"}`} onClick={() => setActiveTab("kalender")}>
              📅 Kalender
            </button>
            <button className={`tab ${activeTab === "daftar" ? "tab-active bg-blue-600 text-white font-bold" : "text-gray-600"}`} onClick={() => setActiveTab("daftar")}>
              📋 Daftar Konten & Bank Stok
            </button>
          </div>

          {/* ISI TAB KALENDER */}
          {activeTab === "kalender" && (
            <div className="flex flex-col flex-1">
              {/* Kalender Header (Persis gambar perbandingan) */}
              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm text-lg" onClick={() => setCurrentDate(new Date(year - 1, month, 1))}>«</button>
                    <button className="btn btn-ghost btn-sm text-lg" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
                  </div>

                  <div className="flex gap-2">
                    <select className="select select-bordered select-sm bg-white font-bold text-gray-800" value={month} onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}>
                      {listBulan.map((b, i) => <option key={i} value={i}>{b}</option>)}
                    </select>
                    <select className="select select-bordered select-sm bg-white font-bold text-gray-800" value={year} onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}>
                      {listTahun.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm text-lg" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
                    <button className="btn btn-ghost btn-sm text-lg" onClick={() => setCurrentDate(new Date(year + 1, month, 1))}>»</button>
                  </div>
                </div>
                <button className="btn btn-outline border-gray-400 text-gray-700 btn-sm rounded-full px-6" onClick={() => setCurrentDate(new Date())}>
                  📅 Hari Ini
                </button>
              </div>

              {/* Kalender Grid (Persis kayak Bedah Buku/Belajar) */}
              <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                  {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, i) => (
                    <div key={day} className={`text-center py-3 text-sm font-bold ${i === 0 ? "text-red-500" : "text-gray-700"}`}>
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 bg-gray-200 gap-px">
                  {days.map((day, index) => {
                    if (day === null) return <div key={`empty-${index}`} className="bg-white min-h-[120px]"></div>;
                    
                    const dateStr = getLocalDateString(year, month, day);
                    const dayLogs = filteredLogs.filter(l => l.tanggal === dateStr);
                    const isToday = dateStr === todayStr;
                    const isMinggu = new Date(year, month, day).getDay() === 0;

                    return (
                      <div 
                        key={day} 
                        className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors relative group`}
                        onClick={() => openModal(dateStr)}
                      >
                        <div className={`text-right text-sm font-semibold mb-2 ${isToday ? "text-blue-600" : isMinggu ? "text-red-500" : "text-gray-700"}`}>
                          {isToday ? (
                            <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 inline-flex items-center justify-center">{day}</span>
                          ) : (
                            day
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayLogs.map(log => (
                            <div key={log.id} className="text-xs truncate bg-blue-50 text-blue-700 px-1.5 py-1 rounded border border-blue-200">
                              {log.tipe === "short" ? "📱" : "🖥️"} {log.judul}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ISI TAB DAFTAR KONTEN & STOK */}
          {activeTab === "daftar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Bank Stok */}
              <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-blue-700 mb-4">📦 Bank Stok (Siap Publish)</h2>
                <div className="space-y-3">
                  {filteredLogs.filter(l => l.status === "ready").length === 0 ? (
                    <p className="text-sm text-gray-400">Belum ada stok. Produksi dulu pas hari Minggu!</p>
                  ) : (
                    filteredLogs.filter(l => l.status === "ready").map(log => (
                      <div key={log.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <div className="truncate pr-4">
                          <p className="font-bold text-sm truncate text-gray-800">{log.judul}</p>
                          <p className="text-xs text-gray-500">Dibuat: {log.tanggal} | {log.tipe === "short" ? "Short" : "Video"}</p>
                        </div>
                        <button onClick={() => openModal(todayStr, {...log, status: "publish"})} className="btn btn-sm btn-primary shrink-0">
                          Publish Skrg
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Kolom Semua Konten */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Histori & Semua Konten</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredLogs.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).map(log => {
                    const statusObj = KONTEN_STATUS.find(s => s.id === log.status);
                    return (
                      <div key={log.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg cursor-pointer hover:border-blue-400 transition" onClick={() => openModal(log.tanggal, log)}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm text-gray-800 line-clamp-1">{log.judul}</p>
                          <span className={`text-xs px-2 py-0.5 rounded text-white ${statusObj?.color || "bg-gray-500"}`}>{statusObj?.nama}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex gap-2">
                          <span>📅 {log.tanggal}</span>
                          <span>• {log.tipe === "short" ? "📱 Short" : "🖥️ Video"}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL INPUT/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{form.id ? "✏️ Edit Konten" : `➕ Tambah Konten (${selectedDateStr})`}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-bold text-xl">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className={`p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 ${isSunday ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                {isSunday ? "🛠️ Fokus Produksi: Target siapin 6 stok hari ini!" : "🚀 Fokus Upload: Target publish 1 konten hari ini!"}
              </div>

              <form id="youtubeForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul / Ide Konten</label>
                  <input type="text" className="input input-bordered w-full bg-white text-gray-800" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required placeholder="Contoh: Vlog Test Top Speed" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Konten</label>
                    <select className="select select-bordered w-full bg-white text-gray-800" value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})}>
                      <option value="short">📱 Short</option>
                      <option value="video">🖥️ Video Reguler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                    <input type="date" className="input input-bordered w-full bg-white text-gray-800" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status Pekerjaan</label>
                  <select className="select select-bordered w-full bg-white text-gray-800" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {KONTEN_STATUS.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link GDrive (Thumbnail/Mentahan)</label>
                  <input type="url" className="input input-bordered w-full bg-white text-gray-800" value={form.gdriveUrl} onChange={e => setForm({...form, gdriveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link YouTube (Kalau udah publish)</label>
                  <input type="url" className="input input-bordered w-full bg-white text-gray-800" value={form.linkYoutube} onChange={e => setForm({...form, linkYoutube: e.target.value})} placeholder="https://youtu.be/..." />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan</label>
                  <textarea className="textarea textarea-bordered w-full h-20 bg-white text-gray-800" value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} placeholder="Hashtag atau draft deskripsi..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              {form.id ? (
                <button type="button" onClick={() => handleDelete(form.id)} className="btn btn-outline btn-error btn-sm">🗑️ Hapus</button>
              ) : <div></div>}
              
              <div className="space-x-2">
                <button type="button" onClick={closeModal} className="btn btn-ghost btn-sm text-gray-600">Batal</button>
                <button type="submit" form="youtubeForm" className="btn btn-primary btn-sm">💾 Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}