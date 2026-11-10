// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Self Management",
  description: "Sistem pengelolaan diri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-theme="calmindigo">
      <head>
        {/* 
          PERBAIKAN: 
          Kita panggil font Plus Jakarta Sans pakai tag <link> biasa.
          Ini 100% menghindari bug Turbopack Vercel, dan font lo TETAP SAMA.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      {/* 
        PERBAIKAN: 
        Tambahin inline style fontFamily biar body-nya otomatis pakai font ini.
      */}
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}