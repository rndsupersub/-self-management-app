// lib/holidays.js
// Data libur nasional Indonesia + cuti bersama
// Sumber: SKB 3 Menteri
// Catatan: Data 2027 masih prediksi, bisa berubah

export const HOLIDAYS = {
  // ========== 2026 ==========
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Mikraj Nabi Muhammad SAW",
  "2026-02-16": "Cuti Bersama Tahun Baru Imlek",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-18": "Cuti Bersama Hari Suci Nyepi",
  "2026-03-19": "Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-03-20": "Cuti Bersama Idul Fitri",
  "2026-03-21": "Idul Fitri 1447 Hijriah",
  "2026-03-22": "Idul Fitri 1447 Hijriah",
  "2026-03-23": "Cuti Bersama Idul Fitri",
  "2026-03-24": "Cuti Bersama Idul Fitri",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Kebangkitan Yesus Kristus (Paskah)",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-15": "Cuti Bersama Kenaikan Yesus Kristus",
  "2026-05-27": "Idul Adha 1447 Hijriah",
  "2026-05-28": "Cuti Bersama Idul Adha",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "1 Muharam Tahun Baru Islam 1448 Hijriah",
  "2026-08-17": "Proklamasi Kemerdekaan RI",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-24": "Cuti Bersama Natal",
  "2026-12-25": "Kelahiran Yesus Kristus (Natal)",

  // ========== 2027 (PREDIKSI) ==========
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-01-05": "Isra Mikraj Nabi Muhammad SAW",
  "2027-02-05": "Cuti Bersama Tahun Baru Imlek",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
  "2027-03-08": "Cuti Bersama Idul Fitri",
  "2027-03-09": "Hari Raya Nyepi (Tahun Baru Saka 1949)",
  "2027-03-10": "Idul Fitri 1448 Hijriah",
  "2027-03-11": "Idul Fitri 1448 Hijriah (Cuti Bersama)",
  "2027-03-12": "Cuti Bersama Idul Fitri",
  "2027-03-26": "Wafat Isa Almasih (Jumat Agung)",
  "2027-03-28": "Kebangkitan Isa Almasih (Paskah)",
  "2027-04-07": "Cuti Bersama Hari Suci Nyepi",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Isa Almasih",
  "2027-05-07": "Cuti Bersama Kenaikan Isa Almasih",
  "2027-05-16": "Hari Raya Waisak 2571 BE",
  "2027-05-18": "Cuti Bersama Idul Adha",
  "2027-05-21": "Cuti Bersama Waisak",
  "2027-06-01": "Hari Lahir Pancasila",
  "2027-06-06": "Tahun Baru Islam 1449 Hijriah",
  "2027-06-16": "Idul Adha 1448 Hijriah",
  "2027-08-15": "Maulid Nabi Muhammad SAW",
  "2027-08-17": "Proklamasi Kemerdekaan RI ke-82",
  "2027-12-24": "Cuti Bersama Natal",
  "2027-12-25": "Hari Raya Natal",
};

export function isHoliday(dateStr) {
  return HOLIDAYS[dateStr] || null;
}