// components/SettingKeuangan.js
"use client";

import { useState } from "react";
import {
  DEFAULT_SETTING,
  DEFAULT_SUMBER_PEMASUKAN,
  DEFAULT_KATEGORI,
  generateId,
  formatRupiah,
} from "@/lib/keuanganData";

// ========== JENIS TRANSAKSI ==========
const JENIS_LIST = [
  { id: "masuk", label: "💰 Masuk" },
  { id: "keluar", label: "📤 Keluar" },
  { id: "tabungan", label: "🏦 Tabungan" },
  { id: "sedekah", label: "🤲 Sedekah" },
];

export default function SettingKeuangan({
  setting = DEFAULT_SETTING,
  sumberPemasukanList = DEFAULT_SUMBER_PEMASUKAN,
  kategoriList = DEFAULT_KATEGORI,
  onUpdateSetting,
  onUpdateSumberPemasukan,
  onUpdateKategori,
}) {
  // ========== STATE WARNING/DANGER ==========
  const [warningInput, setWarningInput] = useState(setting.warningPersen || 80);
  const [dangerInput, setDangerInput] = useState(setting.dangerPersen || 100);
  const [savedNotif, setSavedNotif] = useState("");

  // ========== STATE SUMBER PEMASUKAN ==========
  const [showFormSumber, setShowFormSumber] = useState(false);
  const [editingSumberId, setEditingSumberId] = useState(null);
  const [formSumber, setFormSumber] = useState({
    nama: "",
    nominal: "",
  });

  // ========== STATE KATEGORI ==========
  const [activeJenisKategori, setActiveJenisKategori] = useState("masuk");
  const [newKategoriNama, setNewKategoriNama] = useState("");
  const [editingKategoriId, setEditingKategoriId] = useState(null);
  const [editingKategoriNama, setEditingKategoriNama] = useState("");

  // ========== SIMPAN WARNING/DANGER ==========
  const handleSimpanSetting = () => {
    const w = parseInt(warningInput);
    const d = parseInt(dangerInput);

    if (!w || !d || w < 0 || d < 0 || w > 200 || d > 200) {
      alert("Persentase harus angka antara 0-200.");
      return;
    }

    if (w >= d) {
      alert("Warning harus lebih kecil dari Danger.");
      return;
    }

    onUpdateSetting({
      warningPersen: w,
      dangerPersen: d,
    });

    setSavedNotif("setting");
    setTimeout(() => setSavedNotif(""), 2000);
  };

  // ========== BUKA FORM SUMBER (TAMBAH) ==========
  const handleBukaFormSumber = () => {
    setFormSumber({ nama: "", nominal: "" });
    setEditingSumberId(null);
    setShowFormSumber(true);
  };

  // ========== BUKA FORM SUMBER (EDIT) ==========
  const handleBukaEditSumber = (sumber) => {
    setFormSumber({
      nama: sumber.nama,
      nominal: sumber.nominal || "",
    });
    setEditingSumberId(sumber.id);
    setShowFormSumber(true);
  };

  // ========== SIMPAN SUMBER PEMASUKAN ==========
  const handleSimpanSumber = () => {
    if (!formSumber.nama.trim()) return;

    const nominal = parseInt(formSumber.nominal) || 0;

    const newSumber = {
      id: editingSumberId || generateId("sumber"),
      nama: formSumber.nama.trim(),
      nominal,
    };

    let updated;
    if (editingSumberId) {
      updated = sumberPemasukanList.map((s) =>
        s.id === editingSumberId ? newSumber : s
      );
    } else {
      updated = [...sumberPemasukanList, newSumber];
    }

    onUpdateSumberPemasukan(updated);
    setShowFormSumber(false);
    setEditingSumberId(null);
    setFormSumber({ nama: "", nominal: "" });
  };

  // ========== HAPUS SUMBER PEMASUKAN ==========
  const handleHapusSumber = (id) => {
    if (!confirm("Hapus sumber pemasukan ini?")) return;
    const updated = sumberPemasukanList.filter((s) => s.id !== id);
    onUpdateSumberPemasukan(updated);
  };

  // ========== TAMBAH KATEGORI ==========
  const handleTambahKategori = () => {
    if (!newKategoriNama.trim()) return;

    const newKat = {
      id: generateId("kat"),
      nama: newKategoriNama.trim(),
    };

    const updated = {
      ...kategoriList,
      [activeJenisKategori]: [
        ...(kategoriList[activeJenisKategori] || []),
        newKat,
      ],
    };

    onUpdateKategori(updated);
    setNewKategoriNama("");
  };

  // ========== EDIT KATEGORI ==========
  const handleBukaEditKategori = (kat) => {
    setEditingKategoriId(kat.id);
    setEditingKategoriNama(kat.nama);
  };

  const handleSimpanEditKategori = () => {
    if (!editingKategoriNama.trim()) return;

    const updated = {
      ...kategoriList,
      [activeJenisKategori]: (kategoriList[activeJenisKategori] || []).map(
        (k) =>
          k.id === editingKategoriId
            ? { ...k, nama: editingKategoriNama.trim() }
            : k
      ),
    };

    onUpdateKategori(updated);
    setEditingKategoriId(null);
    setEditingKategoriNama("");
  };

  // ========== HAPUS KATEGORI ==========
  const handleHapusKategori = (id) => {
    if (!confirm("Hapus kategori ini? Transaksi yang udah ada tetap tersimpan."))
      return;

    const updated = {
      ...kategoriList,
      [activeJenisKategori]: (kategoriList[activeJenisKategori] || []).filter(
        (k) => k.id !== id
      ),
    };

    onUpdateKategori(updated);
  };

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          ⚙️ Atur warning/danger budget, sumber pemasukan, dan kategori
          transaksi. Semua <strong>editable</strong>.
        </span>
      </div>

      {/* ========== WARNING & DANGER ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            ⚠️ Warning & Danger Budget
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Warning (%) — default 80
              </label>
              <input
                type="number"
                min="0"
                max="200"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                value={warningInput}
                onChange={(e) => setWarningInput(e.target.value)}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Wallet dianggap <strong>Warning</strong> kalau pemakaian ≥
                persen ini.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Danger (%) — default 100
              </label>
              <input
                type="number"
                min="0"
                max="200"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                value={dangerInput}
                onChange={(e) => setDangerInput(e.target.value)}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Wallet dianggap <strong>Over Budget</strong> kalau pemakaian ≥
                persen ini.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={handleSimpanSetting}
            >
              💾 Simpan Setting
            </button>
          </div>

          {savedNotif === "setting" && (
            <div className="alert alert-success py-2 mt-2 text-xs">
              <span>✅ Setting berhasil disimpan!</span>
            </div>
          )}
        </div>
      </div>

      {/* ========== SUMBER PEMASUKAN ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              💵 Sumber Pemasukan ({sumberPemasukanList.length})
            </h3>
            <button
              className="btn btn-primary btn-xs"
              onClick={handleBukaFormSumber}
            >
              + Tambah
            </button>
          </div>

          {/* FORM SUMBER */}
          {showFormSumber && (
            <div className="bg-blue-50 rounded p-3 mb-3 space-y-2 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                {editingSumberId ? "✏️ Edit Sumber" : "➕ Tambah Sumber"}
              </p>

              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Nama sumber (misal: Gaji Senin)"
                value={formSumber.nama}
                onChange={(e) =>
                  setFormSumber({ ...formSumber, nama: e.target.value })
                }
                autoFocus
              />

              <input
                type="number"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Nominal (Rp) — misal: 90000"
                value={formSumber.nominal}
                onChange={(e) =>
                  setFormSumber({ ...formSumber, nominal: e.target.value })
                }
              />

              {formSumber.nominal && (
                <p className="text-xs text-gray-500">
                  = {formatRupiah(formSumber.nominal)}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpanSumber}
                  disabled={!formSumber.nama.trim()}
                >
                  {editingSumberId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => {
                    setShowFormSumber(false);
                    setEditingSumberId(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* LIST SUMBER */}
          <div className="space-y-2">
            {sumberPemasukanList.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-3">
                Belum ada sumber pemasukan.
              </p>
            ) : (
              sumberPemasukanList.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-2 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {s.nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRupiah(s.nominal || 0)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-xs text-gray-500"
                      onClick={() => handleBukaEditSumber(s)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleHapusSumber(s.id)}
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-gray-500 mt-3">
            💡 Kalau gaji naik atau bisnis jalan, tinggal <strong>tambah</strong>{" "}
            atau <strong>edit</strong> sumber pemasukan di sini.
          </p>
        </div>
      </div>

      {/* ========== KATEGORI TRANSAKSI ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            🏷️ Kategori Transaksi
          </h3>

          {/* TAB JENIS KATEGORI */}
          <div className="tabs tabs-boxed bg-gray-50 border border-gray-200 p-1 w-fit mb-3">
            {JENIS_LIST.map((j) => (
              <button
                key={j.id}
                className={`tab ${
                  activeJenisKategori === j.id
                    ? "tab-active bg-blue-600 text-white"
                    : ""
                }`}
                onClick={() => {
                  setActiveJenisKategori(j.id);
                  setEditingKategoriId(null);
                }}
              >
                {j.label} ({(kategoriList[j.id] || []).length})
              </button>
            ))}
          </div>

          {/* FORM TAMBAH KATEGORI */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
              placeholder={`Nama kategori baru untuk ${
                JENIS_LIST.find((j) => j.id === activeJenisKategori)?.label
              }`}
              value={newKategoriNama}
              onChange={(e) => setNewKategoriNama(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTambahKategori()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleTambahKategori}
              disabled={!newKategoriNama.trim()}
            >
              ➕ Tambah
            </button>
          </div>

          {/* LIST KATEGORI */}
          <div className="space-y-1">
            {(kategoriList[activeJenisKategori] || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-3">
                Belum ada kategori di jenis ini.
              </p>
            ) : (
              (kategoriList[activeJenisKategori] || []).map((k) => (
                <div
                  key={k.id}
                  className="flex justify-between items-center p-2 rounded border border-gray-200 bg-gray-50"
                >
                  {editingKategoriId === k.id ? (
                    <>
                      <input
                        type="text"
                        className="input input-bordered input-xs flex-1 text-gray-800 bg-white mr-2"
                        value={editingKategoriNama}
                        onChange={(e) =>
                          setEditingKategoriNama(e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSimpanEditKategori()
                        }
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={handleSimpanEditKategori}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditingKategoriId(null);
                            setEditingKategoriNama("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-800">{k.nama}</span>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs text-gray-500"
                          onClick={() => handleBukaEditKategori(k)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleHapusKategori(k.id)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-gray-500 mt-3">
            💡 Kategori yang udah dipakai di transaksi <strong>tidak akan hilang</strong>{" "}
            walau dihapus di sini. Transaksi lama tetap tersimpan.
          </p>
        </div>
      </div>
    </div>
  );
}