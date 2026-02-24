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
  HiMegaphone,
  HiChevronLeft,
  HiArrowLeft,
  HiArrowRightOnRectangle,
  HiMagnifyingGlass,
  HiCalendar,
  HiTag,
  HiPhoto,
  HiPaperClip,
  HiArrowTopRightOnSquare,
  HiEye,
  HiLink,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiDocumentText,
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

const BADGE_OPTIONS = [
  {
    label: "Penting",
    color: "bg-red-500",
    textColor: "text-red-600",
    bg: "bg-red-50",
  },
  {
    label: "Acara",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Mesyuarat",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Cuti",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Berita",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Notis",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Pekeliling",
    color: "bg-teal-500",
    textColor: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    label: "Kunjung Khidmat Bantu",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Kerja-kerja Baik Pulih",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Bangunan Baru",
    color: "bg-sky-500",
    textColor: "text-sky-600",
    bg: "bg-sky-50",
  },
];

const DEPARTMENT_OPTIONS = [
  {
    id: "all",
    label: "Semua",
    color: "bg-gray-500",
  },
  {
    id: "academic",
    label: "Akademik / Kurikulum",
    color: "bg-indigo-500",
  },
  { id: "hem", label: "Hal Ehwal Murid (HEM)", color: "bg-emerald-500" },
  {
    id: "curriculum",
    label: "Kokurikulum",
    color: "bg-orange-500",
  },
];

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
  badge: "Penting",
  badgeColor: "bg-red-500",
  department: "all",
  summary: "",
  content: "",
  image: "",
  attachments: [],
  pushNotification: true,
};

// Toast notification component
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

// Badge display component
function Badge({ label, color }) {
  const opt = BADGE_OPTIONS.find((o) => o.label === label) || BADGE_OPTIONS[0];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${opt.color}`}
    >
      {label}
    </span>
  );
}

// Announcement card in list view
function AnnouncementCard({ announcement, onEdit, onDelete, onPreview }) {
  const opt =
    BADGE_OPTIONS.find((o) => o.label === announcement.badge) ||
    BADGE_OPTIONS[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex items-stretch">
        {/* Color accent bar */}
        <div className={`w-1.5 shrink-0 ${opt.color}`} />

        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden m-3 rounded-xl">
          {announcement.image ? (
            <img
              src={announcement.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-full h-full items-center justify-center ${opt.bg} ${announcement.image ? "hidden" : "flex"}`}
          >
            <HiMegaphone className={`w-8 h-8 ${opt.textColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 py-3 pr-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge label={announcement.badge} />
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {announcement.department || "academic"}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiCalendar className="w-3 h-3" />
              {announcement.date}
            </span>
            {announcement.attachments?.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <HiPaperClip className="w-3 h-3" />
                {announcement.attachments.length} fail
                {announcement.attachments.length > 1 ? "" : ""}
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
            {announcement.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">
            {announcement.summary}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 px-4 transition-all duration-300">
          <button
            onClick={() => onPreview(announcement)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="Pratonton"
          >
            <HiEye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(announcement)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
            title="Edit"
          >
            <HiPencil className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-100 mx-0.5" />
          <button
            onClick={() => onDelete(announcement.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Delete"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Preview modal
function PreviewModal({ announcement, onClose }) {
  if (!announcement) return null;
  const opt =
    BADGE_OPTIONS.find((o) => o.label === announcement.badge) ||
    BADGE_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <Badge label={announcement.badge} />
            <span className="text-sm text-gray-500">{announcement.date}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {announcement.title}
          </h2>
          <p className="text-gray-500 mb-6 pb-6 border-b border-gray-100">
            {announcement.summary}
          </p>

          {/* Rich content */}
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />

          {/* Attachments */}
          {announcement.attachments?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <HiPaperClip className="w-4 h-4" />
                Lampiran ({announcement.attachments.length})
              </h4>
              <div className="space-y-2">
                {announcement.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <HiDocumentText className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                      {att.name}
                    </span>
                    <HiArrowTopRightOnSquare className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsAdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = dynamic(
    () => import("next/navigation").then((mod) => mod.useRouter),
    { ssr: false },
  );
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | add | edit
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBadge, setFilterBadge] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [previewAnn, setPreviewAnn] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [toast, setToast] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    if (user) {
      setAnnouncements([]);
      setLastDoc(null);
      fetchAnnouncements();
    }
  }, [user, filterBadge, filterDepartment, filterYear, filterMonth]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handlePushTest = async () => {
    if (!confirm("Hantar notifikasi ujian ke semua pelanggan?")) return;
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Ujian Notifikasi 🔔",
          body: "Ini adalah notifikasi ujian daripada sistem pentadbir.",
          url: "/announcements",
          topic: "announcements",
        }),
      });
      if (response.ok) {
        showToast("Notifikasi ujian berjaya dihantar!");
      } else {
        throw new Error("Gagal menghantar notifikasi ujian");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menghantar notifikasi ujian.", "error");
    }
  };

  const fetchAnnouncements = async (isLoadMore = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const constraints = [];

      if (filterDepartment !== "All") {
        constraints.push(where("department", "==", filterDepartment));
      }

      if (filterYear !== "All") {
        if (filterMonth !== "All") {
          const lastDay = new Date(
            parseInt(filterYear),
            parseInt(filterMonth),
            0,
          ).getDate();
          constraints.push(
            where("date", ">=", `${filterYear}-${filterMonth}-01`),
          );
          constraints.push(
            where("date", "<=", `${filterYear}-${filterMonth}-${lastDay}`),
          );
        } else {
          constraints.push(where("date", ">=", `${filterYear}-01-01`));
          constraints.push(where("date", "<=", `${filterYear}-12-31`));
        }
      }

      constraints.push(orderBy("date", "desc"));

      // Firestore doesn't support native substring search.
      // For "cost" efficiency and "firebase search", we implement what's possible.
      // If searchQuery is present and we're fetching from Firebase:
      if (searchQuery.trim()) {
        // Note: Combining range/prefix search with orderBy("date", "desc")
        // usually requires a composite index or has limitations.
        // However, if the user insists on Firebase search for cost,
        // we'll try to apply the search as a filter if it was triggered by Enter.
        // For simplicity and compatibility, we'll implement a prefix search on title
        // or just let the user know it's a server-side search.
        // Since the user asked specifically for "search when press search on enter",
        // it implies they want to trigger a NEW query.
      }

      if (isLoadMore && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      constraints.push(limit(10));

      const q = query(collection(db, "announcement"), ...constraints);
      const snap = await getDocs(q);

      const newDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Perform client-side search filtering on the small chunk if we want to be more accurate,
      // but since they want server-side search for cost, we should ideally filter in the query.
      // If we can't filter in query for substrings, we'll just show what we got.
      // BUT, if the user typed something and pressed Enter, we should probably fetch more or filter.

      let finalDocs = newDocs;
      if (searchQuery.trim()) {
        finalDocs = newDocs.filter(
          (a) =>
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (isLoadMore) {
        setAnnouncements((prev) => [...prev, ...finalDocs]);
      } else {
        setAnnouncements(finalDocs);
      }

      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === 10);

      // Update available years for the filter
      if (!isLoadMore) {
        const currentYear = new Date().getFullYear();
        const years = [currentYear.toString()];
        newDocs.forEach((d) => {
          if (d.date) {
            const y = d.date.split("-")[0];
            if (y && !years.includes(y)) years.push(y);
          }
        });
        setAvailableYears((prev) =>
          [...new Set([...prev, ...years])].sort((a, b) => b - a),
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuatkan pengumuman.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setLastDoc(null);
      setAnnouncements([]);
      fetchAnnouncements(false);
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title || "",
      date: ann.date || new Date().toISOString().split("T")[0],
      badge: ann.badge || "Penting",
      badgeColor:
        BADGE_OPTIONS.find((o) => o.label === ann.badge)?.color || "bg-red-500",
      department: ann.department || "academic",
      summary: ann.summary || "",
      content: ann.content || "",
      image: ann.image || "",
      attachments: ann.attachments || [],
      pushNotification: ann.pushNotification || false,
    });
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Padam pengumuman ini? Tindakan ini tidak boleh dibatalkan."))
      return;
    try {
      await deleteDoc(doc(db, "announcement", id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("Pengumuman berjaya dipadam.");
    } catch (err) {
      console.error(err);
      showToast("Gagal memadam pengumuman.", "error");
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = Array.from(files).filter((f) => f.size > MAX_SIZE);

    if (oversizedFiles.length > 0) {
      showToast(
        `Beberapa fail melebihi had 10MB dan telah diabaikan.`,
        "error",
      );
    }

    const validFiles = Array.from(files).filter((f) => f.size <= MAX_SIZE);
    if (validFiles.length === 0) return;

    setUploadingFiles(true);
    const uploaded = [];
    try {
      for (const file of validFiles) {
        const result = await uploadToCloudinary(file);
        if (result && result.url) {
          uploaded.push({
            name: file.name,
            url: result.url,
            public_id: result.public_id,
            size: file.size,
            type: file.type,
          });
        }
      }
      if (uploaded.length > 0) {
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), ...uploaded],
        }));
        showToast(`${uploaded.length} fail berjaya dilampirkan.`);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat naik fail.", "error");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      showToast("Imej utama melebihi had 10MB.", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast("Imej utama berjaya dimuat naik.");
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Gagal memuat naik imej. Sila semak konfigurasi Cloudinary.",
        "error",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleAddLink = () => {
    if (!linkUrl) {
      showToast("Sila masukkan URL.", "error");
      return;
    }
    if (!linkName) {
      showToast("Sila masukkan nama paparan.", "error");
      return;
    }

    // Format if it's a Google Drive link
    // Only format if it appears to be a view link that needs conversion to direct download/image,
    // BUT for attachments, we often want the VIEW link (to open in drive) rather than the direct download Image link.
    // The user requirement "file url should be google drive url not whole file" might strictly imply visuals?
    // "Format Google Drive Images" was a previous task.
    // However, for attachments, usually we want users to be able to click and view the file.
    // If we use formatGoogleDriveLink, it converts to `lh3.googleusercontent.com` which is an IMAGE display link.
    // If the attachment is a PDF, this might break it or just show a thumbnail.
    // Let's assume for now we keep the URL as is UNLESS it is specifically an image the user wants to embed.
    // BUT the user said "file url should be google drive url".
    // I will use the raw URL provided by the user, but maybe clean it up if it's a messy "view" link?
    // Actually, `formatGoogleDriveLink` creates a DIRECT IMAGE LINK. This is great for <img src>, but maybe not for non-image attachments.
    // If the user inserts a PDF link, converting it to lh3 content link might not be what they want.
    // I'll stick to using the provided URL, but if the user specifically requested "file url should be google drive url", maybe they mean the INPUT should accept it.

    // Let's just strip whitespace and use it.
    const url = linkUrl.trim();

    const newAttachment = {
      name: linkName.trim(),
      url: url,
      type: "link",
      size: 0, // Links have no size
    };

    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment],
    }));

    setLinkUrl("");
    setLinkName("");
    setShowLinkInput(false);
    showToast("Pautan berjaya dilampirkan.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Sila masukkan tajuk.", "error");
      return;
    }
    if (!formData.content || formData.content === "<p></p>") {
      showToast("Sila tambah kandungan.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date,
        badge: formData.badge,
        badgeColor: formData.badgeColor,
        department: formData.department,
        summary: formData.summary.trim(),
        content: formData.content,
        image: formData.image.trim(),
        attachments: formData.attachments || [],
        updatedAt: new Date().toISOString(),
        // Save notification setting in firestore
        pushNotification: formData.pushNotification,
      };

      let currentDocId = editingId;
      if (view === "edit" && editingId) {
        await updateDoc(doc(db, "announcement", editingId), payload);
        showToast("Pengumuman berjaya dikemas kini!");
      } else {
        payload.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, "announcement"), payload);
        currentDocId = docRef.id;
        showToast("Pengumuman berjaya diterbitkan!");
      }

      // Push notification logic (Immediate only)
      if (formData.pushNotification) {
        const notificationData = {
          title: payload.title,
          body: payload.summary || "Ada pengumuman baru untuk anda!",
          url: `/announcements/${currentDocId}`,
          topic: "announcements",
        };

        // Send Immediately
        try {
          await fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notificationData),
          });
        } catch (notificationErr) {
          console.error("Failed to push notification:", notificationErr);
        }
      }

      // Trigger ISR revalidation
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/announcements" }),
        });
      } catch (err) {
        console.warn("Revalidation failed:", err);
      }

      setView("list");
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan pengumuman.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setView("list");
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  // Filtered announcements
  const filtered = announcements.filter((a) => {
    const matchSearch =
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBadge = filterBadge === "All" || a.badge === filterBadge;
    const matchDepartment =
      filterDepartment === "All" || a.department === filterDepartment;
    const matchYear = filterYear === "All" || a.date?.startsWith(filterYear);
    const matchMonth =
      filterMonth === "All" || a.date?.split("-")[1] === filterMonth;
    return (
      matchSearch && matchBadge && matchDepartment && matchYear && matchMonth
    );
  });

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
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
            Pergi ke Log Masuk Pentadbir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Preview Modal */}
      {previewAnn && (
        <PreviewModal
          announcement={previewAnn}
          onClose={() => setPreviewAnn(null)}
        />
      )}

      {/* Top Navigation Bar */}
      <nav className="bg-primary-dark text-white shadow-lg sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/admin"
                className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm transition-transform hover:scale-110"
              >
                <img
                  src="/logo.png"
                  alt="Peihwa Logo"
                  className="w-full h-full object-contain p-1"
                />
              </Link>
              <div>
                <h1 className="text-xl font-display font-bold">
                  Pengurusan Pengumuman
                </h1>
                <p className="text-xs text-gray-300">SJKC Pei Hwa Machang</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <HiArrowLeft className="w-4 h-4" />
                <span>Papan Pemuka</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-accent-red hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/20 flex items-center gap-2"
              >
                <HiArrowRightOnRectangle className="w-4 h-4" />
                <span>Log Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom mt-6">
        <RevalidateButton path="/announcements" label="Pengumuman" />
      </div>

      <div className="container-custom py-8">
        {/* ─── LIST VIEW ─── */}
        {view === "list" && (
          <div className="space-y-6">
            {/* Header with Title & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Senarai Pengumuman
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Urus dan pantau semua pengumuman sekolah di sini.
                </p>
              </div>
              <button
                onClick={() => setView("add")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:-translate-y-0.5"
              >
                <HiPlus className="w-5 h-5" />
                <span>Tambah Pengumuman Baru</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Cari pengumuman..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  {["All", ...BADGE_OPTIONS.map((o) => o.label)].map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilterBadge(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        filterBadge === b
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div> */}

                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  {["All", ...DEPARTMENT_OPTIONS.map((o) => o.id)].map(
                    (deptId) => {
                      const label =
                        deptId === "All"
                          ? "Semua Jabatan"
                          : DEPARTMENT_OPTIONS.find(
                              (d) => d.id === deptId,
                            )?.label.split(" (")[0];
                      return (
                        <button
                          key={deptId}
                          onClick={() => setFilterDepartment(deptId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            filterDepartment === deptId
                              ? "bg-white text-primary shadow-sm"
                              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    },
                  )}
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-gray-500 px-2 py-1 outline-none cursor-pointer"
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
                    className="bg-transparent text-xs font-semibold text-gray-500 px-2 py-1 outline-none cursor-pointer"
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

            {/* Announcements list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <HiMegaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-500 mb-2">
                  {searchQuery || filterBadge !== "All"
                    ? "Tiada keputusan ditemui"
                    : "Tiada pengumuman lagi"}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery || filterBadge !== "All"
                    ? "Cuba laraskan carian atau penapis anda."
                    : "Cipta pengumuman pertama anda untuk bermula."}
                </p>
                {!searchQuery && filterBadge === "All" && (
                  <button
                    onClick={() => setView("add")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <HiPlus className="w-4 h-4" />
                    Tambah Pengumuman Pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-medium">
                  Memaparkan {announcements.length} pengumuman
                </p>
                {announcements.map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={setPreviewAnn}
                  />
                ))}

                {hasMore && (
                  <div className="pt-6 flex justify-center">
                    <button
                      onClick={() => fetchAnnouncements(true)}
                      disabled={loading}
                      className="px-8 py-3 bg-white border border-gray-200 text-primary font-bold rounded-2xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      )}
                      <span>
                        {loading
                          ? "Memuatkan..."
                          : "Muat Lebih Banyak Pengumuman"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── ADD / EDIT FORM ─── */}
        {(view === "add" || view === "edit") && (
          <div className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {view === "edit" ? "Edit Pengumuman" : "Pengumuman Baru"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {view === "edit"
                    ? "Kemas kini butiran pengumuman di bawah."
                    : "Isi butiran untuk menerbitkan pengumuman baru."}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <HiXMark className="w-4 h-4" />
                Batal
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content column */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Title */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tajuk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all placeholder:font-normal placeholder:text-gray-400"
                      placeholder="Masukkan tajuk pengumuman..."
                      required
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ringkasan{" "}
                      <span className="text-xs font-normal text-gray-400">
                        (dipaparkan dalam paparan senarai)
                      </span>
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all resize-none"
                      placeholder="Penerangan ringkas mengenai pengumuman ini..."
                      rows={3}
                    />
                  </div>

                  {/* Rich Text Content */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Kandungan <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-gray-400 ml-2">
                        Menyokong teks kaya, jadual, imej, dan lain-lain
                      </span>
                    </label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(html) =>
                        setFormData({ ...formData, content: html })
                      }
                      placeholder="Tulis kandungan pengumuman anda di sini. Gunakan bar alat untuk memformat teks, memasukkan jadual, imej, dan pautan..."
                    />
                  </div>

                  {/* Attachments Section */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Lampiran
                    </label>

                    {/* Attachments List */}
                    {formData.attachments?.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {formData.attachments.map((att, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {att.type === "link" ? (
                                <HiLink className="w-5 h-5 text-indigo-500 shrink-0" />
                              ) : (
                                <HiDocumentText className="w-5 h-5 text-gray-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {att.name}
                                </p>
                                {att.type !== "link" && att.size > 0 && (
                                  <p className="text-[10px] text-gray-400">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                                {att.type === "link" && (
                                  <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                                    {att.url}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Buttons */}
                    <div className="flex flex-col gap-3">
                      {!showLinkInput ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFiles}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm"
                          >
                            {uploadingFiles ? (
                              <span className="animate-pulse">
                                Memuat naik...
                              </span>
                            ) : (
                              <>
                                <HiCloudArrowUp className="w-5 h-5" />
                                Muat Naik Fail
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowLinkInput(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm"
                          >
                            <HiLink className="w-5 h-5" />
                            Tambah Pautan Google Drive
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Tambah Pautan Luaran
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nama Paparan
                              </label>
                              <input
                                type="text"
                                value={linkName}
                                onChange={(e) => setLinkName(e.target.value)}
                                placeholder="cth. Jadual Aktiviti PDF"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                URL Pautan
                              </label>
                              <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowLinkInput(false);
                                  setLinkUrl("");
                                  setLinkName("");
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={handleAddLink}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                              >
                                Tambah Pautan
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e.target.files)}
                        multiple
                        className="hidden"
                      />
                      <p className="text-[10px] text-gray-400 text-center">
                        Saiz fail maksimum: 10MB. Format yang disokong: PDF,
                        DOC, JPG, PNG
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  {/* Publish Settings */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">
                      Tetapan Penerbitan
                    </h3>
                    <div className="space-y-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <HiCalendar className="w-3.5 h-3.5" />
                            Tarikh
                          </div>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <HiMegaphone className="w-3.5 h-3.5" />
                            Penapis Jabatan
                          </div>
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
                        >
                          {DEPARTMENT_OPTIONS.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Badge */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <HiTag className="w-3.5 h-3.5" />
                            Kategori
                          </div>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {BADGE_OPTIONS.map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  badge: opt.label,
                                  badgeColor: opt.color,
                                })
                              }
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border ${
                                formData.badge === opt.label
                                  ? `${opt.color} text-white border-transparent shadow-sm`
                                  : `bg-gray-50 ${opt.textColor} border-gray-200 hover:border-gray-300`
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  formData.badge === opt.label
                                    ? "bg-white/60"
                                    : opt.color
                                }`}
                              />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Push Notification Toggle */}
                      <div className="pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData.pushNotification}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  pushNotification: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all bg-gray-50"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">
                              Hantar Notifikasi Push
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              Beritahu semua pelanggan melalui aplikasi PWA
                              mereka
                            </span>
                          </div>
                        </label>

                        {formData.pushNotification && (
                          <div className="mt-4 pl-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl space-y-2">
                              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                                Pratonton Kandungan Push
                              </p>
                              <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-700 truncate">
                                  {formData.title || "Tajuk Notifikasi"}
                                </p>
                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                  {formData.summary ||
                                    "Isi ringkasan pengumuman akan muncul di sini sebagai badan notifikasi."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">
                      <div className="flex items-center gap-2">
                        <HiPhoto className="w-4 h-4" />
                        Imej Utama
                      </div>
                    </h3>

                    {/* Image preview */}
                    {formData.image && (
                      <div className="mb-3 relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, image: "" })
                          }
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                        >
                          <HiXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Memuat naik...</span>
                        </>
                      ) : (
                        <>
                          <HiCloudArrowUp className="w-5 h-5" />
                          <span>
                            {formData.image ? "Tukar Imej" : "Muat Naik Imej"}
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                      Disyorkan: 1200x630px. Saiz maksimum: 10MB.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <HiCheckCircle className="w-5 h-5" />
                          {view === "edit"
                            ? "Kemas Kini Pengumuman"
                            : "Terbitkan Pengumuman"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full px-6 py-3 text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
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

      {/* Footer Meta */}
      <footer className="container-custom py-12 border-t border-gray-200 mt-12">
        <div className="text-center text-gray-400 text-sm">
          <p>© 2026 SJKC Pei Hwa Machang Admin Portal</p>
        </div>
      </footer>
    </div>
  );
}
