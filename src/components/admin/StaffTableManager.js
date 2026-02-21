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
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  or,
  and,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import { uploadToCloudinary } from "@lib/cloudinary";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass,
  HiFunnel,
  HiUserCircle,
  HiPhoto,
  HiCheckCircle,
  HiXCircle,
  HiCloudArrowUp,
  HiLink,
  HiArrowsRightLeft,
  HiUser,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { subjects } from "@lib/staffData";
import { useRef } from "react";

export default function StaffTableManager({
  collectionName = "staff",
  title = "Staff",
  showSubjects = true,
}) {
  const [msSubjects, setMsSubjects] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'visual'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCursors, setPageCursors] = useState({ 1: null });
  const itemsPerPage = 7;
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    name_zh: "",
    role_ms: "Guru",
    role_zh: "老师",
    category: "Pentadbiran",
    subject: [],
    level: 2,
    parentIds: [],
    image: "",
  });

  useEffect(() => {
    fetchStaff();
    loadMsSubjects();
  }, [collectionName]);

  const loadMsSubjects = async () => {
    try {
      const response = await fetch("/locales/ms/common.json");
      if (response.ok) {
        const data = await response.json();
        setMsSubjects(data.subjects || {});
      }
    } catch (err) {
      console.error("Error loading MS subjects:", err);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), orderBy("level", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name || "",
        name_zh: staff.name_zh || "",
        role_ms: staff.role_ms || "",
        role_zh: staff.role_zh || "",
        category: staff.category || "Teacher",
        subject: staff.subject || [],
        level: staff.level ?? 2,
        parentIds: Array.isArray(staff.parentIds)
          ? staff.parentIds
          : staff.parentId
            ? [staff.parentId]
            : [],
        image: staff.image
          ? typeof staff.image === "object"
            ? staff.image.url
            : staff.image
          : "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        name_zh: "",
        role_ms: "Guru",
        role_zh: "老师",
        category: "Teacher",
        subject: [],
        level: 2,
        parentIds: [],
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanData = { ...formData };

      // Migrate or clean up parentId if it exists
      if (cleanData.parentIds && cleanData.parentIds.length === 0) {
        delete cleanData.parentIds;
      }
      // Also clean up old field if it exists
      delete cleanData.parentId;

      if (editingStaff) {
        await updateDoc(doc(db, collectionName, editingStaff.id), cleanData);
      } else {
        await addDoc(collection(db, collectionName), cleanData);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("Ralat menyimpan maklumat kakitangan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Adakah anda pasti mahu memadam kakitangan ini?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      setStaffList(staffList.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    setFormData((prev) => {
      const subjects = prev.subject.includes(subject)
        ? prev.subject.filter((s) => s !== subject)
        : [...prev.subject, subject];
      return { ...prev, subject: subjects };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const result = await uploadToCloudinary(uploadData);
      if (result && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memuat naik imej. Sila semak konfigurasi Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const term = searchTerm.toLowerCase().trim();

    // Fuzzy search: check if term is contained ANYWHERE in EN or ZH name
    const matchesSearch =
      !term ||
      s.name?.toLowerCase().includes(term) ||
      s.name_zh?.includes(term);

    const matchesCategory =
      filterCategory === "All" ||
      (s.category &&
        s.category
          .split(",")
          .map((c) => c.trim())
          .includes(filterCategory));

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const getStaffDisplayName = (id) => {
    const s = staffList.find((item) => item.id === id);
    if (!s) return id;
    return `${s.name_zh ? `[${s.name_zh}] ` : ""}${s.name}`;
  };

  const availableParents = staffList.filter(
    (s) =>
      s.id !== editingStaff?.id && // Can't be own parent
      !(formData.parentIds || []).includes(s.id), // Not already selected
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari mengikut nama..."
              className="w-full pl-10 pr-24 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchTerm(searchInput);
                }
              }}
            />
            <button
              onClick={() => setSearchTerm(searchInput)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Cari
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "table"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Jadual
          </button>
          <button
            onClick={() => setViewMode("visual")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "visual"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Visual
          </button>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <HiPlus className="w-5 h-5" />
          <span>Tambah {title} Baru</span>
        </button>
      </div>

      {viewMode === "table" ? (
        /* Staff Table */
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Maklumat Kakitangan
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Jawatan
                  </th>
                  {collectionName !== "LPS" && collectionName !== "PTA" && (
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Kategori
                    </th>
                  )}
                  {showSubjects && (
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                  )}
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">
                    Tahap
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && staffList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">
                          Memuatkan rekod kakitangan...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 italic"
                    >
                      Tiada kakitangan ditemui yang sepadan dengan kriteria
                      anda.
                    </td>
                  </tr>
                ) : (
                  paginatedStaff.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10 shrink-0">
                            {staff.image ? (
                              <img
                                src={
                                  staff.image?.url ||
                                  (typeof staff.image === "string"
                                    ? staff.image
                                    : "")
                                }
                                alt={staff.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HiUserCircle className="w-8 h-8 text-primary/20" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-primary text-lg">
                              {staff.name_zh && (
                                <span className="mr-2">{staff.name_zh}</span>
                              )}
                              {staff.name}
                            </div>
                            <div className="text-xs text-gray-400 font-mono uppercase tracking-tighter">
                              ID: {staff.id?.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-800">
                            {staff.role_ms}
                          </div>
                          <div className="text-xs text-gray-500">
                            {staff.role_zh}
                          </div>
                        </div>
                      </td>
                      {collectionName !== "LPS" && collectionName !== "PTA" && (
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {staff.category?.split(",").map((cat, i) => {
                              const trimmedCat = cat.trim();
                              const isManagement = trimmedCat === "Management";
                              const isTeacher = trimmedCat === "Teacher";
                              const isAdmin =
                                trimmedCat === "Admin" ||
                                trimmedCat === "Pentadbiran";

                              return (
                                <span
                                  key={i}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isManagement
                                      ? "bg-accent-yellow/10 text-yellow-700 border border-yellow-200"
                                      : isTeacher
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-accent-green/10 text-green-700 border border-green-200"
                                  }`}
                                >
                                  {isManagement
                                    ? "Pengurusan"
                                    : isTeacher
                                      ? "Guru"
                                      : isAdmin
                                        ? "Pentadbiran"
                                        : trimmedCat}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      )}
                      {showSubjects && (
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {staff.subject?.map((sub) => (
                              <span
                                key={sub}
                                className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600"
                              >
                                {msSubjects[sub] || sub}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200">
                          {staff.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 transition-all duration-300">
                          <button
                            onClick={() => handleOpenModal(staff)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                            title="Edit"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <div className="w-px h-6 bg-gray-100 mx-0.5" />
                          <button
                            onClick={() => handleDelete(staff.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            title="Delete"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Menunjukkan{" "}
                <span className="font-bold text-primary">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                hingga{" "}
                <span className="font-bold text-primary">
                  {Math.min(
                    currentPage * itemsPerPage,
                    viewMode === "table" ? totalItems : filteredStaff.length,
                  )}
                </span>{" "}
                daripada{" "}
                <span className="font-bold text-primary">
                  {viewMode === "table" ? totalItems : filteredStaff.length}
                </span>{" "}
                rekod
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <StaffVisualManager
          staffList={staffList}
          onUpdateStaff={async (id, data) => {
            await updateDoc(doc(db, collectionName, id), data);
            fetchStaff();
          }}
          onEditStaff={handleOpenModal}
        />
      )}

      {/* Modal Tooltip / Info */}
      <div className="text-xs text-gray-400 text-center italic">
        * Level 0: Guru Besar | Level 1: Guru Penolong Kanan | Level 2+:
        Kakitangan
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-primary text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-display font-bold">
                  {editingStaff
                    ? `Edit Butiran ${title}`
                    : `Daftar ${title} Baru`}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  Kemas kini dan urus maklumat kakitangan sekolah
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HiXCircle className="w-8 h-8" />
              </button>
            </div>

            {/* Modal Content - Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-8">
              <form
                id="staff-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Basic Identification */}
                <section className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                    Pengenalan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Nama Penuh (En)
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. Lee Chee Wah"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Nama Cina (中文姓名)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="如：李志华"
                        value={formData.name_zh}
                        onChange={(e) =>
                          setFormData({ ...formData, name_zh: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* Role Details */}
                <section className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                    Jawatan & Hierarki
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Jawatan (Malay)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        value={formData.role_ms}
                        onChange={(e) =>
                          setFormData({ ...formData, role_ms: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Jawatan (中)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        placeholder="如：校长"
                        value={formData.role_zh}
                        onChange={(e) =>
                          setFormData({ ...formData, role_zh: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {collectionName !== "LPS" && collectionName !== "PTA" && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          Kategori Pentadbiran
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Teacher"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Tahap Organisasi (0-9)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="9"
                        className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            level: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Report to
                      </label>
                      <div className="space-y-3">
                        {/* List of selected parents */}
                        <div className="flex flex-wrap gap-2">
                          {(formData.parentIds || []).length > 0 ? (
                            (formData.parentIds || []).map((pId) => (
                              <div
                                key={pId}
                                className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold animate-in zoom-in duration-200"
                              >
                                <span>{getStaffDisplayName(pId)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      parentIds: formData.parentIds.filter(
                                        (id) => id !== pId,
                                      ),
                                    });
                                  }}
                                  className="p-1 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                                  title="Gugurkan Induk"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic py-1">
                              Tiada induk dipilih.
                            </p>
                          )}
                        </div>

                        {/* Dropdown to add */}
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer text-sm font-medium"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                setFormData({
                                  ...formData,
                                  parentIds: [
                                    ...(formData.parentIds || []),
                                    e.target.value,
                                  ],
                                });
                              }
                            }}
                          >
                            <option value="" disabled>
                              + Tambah Induk (Pilih Nama)
                            </option>
                            {availableParents.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name_zh ? `[${s.name_zh}] ` : ""}
                                {s.name} ({s.role_ms})
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <HiPlus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Subjects */}
                {showSubjects && (
                  <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                      Mata Pelajaran Ditugaskan
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.subject.includes(sub)
                              ? "bg-primary text-white shadow-md scale-105"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {msSubjects[sub] || sub}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Media */}
                <section className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                    Imej Profil
                  </h4>
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 overflow-hidden shrink-0 shadow-sm">
                      {formData.image ? (
                        <img
                          src={
                            typeof formData.image === "object"
                              ? formData.image.url
                              : formData.image
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HiPhoto className="w-10 h-10" />
                      )}
                    </div>
                    <div className="flex-1">
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm"
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
                              {formData.image ? "Tukar Foto" : "Muat Naik Foto"}
                            </span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">
                        Foto disimpan dengan selamat di Cloudinary.
                      </p>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="staff-form"
                disabled={loading}
                className="btn-primary flex items-center gap-2 px-10 shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <HiCheckCircle className="w-5 h-5" />
                )}
                <span>{editingStaff ? "Simpan Perubahan" : "Cipta Rekod"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffVisualManager({ staffList, onUpdateStaff, onEditStaff }) {
  const [connecting, setConnecting] = useState(null); // { fromId, startPos }
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredStaffId, setHoveredStaffId] = useState(null);
  const containerRef = useRef(null);

  // Determine the dynamic range of levels: always show at least 0-3, or maxLevel + 1
  const maxExistingLevel =
    staffList.length > 0 ? Math.max(...staffList.map((s) => s.level || 0)) : 2;

  const levels = Array.from(
    { length: Math.max(maxExistingLevel + 2, 4) },
    (_, i) => i,
  );

  const staffByLevel = levels.map((l) => ({
    level: l,
    staff: staffList
      .filter((s) => s.level === l)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }));

  const handleDragEnd = async (staffId, newLevel, targetOrderId = null) => {
    const levelStaff = staffByLevel.find((l) => l.level === newLevel).staff;
    let newOrder = 0;

    if (targetOrderId === null) {
      // Drop on container (append to end)
      newOrder =
        levelStaff.length > 0
          ? Math.max(...levelStaff.map((s) => s.order ?? 0)) + 1
          : 0;
    } else {
      // Find the target card's current relative position
      const targetIndex = levelStaff.findIndex((s) => s.id === targetOrderId);
      if (targetIndex !== -1) {
        newOrder = targetIndex;
      }
    }

    // Proactively update local state for faster feedback if possible,
    // but here we rely on fetchStaff from the parent.
    await onUpdateStaff(staffId, { level: newLevel, order: newOrder });

    // Normalize orders for everyone in this level to keep them as integers
    // We'll let the next refresh handle this naturally if we just set the new one.
    // For a more robust solution, we re-index after the update.
  };

  const handleLevelDrop = async (e, level) => {
    e.preventDefault();
    const staffId = e.dataTransfer.getData("staffId");
    if (!staffId) return;

    const container = e.currentTarget;
    const mouseX = e.clientX;
    const cardEls = Array.from(
      container.querySelectorAll("[data-staff-id]"),
    ).filter((el) => el.getAttribute("data-staff-id") !== staffId); // Don't count self

    let targetCardId = null;

    for (const cardEl of cardEls) {
      const rect = cardEl.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (mouseX < midX) {
        targetCardId = cardEl.getAttribute("data-staff-id");
        break;
      }
    }

    await handleDragEnd(staffId, level, targetCardId);
  };

  const startConnecting = (e, staffId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const startPos = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
    setConnecting({ fromId: staffId, startPos });
    setCursorPos({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
  };

  useEffect(() => {
    if (!connecting) return;

    const handleMouseMove = (e) => {
      const containerRect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      });
    };

    const handleMouseUp = () => {
      setConnecting(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [connecting]);

  const completeConnection = async (targetId) => {
    if (connecting && connecting.fromId !== targetId) {
      // Check if target is at a higher level than the source (prevent loops or weirdness)
      const targetStaff = staffList.find((s) => s.id === targetId);
      const sourceStaff = staffList.find((s) => s.id === connecting.fromId);

      if (targetStaff && sourceStaff && targetStaff.level > sourceStaff.level) {
        const currentParents = Array.isArray(targetStaff.parentIds)
          ? targetStaff.parentIds
          : targetStaff.parentId
            ? [targetStaff.parentId]
            : [];

        if (!currentParents.includes(connecting.fromId)) {
          await onUpdateStaff(targetId, {
            parentIds: [...currentParents, connecting.fromId],
          });
        }
      } else if (
        targetStaff &&
        sourceStaff &&
        targetStaff.level <= sourceStaff.level
      ) {
        alert("Anak mesti berada di tahap yang lebih rendah daripada induk.");
      }
      setConnecting(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[800px] bg-gray-50 rounded-[2.5rem] border border-gray-200 overflow-hidden p-8 shadow-inner"
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {staffList.map((s) => {
          const currentParents = Array.isArray(s.parentIds)
            ? s.parentIds
            : s.parentId
              ? [s.parentId]
              : [];

          return currentParents.map((pId) => {
            const parent = staffList.find((p) => p.id === pId);
            if (!parent) return null;

            return (
              <ConnectionLine
                key={`${s.id}-${pId}`}
                fromId={pId}
                toId={s.id}
                containerRef={containerRef}
                staffList={staffList}
                isHighlighted={
                  hoveredStaffId === s.id || hoveredStaffId === pId
                }
              />
            );
          });
        })}
        {connecting && (
          <line
            x1={connecting.startPos.x}
            y1={connecting.startPos.y}
            x2={cursorPos.x}
            y2={cursorPos.y}
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrow)"
          />
        )}
      </svg>

      <div className="space-y-10 relative z-10">
        {staffByLevel.map((levelGroup) => (
          <div key={levelGroup.level} className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-primary/10">
                  {levelGroup.level}
                </span>
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                  {levelGroup.level === 0
                    ? "Kepimpinan (Level 0)"
                    : levelGroup.level === 1
                      ? "GPK / Pengurusan (Level 1)"
                      : levelGroup.level === 2
                        ? "Kakitangan (Level 2)"
                        : `Sub-Level ${levelGroup.level}`}
                </span>
              </div>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            <div
              className="flex flex-wrap gap-6 justify-center min-h-[140px] p-6 bg-white/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 transition-all hover:bg-white/50 hover:border-primary/20 group/level"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "border-primary/40",
                  "bg-primary/5",
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-primary/40",
                  "bg-primary/5",
                );
              }}
              onDrop={(e) => handleLevelDrop(e, levelGroup.level)}
            >
              {levelGroup.staff.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center text-gray-400 italic text-sm gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <HiArrowsRightLeft className="w-5 h-5 opacity-20" />
                  </div>
                  <span>
                    Tarik kakitangan ke sini untuk ke tahap {levelGroup.level}
                  </span>
                </div>
              )}
              {levelGroup.staff.map((staff) => (
                <VisualStaffCard
                  key={staff.id}
                  staff={staff}
                  onEdit={() => onEditStaff(staff)}
                  onStartConnect={(e) => startConnecting(e, staff.id)}
                  onDropConnect={() => completeConnection(staff.id)}
                  isConnecting={connecting?.fromId === staff.id}
                  showParentStatus={
                    (Array.isArray(staff.parentIds) &&
                      staff.parentIds.length > 0) ||
                    !!staff.parentId
                  }
                  onUpdateStaff={onUpdateStaff}
                  staffList={staffList}
                  onHover={(id) => setHoveredStaffId(id)}
                  isHovered={hoveredStaffId === staff.id}
                  isRelatedHovered={
                    hoveredStaffId &&
                    ((Array.isArray(staff.parentIds) &&
                      staff.parentIds.includes(hoveredStaffId)) ||
                      staff.parentId === hoveredStaffId ||
                      staffList
                        .find((s) => s.id === hoveredStaffId)
                        ?.parentIds?.includes(staff.id) ||
                      staffList.find((s) => s.id === hoveredStaffId)
                        ?.parentId === staff.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualStaffCard({
  staff,
  onEdit,
  onStartConnect,
  onDropConnect,
  isConnecting,
  showParentStatus,
  onUpdateStaff,
  staffList,
  onHover,
  isHovered,
  isRelatedHovered,
}) {
  const cardRef = useRef(null);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      layout
      layoutId={staff.id}
      data-staff-id={staff.id}
      draggable
      onDragStart={(e) => {
        setIsDraggingLocal(true);
        e.dataTransfer.setData("staffId", staff.id);
        e.dataTransfer.setData("level", staff.level);

        // Improve drag image visibility
        const ghost = e.currentTarget.cloneNode(true);
        ghost.style.position = "absolute";
        ghost.style.top = "-1000px";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 80, 40);
        setTimeout(() => document.body.removeChild(ghost), 0);
      }}
      onDragEnd={() => setIsDraggingLocal(false)}
      onDragOver={(e) => {
        e.preventDefault();
        const draggedLevel = e.dataTransfer.getData("level");
        if (parseInt(draggedLevel) === staff.level) {
          e.currentTarget.classList.add("scale-105", "border-primary/40");
        }
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("scale-105", "border-primary/40");
      }}
      onDrop={(e) => {
        // Letting the level container handle the drop for consistent reordering
      }}
      onMouseEnter={() => onHover(staff.id)}
      onMouseLeave={() => onHover(null)}
      onMouseUp={(e) => {
        onDropConnect();
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-44 bg-white p-3 rounded-[1.5rem] shadow-md border-2 transition-all cursor-grab active:cursor-grabbing ${
        isDraggingLocal ? "opacity-20 scale-95" : "opacity-100"
      } ${
        isConnecting
          ? "border-primary ring-4 ring-primary/5"
          : isHovered || isRelatedHovered
            ? "border-primary shadow-xl scale-102"
            : "border-transparent hover:shadow-xl hover:border-primary/10"
      }`}
    >
      <div
        className={`flex flex-col items-center text-center gap-2 ${isHovered || isRelatedHovered ? "opacity-100" : "opacity-90"}`}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 p-0.5 ring-1 ring-gray-100 shadow-inner">
            <div className="w-full h-full rounded-full bg-white overflow-hidden">
              {staff.image ? (
                <img
                  src={
                    typeof staff.image === "object"
                      ? staff.image.url
                      : staff.image
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/10">
                  <HiUserCircle className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          <button
            onMouseDown={onStartConnect}
            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20 group"
            title="Tarik ke anak untuk menyambung"
          >
            <HiLink className="w-3 h-3" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Sambung ke Anak
            </div>
          </button>

          {showParentStatus && (
            <div className="absolute -top-0.5 -left-0.5 flex flex-col gap-1 z-30">
              <div
                className="w-5 h-5 bg-accent-green text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
                title="Mempunyai induk"
              >
                <HiCheckCircle className="w-3 h-3" />
              </div>

              {/* Unlink buttons for each parent */}
              {(() => {
                const pIds = Array.isArray(staff.parentIds)
                  ? staff.parentIds
                  : staff.parentId
                    ? [staff.parentId]
                    : [];

                return pIds.map((pId) => {
                  const pName =
                    staffList.find((s) => s.id === pId)?.name || "Induk";
                  return (
                    <button
                      key={pId}
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextParents = pIds.filter((id) => id !== pId);
                        onUpdateStaff(staff.id, { parentIds: nextParents });
                      }}
                      className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white hover:bg-red-600 transition-colors group/trash"
                      title={`Padam sambungan ke ${pName}`}
                    >
                      <HiTrash className="w-2.5 h-2.5" />
                      <div className="absolute left-6 bg-gray-800 text-[8px] px-1 py-0.5 rounded opacity-0 group-hover/trash:opacity-100 whitespace-nowrap pointer-events-none">
                        Unlink {pName}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 text-[11px] leading-tight line-clamp-2 min-h-[1.5rem] flex items-center justify-center">
            {staff.name_zh && <span className="mr-1">{staff.name_zh}</span>}
            {staff.name}
          </h4>
          <div className="inline-block px-2 py-0.5 bg-primary/5 rounded-full">
            <p className="text-[8px] text-primary font-bold uppercase tracking-wider">
              {staff.role_ms}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-50 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-full py-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold"
          >
            <HiPencil className="w-4 h-4" />
            <span>Kemas Kini</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectionLine({
  fromId,
  toId,
  containerRef,
  staffList,
  isHighlighted,
}) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const updatePos = () => {
      const fromEl = document.querySelector(`[data-staff-id="${fromId}"]`);
      const toEl = document.querySelector(`[data-staff-id="${toId}"]`);

      if (fromEl && toEl && containerRef.current) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setPos({
          // Parent bottom center
          x1: fromRect.left + fromRect.width / 2 - containerRect.left,
          y1: fromRect.top + fromRect.height - containerRect.top,
          // Child top center
          x2: toRect.left + toRect.width / 2 - containerRect.left,
          y2: toRect.top - containerRect.top,
        });
      }
    };

    updatePos();
    const timer = setTimeout(updatePos, 300);
    const timer2 = setTimeout(updatePos, 800);

    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("resize", updatePos);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [fromId, toId, staffList]);

  if (!pos) return null;

  const dx = pos.x2 - pos.x1;
  const dy = pos.y2 - pos.y1;
  const curve = Math.abs(dy) * 0.5;

  // Cubic Bezier path: starts at parent bottom, curves down then back to child top
  const d = `M ${pos.x1} ${pos.y1} C ${pos.x1} ${pos.y1 + curve} ${pos.x2} ${pos.y2 - curve} ${pos.x2} ${pos.y2}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={isHighlighted ? "#1d4ed8" : "#cbd5e1"}
      strokeWidth={isHighlighted ? "3" : "2"}
      markerEnd="url(#arrow)"
      className={`transition-all duration-300 ${isHighlighted ? "z-20 opacity-100" : "z-0 opacity-40"}`}
    />
  );
}
