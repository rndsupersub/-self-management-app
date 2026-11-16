// components/PerbandinganPeriode.js
// Head-to-head: periode yang dipilih vs periode sebelumnya, komponen per
// komponen (masuk, keluar, tabungan, sedekah, net). Dua batang per baris biar
// langsung kelihatan mana yang lebih besar tanpa baca angka dulu.

"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatRupiah } from "@/lib/keuanganData";

function Baris({ label, sekarang, lalu, labelSekarang, labelLalu, naikBagus }) {
  const maks = Math.max(Math.abs(sekarang), Math.abs(lalu), 1);
  const lebarSekarang = (Math.abs(sekarang) / maks) * 100;
  const lebarLalu = (Math.abs(lalu) / maks) * 100;
  const selisih = sekarang - lalu;
  const persen = lalu === 0 ? null : Math.round((selisih / Math.abs(lalu)) * 100);
  const naik = selisih > 0;
  const bagus = selisih === 0 ? null : naikBagus ? naik : !naik;

  return (
    <div className="p-2 rounded border border-gray-200 bg-gray-50">
      <div className="flex justify-between items-baseline text-xs mb-1">
        <span className="font-semibold text-gray-700">{label}</span>
        <span
          className={`inline-flex items-center gap-0.5 ${
            bagus === null ? "text-gray-400" : bagus ? "text-green-600" : "text-red-600"
          }`}
        >
          {bagus === null ? <Minus size={12} /> : naik ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {selisih === 0
            ? "sama"
            : `${selisih > 0 ? "+" : "−"}${formatRupiah(Math.abs(selisih))}${
                persen === null ? "" : ` (${Math.abs(persen)}%)`
              }`}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-24 truncate">{labelSekarang}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className="h-2 rounded bg-blue-500" style={{ width: `${lebarSekarang}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-gray-700 w-20 text-right">
            {formatRupiah(sekarang)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-24 truncate">{labelLalu}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className="h-2 rounded bg-gray-400" style={{ width: `${lebarLalu}%` }} />
          </div>
          <span className="text-[11px] text-gray-600 w-20 text-right">{formatRupiah(lalu)}</span>
        </div>
      </div>
    </div>
  );
}

export default function PerbandinganPeriode({
  sekarang,
  lalu,
  labelSekarang = "Periode ini",
  labelLalu = "Pembanding",
}) {
  if (!sekarang || !lalu) return null;

  return (
    <div className="space-y-2">
      <Baris
        label="Pemasukan"
        sekarang={sekarang.total.masuk}
        lalu={lalu.total.masuk}
        labelSekarang={labelSekarang}
        labelLalu={labelLalu}
        naikBagus
      />
      <Baris
        label="Pengeluaran (+ sedekah)"
        sekarang={sekarang.total.keluar + sekarang.total.sedekah}
        lalu={lalu.total.keluar + lalu.total.sedekah}
        labelSekarang={labelSekarang}
        labelLalu={labelLalu}
        naikBagus={false}
      />
      <Baris
        label="Tabungan"
        sekarang={sekarang.total.tabungan}
        lalu={lalu.total.tabungan}
        labelSekarang={labelSekarang}
        labelLalu={labelLalu}
        naikBagus
      />
      <Baris
        label="Cash Flow Bersih"
        sekarang={sekarang.net}
        lalu={lalu.net}
        labelSekarang={labelSekarang}
        labelLalu={labelLalu}
        naikBagus
      />
    </div>
  );
}
