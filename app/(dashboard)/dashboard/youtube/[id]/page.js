"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  YOUTUBE_CHANNELS,
  KONTEN_STATUS,
  TIPE_KONTEN,
  generateYoutubeId,
  getTargetHarian,
} from "@/lib/youtubeData";

export default function YouTubeDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [form, setForm] = useState({
    id: "",
    judul: "",
    tipe: "short",
    tanggal: "",
    status: "idea",
    linkYoutube: "",
    gdriveUrl: "",
    catatan: "",
  });

  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
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
        if (data.activities) setActivities(data.activities);
        if (data.youtube && data.youtube.channels) setChannels(data.youtube.channels);
        else setChannels(YOUTUBE_CHANNELS);
        if (data.youtube_logs) setLogs(data.youtube_logs);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const saveLogsToFirestore = async (newLogs) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { youtube_logs: newLogs });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ===== KALENDER BULANAN (kayak Belajar) =====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const listBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array(firstDayOfMonth)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getLocalDateString = (y, m, d) => {
    const date = new Date(y, m, d);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const channelLogs = logs.filter((log) => log.channel === channelId);

  const openModal = (dateStr = today, logData = null) => {
    setSelectedDateStr(dateStr);
    if (logData) setForm(logData);
    else
      setForm({
        id: "",
        judul: "",
        tipe: "short",
        tanggal: dateStr,
        status: "idea",
        linkYoutube: "",
        gdriveUrl: "",
        catatan: "",
      });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.judul.trim()) return;

    const payload = { ...form, channel: channelId };
    let updatedLogs;
    if (form.id) updatedLogs = logs.map((l) => (l.id === form.id ? payload : l));
    else updatedLogs = [...logs, { ...payload, id: generateYoutubeId() }];

    setLogs(updatedLogs);
    await saveLogsToFirestore(updatedLogs);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus konten ini?")) return;
    const updatedLogs = logs.filter((l) => l.id !== id);
    setLogs(updatedLogs);
    await saveLogsToFirestore(updatedLogs);
    setIsModalOpen(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        Loading...
      </div>
    );

  const currentChannel =
    channels.find((c) => c.id === channelId) ||
    YOUTUBE_CHANNELS.find((c) => c.id === channelId);
  if (!currentChannel)
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        Channel tidak ditemukan.
      </div>
    );

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
                  onClick={() => router.push("/dashboard/youtube")}
                  className="cursor-pointer"
                >
                  📺 YouTube
                </a>
              </li>
              <li>
                <span>{currentChannel.nama}</span>
              </li>
            </ul>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentChannel.nama}
            </h1>
          </div>

          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("kalender")}
            >
              📅 Kalender
            </button>
            <button
              className={`tab ${
                activeTab === "daftar" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("daftar")}
            >
              📋 Daftar Konten
            </button>
          </div>

          {activeTab === "kalender" && (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          setCurrentDate(new Date(year - 1, month, 1))
                        }
                      >
                        «
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          setCurrentDate(new Date(year, month - 1, 1))
                        }
                      >
                        ‹
                      </button>
                    </div>
                    <div className="font-bold text-gray-800 text-lg">
                      {listBulan[month]} {year}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          setCurrentDate(new Date(year, month + 1, 1))
                        }
                      >
                        ›
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          setCurrentDate(new Date(year + 1, month, 1))
                        }
                      >
                        »
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hari Ini
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                      (d, i) => (
                        <div
                          key={d}
                          className={`text-center py-2 text-sm font-bold ${
                            i === 0 ? "text-red-500" : "text-gray-700"
                          }`}
                        >
                          {d}
                        </div>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-7 bg-gray-200 gap-px">
                    {days.map((day, idx) => {
                      if (!day)
                        return (
                          <div
                            key={`empty-${idx}`}
                            className="bg-white min-h-[100px]"
                          ></div>
                        );
                      const dateStr = getLocalDateString(year, month, day);
                      const dayLogs = channelLogs.filter(
                        (l) => l.tanggal === dateStr
                      );
                      const isToday = dateStr === today;
                      const target = getTargetHarian(dateStr);

                      return (
                        <div
                          key={day}
                          className="bg-white min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => openModal(dateStr)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-gray-400">
                              {dayLogs.length}/{target.target}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                isToday ? "text-blue-600" : "text-gray-700"
                              }`}
                            >
                              {day}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {dayLogs.map((log) => (
                              <div
                                key={log.id}
                                className="text-xs truncate bg-blue-50 text-blue-700 px-1.5 py-1 rounded border border-blue-200"
                              >
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
            </div>
          )}

          {activeTab === "daftar" && (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    📋 Semua Konten
                  </h2>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openModal()}
                  >
                    + Tambah Konten
                  </button>
                </div>
                {channelLogs.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">
                    Belum ada konten di channel ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {channelLogs
                      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                      .map((log) => {
                        const statusObj = KONTEN_STATUS.find(
                          (s) => s.id === log.status
                        );
                        return (
                          <div
                            key={log.id}
                            className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400"
                            onClick={() => openModal(log.tanggal, log)}
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-800">
                                {log.judul}
                              </p>
                              <p className="text-xs text-gray-500">
                                📅 {log.tanggal} •{" "}
                                {log.tipe === "short" ? "📱 Short" : "🖥️ Video"}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded text-white ${statusObj?.color}`}
                            >
                              {statusObj?.nama}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {form.id ? "✏️ Edit Konten" : `➕ Tambah Konten`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>
            <form
              id="youtubeForm"
              onSubmit={handleSave}
              className="p-4 space-y-4 overflow-y-auto max-h-[70vh]"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Judul Konten
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white text-gray-800"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipe
                  </label>
                  <select
                    className="select select-bordered w-full bg-white text-gray-800"
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                  >
                    {TIPE_KONTEN.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-white text-gray-800"
                    value={form.tanggal}
                    onChange={(e) =>
                      setForm({ ...form, tanggal: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="select select-bordered w-full bg-white text-gray-800"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {KONTEN_STATUS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link YouTube
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full bg-white text-gray-800"
                  value={form.linkYoutube}
                  onChange={(e) =>
                    setForm({ ...form, linkYoutube: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
              {form.tipe === "video" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Link GDrive (Thumbnail / Mentahan)
                  </label>
                  <input
                    type="url"
                    className="input input-bordered w-full bg-white text-gray-800"
                    value={form.gdriveUrl}
                    onChange={(e) =>
                      setForm({ ...form, gdriveUrl: e.target.value })
                    }
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  className="textarea textarea-bordered w-full bg-white text-gray-800"
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                ></textarea>
              </div>
            </form>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              {form.id ? (
                <button
                  type="button"
                  onClick={() => handleDelete(form.id)}
                  className="btn btn-outline btn-error btn-sm"
                >
                  🗑️ Hapus
                </button>
              ) : (
                <div></div>
              )}
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-sm text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="youtubeForm"
                  className="btn btn-primary btn-sm"
                >
                  💾 Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}