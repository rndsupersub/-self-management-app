// lib/telegramReminderProyek.js
// Logika khusus buat Reminder Pekerjaan & Bisnis (Terpisah dari Pribadi)

import { escapeHtml } from "./telegramData";

// ========== CONFIG REMINDER PROYEK ==========
export const REMINDER_PROYEK_CONFIG = {
  enabled: true, // Toggle global default
  deadlineH7: true,
  deadlineH3: true,
  deadlineH1: true,
  deadlineLewat: true,
  vendorFollowUp: true, // Ngingetin vendor yang belum dikunjungi
  vendorHari: 30, // Ngingetin kalau udah 30 hari nggak dikunjungi
};

export function todayStr() {
  // WIB, bukan UTC — biar H-7/H-3/H-1 nggak geser kalau dicek pagi.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Snooze disimpan terpisah dari log harian, key-nya ID reminder yang sama
// dengan yang dipakai scanner (`pekerjaan_<kegId>`, `vendor_<vendorId>`, dst).
export function isReminderSnoozed(userData, reminderId, now = Date.now()) {
  const until = userData?.reminderProyekSnooze?.[reminderId];
  if (!until) return false;
  const ts = new Date(until).getTime();
  return Number.isFinite(ts) && ts > now;
}

export function selisihHari(tanggalTarget, tanggalSekarang) {
  const t1 = new Date(tanggalTarget);
  const t2 = new Date(tanggalSekarang);
  const diffTime = t1 - t2;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ========== CARI KEGIATAN YANG BUTUH REMINDER ==========
export function cariReminderProyek(userData) {
  const hasil = [];
  const hariIni = todayStr();
  
  // Cek setting user, kalau dimatiin skip
  // Merge default biar toggle yang cuma nyimpen 1 key nggak matiin sub-key lain.
  const settings = { ...REMINDER_PROYEK_CONFIG, ...(userData.reminderProyekSettings || {}) };
  if (settings.enabled === false) return hasil;

  // 1. SCAN PEKERJAAN
  (userData.pekerjaan || []).forEach((pt) => {
    (pt.brands || []).forEach((brand) => {
      (brand.kegiatan || []).forEach((keg) => {
        if (keg.status === "selesai") return; // Skip yang udah selesai

        const deadline = keg.tanggalSelesai || keg.tanggal;
        const sisaHari = selisihHari(deadline, hariIni);

        let tipe = null;
        let label = "";

        if (sisaHari === 7 && settings.deadlineH7) { tipe = "H7"; label = "7 hari lagi"; }
        else if (sisaHari === 3 && settings.deadlineH3) { tipe = "H3"; label = "3 hari lagi"; }
        else if (sisaHari === 1 && settings.deadlineH1) { tipe = "H1"; label = "Besok"; }
        else if (sisaHari < 0 && settings.deadlineLewat) { tipe = "LEWAT"; label = `Lewat ${Math.abs(sisaHari)} hari`; }

        if (tipe) {
          hasil.push({
            id: `pekerjaan_${keg.id}`,
            tipe: "pekerjaan_deadline",
            subTipe: tipe,
            ptId: pt.id,
            ptNama: pt.nama,
            brandId: brand.id,
            brandNama: brand.nama,
            kegId: keg.id,
            judul: keg.judul,
            deadline: deadline,
            label: label,
            sisaHari: sisaHari
          });
        }
      });

      // 2. SCAN VENDOR (Belum dikunjungi)
      if (settings.vendorFollowUp) {
        (brand.vendorList || []).forEach((vendor) => {
          if (vendor.status === "belum_digunakan") return; // Skip yang disilence

          // Jangan sort array asli: urutan log kunjungan di web bisa berubah
          // cuma karena bot ngecek reminder.
          const logs = vendor.logKunjungan || [];
          const lastVisit = logs.length > 0 
            ? [...logs].sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal))[0].tanggal 
            : vendor.createdAt ? vendor.createdAt.split("T")[0] : hariIni;
          
          const selisih = selisihHari(hariIni, lastVisit);
          
          if (selisih >= settings.vendorHari) {
            hasil.push({
              id: `vendor_${vendor.id}`,
              tipe: "vendor_followup",
              ptId: pt.id,
              ptNama: pt.nama,
              brandId: brand.id,
              brandNama: brand.nama,
              vendorId: vendor.id,
              vendorNama: vendor.nama,
              lastVisit: lastVisit,
              selisihHari: selisih
            });
          }
        });
      }
    });
  });

  // 3. SCAN BISNIS
  (userData.bisnisBrands || []).forEach((brand) => {
    (brand.kegiatan || []).forEach((keg) => {
      if (keg.status === "selesai") return;

      const deadline = keg.tanggalSelesai || keg.tanggal;
      const sisaHari = selisihHari(deadline, hariIni);

      let tipe = null;
      let label = "";

      if (sisaHari === 7 && settings.deadlineH7) { tipe = "H7"; label = "7 hari lagi"; }
      else if (sisaHari === 3 && settings.deadlineH3) { tipe = "H3"; label = "3 hari lagi"; }
      else if (sisaHari === 1 && settings.deadlineH1) { tipe = "H1"; label = "Besok"; }
      else if (sisaHari < 0 && settings.deadlineLewat) { tipe = "LEWAT"; label = `Lewat ${Math.abs(sisaHari)} hari`; }

      if (tipe) {
        hasil.push({
          id: `bisnis_${keg.id}`,
          tipe: "bisnis_deadline",
          subTipe: tipe,
          brandId: brand.id,
          brandNama: brand.nama,
          kegId: keg.id,
          judul: keg.judul,
          deadline: deadline,
          label: label,
          sisaHari: sisaHari
        });
      }
    });

    // Scan Vendor Bisnis
    if (settings.vendorFollowUp) {
      (brand.vendorList || []).forEach((vendor) => {
        if (vendor.status === "belum_digunakan") return;

        const logs = vendor.logKunjungan || [];
        const lastVisit = logs.length > 0 
          ? [...logs].sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal))[0].tanggal 
          : vendor.createdAt ? vendor.createdAt.split("T")[0] : hariIni;
        
        const selisih = selisihHari(hariIni, lastVisit);
        
        if (selisih >= settings.vendorHari) {
          hasil.push({
            id: `vendor_bisnis_${vendor.id}`,
            tipe: "vendor_followup_bisnis",
            brandId: brand.id,
            brandNama: brand.nama,
            vendorId: vendor.id,
            vendorNama: vendor.nama,
            lastVisit: lastVisit,
            selisihHari: selisih
          });
        }
      });
    }
  });

  return hasil.filter((rem) => !isReminderSnoozed(userData, rem.id));
}

// ========== BUILD TEKS & TOMBOL ==========
export function buildReminderProyekMessage(rem) {
  let text = "";
  let buttons = [];

  if (rem.tipe === "pekerjaan_deadline" || rem.tipe === "bisnis_deadline") {
    const emoji = rem.subTipe === "LEWAT" ? "⚠️" : "⏰";
    const infoLokasi = rem.tipe === "pekerjaan_deadline" 
      ? `PT ${escapeHtml(rem.ptNama)} - ${escapeHtml(rem.brandNama)}` 
      : `Bisnis ${escapeHtml(rem.brandNama)}`;
    
    // Judul/lokasi diisi user, jadi wajib di-escape: kalau ada "&" atau "<"
    // Telegram nolak pesan HTML dan reminder-nya nggak pernah terkirim.
    text = `${emoji} <b>Reminder Deadline</b>\n\n📌 <b>${escapeHtml(rem.judul)}</b>\n🏢 ${infoLokasi}\n📅 Deadline: ${escapeHtml(rem.deadline)}\n⏳ Status: <b>${rem.label}</b>`;
    
    buttons = [
      [
        { text: "✅ Tandai Selesai", callback_data: `proyek_selesai|${rem.tipe}|${rem.kegId}` },
        { text: "⏳ Tunda 1 Hari", callback_data: `proyek_tunda|${rem.tipe}|${rem.kegId}` }
      ]
    ];
  } else if (rem.tipe === "vendor_followup" || rem.tipe === "vendor_followup_bisnis") {
    const infoLokasi = rem.tipe === "vendor_followup" 
      ? `PT ${escapeHtml(rem.ptNama)} - ${escapeHtml(rem.brandNama)}` 
      : `Bisnis ${escapeHtml(rem.brandNama)}`;
      
    text = `🏪 <b>Reminder Follow Up Vendor</b>\n\n🏭 <b>${escapeHtml(rem.vendorNama)}</b>\n🏢 ${infoLokasi}\n📅 Terakhir dikunjungi: ${escapeHtml(rem.lastVisit)}\n⏳ Udah <b>${rem.selisihHari} hari</b> nggak dikunjungi.`;
    
    buttons = [
      [
        { text: "📞 Follow Up", callback_data: `proyek_vendor_followup|${rem.tipe}|${rem.vendorId}` },
        { text: "⏳ Tunda 1 Minggu", callback_data: `proyek_vendor_tunda|${rem.tipe}|${rem.vendorId}` }
      ],
      [
        { text: "🚫 Tandai Belum Digunakan", callback_data: `proyek_vendor_belum|${rem.tipe}|${rem.vendorId}` }
      ]
    ];
  }

  return { text, buttons };
}