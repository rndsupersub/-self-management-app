// lib/tanggalLokal.js
// Helper tanggal berbasis zona waktu lokal user/browser.
// Jangan pakai toISOString() buat tanggal kalender: di WIB (UTC+7),
// `new Date(2026, 10, 1).toISOString()` jatuh ke 31 Oktober.

export function parseTanggalLokal(dateStr) {
  if (dateStr instanceof Date) return new Date(dateStr);
  if (!dateStr) return null;

  const s = String(dateStr).trim();
  const match = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3] || 1));
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTanggalLokal(date) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const tanggal = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

export function getTanggalHariIniLokal() {
  return formatTanggalLokal(new Date());
}
