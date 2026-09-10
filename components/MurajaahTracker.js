// components/MurajaahTracker.js
"use client";

export default function MurajaahTracker({ progressData, onUpdate }) {
  const target = 2;
  const lembar = progressData?.murajaahHarian?.lembar || 0;
  const selesai = lembar >= target;
  const pct = Math.min(100, Math.round((lembar / target) * 100));

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-base">🔄 Murajaah Hari Ini</h3>
          <span className={`badge ${selesai ? "badge-success" : "badge-ghost"}`}>
            {selesai ? "✅ Selesai" : `${lembar}/${target} lembar`}
          </span>
        </div>

        <progress className="progress progress-info w-full h-3" value={pct} max="100" />

        <div className="flex gap-2 mt-2">
          <button
            className="btn btn-info btn-sm"
            onClick={() => {
              const newLembar = Math.max(0, lembar - 1);
              onUpdate("hafalan", { murajaahHarian: { lembar: newLembar } });
            }}
            disabled={lembar <= 0}
          >
            −1
          </button>
          <button
            className="btn btn-info btn-sm flex-1"
            onClick={() => {
              const newLembar = Math.min(target + 5, lembar + 1);
              onUpdate("hafalan", { murajaahHarian: { lembar: newLembar } });
            }}
          >
            +1 Lembar
          </button>
        </div>

        <p className="text-xs text-base-content/50 mt-2">
          Target: {target} lembar/hari
        </p>
      </div>
    </div>
  );
}