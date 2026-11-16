This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Telegram Bot Setup

Environment variables:

| Variable | Wajib | Fungsi |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Ya | Token bot dari BotFather |
| `TELEGRAM_SETUP_SECRET` | Ya* | Secret buat memanggil endpoint setup webhook |
| `CRON_SECRET` | Ya* | Secret buat cron reminder (`/api/telegram/reminder`) |
| `TELEGRAM_WEBHOOK_SECRET` | Tidak | Secret token webhook. Kalau kosong, diturunkan otomatis dari bot token |
| `TELEGRAM_WEBHOOK_URL` | Tidak | URL lengkap webhook. Fallback ke `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` |

\* Minimal salah satu dari `TELEGRAM_SETUP_SECRET` atau `CRON_SECRET` harus diisi. Endpoint setup dan reminder menolak request tanpa secret.

Setelah deploy:

1. Daftarkan / perbaiki webhook. Secret token webhook ikut didaftarkan otomatis, jadi update dari Telegram nggak bisa dipalsukan. Ada dua cara, pilih salah satu:

   **Dari web (tanpa curl):** buka Dashboard → tombol **Telegram** → bagian **Webhook Bot** → klik **Aktifkan / Perbaiki Webhook**. Cukup login, nggak perlu secret. Cocok kalau bot tiba-tiba diam (`last_error` kelihatan di situ).

   **Dari terminal:**
   ```bash
   npm run telegram:setup                 # daftarin/perbaiki pakai URL webhook yang sedang aktif
   npm run telegram:setup -- --status     # cek status saja
   npm run telegram:setup -- --url=https://<domain>   # set URL baru
   ```

   **Manual (opsional):**
   ```bash
   curl -X POST "https://<domain>/api/telegram/setup?secret=<TELEGRAM_SETUP_SECRET>"
   ```

   URL webhook diambil dari `TELEGRAM_WEBHOOK_URL` → `NEXT_PUBLIC_APP_URL` → `VERCEL_URL`. Di production wajib `https`.
2. Jadwalkan cron tiap menit ke `POST https://<domain>/api/telegram/reminder` dengan header `x-cron-secret: <CRON_SECRET>` (atau body `{"secret":"<CRON_SECRET>"}`).
3. Buka Dashboard → Telegram → **Generate Pairing Code**, lalu kirim `/link KODE` ke bot. Kode berlaku 10 menit dan sekali pakai.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
