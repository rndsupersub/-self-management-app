// lib/filterMulti.js
// Helper untuk filter yang boleh memilih satu ATAU beberapa nilai sekaligus.
//
// Aturan yang dipakai di seluruh aplikasi:
// - daftar kosong = tidak menyaring apa pun (semua tampil)
// - satu nilai = sama seperti filter lama (tetap kompatibel)
// - lebih dari satu nilai = tampilkan data yang cocok dengan salah satunya

export function daftarPilihan(nilai) {
  if (Array.isArray(nilai)) {
    return nilai.filter((v) => v !== undefined && v !== null && v !== "" && v !== "all" && v !== "semua");
  }
  if (nilai === undefined || nilai === null || nilai === "" || nilai === "all" || nilai === "semua") {
    return [];
  }
  return [nilai];
}

export function cocokPilihan(nilaiItem, dipilih) {
  const pilihan = daftarPilihan(dipilih);
  if (pilihan.length === 0) return true;
  return pilihan.includes(nilaiItem);
}

export function togglePilihan(dipilih, id) {
  const pilihan = daftarPilihan(dipilih);
  return pilihan.includes(id)
    ? pilihan.filter((v) => v !== id)
    : [...pilihan, id];
}

// Teks ringkas untuk tombol filter: "Semua", satu label, atau "N dipilih".
export function ringkasPilihan(daftarPilihanOpsi, dipilih, label = "pilihan", labelSemua = "Semua") {
  const aktif = (daftarPilihanOpsi || []).filter((p) => daftarPilihan(dipilih).includes(p.id));
  if (aktif.length === 0) return labelSemua;
  if (aktif.length === 1) return aktif[0].label;
  return `${aktif.length} ${label} dipilih`;
}
