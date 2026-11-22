// components/ModalPortal.js
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/* Modal yang dipanggil dari header nggak boleh dirender di dalam header:
   header pakai backdrop-blur, dan itu bikin position:fixed ngukur diri dari
   header (bukan layar) — hasilnya panel kepotong dan tombol tutup keluar layar.
   Portal memindahkan isinya ke <body>. Escape + klik latar juga nutup panel. */
export default function ModalPortal({ children, onClose, lockScroll = true }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!lockScroll) return;
    const sebelum = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = sebelum;
    };
  }, [lockScroll]);

  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
