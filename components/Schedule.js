// components/Schedule.js
"use client";

export default function Schedule({ todayProgress, onUpdate }) {
  const schedule = [
    { time: "09:00", id: "npd", label: "📚 NPD", unit: "10 halaman" },
    { time: "10:00", id: "blender", label: "💻 Blender", unit: "1 jam" },
    { time: "11:00", id: "desain", label: "🎨 Illustrator/Photoshop", unit: "1 jam" },
    { time: "13:00", id: "kerja", label: "💼 Kerja (R&D)", unit: "5 jam" },
    { time: "20:30", id: "bisnis", label: "💼 Bisnis", unit: "1 jam" },
    { time: "21:30", id: "hafalan", label: "📖 Hafalan", unit: "1 halaman" },
    { time: "22:00", id: "mandarin", label: "🌏 Mandarin", unit: "30 menit" },
    { time: "22:30", id: "teknik", label: "📐 Teknik Mesin", unit: "45 menit" },
  ];

  const isDone = (id) => {
    if (id === "npd") return (todayProgress?.npd?.page || 0) >= 10;
    if (id === "blender") return (todayProgress?.blender?.selesai || false);
    if (id === "desain") return (todayProgress?.desain?.selesai || false);
    if (id === "kerja") return (todayProgress?.kerja?.selesai || false);
    if (id === "bisnis") return (todayProgress?.bisnis?.progress || 0) >= 3;
    if (id === "hafalan") return (todayProgress?.hafalan?.baru && todayProgress.hafalan.baru !== "");
    if (id === "mandarin") return (todayProgress?.mandarin?.lesson || 0) >= 1;
    if (id === "teknik") return (todayProgress?.teknik?.selesai || false);
    return false;
  };

  const handleDone = (id) => {
    if (id === "npd") onUpdate("npd", { page: 10 });
    else if (id === "blender") onUpdate("blender", { selesai: true });
    else if (id === "desain") onUpdate("desain", { selesai: true });
    else if (id === "kerja") onUpdate("kerja", { selesai: true });
    else if (id === "bisnis") onUpdate("bisnis", { progress: 3 });
    else if (id === "hafalan") onUpdate("hafalan", { baru: "Juz 1, Hal 1" });
    else if (id === "mandarin") onUpdate("mandarin", { lesson: 1 });
    else if (id === "teknik") onUpdate("teknik", { selesai: true, materi: "Selesai" });
  };

  const handleUndo = (id) => {
    if (id === "npd") onUpdate("npd", { page: 0 });
    else if (id === "blender") onUpdate("blender", { selesai: false });
    else if (id === "desain") onUpdate("desain", { selesai: false });
    else if (id === "kerja") onUpdate("kerja", { selesai: false });
    else if (id === "bisnis") onUpdate("bisnis", { progress: 0 });
    else if (id === "hafalan") onUpdate("hafalan", { baru: "" });
    else if (id === "mandarin") onUpdate("mandarin", { lesson: 0 });
    else if (id === "teknik") onUpdate("teknik", { selesai: false, materi: "" });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <h2 className="card-title text-base">📅 Jadwal Hari Ini</h2>
        <div className="divide-y divide-base-200">
          {schedule.map((item) => {
            const done = isDone(item.id);
            return (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold w-14">{item.time}</span>
                  <span className={`text-sm ${done ? 'line-through text-success' : ''}`}>
                    {item.label}
                    <span className="text-xs text-base-content/50 ml-1">({item.unit})</span>
                  </span>
                </div>
                <div className="flex gap-1">
                  {done ? (
                    <>
                      <span className="badge badge-success badge-sm">✅ Selesai</span>
                      <button 
                        className="btn btn-ghost btn-xs text-warning"
                        onClick={() => handleUndo(item.id)}
                        title="Batal"
                      >
                        ↩️
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleDone(item.id)}
                    >
                      ⏳ Belum
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}