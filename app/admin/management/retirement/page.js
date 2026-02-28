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

const CATEGORY = {
  id: "persaraan",
  label: "Persaraan Warga Sekolah",
  color: "bg-rose-500", // Using rose like the parent categories
  textColor: "text-rose-600",
};

const EMPTY_FORM = {
  title: "",
  titleZh: "",
  date: new Date().toISOString().split("T")[0],
  category: "persaraan",
  summary: "",
  summaryZh: "",
  content: "",
  contentZh: "",
  image: "",
  yearsOfService: "",
  jawatan: "",
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
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex items-stretch">
        <div className={`w-1.5 shrink-0 ${CATEGORY.color}`} />
        <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden m-3 rounded-xl">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <HiTag className={`w-8 h-8 ${CATEGORY.textColor} opacity-20`} />
          )}
        </div>
        <div className="flex-1 py-3 pr-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${CATEGORY.color}`}
            >
              {CATEGORY.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiCalendar className="w-3 h-3" />
              {item.date}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
            {item.title}
          </h3>
          <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-tight">
            {item.jawatan || "Pendidik"}
          </p>
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

export default function RetirementAdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState("ms"); // ms | zh
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
  }, [user]);

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
      let q = query(
        collection(db, "persaraan"),
        orderBy("date", "desc"),
        limit(5),
      );

      if (!initial && lastDoc) {
        q = query(
          collection(db, "persaraan"),
          orderBy("date", "desc"),
          startAfter(lastDoc),
          limit(5),
        );
      }

      const snap = await getDocs(q);
      const newItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (initial) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }

      if (snap.docs.length < 5) {
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
    setFormData({ ...item });
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Padam rekod persaraan ini?")) return;
    try {
      await deleteDoc(doc(db, "persaraan", id));
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
        await updateDoc(doc(db, "persaraan", editingId), payload);
        showToast("Berjaya dikemas kini!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "persaraan"), payload);
        showToast("Berjaya diterbitkan!");
      }

      // Revalidate
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/management/persaraan" }),
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
            <h1 className="text-xl font-bold">Urus Persaraan</h1>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <HiArrowLeft /> Papan Pemuka
          </Link>
        </div>
      </nav>

      <div className="container-custom mt-6">
        <RevalidateButton path="/management/persaraan" label="Urus Persaraan" />
      </div>

      <div className="container-custom py-8">
        {view === "list" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Senarai Persaraan</h2>
              <button
                onClick={() => {
                  setFormData(EMPTY_FORM);
                  setEditingId(null);
                  setView("add");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                <span>Tambah Persaraan Baru</span>
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
                      Tiada rekod persaraan lagi.
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
                  {editingId ? "Edit" : "Tambah"} Rekod Persaraan
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {editingId
                    ? "Kemas kini butiran rekod persaraan di bawah."
                    : "Isi butiran untuk menerbitkan rekod persaraan baru."}
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
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl w-fit mb-4">
                      <button
                        type="button"
                        onClick={() => setActiveLang("ms")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLang === "ms" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Malay
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLang("zh")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLang === "zh" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Chinese
                      </button>
                    </div>

                    {activeLang === "ms" ? (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nama & Tajuk (Malay){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-normal"
                            placeholder="cth: Puan Tan Bee Hwa"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Ringkasan / Ucapan Ringkas (Malay)
                          </label>
                          <textarea
                            value={formData.summary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                summary: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                            placeholder="Ucapan ringkas atau ringkasan bakti..."
                            rows={3}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nama & Tajuk (Chinese){" "}
                            <span className="text-red-500">*</span>
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
                            placeholder="例: 陈美华女士"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Ringkasan / Ucapan Ringkas (Chinese)
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
                            placeholder="简短致辞或贡献摘要..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Kandungan Terperinci / Biografi (
                      {activeLang === "ms" ? "Malay" : "Chinese"})
                    </label>
                    {activeLang === "ms" ? (
                      <RichTextEditor
                        content={formData.content}
                        onChange={(html) =>
                          setFormData({ ...formData, content: html })
                        }
                        placeholder="Tuliskan biografi atau penghargaan terperinci di sini..."
                      />
                    ) : (
                      <RichTextEditor
                        content={formData.contentZh}
                        onChange={(html) =>
                          setFormData({ ...formData, contentZh: html })
                        }
                        placeholder="在此处填写详细传记或表扬内容..."
                      />
                    )}
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <HiTag className="w-4 h-4 text-primary" />
                      Maklumat Perkhidmatan
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Tarikh Bersara
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

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Jawatan Terakhir
                      </label>
                      <input
                        type="text"
                        value={formData.jawatan}
                        onChange={(e) =>
                          setFormData({ ...formData, jawatan: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        placeholder="Contoh: Guru Besar"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Sesi Perkhidmatan
                      </label>
                      <input
                        type="text"
                        value={formData.yearsOfService}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearsOfService: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        placeholder="Contoh: 1990 - 2024"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <HiPhoto className="w-4 h-4 text-primary" />
                      Gambar Profil
                    </h3>

                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="cursor-pointer bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-100 transition-all group overflow-hidden"
                    >
                      {formData.image ? (
                        <div className="relative group/img">
                          <img
                            src={formData.image}
                            className="max-h-48 mx-auto rounded-xl shadow-sm transition-transform duration-500 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <span className="text-white text-xs font-bold">
                              Tukar Imej
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <HiPhoto className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold">
                            Muat Naik Gambar
                          </span>
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-[10px] text-primary font-bold animate-pulse">
                            Memuat naik...
                          </p>
                        </div>
                      )}
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
                      {editingId ? "Simpan Perubahan" : "Terbitkan Profil"}
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
