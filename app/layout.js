import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Self Management",
  description: "Sistem pengelolaan diri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-theme="calmindigo">
      <body className={jakartaSans.variable}>{children}</body>
    </html>
  );
}