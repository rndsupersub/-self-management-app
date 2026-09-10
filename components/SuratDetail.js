// components/SuratDetail.js
"use client";

export default function SuratDetail({ surat, progressData, onUpdate }) {
  const selesai = progressData?.hafalan?.selesai || false;
  const catatan = progressData?.hafalan?.catatan || "";
  const murajaahLembar = progressData?.murajaah?.lembar || 0;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Status Hafalan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex justify-between items-center">
            <h3 className="card-title text-sm">📖 Status Hafalan</h3>
            <span className={`badge ${selesai ? "badge-success" : "badge-ghost"}`}>
              {selesai ? "✅ Sudah Hafal" : "⏳ Belum"}
            </span>
          </div>
          <button
            className={`btn btn-sm ${selesai ? "btn-ghost" : "btn-primary"}`}
            onClick={() => onUpdate(surat.id, { hafalan: { selesai: !selesai } })}
          >
            {selesai ? "Batalkan Status Hafal" : "Tandai Sudah Hafal"}
          </button>
        </div>
      </div>

      {/* Murajaah per Surat */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <h3 className="card-title text-sm">🔄 Murajaah Surat Ini</h3>
          <div className="flex gap-2 items-center mt-2">
            <button
              className="btn btn-sm"
              onClick={() =>
                onUpdate(surat.id, { murajaah: { lembar: Math.max(0, murajaahLembar - 1) } })
              }
              disabled={murajaahLembar <= 0}
            >
              −1
            </button>
            <span className="text-lg font-bold w-8 text-center">{murajaahLembar}</span>
            <button
              className="btn btn-sm btn-info"
              onClick={() => onUpdate(surat.id, { murajaah: { lembar: murajaahLembar + 1 } })}
            >
              +1
            </button>
            <span className="text-sm text-base-content/50">lembar</span>
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <h3 className="card-title text-sm">📝 Catatan</h3>
          <textarea
            className="textarea textarea-bordered w-full text-sm"
            rows="3"
            placeholder="Misal: ayat 3 masih lupa, perlu diulang..."
            value={catatan}
            onChange={(e) => onUpdate(surat.id, { hafalan: { catatan: e.target.value } })}
          />
        </div>
      </div>

      {/* Voice Note Placeholder (nanti diisi fitur Telegram) */}
      <div className="card bg-base-100 shadow border-dashed border-2 border-base-300">
        <div className="card-body p-4 text-center">
          <h3 className="card-title text-sm justify-center">🎙️ Rekaman Hafalan (Telegram)</h3>
          <p className="text-xs text-base-content/50">
            Kirim voice note hafalan lewat Telegram Bot, nanti otomatis muncul di sini.
          </p>
          <p className="text-xs text-base-content/40 italic">(Fitur ini segera hadir)</p>
        </div>
      </div>
    </div>
  );
}