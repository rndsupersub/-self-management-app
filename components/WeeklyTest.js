// components/WeeklyTest.js
"use client";

export default function WeeklyTest({ progressData, onUpdate }) {
  const status = progressData?.tesMingguan?.status;
  const tanggal = progressData?.tesMingguan?.tanggal;

  const handleTest = (newStatus) => {
    const today = new Date().toISOString().split("T")[0];
    onUpdate("hafalan", {
      tesMingguan: { status: newStatus, tanggal: today }
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <h3 className="card-title text-base">📝 Tes Murajaah Mingguan</h3>

        {status ? (
          <div className="space-y-2">
            <div className={`alert ${status === "lulus" ? "alert-success" : "alert-warning"}`}>
              <span>
                {status === "lulus" ? "✅ Lulus" : "⚠️ Perlu Ulang"} — {tanggal}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm w-full"
              onClick={() => handleTest(null)}
            >
              Reset Tes
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-base-content/70 mb-3">
              Rekam hafalan murajaah lo minggu ini, terus nilai diri sendiri.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-success btn-sm flex-1"
                onClick={() => handleTest("lulus")}
              >
                ✅ Lulus
              </button>
              <button
                className="btn btn-warning btn-sm flex-1"
                onClick={() => handleTest("perlu_ulang")}
              >
                🔄 Perlu Ulang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}