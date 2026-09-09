"use client";
import { useState } from "react";

export default function ActivityManager({ activities, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const colors = ["primary", "secondary", "success", "warning", "info", "accent"];

  const handleAdd = () => {
    if (!newName.trim() || !newTarget) return;
    const newActivity = {
      id: Date.now().toString(),
      label: `${newIcon} ${newName}`,
      target: parseInt(newTarget) || 1,
      unit: newUnit || "kali",
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    onUpdate([...activities, newActivity]);
    setNewName("");
    setNewTarget("");
    setNewUnit("");
    setNewIcon("📌");
  };

  const handleDelete = (id) => {
    if (!confirm("Hapus aktivitas ini?")) return;
    onUpdate(activities.filter((a) => a.id !== id));
  };

  const handleEdit = (activity) => {
    setEditingId(activity.id);
    setEditName(activity.label.replace(/^[^\s]+\s/, ""));
    setEditTarget(activity.target.toString());
    setEditUnit(activity.unit);
    setEditIcon(activity.label.match(/^([^\s]+)/)?.[0] || "📌");
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim() || !editTarget) return;
    onUpdate(
      activities.map((a) =>
        a.id === id
          ? {
              ...a,
              label: `${editIcon} ${editName}`,
              target: parseInt(editTarget) || 1,
              unit: editUnit || "kali",
            }
          : a
      )
    );
    setEditingId(null);
  };

  return (
    <>
      {/* Tombol Buka Modal */}
      <button
        className="btn btn-ghost btn-sm gap-1"
        onClick={() => setIsOpen(true)}
      >
        ⚙️ Kelola Aktivitas
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card bg-base-100 w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">⚙️ Kelola Aktivitas</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Daftar Aktivitas */}
              <div className="space-y-2 mt-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between bg-base-200 p-2 rounded"
                  >
                    {editingId === act.id ? (
                      <div className="flex-1 flex flex-wrap gap-1">
                        <input
                          type="text"
                          className="input input-bordered input-xs w-12"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          placeholder="Ikon"
                        />
                        <input
                          type="text"
                          className="input input-bordered input-xs flex-1 min-w-[80px]"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nama"
                        />
                        <input
                          type="number"
                          className="input input-bordered input-xs w-16"
                          value={editTarget}
                          onChange={(e) => setEditTarget(e.target.value)}
                          placeholder="Target"
                        />
                        <input
                          type="text"
                          className="input input-bordered input-xs w-20"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          placeholder="Unit"
                        />
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() => handleSaveEdit(act.id)}
                        >
                          💾
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditingId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">
                          {act.label} ({act.target} {act.unit})
                        </span>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEdit(act)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDelete(act.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Tambah */}
              <div className="flex flex-wrap gap-1 mt-4 border-t border-base-200 pt-4">
                <input
                  type="text"
                  className="input input-bordered input-sm w-12"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="Ikon"
                />
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 min-w-[80px]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama aktivitas"
                />
                <input
                  type="number"
                  className="input input-bordered input-sm w-16"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Target"
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-20"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Unit"
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newTarget}
                >
                  ➕ Tambah
                </button>
              </div>

              <p className="text-xs text-base-content/50 mt-2">
                💡 Aktivitas yang dihapus hanya untuk akun ini. Data progress tetap tersimpan di history.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}