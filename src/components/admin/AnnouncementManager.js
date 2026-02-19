"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiX,
  HiMegaphone,
} from "react-icons/hi2";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    badge: "Penting",
    badgeColor: "bg-accent-red",
    summary: "",
    content: "",
    image: "",
  });

  const badgeOptions = [
    { label: "Penting", color: "bg-accent-red" },
    { label: "Acara", color: "bg-accent-green" },
    { label: "Mesyuarat", color: "bg-primary" },
    { label: "Cuti", color: "bg-orange-500" },
    { label: "Berita", color: "bg-blue-500" },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "announcements"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      date: announcement.date,
      badge: announcement.badge,
      badgeColor: announcement.badgeColor,
      summary: announcement.summary,
      content: announcement.content,
      image: announcement.image || "",
    });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Adakah anda pasti mahu memadam pengumuman ini?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "announcements", editingId), formData);
      } else {
        await addDoc(collection(db, "announcements"), formData);
      }
      setEditingId(null);
      setIsAdding(false);
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        badge: "Penting",
        badgeColor: "bg-accent-red",
        summary: "",
        content: "",
        image: "",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-primary">
          Urus Pengumuman
        </h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiPlus /> Tambah Pengumuman
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card-white p-6 md:p-8 border-2 border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-primary mb-6">
            {editingId ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tajuk
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Announcment Title"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tarikh
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Label Lencana
                </label>
                <select
                  value={formData.badge}
                  onChange={(e) => {
                    const option = badgeOptions.find(
                      (o) => o.label === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      badge: e.target.value,
                      badgeColor: option.color,
                    });
                  }}
                  className="input-field"
                >
                  {badgeOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Pratonton
                </label>
                <div className="flex items-center h-full">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-bold ${formData.badgeColor}`}
                  >
                    {formData.badge}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Ringkasan
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                className="input-field h-20"
                placeholder="Ringkasan ringkas yang dipaparkan dalam senarai..."
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Kandungan (Sokongan Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="input-field h-60 font-mono text-sm"
                placeholder="# Butiran Kandungan..."
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                URL Imej Utama (Sokongan Google Drive)
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => {
                  const formattedUrl = e.target.value;
                  setFormData({ ...formData, image: formattedUrl });
                }}
                className="input-field"
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-[10px] text-gray-400 italic">
                Tampal pautan paparan Google Drive, dan ia akan ditukar untuk
                paparan terus.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setIsAdding(false);
                }}
                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary-accent px-8">
                {editingId ? "Kemas Kini Pengumuman" : "Terbitkan Pengumuman"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && !editingId && (
        <div className="grid gap-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              Tiada pengumuman ditemui. Tambah satu untuk bermula.
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="card-white p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${a.badgeColor}/10 overflow-hidden`}
                  >
                    {a.image ? (
                      <img
                        src={a.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <HiMegaphone
                        className={`w-6 h-6 ${a.badgeColor.replace("bg-", "text-")}`}
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${a.badgeColor}`}
                      >
                        {a.badge}
                      </span>
                      <span className="text-xs text-gray-500">{a.date}</span>
                    </div>
                    <h4 className="font-bold text-primary">{a.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {a.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-accent-red hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
