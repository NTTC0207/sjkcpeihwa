"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@lib/firebase";
import { uploadToCloudinary } from "@lib/cloudinary";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowLeft,
  HiArrowRightOnRectangle,
  HiMagnifyingGlass,
  HiCalendar,
  HiTag,
  HiPhoto,
  HiPaperClip,
  HiEye,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiCloudArrowUp,
} from "react-icons/hi2";

import RevalidateButton from "@components/admin/RevalidateButton";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@components/admin/RichTextEditor"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />,
  },
);

const MANAGEMENT_CATEGORIES = [
  {
    id: "persaraan",
    label: "Persaraan Warga Sekolah",
    color: "bg-rose-500",
    textColor: "text-rose-600",
  },
  {
    id: "pertukaran",
    label: "Lapor Diri & Pertukaran",
    color: "bg-amber-500",
    textColor: "text-amber-600",
  },
  {
    id: "bangunan",
    label: "Bangunan Baharu",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  // {
  //   id: "penyelenggaraan",
  //   label: "Kerja-kerja Baik Pulih",
  //   color: "bg-yellow-500",
  //   textColor: "text-yellow-600",
  // },
  // {
  //   id: "khidmat_bantu",
  //   label: "Kunjung Khidmat Bantu",
  //   color: "bg-purple-500",
  //   textColor: "text-purple-600",
  // },
];

const EMPTY_FORM = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  category: "persaraan",
  summary: "",
  content: "",
  image: "",
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
        type === "success" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {type === "success" ? (
        <HiCheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <HiExclamationTriangle className="w-5 h-5 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <HiXMark className="w-4 h-4" />
      </button>
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete }) {
  const cat =
    MANAGEMENT_CATEGORIES.find((c) => c.id === item.category) ||
    MANAGEMENT_CATEGORIES[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex items-stretch">
        <div className={`w-1.5 shrink-0 ${cat.color}`} />
        <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden m-3 rounded-xl">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <HiTag className={`w-8 h-8 ${cat.textColor} opacity-20`} />
          )}
        </div>
        <div className="flex-1 py-3 pr-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${cat.color}`}
            >
              {cat.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiCalendar className="w-3 h-3" />
              {item.date}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
        </div>
        <div className="flex items-center gap-1.5 px-4">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            <HiPencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManagementAdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "management"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      showToast("Gagal memuatkan data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Padam rekod ini?")) return;
    try {
      await deleteDoc(doc(db, "management", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Rekod berjaya dipadam.");
    } catch (err) {
      showToast("Gagal memadam.", "error");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      if (result?.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast("Imej berjaya dimuat naik.");
      }
    } catch (err) {
      showToast("Gagal muat naik imej.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, updatedAt: new Date().toISOString() };
      if (editingId) {
        await updateDoc(doc(db, "management", editingId), payload);
        showToast("Berjaya dikemas kini!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "management"), payload);
        showToast("Berjaya diterbitkan!");
      }

      // Revalidate school affairs paths
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/management/${formData.category}` }),
        });
      } catch (err) {}

      setView("list");
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchItems();
    } catch (err) {
      showToast("Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/admin" className="btn-primary px-6 py-3">
          Log Masuk
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-bg">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <nav className="bg-primary-dark text-white shadow-lg sticky top-0 z-50">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden"
            >
              <img src="/logo.png" className="w-8 h-8 object-contain" />
            </Link>
            <h1 className="text-xl font-bold">Urusan Sekolah</h1>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <HiArrowLeft /> Papan Pemuka
          </Link>
        </div>
      </nav>

      <div className="container-custom py-8">
        {view === "list" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Senarai Urusan Sekolah</h2>
              <button
                onClick={() => setView("add")}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg"
              >
                <HiPlus /> Tambah Baru
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-24 bg-white rounded-2xl" />
                  <div className="h-24 bg-white rounded-2xl" />
                </div>
              ) : (
                items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
              {!loading && items.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
                  Tiada rekod lagi.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit" : "Tambah"} Urusan Sekolah
              </h2>
              <button
                onClick={() => setView("list")}
                className="text-gray-500 hover:text-gray-700 font-bold tracking-tight"
              >
                Batal
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tajuk
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                  >
                    {MANAGEMENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tarikh
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ringkasan
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kandungan
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) =>
                    setFormData({ ...formData, content: html })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Imej
                </label>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="cursor-pointer bg-gray-50 border border-dashed rounded-xl p-6 text-center hover:bg-gray-100 transition-colors"
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      className="max-h-48 mx-auto rounded-lg mb-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <HiPhoto className="w-10 h-10" />{" "}
                      <span>Muat Naik Imej</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <p className="text-xs text-primary mt-2">Memuat naik...</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-4 text-lg rounded-xl flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HiCheckCircle className="w-6 h-6" />
                )}
                <span>{editingId ? "Simpan Perubahan" : "Terbitkan"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
