// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro"; // <-- UDAH DIGANTI KE PRO
import jsPDF from "jspdf";

export default function ExportPDFButton({ targetId = "export-area", fileName = "laporan.pdf", title = "Laporan" }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert(`Area dengan ID "${targetId}" tidak ditemukan.`);
      return;
    }

    setIsExporting(true);

    try {
      // 1. Capture element jadi canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Biar tajam (Retina)
        useCORS: true,
        backgroundColor: "#ffffff", // Biar nggak transparan
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // 2. Setup PDF A4 (210 x 297 mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 3. Hitung dimensi gambar biar proporsional
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // 4. Tambahin halaman pertama
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 5. Kalau kepanjangan, potong otomatis jadi multi-page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 6. Bikin footer teks di tiap halaman
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${title} — Halaman ${i} dari ${totalPages}`, 10, pageHeight - 5);
      }

      // 7. Save
      pdf.save(fileName);
    } catch (err) {
      console.error("Export PDF error:", err);
      alert("Gagal export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn btn-ghost btn-sm gap-1"
      title="Export halaman ini ke PDF"
    >
      {isExporting ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        "📄"
      )}
      {isExporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}