// components/FilterWilayah.js
"use client";

// Filter wilayah bertingkat (negara -> provinsi -> kota) yang dibangun dari
// data yang benar-benar ada. Tiap tingkat bisa pilih satu atau beberapa
// sekaligus. Dipakai di tab Vendor supaya caranya sama.

import { MapPin, RotateCcw } from "lucide-react";
import FilterMulti from "@/components/FilterMulti";
import { daftarPilihan } from "@/lib/filterMulti";

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

  const nilaiNegara = daftarPilihan(nilai?.negara);
  const nilaiProvinsi = daftarPilihan(nilai?.provinsi);
  const nilaiKota = daftarPilihan(nilai?.kota);
  const aktif =
    nilaiNegara.length > 0 || nilaiProvinsi.length > 0 || nilaiKota.length > 0;

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-2" data-html2canvas-ignore="true">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1 shrink-0">
          <MapPin size={12} /> {label}
        </span>

        <FilterMulti
          label="Negara"
          labelSemua="Semua negara"
          lebar={150}
          pilihan={negara.map((n) => ({ id: n.nama, label: n.nama, jumlah: n.jumlah }))}
          nilai={nilaiNegara}
          onChange={(baru) => onChange({ negara: baru, provinsi: [], kota: [] })}
        />

        <FilterMulti
          label="Provinsi"
          labelSemua={provinsi.length ? "Semua provinsi" : "Pilih negara dulu"}
          lebar={190}
          pilihan={provinsi.map((p) => ({
            id: p.nama,
            kunci: `${p.negara}-${p.nama}`,
            label: p.nama,
            jumlah: p.jumlah,
          }))}
          nilai={nilaiProvinsi}
          onChange={(baru) =>
            onChange({ negara: nilaiNegara, provinsi: baru, kota: [] })
          }
        />

        <FilterMulti
          label="Kota"
          labelSemua={kota.length ? "Semua kota" : "Pilih provinsi dulu"}
          lebar={170}
          pilihan={kota.map((k) => ({
            id: k.nama,
            kunci: `${k.negara}-${k.provinsi}-${k.nama}`,
            label: k.nama,
            jumlah: k.jumlah,
          }))}
          nilai={nilaiKota}
          onChange={(baru) =>
            onChange({ negara: nilaiNegara, provinsi: nilaiProvinsi, kota: baru })
          }
        />

        {aktif && (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-stone-500 hover:text-stone-800"
            onClick={() => onChange({ negara: [], provinsi: [], kota: [] })}
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
