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
import { HiPlus, HiPencil, HiTrash, HiUser } from "react-icons/hi2";
import { subjects } from "@lib/staffData";
import { useLanguage } from "@lib/LanguageContext";

export default function StaffManager() {
  const { translations } = useLanguage();
  const tSubjects = translations?.subjects || {};
  const [staffList, setStaffList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    name_zh: "",
    role: "Teacher",
    role_ms: "Guru",
    role_zh: "老师",
    category: "Teacher",
    subject: [],
    level: 2,
    parentId: "",
    image: "",
  });

  const categories = ["Management", "Teacher"];

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(staffList.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [staffList.length, currentPage]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "staff"), orderBy("level", "asc"));
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

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setFormData({
      name: staff.name,
      name_zh: staff.name_zh || "",
      role: staff.role,
      role_ms: staff.role_ms || "",
      role_zh: staff.role_zh || "",
      category: staff.category,
      subject: staff.subject || [],
      level: staff.level || 2,
      parentId: staff.parentId || "",
      image: staff.image
        ? typeof staff.image === "object"
          ? staff.image.url
          : staff.image
        : "",
    });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Adakah anda pasti mahu memadam ahli kakitangan ini?")) return;
    try {
      await deleteDoc(doc(db, "staff", id));
      setStaffList(staffList.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  const toggleSubject = (subject) => {
    if (formData.subject.includes(subject)) {
      setFormData({
        ...formData,
        subject: formData.subject.filter((s) => s !== subject),
      });
    } else {
      setFormData({ ...formData, subject: [...formData.subject, subject] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanData = { ...formData };
      if (!cleanData.parentId) delete cleanData.parentId;

      if (editingId) {
        await updateDoc(doc(db, "staff", editingId), cleanData);
      } else {
        await addDoc(collection(db, "staff"), cleanData);
      }
      setEditingId(null);
      setIsAdding(false);
      setFormData({
        name: "",
        name_zh: "",
        role: "Teacher",
        role_ms: "Guru",
        role_zh: "老师",
        category: "Teacher",
        subject: [],
        level: 2,
        parentId: "",
        image: "",
      });
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
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
          Urus Kakitangan
        </h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiPlus /> Tambah Ahli Kakitangan
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card-white p-6 md:p-8 border-2 border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-primary mb-6">
            {editingId ? "Edit Ahli Kakitangan" : "Tambah Ahli Kakitangan Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nama (Inggeris/Malay)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Nama Penuh"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nama (Cina)
                  </label>
                  <input
                    type="text"
                    value={formData.name_zh}
                    onChange={(e) =>
                      setFormData({ ...formData, name_zh: e.target.value })
                    }
                    className="input-field"
                    placeholder="中文姓名"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "Management"
                          ? "Pengurusan"
                          : cat === "Teacher"
                            ? "Guru"
                            : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Jawatan (Inggeris)
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="input-field"
                    placeholder="Headmaster / Teacher / etc."
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Jawatan (Malay)
                  </label>
                  <input
                    type="text"
                    value={formData.role_ms}
                    onChange={(e) =>
                      setFormData({ ...formData, role_ms: e.target.value })
                    }
                    className="input-field"
                    placeholder="Guru Besar / Guru / etc."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Jawatan (Cina)
                  </label>
                  <input
                    type="text"
                    value={formData.role_zh}
                    onChange={(e) =>
                      setFormData({ ...formData, role_zh: e.target.value })
                    }
                    className="input-field"
                    placeholder="校长 / 老师 / etc."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Hierarki Organisasi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Tahap (0=Asal, 1=GPK, 2=Kakitangan)
                    </label>
                    <input
                      type="number"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      min="0"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Melapor Kepada (Induk)
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentId: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="">Tiada (Tahap Atas)</option>
                      {staffList
                        .filter(
                          (s) =>
                            s.id !== editingId &&
                            s.level < (formData.level || 3),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mata Pelajaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        formData.subject.includes(sub)
                          ? "bg-primary text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tSubjects[sub] || sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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
                {editingId ? "Kemas Kini Kakitangan" : "Tambah Kakitangan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && !editingId && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                Tiada ahli kakitangan ditemui. Tambah satu untuk bermula.
              </div>
            ) : (
              staffList
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((s) => (
                  <div
                    key={s.id}
                    className="card-white p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                        {s.image ? (
                          <img
                            src={s.image}
                            className="w-full h-full rounded-full object-cover"
                            alt=""
                          />
                        ) : (
                          <HiUser className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary leading-tight">
                          {s.name_zh ? `${s.name_zh} ${s.name}` : s.name}
                        </h4>
                        <p className="text-xs text-gray-500">{s.role}</p>
                        <div className="flex gap-1 mt-1">
                          {s.subject?.slice(0, 2).map((sub) => (
                            <span
                              key={sub}
                              className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600"
                            >
                              {tSubjects[sub] || sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1.5 text-primary hover:bg-primary/5 rounded-md transition-colors"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-accent-red hover:bg-red-50 rounded-md transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Pagination */}
          {staffList.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.ceil(staffList.length / itemsPerPage) },
                  (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg border transition-all ${
                        currentPage === i + 1
                          ? "bg-primary text-white border-primary shadow-md"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      Math.ceil(staffList.length / itemsPerPage),
                      prev + 1,
                    ),
                  )
                }
                disabled={
                  currentPage === Math.ceil(staffList.length / itemsPerPage)
                }
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
