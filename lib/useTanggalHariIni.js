"use client";

// lib/useTanggalHariIni.js
// Tanggal hari ini versi lokal (browser), tanpa setState di dalam useEffect.
//
// Kenapa begini: tanggal baru bisa dihitung di klien, dan menghitungnya saat
// render server bikin hydration mismatch. `useSyncExternalStore` adalah cara
// resmi React untuk nilai yang cuma ada di klien: server dapat "" (sama seperti
// HTML awal), lalu setelah hidrasi otomatis dapat tanggal asli.

import { useSyncExternalStore } from "react";

const tidakAdaPerubahan = () => () => {};

const tanggalSekarang = () =>
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
    new Date().getDate()
  ).padStart(2, "0")}`;

export default function useTanggalHariIni() {
  return useSyncExternalStore(tidakAdaPerubahan, tanggalSekarang, () => "");
}
