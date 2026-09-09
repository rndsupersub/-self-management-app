import "./globals.css";

export const metadata = {
  title: "Self Management",
  description: "Sistem pengelolaan diri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-theme="light">
      <body>{children}</body>
    </html>
  );
}