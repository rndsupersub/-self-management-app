// app/(dashboard)/dashboard/youtube/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  YOUTUBE_CHANNELS, 
  KONTEN_STATUS, 
  generateYoutubeId 
} from "@/lib/youtubeData";

export default function YouTubeDashboard() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("kalender"); // 'kalender' | 'daftar'
  const [activeChannel, setActiveChannel] = useState("gua"); 
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  
  // Form State
  const [form, setForm] = useState({
    id: "", channel: "gua", judul: "", tipe: "short", tanggal: "", status: "idea", linkYoutube: "", gdriveUrl: "", catatan: ""
  });

  // ========== INIT DATA ==========
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

  // ========== CALENDAR LOGIC ==========
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Minggu
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

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

  // ========== RENDER HELPERS ==========
  const getBadgeClass = (statusId) => {
    switch(statusId) {
      case "idea": return "badge-ghost";
      case "editing": return "badge-warning";
      case "ready": return "badge-info text-white";
      case "publish": return "badge-success text-white";
      default: return "badge-ghost";
    }
  };

  if (isLoading) return <div className="p-8 text-center text-base-content">Memuat YouTube Tracker...</div>;
  if (!user) return <div className="p-8 text-center text-error">Silakan login dulu!</div>;

  const filteredLogs = logs.filter(log => log.channel === activeChannel);

  // Hitung target batching (Minggu = 6 produksi, Senin-Sabtu = 1 publish)
  const isSunday = selectedDateStr ? new Date(selectedDateStr).getDay() === 0 : false;
  const targetLabel = isSunday ? "Target Hari Ini: 6 Produksi" : "Target Hari Ini: 1 Post";

  return (
    <div className="flex flex-col h-full bg-base-200">
      {/* BREADCRUMB */}
      <div className="p-4 text-sm breadcrumbs text-base-content/70">
        <ul>
          <li><Link href="/dashboard">🏠 Dashboard</Link></li>
          <li>YouTube</li>
        </ul>
      </div>

      <div className="flex-1 p-4 pt-0">
        <div className="bg-base-100 rounded-box shadow-sm border border-base-300 min-h-full flex flex-col p-6">
          
          {/* HEADER & TAMBAH BUTTON */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-base-content">
              📺 YouTube Tracker
            </h1>
            <button className="btn btn-primary btn-sm" onClick={() => openModal(todayStr)}>
              + Tambah Konten
            </button>
          </div>

          {/* CHANNEL FILTER */}
          <div className="mb-4">
            <div className="tabs tabs-boxed bg-base-200 inline-flex">
              {YOUTUBE_CHANNELS.map(ch => (
                <a 
                  key={ch.id} 
                  className={`tab font-bold ${activeChannel === ch.id ? "tab-active bg-primary text-primary-content" : ""}`}
                  onClick={() => setActiveChannel(ch.id)}
                >
                  {ch.nama}
                </a>
              ))}
            </div>
          </div>

          {/* TABS KALENDER VS DAFTAR */}
          <div className="tabs tabs-bordered mb-4">
            <a className={`tab tab-lg font-bold ${activeTab === "kalender" ? "tab-active text-primary" : ""}`} onClick={() => setActiveTab("kalender")}>
              📅 Kalender
            </a>
            <a className={`tab tab-lg font-bold ${activeTab === "daftar" ? "tab-active text-primary" : ""}`} onClick={() => setActiveTab("daftar")}>
              📋 Daftar Konten & Bank Stok
            </a>
          </div>

          {/* ISI TAB KALENDER */}
          {activeTab === "kalender" && (
            <div className="flex flex-col flex-1">
              {/* Kalender Header */}
              <div className="flex flex-col items-center mb-4 gap-2">
                <div className="flex items-center gap-4">
                  <button className="btn btn-sm btn-ghost" onClick={prevMonth}>{"<"}</button>
                  <span className="text-lg font-bold w-40 text-center text-base-content">
                    {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </span>
                  <button className="btn btn-sm btn-ghost" onClick={nextMonth}>{">"}</button>
                </div>
                <button className="btn btn-xs btn-outline rounded-full" onClick={goToToday}>Hari Ini</button>
              </div>

              {/* Kalender Grid */}
              <div className="grid grid-cols-7 gap-px bg-base-300 border border-base-300 rounded-lg overflow-hidden">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, i) => (
                  <div key={day} className={`bg-base-200 text-center py-2 text-sm font-bold ${i === 0 ? "text-error" : "text-base-content"}`}>
                    {day}
                  </div>
                ))}
                
                {days.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="bg-base-100 min-h-[100px]"></div>;
                  
                  const dateStr = getLocalDateString(year, month, day);
                  const dayLogs = filteredLogs.filter(l => l.tanggal === dateStr);
                  const isToday = dateStr === todayStr;
                  const isMinggu = new Date(year, month, day).getDay() === 0;

                  return (
                    <div 
                      key={day} 
                      className={`bg-base-100 min-h-[100px] p-2 cursor-pointer hover:bg-base-200 transition-colors border-t border-l border-base-300 relative group`}
                      onClick={() => openModal(dateStr)}
                    >
                      <div className={`text-right text-sm font-semibold mb-1 ${isToday ? "text-primary" : isMinggu ? "text-error" : "text-base-content/70"}`}>
                        {isToday ? (
                          <span className="bg-primary text-primary-content rounded-full w-6 h-6 inline-flex items-center justify-center">{day}</span>
                        ) : (
                          day
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayLogs.slice(0, 3).map(log => (
                          <div key={log.id} className="text-xs truncate bg-base-200 px-1 py-0.5 rounded border border-base-300">
                            {log.tipe === "short" ? "📱" : "🖥️"} {log.judul}
                          </div>
                        ))}
                        {dayLogs.length > 3 && <div className="text-xs text-center text-base-content/50">+{dayLogs.length - 3} lagi</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ISI TAB DAFTAR KONTEN & STOK */}
          {activeTab === "daftar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Bank Stok (Ready tapi belum publish) */}
              <div className="border border-info bg-info/5 rounded-xl p-4">
                <h2 className="text-lg font-bold text-info mb-4">📦 Bank Stok (Siap Publish)</h2>
                <div className="space-y-3">
                  {filteredLogs.filter(l => l.status === "ready").length === 0 ? (
                    <p className="text-sm opacity-50">Belum ada stok. Produksi dulu pas hari Minggu!</p>
                  ) : (
                    filteredLogs.filter(l => l.status === "ready").map(log => (
                      <div key={log.id} className="bg-base-100 border border-base-300 p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <div className="truncate pr-4">
                          <p className="font-bold text-sm truncate">{log.judul}</p>
                          <p className="text-xs opacity-60">Dibuat: {log.tanggal} | {log.tipe === "short" ? "Short" : "Video"}</p>
                        </div>
                        <button onClick={() => openModal(todayStr, {...log, status: "publish"})} className="btn btn-sm btn-info text-white">
                          Publish Hari Ini
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Kolom Semua Konten Terakhir */}
              <div className="border border-base-300 rounded-xl p-4 bg-base-50">
                <h2 className="text-lg font-bold mb-4">📝 Histori Konten</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredLogs.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0,20).map(log => {
                    const statusObj = KONTEN_STATUS.find(s => s.id === log.status);
                    return (
                      <div key={log.id} className="bg-base-100 border border-base-300 p-3 rounded-lg cursor-pointer hover:border-primary transition" onClick={() => openModal(log.tanggal, log)}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm line-clamp-1">{log.judul}</p>
                          <div className={`badge badge-sm ${getBadgeClass(log.status)}`}>{statusObj?.nama}</div>
                        </div>
                        <p className="text-xs opacity-60 flex gap-2">
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
      <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-11/12 max-w-2xl bg-base-100">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          
          <h3 className="font-bold text-lg mb-2">{form.id ? "✏️ Edit Konten" : "➕ Tambah Konten Baru"}</h3>
          
          {/* Info Batching */}
          <div className={`p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 ${isSunday ? "bg-warning/20 text-warning-content" : "bg-info/20 text-info-content"}`}>
            {isSunday ? "🛠️ Fokus Produksi: Jangan lupa siapin stok buat seminggu ke depan!" : "🚀 Fokus Upload: Publish stok yang udah ada!"}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Judul / Ide Konten</span></label>
              <input type="text" className="input input-bordered w-full" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required placeholder="Contoh: Vlog Test Top Speed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Tipe Konten</span></label>
                <select className="select select-bordered" value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})}>
                  <option value="short">📱 Short</option>
                  <option value="video">🖥️ Video Reguler</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Tanggal (Jadwal)</span></label>
                <input type="date" className="input input-bordered" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Status Pekerjaan</span></label>
              <select className="select select-bordered" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {KONTEN_STATUS.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Link GDrive (Upload Thumbnail/Mentahan di sini)</span></label>
              <input type="url" className="input input-bordered w-full" value={form.gdriveUrl} onChange={e => setForm({...form, gdriveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Link YouTube (Kalau udah publish)</span></label>
              <input type="url" className="input input-bordered w-full" value={form.linkYoutube} onChange={e => setForm({...form, linkYoutube: e.target.value})} placeholder="https://youtu.be/..." />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Catatan / Hashtag</span></label>
              <textarea className="textarea textarea-bordered h-20" value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} placeholder="Tulis catatan atau draft caption di sini..."></textarea>
            </div>

            <div className="modal-action justify-between mt-6">
              {form.id ? (
                <button type="button" onClick={() => handleDelete(form.id)} className="btn btn-error btn-outline">🗑️ Hapus</button>
              ) : <div></div>}
              
              <div className="space-x-2">
                <button type="button" onClick={closeModal} className="btn btn-ghost">Batal</button>
                <button type="submit" className="btn btn-primary">💾 Simpan Data</button>
              </div>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeModal}><button>close</button></form>
      </dialog>

    </div>
  );
}