"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  HiTrophy,
  HiArrowLeft,
  HiArrowRightOnRectangle,
  HiMagnifyingGlass,
  HiCalendar,
  HiTag,
  HiPhoto,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiCloudArrowUp,
  HiEye,
  HiAcademicCap,
  HiUserGroup,
  HiStar,
} from "react-icons/hi2";

const RichTextEditor = dynamic(
  () => import("@components/admin/RichTextEditor"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />,
  },
);

import RevalidateButton from "@components/admin/RevalidateButton";

const CATEGORY_META = {
  Akademik: {
    label: "Akademik",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    icon: <HiAcademicCap className="w-5 h-5" />,
  },
  Sukan: {
    label: "Sukan",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    icon: <HiTrophy className="w-5 h-5" />,
  },
  "Ko-Kurikulum": {
    label: "Ko-Kurikulum",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    icon: <HiUserGroup className="w-5 h-5" />,
  },
  "Seni & Kebudayaan": {
    label: "Seni & Kebudayaan",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    icon: <HiStar className="w-5 h-5" />,
  },
  "Lain-lain": {
    label: "Lain-lain",
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-600",
    icon: <HiTrophy className="w-5 h-5" />,
  },
};

const MONTH_OPTIONS = [
  { id: "All", label: "Semua Bulan" },
  { id: "01", label: "Januari" },
  { id: "02", label: "Februari" },
  { id: "03", label: "Mac" },
  { id: "04", label: "April" },
  { id: "05", label: "Mei" },
  { id: "06", label: "Jun" },
  { id: "07", label: "Julai" },
  { id: "08", label: "Ogos" },
  { id: "09", label: "September" },
  { id: "10", label: "Oktober" },
  { id: "11", label: "November" },
  { id: "12", label: "Disember" },
];

const EMPTY_FORM = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  category: "Akademik",
  summary: "",
  description: "",
  image: "",
  studentNames: "",
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

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

function AwardCard({ award, onEdit, onDelete, onPreview }) {
  const meta = CATEGORY_META[award.category] || CATEGORY_META["Lain-lain"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex items-stretch">
        {/* Color accent bar */}
        <div className={`w-1.5 shrink-0 ${meta.color}`} />

        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden m-3 rounded-xl relative">
          {award.image ? (
            <img
              src={award.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${meta.lightColor}`}
            >
              <div
                className={`${meta.textColor} opacity-40 transition-transform duration-500 group-hover:scale-125`}
              >
                {meta.icon}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 py-3 pr-3 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${meta.color}`}
            >
              {award.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiCalendar className="w-3 h-3" />
              {award.date}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {award.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1 font-medium italic">
            {award.summary || "Tiada ringkasan."}
          </p>
          {award.studentNames && (
            <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
              Murid: {award.studentNames}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(award)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Pratonton"
          >
            <HiEye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(award)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
            title="Edit"
          >
            <HiPencil className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-100 mx-0.5" />
          <button
            onClick={() => onDelete(award.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ award, onClose }) {
  if (!award) return null;
  const meta = CATEGORY_META[award.category] || CATEGORY_META["Lain-lain"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${meta.color}`}
            >
              {award.category}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {award.date}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <HiXMark className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10">
          {award.image && (
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-sm">
              <img
                src={award.image}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4 leading-tight">
            {award.title}
          </h2>

          <div className="flex items-start gap-3 mb-8 bg-neutral-bg p-4 rounded-2xl border border-gray-50 text-gray-700">
            <HiUserGroup className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="font-bold">{award.studentNames}</p>
          </div>

          <div
            className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: award.description }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ───────────────────────────────────────────────────

export default function PenghargaanAdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | add | edit
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [toast, setToast] = useState(null);
  const [previewAward, setPreviewAward] = useState(null);
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
    if (user) {
      fetchAwards();
    }
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "penghargaan"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAwards(docs);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuatkan data penghargaan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (award) => {
    setEditingId(award.id);
    setFormData({
      title: award.title || "",
      date: award.date || new Date().toISOString().split("T")[0],
      category: award.category || "Akademik",
      summary: award.summary || "",
      description: award.description || "",
      image: award.image || "",
      studentNames: award.studentNames || "",
    });
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Padam penghargaan ini? Tindakan ini tidak boleh dibatalkan."))
      return;
    try {
      await deleteDoc(doc(db, "penghargaan", id));
      setAwards((prev) => prev.filter((a) => a.id !== id));
      showToast("Penghargaan berjaya dipadam.");
    } catch (err) {
      console.error(err);
      showToast("Gagal memadam penghargaan.", "error");
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
      console.error(err);
      showToast("Gagal memuat naik imej.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Sila masukkan tajuk.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date,
        category: formData.category,
        summary: formData.summary.trim() || "",
        description: formData.description || "",
        image: formData.image || "",
        studentNames: formData.studentNames || "",
        updatedAt: new Date().toISOString(),
      };

      if (view === "edit" && editingId) {
        await updateDoc(doc(db, "penghargaan", editingId), payload);
        showToast("Penghargaan berjaya dikemas kini!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "penghargaan"), payload);
        showToast("Penghargaan berjaya ditambah!");
      }

      // Trigger ISR revalidation
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/penghargaan" }),
        });
      } catch (err) {
        console.warn("Revalidation failed:", err);
      }

      setView("list");
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchAwards();
    } catch (err) {
      console.error("Save error:", err);
      showToast("Gagal menyimpan penghargaan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/admin";
  };

  const availableYears = useMemo(() => {
    const years = [...new Set(awards.map((a) => a.date?.split("-")[0]))].filter(
      Boolean,
    );
    return years.sort((a, b) => b - a);
  }, [awards]);

  const filteredAwards = useMemo(() => {
    return awards.filter((a) => {
      const matchSearch =
        !searchQuery ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentNames?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        filterCategory === "All" || a.category === filterCategory;
      const matchYear = filterYear === "All" || a.date?.startsWith(filterYear);
      const matchMonth =
        filterMonth === "All" || a.date?.split("-")[1] === filterMonth;
      return matchSearch && matchCategory && matchYear && matchMonth;
    });
  }, [awards, searchQuery, filterCategory, filterYear, filterMonth]);

  // Auth Guard
  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <HiExclamationTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-500 mb-6">
            Anda mesti log masuk untuk mengakses halaman ini.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Log Masuk Pentadbir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {previewAward && (
        <PreviewModal
          award={previewAward}
          onClose={() => setPreviewAward(null)}
        />
      )}

      {/* Navigation */}
      <nav className="bg-primary-dark text-white shadow-lg sticky top-0 z-50">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 transition-transform hover:scale-110 shadow-sm"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </Link>
            <div>
              <h1 className="text-xl font-display font-bold">
                Pengurusan Penghargaan
              </h1>
              <p className="text-xs text-gray-300">SJK(C) Pei Hwa Machang</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors font-medium border border-white/5"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span>Papan Pemuka</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              <HiArrowRightOnRectangle className="w-4 h-4" />
              <span>Log Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container-custom mt-6">
        <RevalidateButton path="/penghargaan" label="Pengurusan Penghargaan" />
      </div>

      <div className="container-custom py-8">
        {view === "list" ? (
          <div className="space-y-6">
            {/* Header with Title & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  Senarai Penghargaan
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Urus dan pantau semua rekod kecemerlangan murid di sini.
                </p>
              </div>
              <button
                onClick={() => {
                  setView("add");
                  setFormData(EMPTY_FORM);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                <span>Tambah Penghargaan Baru</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari penghargaan atau nama murid..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  {["All", ...Object.keys(CATEGORY_META)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        filterCategory === cat
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                      }`}
                    >
                      {cat === "All" ? "Semua" : cat}
                    </button>
                  ))}
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-400 px-3 py-1.5 outline-none cursor-pointer appearance-none uppercase tracking-wider"
                  >
                    <option value="All">Semua Tahun</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-400 px-3 py-1.5 outline-none cursor-pointer appearance-none uppercase tracking-wider"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Award List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-white rounded-2xl animate-pulse border border-gray-50 shadow-sm"
                  />
                ))}
              </div>
            ) : filteredAwards.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
                <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mb-4">
                  <HiTrophy className="w-8 h-8 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-1">
                  Tiada rekod ditemui
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Sila cuba laraskan carian atau penapis anda untuk melihat
                  hasil lain.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-medium">
                  Memaparkan {filteredAwards.length} rekod penghargaan
                </p>
                {filteredAwards.map((award) => (
                  <AwardCard
                    key={award.id}
                    award={award}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={setPreviewAward}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Form Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {view === "edit" ? "Edit Penghargaan" : "Penghargaan Baru"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {view === "edit"
                    ? "Kemas kini butiran penghargaan di bawah."
                    : "Isi butiran untuk menambah rekod penghargaan baru."}
                </p>
              </div>
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <HiXMark className="w-4 h-4" />
                <span>Batal</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Title Input */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tajuk Penghargaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-normal"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="cth: Pingat Emas Olimpik Matematik Kebangsaan"
                    />
                  </div>

                  {/* Summary Input */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ringkasan{" "}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        (Dipaparkan dalam paparan senarai)
                      </span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="Penerangan ringkas mengenai penghargaan ini..."
                      rows={3}
                    />
                  </div>

                  {/* Student Names */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nama Murid{" "}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        (Pilihan)
                      </span>
                    </label>
                    <div className="relative">
                      <HiUserGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={formData.studentNames}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentNames: e.target.value,
                          })
                        }
                        placeholder="cth: Tan Ah Kow, Ali bin Abu"
                      />
                    </div>
                  </div>

                  {/* Description Editor */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Butiran / Penerangan
                    </label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) =>
                        setFormData({ ...formData, description: content })
                      }
                      placeholder="Tulis butiran lanjut mengenai penghargaan ini..."
                    />
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-5">
                  {/* Settings Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
                      <HiTag className="w-4 h-4 text-primary" />
                      Tetapan Rekod
                    </h3>

                    <div className="space-y-4">
                      {/* Date Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                          Tarikh Kejayaan
                        </label>
                        <div className="relative">
                          <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                          <input
                            type="date"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Category Grid */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                          Kategori
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(CATEGORY_META).map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  category: opt.label,
                                })
                              }
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                formData.category === opt.label
                                  ? `${opt.color} text-white border-transparent shadow-md`
                                  : `bg-gray-50 ${opt.textColor} border-gray-100 hover:border-gray-200`
                              }`}
                            >
                              <div
                                className={`p-1 rounded-lg ${formData.category === opt.label ? "bg-white/20" : opt.lightColor}`}
                              >
                                {opt.icon}
                              </div>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <HiPhoto className="w-4 h-4 text-primary" />
                      Imej Pemenang
                    </h3>

                    <div className="space-y-4">
                      {formData.image ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group/img">
                          <img
                            src={formData.image}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, image: "" })
                            }
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <HiXMark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                          <HiPhoto className="w-10 h-10 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Tiada Imej
                          </span>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current.click()}
                        disabled={uploadingImage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <HiCloudArrowUp className="w-5 h-5" />
                        )}
                        <span>
                          {uploadingImage
                            ? "Memuat naik..."
                            : formData.image
                              ? "Ubah Imej"
                              : "Muat Naik Imej"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Submission Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <HiCheckCircle className="w-5 h-5" />
                          <span>
                            {view === "add"
                              ? "Terbitkan Rekod"
                              : "Kemas Kini Rekod"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="w-full px-6 py-3.5 text-gray-500 font-bold border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className="container-custom py-12 border-t border-gray-100 mt-12 bg-white/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 Portal Admin SJK(C) Pei Hwa</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Bantuan
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privasi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
