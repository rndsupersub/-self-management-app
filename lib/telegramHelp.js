// lib/telegramHelp.js
// Panduan bot yang ramah: pendek, bertombol, dan akurat.
// Satu node = satu layar. Tombol "Kembali" selalu ada (kecuali root).
// Catatan: callback_data cuma boleh <= 64 byte, jadi pakai id pendek.

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "self_manage_alfathan_bot";

const HELP_NODES = {
  root: {
    title: "🤖 <b>Bot Self Management</b>",
    body: [
      "Pilih yang mau lo lakuin. Semua data langsung masuk ke website.",
      "",
      "Tips: tombol <b>📖 Panduan</b> ini bisa dibuka kapan aja lewat /help.",
    ].join("\n"),
    buttons: [
      [{ text: "💰 Keuangan", nav: "keuangan" }, { text: "💼 Pekerjaan", nav: "pekerjaan" }],
      [{ text: "🛒 Bisnis", nav: "bisnis" }, { text: "📚 Belajar", nav: "belajar" }],
      [{ text: "📖 Hafalan", nav: "hafalan" }, { text: "🏃 Olahraga", nav: "olahraga" }],
      [{ text: "📺 YouTube", nav: "youtube" }, { text: "📕 Bedah Buku", nav: "bedahbuku" }],
      [{ text: "🏪 Vendor", nav: "vendor" }, { text: "🔔 Reminder", nav: "reminder" }],
      [{ text: "🔗 Cara Link Akun", nav: "linking" }],
    ],
  },

  keuangan: {
    title: "💰 <b>Catat Keuangan</b>",
    body: [
      "Bot nanya urut: <b>jenis → kategori → nominal → metode → catatan → tanggal</b>.",
      "Tanggal default <b>hari ini (WIB)</b>, bisa diganti ke kemarin/besok.",
      "",
      "Contoh:",
      "• Keluar → Makan → 30000 → Cash",
      "• Masuk → Gaji Senin → 500000",
      "",
      "Dompet otomatis ditentukan dari kategori, jadi nggak perlu pilih manual.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat keuangan", start: "keuangan" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  pekerjaan: {
    title: "💼 <b>Catat Pekerjaan</b>",
    body: [
      "Urutannya: <b>PT → Brand → Judul → Kategori → Prioritas → Sumber → Tanggal mulai → Tanggal selesai → Catatan</b>.",
      "",
      "Tanggal mulai & selesai bisa beda, jadi kegiatan multi-hari kecatat sebagai satu rentang.",
      "Setelah tersimpan, kegiatan muncul di menu Pekerjaan → brand → Semua Kegiatan.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat pekerjaan", start: "pekerjaan" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  bisnis: {
    title: "🛒 <b>Catat Bisnis</b>",
    body: [
      "Urutannya: <b>Brand → Judul → Tanggal mulai → Tanggal selesai → Kategori → Prioritas → Sumber → Catatan</b>.",
      "",
      "Sama seperti Pekerjaan, tanggal bisa berupa rentang.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat bisnis", start: "bisnis" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  belajar: {
    title: "📚 <b>Catat Belajar</b>",
    body: [
      "Urutannya: <b>Kategori → Sub-kategori → Tool → Fitur (opsional) → Part (opsional) → Catatan → Link</b>.",
      "",
      "Catatan masuk ke kalender belajar sesuai tanggal hari ini.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat belajar", start: "belajar" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  hafalan: {
    title: "📖 <b>Catat Hafalan</b>",
    body: [
      "Urutannya: <b>Juz → Surat → Halaman mulai → Halaman selesai → Catatan</b>.",
      "",
      "Rekaman suara (voice note) bisa dikirim di tengah wizard, setelah surat dipilih.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat hafalan", start: "hafalan" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  olahraga: {
    title: "🏃 <b>Catat Olahraga</b>",
    body: [
      "Urutannya: <b>Jenis → Jumlah → Catatan</b>.",
      "",
      "Contoh jumlah: <code>7 km</code>, <code>20 reps</code>, <code>60 detik</code>.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat olahraga", start: "olahraga" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  youtube: {
    title: "📺 <b>Catat YouTube</b>",
    body: [
      "Urutannya: <b>Channel → Tipe → Judul → Status → Link YouTube → Link GDrive → Catatan</b>.",
      "",
      "Status: Ide, Recording, Editing, Ready, Published.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat YouTube", start: "youtube" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  bedahbuku: {
    title: "📕 <b>Catat Bedah Buku</b>",
    body: [
      "Urutannya: <b>Buku → Halaman mulai → Halaman selesai → Catatan</b>.",
      "",
      "Progress halaman otomatis masuk ke buku yang dipilih.",
    ].join("\n"),
    buttons: [
      [{ text: "➕ Mulai catat bedah buku", start: "bedah-buku" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  vendor: {
    title: "🏪 <b>Tambah Vendor</b>",
    body: [
      "Pilih <b>Pekerjaan</b> atau <b>Bisnis</b> dulu, lalu pilih PT/Brand.",
      "",
      "Setelah itu bot nanya data vendor (nama, kontak, alamat, MOQ, HPP, status) dan pertanyaan awal yang lo atur di web.",
    ].join("\n"),
    buttons: [
      [{ text: "💼 Vendor Pekerjaan", start: "pekerjaan" }, { text: "🛒 Vendor Bisnis", start: "bisnis" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  reminder: {
    title: "🔔 <b>Reminder</b>",
    body: [
      "<b>Reminder pribadi</b> — ngingetin jadwal harian 15, 5, dan 1 menit sebelum mulai.",
      "<b>Reminder proyek</b> — ngingetin deadline kegiatan H-7, H-3, H-1, dan saat lewat, plus follow up vendor.",
      "",
      "Buka status buat nyalain/matiin per bagian.",
    ].join("\n"),
    buttons: [
      [{ text: "🔔 Reminder pribadi", nav: "reminder_pribadi" }],
      [{ text: "📋 Reminder proyek", nav: "reminder_proyek" }],
      [{ text: "⬅️ Kembali", nav: "root" }],
    ],
  },

  reminder_pribadi: {
    title: "🔔 <b>Reminder Pribadi</b>",
    body: [
      "Bot ngikutin jadwal harian di web.",
      "",
      "Ketik <code>/reminder</code> buat lihat status & toggle.",
      "Ketik <code>/pause</code> buat matiin semua, <code>/resume</code> buat nyalain lagi.",
    ].join("\n"),
    buttons: [
      [{ text: "⚙️ Buka status reminder", open: "reminder" }],
      [{ text: "⬅️ Kembali", nav: "reminder" }],
    ],
  },

  reminder_proyek: {
    title: "📋 <b>Reminder Proyek</b>",
    body: [
      "Ngingetin deadline Pekerjaan & Bisnis, plus vendor yang lama nggak dikunjungi.",
      "",
      "Ketik <code>/reminder-proyek</code> buat lihat status & toggle.",
    ].join("\n"),
    buttons: [
      [{ text: "⚙️ Buka status reminder proyek", open: "reminder_proyek" }],
      [{ text: "⬅️ Kembali", nav: "reminder" }],
    ],
  },

  linking: {
    title: "🔗 <b>Cara Link Akun</b>",
    body: [
      "1. Buka website → tombol <b>Telegram</b> di atas",
      "2. Klik <b>Generate Pairing Code</b>",
      `3. Kirim ke bot ini: <code>/link KODE</code>`,
      "",
      `Bot: @${BOT_USERNAME}`,
      "",
      "Kalau belum di-link, bot cuma bisa /start, /help, dan /link.",
    ].join("\n"),
    buttons: [[{ text: "⬅️ Kembali", nav: "root" }]],
  },
};

export function buildHelpView(nodeId = "root") {
  const node = HELP_NODES[nodeId] || HELP_NODES.root;
  const keyboard = (node.buttons || []).map((row) =>
    row.map((b) => ({
      text: b.text,
      callback_data: b.nav ? `nav|${b.nav}` : b.open ? `open|${b.open}` : `start|${b.start}`,
    }))
  );
  return { text: `${node.title}\n\n${node.body}`, keyboard };
}

// Daftar menu dinamis (dari menu web + custom) dalam bentuk tombol.
export function buildMenuListView(userData = {}) {
  const menus = (userData.menus || []).filter((m) => m.visible !== false && m.id !== "dashboard");
  const custom = Object.values(userData.menusCustom || {});

  const rows = [];
  for (let i = 0; i < menus.length; i += 2) {
    const row = [{ text: trim(menus[i].label), callback_data: `start|${menus[i].id}` }];
    if (menus[i + 1]) row.push({ text: trim(menus[i + 1].label), callback_data: `start|${menus[i + 1].id}` });
    rows.push(row);
  }
  for (let i = 0; i < custom.length; i += 2) {
    const row = [{ text: trim(custom[i].nama), callback_data: `start|${custom[i].id}` }];
    if (custom[i + 1]) row.push({ text: trim(custom[i + 1].nama), callback_data: `start|${custom[i + 1].id}` });
    rows.push(row);
  }
  rows.push([{ text: "📖 Panduan", callback_data: "nav|root" }]);

  return {
    text: "<b>📋 Mau catat apa?</b>\n\nPilih menu di bawah. Tombol <b>📖 Panduan</b> buat lihat cara pakai.",
    keyboard: rows,
  };
}

function trim(text, max = 28) {
  const t = String(text || "").replace(/<[^>]*>/g, "");
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

// Command yang didaftarkan ke menu biru Telegram (setMyCommands).
// Nama command cuma boleh huruf kecil, angka, dan underscore.
export const BOT_COMMANDS = [
  { command: "start", description: "Mulai & menu utama" },
  { command: "help", description: "Panduan singkat" },
  { command: "menu_list", description: "Daftar menu yang bisa dicatat" },
  { command: "keuangan", description: "Catat transaksi keuangan" },
  { command: "pekerjaan", description: "Catat kegiatan pekerjaan" },
  { command: "bisnis", description: "Catat kegiatan bisnis" },
  { command: "belajar", description: "Catat belajar" },
  { command: "hafalan", description: "Catat hafalan" },
  { command: "olahraga", description: "Catat olahraga" },
  { command: "youtube", description: "Catat konten YouTube" },
  { command: "reminder", description: "Status reminder pribadi" },
  { command: "status", description: "Cek koneksi bot" },
];
