// components/KelolaLabelKegiatan.js
// Kelola daftar Prioritas & Sumber. Dua-duanya disimpan per user di Firestore
// (prioritasList / sumberList) supaya bisa ditambah, di-rename, dihapus, dan diwarnai.
"use client";

import { useState } from "react";
import { Settings, X, Plus, Trash2, Save } from "lucide-react";
import { WARNA_OPTIONS, generateId, getWarnaStyle } from "@/lib/pekerjaanData";

function BarisLabel({ item, onChange, onDelete, placeholder }) {
  return (
    <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded p-2">
      <span
        className={`w-4 h-4 rounded shrink-0 ${getWarnaStyle(item.warna).dot}`}
      />
      <input
        type="text"
        className="input input-bordered input-sm flex-1 min-w-[120px] text-gray-800 bg-white"
        placeholder={placeholder}
        value={item.label}
        onChange={(e) => onChange({ ...item, label: e.target.value })}
      />
      <select
        className="select select-bordered select-sm text-gray-800 bg-white"
        value={item.warna || "gray"}
        onChange={(e) => onChange({ ...item, warna: e.target.value })}
        title="Warna badge"
      >
        {WARNA_OPTIONS.map((w) => (
          <option key={w.id} value={w.id}>
            {w.label}
          </option>
        ))}
      </select>
      <button
        className="btn btn-ghost btn-sm text-red-500"
        onClick={onDelete}
        title="Hapus"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function KelolaLabelKegiatan({
  prioritasList = [],
  sumberList = [],
  onUpdatePrioritasList,
  onUpdateSumberList,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("prioritas");
  const [draftPrioritas, setDraftPrioritas] = useState([]);
  const [draftSumber, setDraftSumber] = useState([]);
  const [error, setError] = useState("");

  const buka = () => {
    setDraftPrioritas(prioritasList.map((p) => ({ ...p })));
    setDraftSumber(sumberList.map((s) => ({ ...s })));
    setError("");
    setOpen(true);
  };

  const simpan = async () => {
    const prioritasRapi = draftPrioritas
      .map((p) => ({ ...p, label: (p.label || "").trim() }))
      .filter((p) => p.label);
    const sumberRapi = draftSumber
      .map((s) => ({ ...s, label: (s.label || "").trim() }))
      .filter((s) => s.label);

    if (prioritasRapi.length === 0) {
      setError("Minimal harus ada 1 prioritas.");
      return;
    }
    if (sumberRapi.length === 0) {
      setError("Minimal harus ada 1 sumber.");
      return;
    }

    try {
      await onUpdatePrioritasList(prioritasRapi);
      await onUpdateSumberList(sumberRapi);
      setOpen(false);
      setError("");
    } catch (e) {
      setError("Gagal nyimpen: " + (e?.message || "coba lagi."));
    }
  };

  const listAktif = tab === "prioritas" ? draftPrioritas : draftSumber;
  const setListAktif = tab === "prioritas" ? setDraftPrioritas : setDraftSumber;
  const prefixId = tab === "prioritas" ? "pri" : "sum";

  return (
    <>
      <button
        className="btn btn-ghost btn-xs text-gray-600"
        onClick={buka}
        title="Kelola Prioritas & Sumber"
      >
        <Settings size={14} className="mr-1" /> Kelola Prioritas & Sumber
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Settings size={18} /> Kelola Prioritas & Sumber
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="tabs tabs-boxed bg-gray-100 p-1 w-fit mb-3">
                <button
                  className={`tab tab-sm ${
                    tab === "prioritas"
                      ? "tab-active bg-white shadow text-gray-800 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setTab("prioritas")}
                >
                  Prioritas ({draftPrioritas.length})
                </button>
                <button
                  className={`tab tab-sm ${
                    tab === "sumber"
                      ? "tab-active bg-white shadow text-gray-800 font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setTab("sumber")}
                >
                  Sumber ({draftSumber.length})
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                {tab === "prioritas"
                  ? "Prioritas dipakai buat nandain seberapa penting kegiatan."
                  : "Sumber dipakai buat nandain kegiatan ini datang dari siapa."}
              </p>

              <div className="space-y-2">
                {listAktif.map((item) => (
                  <BarisLabel
                    key={item.id}
                    item={item}
                    placeholder={
                      tab === "prioritas" ? "Nama prioritas" : "Nama sumber"
                    }
                    onChange={(baru) =>
                      setListAktif((prev) =>
                        prev.map((x) => (x.id === item.id ? baru : x))
                      )
                    }
                    onDelete={() =>
                      setListAktif((prev) =>
                        prev.filter((x) => x.id !== item.id)
                      )
                    }
                  />
                ))}
              </div>

              <button
                className="btn btn-outline btn-sm w-full mt-3"
                onClick={() =>
                  setListAktif((prev) => [
                    ...prev,
                    {
                      id: generateId(prefixId),
                      label: "",
                      warna: "gray",
                    },
                  ])
                }
              >
                <Plus size={14} className="mr-1" />
                Tambah {tab === "prioritas" ? "Prioritas" : "Sumber"}
              </button>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2">
                  {error}
                </p>
              )}

              <p className="text-[10px] text-gray-500 mt-3">
                Item yang dihapus nggak bisa dipilih lagi di kegiatan baru, tapi
                kegiatan lama yang masih pakai item itu nggak berubah.
              </p>

              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm flex-1" onClick={simpan}>
                  <Save size={14} className="mr-1" /> Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
