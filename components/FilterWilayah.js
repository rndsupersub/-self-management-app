// components/FilterWilayah.js
"use client";

// Filter wilayah bertingkat (negara -> provinsi -> kota) yang dibangun dari
// data yang benar-benar ada. Dipakai di Direktori dan Vendor supaya keduanya
// punya cara yang sama untuk menyaring lokasi.

import { MapPin, RotateCcw } from "lucide-react";

const KELAS_SELECT =
  "select select-bordered select-xs w-full text-stone-800 bg-white min-w-0";

export default function FilterWilayah({
  pilihan,
  nilai,
  onChange,
  jumlah,
  jumlahTotal,
  label = "Wilayah",
}) {
  const negara = pilihan?.negara || [];
  const provinsi = pilihan?.provinsi || [];
  const kota = pilihan?.kota || [];
  const aktif = Boolean(nilai?.negara || nilai?.provinsi || nilai?.kota);

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-2" data-html2canvas-ignore="true">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1 shrink-0">
          <MapPin size={12} /> {label}
        </span>

        <select
          className={KELAS_SELECT}
          value={nilai?.negara || ""}
          onChange={(e) =>
            onChange({ negara: e.target.value, provinsi: "", kota: "" })
          }
          aria-label="Filter negara"
          style={{ maxWidth: 150 }}
        >
          <option value="">Semua negara</option>
          {negara.map((n) => (
            <option key={n.nama} value={n.nama}>
              {n.nama} ({n.jumlah})
            </option>
          ))}
        </select>

        <select
          className={KELAS_SELECT}
          value={nilai?.provinsi || ""}
          onChange={(e) => onChange({ ...nilai, provinsi: e.target.value, kota: "" })}
          aria-label="Filter provinsi"
          disabled={provinsi.length === 0}
          style={{ maxWidth: 190 }}
        >
          <option value="">Semua provinsi</option>
          {provinsi.map((p) => (
            <option key={`${p.negara}-${p.nama}`} value={p.nama}>
              {p.nama} ({p.jumlah})
            </option>
          ))}
        </select>

        <select
          className={KELAS_SELECT}
          value={nilai?.kota || ""}
          onChange={(e) => onChange({ ...nilai, kota: e.target.value })}
          aria-label="Filter kota"
          disabled={kota.length === 0}
          style={{ maxWidth: 170 }}
        >
          <option value="">Semua kota</option>
          {kota.map((k) => (
            <option key={`${k.negara}-${k.provinsi}-${k.nama}`} value={k.nama}>
              {k.nama} ({k.jumlah})
            </option>
          ))}
        </select>

        {aktif && (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-stone-500 hover:text-stone-800"
            onClick={() => onChange({ negara: "", provinsi: "", kota: "" })}
            title="Hapus filter wilayah"
          >
            <RotateCcw size={11} className="mr-1" /> Reset
          </button>
        )}

        {typeof jumlah === "number" && (
          <span className="text-[11px] text-stone-400 ml-auto">
            {jumlah}
            {typeof jumlahTotal === "number" && jumlahTotal !== jumlah ? ` / ${jumlahTotal}` : ""} entri
          </span>
        )}
      </div>
    </div>
  );
}
