// components/KalenderTransaksi.js
"use client";

import { useState, useMemo } from "react";
import { DEFAULT_DOMPET, DEFAULT_KATEGORI, formatRupiah, formatTanggal, generateId, getTanggalHariIni, deriveWalletId } from "@/lib/keuanganData";
import { HOLIDAYS } from "@/lib/holidays";
import { Wallet, ArrowUpRight, Landmark, HeartHandshake, Calendar, Info, Pencil, Plus, Trash2, MessageSquare, Banknote, AlertTriangle, Save } from "lucide-react";

export default function KalenderTransaksi({
  keuanganTransaksi = {},
  dompetList = DEFAULT_DOMPET,
  kategoriList = DEFAULT_KATEGORI,
  onSimpanTransaksi,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTanggalHariIni());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ jenis: "keluar", kategori: "", nominal: "", metode: "Cash", catatan: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => { const now = new Date(); setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(getTanggalHariIni()); };
  const handleMonthChange = (e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  const transaksiHariIni = useMemo(
    () => keuanganTransaksi[selectedDate] || [],
    [keuanganTransaksi, selectedDate]
  );

  const getWalletId = (jenis, kategoriId) =>
    deriveWalletId(kategoriList, jenis, kategoriId);

  const handleBukaForm = () => { setFormData({ jenis: "keluar", kategori: "", nominal: "", metode: "Cash", catatan: "" }); setEditingId(null); setErrorMsg(""); setShowForm(true); };
  const handleBukaEdit = (trx) => { setFormData({ jenis: trx.jenis, kategori: trx.kategoriId || "", nominal: trx.nominal || "", metode: trx.metode || "Cash", catatan: trx.catatan || "" }); setEditingId(trx.id); setErrorMsg(""); setShowForm(true); };

  // Simpan dikirim sebagai AKSI (tambah/edit/hapus), bukan peta penuh.
  // Halaman yang menerapkannya ke data terbaru server, jadi edit/hapus
  // nggak bisa ketimpa tulisan lain yang telat.
  const handleSimpan = async () => {
    setErrorMsg("");
    if (!formData.kategori) { setErrorMsg("Pilih kategori dulu."); return; }
    const nominal = parseInt(formData.nominal);
    if (!nominal || nominal <= 0) { setErrorMsg("Nominal harus lebih dari 0."); return; }
    if (menyimpan) return;

    const walletId = getWalletId(formData.jenis, formData.kategori);
    const sekarang = new Date().toISOString();
    const trx = { jenis: formData.jenis, kategoriId: formData.kategori, nominal, metode: formData.metode, catatan: formData.catatan, walletId, updatedAt: sekarang };
    if (editingId) trx.id = editingId;
    else { trx.id = generateId("trx"); trx.createdAt = sekarang; }

    setMenyimpan(true);
    const ok = await onSimpanTransaksi?.({
      aksi: editingId ? "edit" : "tambah",
      tanggal: selectedDate,
      trx,
      id: editingId,
    });
    setMenyimpan(false);
    if (ok === false) return; // pesan gagal sudah ditampilkan halaman
    setShowForm(false); setEditingId(null);
  };

  const handleHapus = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    if (menyimpan) return;
    setMenyimpan(true);
    await onSimpanTransaksi?.({ aksi: "hapus", tanggal: selectedDate, id });
    setMenyimpan(false);
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = []; for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = getTanggalHariIni();

  const getTransaksiByDate = (date) => keuanganTransaksi[date] || [];
  const getDotColor = (trxList) => {
    if (!trxList || trxList.length === 0) return null;
    if (trxList.some((t) => t.jenis === "masuk")) return "bg-green-500";
    if (trxList.some((t) => t.jenis === "keluar")) return "bg-error";
    if (trxList.some((t) => t.jenis === "tabungan")) return "bg-stone-600";
    if (trxList.some((t) => t.jenis === "sedekah")) return "bg-orange-500";
    return "bg-gray-400";
  };
  const getKategoriObj = (jenis, kategoriId) => (kategoriList[jenis] || []).find((k) => k.id === kategoriId);

  const jenisList = [
    { id: "masuk", label: "Masuk", icon: <Wallet size={14} className="mr-1"/> },
    { id: "keluar", label: "Keluar", icon: <ArrowUpRight size={14} className="mr-1"/> },
    { id: "tabungan", label: "Tabungan", icon: <Landmark size={14} className="mr-1"/> },
    { id: "sedekah", label: "Sedekah", icon: <HeartHandshake size={14} className="mr-1"/> },
  ];
  const getJenisLabel = (id) => jenisList.find((j) => j.id === id)?.label || id;
  const getJenisColor = (id) => {
    if (id === "masuk") return "text-green-700 bg-green-50 border-green-200";
    if (id === "keluar") return "text-error bg-red-50 border-red-200";
    if (id === "tabungan") return "text-stone-700 bg-stone-100 border-stone-200";
    if (id === "sedekah") return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const totalHariIni = useMemo(() => {
    const total = { masuk: 0, keluar: 0, tabungan: 0, sedekah: 0 };
    transaksiHariIni.forEach((t) => { if (total[t.jenis] !== undefined) total[t.jenis] += parseInt(t.nominal) || 0; });
    return total;
  }, [transaksiHariIni]);

  return (
    <div className="space-y-4">
      <div className="alert alert-info py-2 text-xs flex items-center gap-2" data-html2canvas-ignore="true">
        <Info size={14} className="mr-1" /> Klik tanggal di kalender buat input / liat transaksi. Dot = ada transaksi.
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4" data-html2canvas-ignore="true">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear}>«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth}>‹</button>
            </div>
            <div className="flex items-center gap-2">
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getMonth()} onChange={handleMonthChange}>
                {monthNames.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
              </select>
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getFullYear()} onChange={handleYearChange}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear}>»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3" data-html2canvas-ignore="true">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}><Calendar size={14} className="mr-1"/> Hari Ini</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const trxList = getTransaksiByDate(item.date);
              const dotColor = getDotColor(trxList);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              if (isHolidayDate && !isSelected) boxClass = "bg-error text-white border-error font-bold";
              if (isSelected) boxClass = "bg-stone-200 text-stone-900 border-2 border-stone-800 font-bold ring-1 ring-stone-300";

              return (
                <button key={item.date} className={`aspect-square rounded border ${boxClass} relative transition text-sm`} onClick={() => setSelectedDate(item.date)} title={holiday || ""}>
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {dotColor && <span className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${dotColor}`} />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /><span>Masuk</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /><span>Keluar</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-600" /><span>Tabungan</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /><span>Sedekah</span></div>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Calendar size={16}/> {formatTanggal(selectedDate, "hari")}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">Total: <Wallet size={12}/> {formatRupiah(totalHariIni.masuk)} masuk • <ArrowUpRight size={12}/> {formatRupiah(totalHariIni.keluar)} keluar</p>
            </div>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={handleBukaForm} data-html2canvas-ignore="true"><Plus size={16} className="mr-1"/> Tambah Transaksi</button>
            )}
          </div>

          {showForm && (
            <div className="bg-stone-100 rounded p-3 space-y-3 border border-stone-200 mb-3" data-html2canvas-ignore="true">
              <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">{editingId ? <><Pencil size={14}/> Edit Transaksi</> : <><Plus size={14}/> Tambah Transaksi</>}</p>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Jenis</label>
                <div className="grid grid-cols-4 gap-1">
                  {jenisList.map((j) => (
                    <button key={j.id} className={`btn btn-xs ${formData.jenis === j.id ? "btn-primary" : "btn-outline"}`} onClick={() => setFormData({ ...formData, jenis: j.id, kategori: "" })}>{j.icon} {j.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</label>
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}>
                  <option value="">-- Pilih Kategori --</option>
                  {(kategoriList[formData.jenis] || []).map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nominal (Rp)</label>
                  <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="30000" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Metode</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.metode} onChange={(e) => setFormData({ ...formData, metode: e.target.value })}>
                    <option value="Cash">Cash</option><option value="Transfer">Transfer</option><option value="E-Wallet">E-Wallet</option><option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan</label>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Catatan (opsional)" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
              </div>
              {errorMsg && <div className="alert alert-error py-2 text-xs flex items-center gap-1"><AlertTriangle size={14}/> {errorMsg}</div>}
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan} disabled={menyimpan}>{menyimpan ? "Menyimpan..." : editingId ? <><Save size={16} className="mr-1"/> Simpan</> : <><Plus size={16} className="mr-1"/> Tambah</>}</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setShowForm(false); setEditingId(null); }} disabled={menyimpan}>Batal</button>
              </div>
            </div>
          )}

          {transaksiHariIni.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Banknote size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada transaksi di tanggal ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transaksiHariIni.slice().sort((a, b) => String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || ""))).map((trx) => {
                const kategori = getKategoriObj(trx.jenis, trx.kategoriId);
                return (
                  <div key={trx.id} className={`flex items-start gap-3 p-3 rounded border ${getJenisColor(trx.jenis)}`}>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold">{getJenisLabel(trx.jenis)}</p>
                        <p className="text-sm font-bold">{trx.jenis === "masuk" ? "+" : "-"}{formatRupiah(Number(trx.nominal ?? trx.jumlah ?? 0))}</p>
                      </div>
                      <p className="text-xs mt-0.5">{kategori?.nama || trx.kategori || trx.kategoriId || "Tanpa Kategori"}</p>
                      {trx.catatan && <p className="text-xs mt-1 italic opacity-80 flex items-center gap-1"><MessageSquare size={12}/> {trx.catatan}</p>}
                    </div>
                    <div className="flex gap-1" data-html2canvas-ignore="true">
                      <button className="btn btn-ghost btn-xs" onClick={() => handleBukaEdit(trx)} disabled={menyimpan}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-xs text-stone-400 hover:text-error" onClick={() => handleHapus(trx.id)} disabled={menyimpan}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}