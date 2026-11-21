// components/TambahDariMaps.js
"use client";

// Jalan pintas GRATIS untuk mengisi direktori:
// cari tempatnya di Google Maps -> Bagikan -> Salin tautan -> tempel di sini.
// Aplikasi membaca nama + titik koordinat dari tautan, lalu minta alamat ke
// OpenStreetMap (tanpa API key). Tidak ada layanan berbayar yang dipakai.

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { ExternalLink, MapPin, Plus, Search, X } from "lucide-react";
import { uraiTautanMaps } from "@/lib/mapsTautan";
import { buatMitraKosong, deteksiWilayah } from "@/lib/direktoriData";

export default function TambahDariMaps({ onSiap }) {
  const [buka, setBuka] = useState(false);
  const [teks, setTeks] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState("");

  const ambil = async () => {
    const urai = uraiTautanMaps(teks);
    if (urai.lat === null && !urai.nama) {
      setPesan(
        urai.pendek
          ? "Tautan pendek (maps.app.goo.gl / goo.gl) tidak memuat titik peta. Buka dulu tautannya, tekan Bagikan → Salin tautan, lalu tempel tautan panjangnya."
          : urai.kataKunci
            ? "Tautan itu halaman hasil pencarian, bukan satu tempat. Buka salah satu usahanya di Google Maps, lalu tekan Bagikan → Salin tautan."
            : "Tempel tautan tempat dari Google Maps, atau ketik nama usahanya. Contoh: https://www.google.com/maps/place/Nama+Usaha/@-6.9,107.6,17z"
      );
      return;
    }

    setMemuat(true);
    setPesan("");
    let detail = {};
    let catatanAlamat = "";

    if (urai.lat !== null) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Sesi login tidak ditemukan. Muat ulang halaman lalu login lagi.");
        const token = await user.getIdToken();
        const param = new URLSearchParams({ lat: String(urai.lat), lon: String(urai.lon) });
        const res = await fetch(`/api/direktori/lihat?${param}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          detail = data;
          catatanAlamat = "Alamat diambil dari titik Google Maps (data peta OpenStreetMap).";
        } else {
          setPesan(
            data.error ||
              "Alamat otomatis belum bisa diambil. Titik koordinatnya tetap dipakai."
          );
        }
      } catch (err) {
        setPesan(
          `${err?.message || "Alamat otomatis gagal diambil."} Titik koordinatnya tetap dipakai.`
        );
      }
    }

    const kota = detail.kota || "";
    const provinsi = detail.provinsi || "";
    const negara = detail.negara || (urai.lat !== null ? "" : "Indonesia");

    const mitra = buatMitraKosong({
      nama: detail.nama || urai.nama || "",
      alamat: detail.alamat || "",
      kota,
      provinsi,
      negara,
      wilayah:
        detail.wilayah ||
        (urai.lat !== null ? "lainnya" : deteksiWilayah({ kota, provinsi, negara })),
      mapsUrl: urai.mapsUrl,
      mapsKoordinat:
        urai.lat !== null
          ? `https://www.google.com/maps/search/?api=1&query=${urai.lat},${urai.lon}`
          : "",
      koordinat: urai.lat !== null ? { lat: urai.lat, lon: urai.lon } : null,
      kontak: {
        telepon: detail.telepon || "",
        wa: detail.telepon || "",
      },
      website: detail.website || "",
      sumber: "google-maps",
      sumberUrl: urai.mapsUrl,
      catatan: catatanAlamat,
      layanan: urai.kataKunci && !urai.nama ? urai.kataKunci : "",
    });

    // Kalau alamat gagal diambil, jangan paksa wilayah "lainnya": biarkan
    // deteksi dari tautan (kalau ada nama kota di dalamnya).
    if (!detail.wilayah && urai.lat === null) {
      mitra.wilayah = deteksiWilayah({ kota, provinsi, negara });
    }

    onSiap(
      mitra,
      urai.lat !== null
        ? "Data dari Google Maps sudah terisi. Periksa nama, nomor telepon, dan layanannya, lalu simpan."
        : "Nama terbaca, tapi tautannya tidak memuat titik koordinat. Lengkapi alamat manual, atau salin ulang tautan dari tombol Bagikan di Google Maps."
    );

    setMemuat(false);
    setBuka(false);
    setTeks("");
  };

  return (
    <div className="card bg-white shadow border border-stone-200">
      <div className="card-body p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
              <MapPin size={15} className="text-stone-500" /> Tambah dari Google Maps
            </p>
            <p className="text-[11px] text-stone-500">
              Data peta publik belum selengkap Google Maps. Cari di Google Maps (gratis), salin
              tautannya, lalu tempel di sini — nama, titik peta, dan alamat terisi otomatis.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
            onClick={() => {
              setBuka((b) => !b);
              setPesan("");
            }}
            data-html2canvas-ignore="true"
          >
            {buka ? <X size={13} className="mr-1" /> : <Plus size={13} className="mr-1" />}
            {buka ? "Tutup" : "Tempel tautan"}
          </button>
        </div>

        {buka && (
          <div className="space-y-2" data-html2canvas-ignore="true">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="input input-bordered input-sm w-full text-stone-800 bg-white"
                placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/place/Nama+Usaha/@-6.9,107.6,17z"
                value={teks}
                onChange={(e) => setTeks(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ambil();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm shrink-0"
                onClick={ambil}
                disabled={memuat || teks.trim().length < 3}
              >
                {memuat ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-1" /> Mengambil...
                  </>
                ) : (
                  <>
                    <Search size={14} className="mr-1" /> Ambil data
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
              <span>Belum punya tautannya?</span>
              <a
                className="btn btn-xs btn-ghost text-stone-600 hover:text-stone-900"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  teks.trim() || "injection moulding bandung"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={12} className="mr-1" /> Buka Google Maps
                <ExternalLink size={10} className="ml-1" />
              </a>
              <span className="text-stone-400">
                Caranya: cari usahanya → Bagikan → Salin tautan.
              </span>
            </div>

            {pesan && (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                {pesan}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
