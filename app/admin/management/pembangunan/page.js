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
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@lib/firebase";
import { uploadToCloudinary } from "@lib/cloudinary";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowLeft,
  HiCalendar,
  HiTag,
  HiPhoto,
  HiCheckCircle,
  HiExclamationTriangle,
  HiXMark,
  HiChevronDown,
} from "react-icons/hi2";

// Dynamically import RichTextEditor
const RichTextEditor = dynamic(
  () => import("@components/admin/RichTextEditor"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />,
  },
);

import RevalidateButton from "@components/admin/RevalidateButton";

const CATEGORIES = [
  {
    id: "bangunan",
    label: "Bangunan Baharu",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    path: "/management/bangunan",
  },
  {
    id: "penyelenggaraan",
    label: "Penyelenggaraan",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
    path: "/management/penyelenggaraan",
  },
];

const EMPTY_FORM = {
  title: "",
  titleZh: "",
  date: new Date().toISOString().split("T")[0],
  category: "bangunan",
  summary: "",
  summaryZh: "",
  content: "",
  contentZh: "",
  image: "",
  images: [],
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
  const cat = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];
  const displayImage = item.image || (item.images && item.images[0]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex items-stretch">
        <div className={`w-1.5 shrink-0 ${cat.color}`} />
        <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden m-3 rounded-xl">
          {displayImage ? (
            <img
              src={displayImage}
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
            {item.images?.length > 1 && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                {item.images.length} Imej
              </span>
            )}
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

export default function PembangunanAdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [view, setView] = useState("list");
  const [activeCategory, setActiveCategory] = useState("all");
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
    if (user) fetchItems(true);
  }, [user, activeCategory]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchItems = async (initial = false) => {
    if (initial) {
      setLoading(true);
      setItems([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let constraints = [
        where("category", "in", ["bangunan", "penyelenggaraan"]),
        orderBy("date", "desc"),
        limit(10),
      ];

      if (activeCategory !== "all") {
        constraints = [
          where("category", "==", activeCategory),
          orderBy("date", "desc"),
          limit(10),
        ];
      }

      if (!initial && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, "management"), ...constraints);
      const snap = await getDocs(q);
      const newItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (initial) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }

      if (snap.docs.length < 10) {
        setHasMore(false);
      } else {
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(true);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuatkan data.", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      ...EMPTY_FORM,
      ...item,
      images: item.images || (item.image ? [item.image] : []),
    });
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);

      const newUrls = results.filter((r) => r?.url).map((r) => r.url);

      if (newUrls.length > 0) {
        setFormData((prev) => {
          const updatedImages = [...(prev.images || []), ...newUrls];
          return {
            ...prev,
            images: updatedImages,
            image: updatedImages[0], // Set first image as primary for compatibility
          };
        });
        showToast(`${newUrls.length} imej berjaya dimuat naik.`);
      }
    } catch (err) {
      showToast("Gagal muat naik imej.", "error");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages.length > 0 ? updatedImages[0] : "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        updatedAt: new Date().toISOString(),
        image: formData.images?.[0] || "",
        images: formData.images || [],
        // Sync Chinese content to Malay fields as fallback
        title: formData.titleZh,
        summary: formData.summaryZh,
        content: formData.contentZh,
      };

      if (editingId) {
        await updateDoc(doc(db, "management", editingId), payload);
        showToast("Berjaya dikemas kini!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "management"), payload);
        showToast("Berjaya diterbitkan!");
      }

      // Revalidate
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
      fetchItems(true);
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
            <h1 className="text-xl font-bold">Pembangunan & Penyelenggaraan</h1>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <HiArrowLeft /> Papan Pemuka
          </Link>
        </div>
      </nav>

      <div className="container-custom mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <RevalidateButton path="/management/bangunan" label="Bangunan Baharu" />
        <RevalidateButton
          path="/management/penyelenggaraan"
          label="Penyelenggaraan"
        />
      </div>

      <div className="container-custom py-8">
        {view === "list" ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}
                >
                  Semua
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id ? `${cat.color} text-white shadow-lg shadow-black/10` : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setFormData(EMPTY_FORM);
                  setEditingId(null);
                  setView("add");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                <span>Tambah Perkembangan Baru</span>
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-24 bg-white rounded-2xl" />
                  <div className="h-24 bg-white rounded-2xl" />
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}

                  {hasMore && (
                    <button
                      onClick={() => fetchItems(false)}
                      disabled={loadingMore}
                      className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiChevronDown className="w-5 h-5" />
                      )}
                      <span>Muat Lebih Banyak</span>
                    </button>
                  )}

                  {!loading && items.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
                      Tiada rekod lagi.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {editingId ? "Edit" : "Tambah"} Rekod Perkembangan
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Kemas kini butiran perkembangan pembangunan sekolah di bawah.
                </p>
              </div>
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                <HiXMark className="w-4 h-4" />
                <span>Batal</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Tajuk <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.titleZh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            titleZh: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-normal"
                        placeholder="标题..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Ringkasan
                      </label>
                      <textarea
                        value={formData.summaryZh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            summaryZh: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Kandungan Terperinci
                    </label>
                    <RichTextEditor
                      content={formData.contentZh}
                      onChange={(html) =>
                        setFormData({ ...formData, contentZh: html })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <HiTag className="w-4 h-4 text-primary" />
                      Tetapan Rekod
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Kategori
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Tarikh
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <HiPhoto className="w-4 h-4 text-primary" />
                      Gambar Perkembangan (Carousel)
                    </h3>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {formData.images?.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden group border bg-gray-50"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <HiXMark className="w-4 h-4" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-lg uppercase">
                              Utama
                            </span>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-400"
                      >
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <HiPlus className="w-6 h-6" />
                            <span className="text-[10px] font-bold">
                              Tambah
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiCheckCircle className="w-5 h-5" />
                    )}
                    <span>
                      {editingId ? "Simpan Perubahan" : "Terbitkan Rekod"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
