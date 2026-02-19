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
import { formatGoogleDriveLink } from "@lib/utils";
import { uploadToCloudinary } from "@lib/cloudinary";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronLeft,
  HiMagnifyingGlass,
  HiFunnel,
  HiUserCircle,
  HiPhoto,
  HiCheckCircle,
  HiXCircle,
  HiCloudArrowUp,
} from "react-icons/hi2";
import { subjects } from "@lib/staffData";
import { useRef } from "react";

export default function StaffTableManager({
  collectionName = "staff",
  title = "Staff",
  showSubjects = true,
}) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    name_zh: "",
    role_ms: "Guru",
    role_zh: "老师",
    category: "Teacher",
    subject: [],
    level: 2,
    parentId: "",
    image: null,
  });

  const categories = ["Management", "Teacher", "Admin"];

  useEffect(() => {
    fetchStaff();
  }, []);

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
        parentId: staff.parentId || "",
        image: staff.image || null,
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
        parentId: "",
        image: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanData = { ...formData };
      if (!cleanData.parentId) delete cleanData.parentId;

      if (editingStaff) {
        await updateDoc(doc(db, collectionName, editingStaff.id), cleanData);
      } else {
        await addDoc(collection(db, collectionName), cleanData);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("Error saving staff information.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
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
      const url = await uploadToCloudinary(uploadData);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please check Cloudinary configuration.");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name_zh?.includes(searchTerm);

    const matchesCategory =
      filterCategory === "All" || s.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or role..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm appearance-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New {title}</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Staff Info
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                {showSubjects && (
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Subjects
                  </th>
                )}
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">
                  Level
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">
                  Actions
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
                        Loading staff records...
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
                    No staff members found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10 shrink-0">
                          {staff.image ? (
                            <img
                              src={formatGoogleDriveLink(staff.image)}
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
                            ID: {staff.id.substring(0, 8)}...
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
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          staff.category === "Management"
                            ? "bg-accent-yellow/10 text-yellow-700"
                            : staff.category === "Teacher"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent-green/10 text-green-700"
                        }`}
                      >
                        {staff.category}
                      </span>
                    </td>
                    {showSubjects && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.subject?.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600"
                            >
                              {sub}
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
      </div>

      {/* Modal Tooltip / Info */}
      <div className="text-xs text-gray-400 text-center italic">
        * Level 0: Headmaster | Level 1: Vice Principals | Level 2+: Staff &
        Teachers
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
                    ? `Edit ${title} Details`
                    : `Register New ${title}`}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  Update and manage school personnel information
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
                    Identification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Full Name (EN/MS)
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
                        Chinese Name (中文姓名)
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
                    Position & Hierarchy
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Role (MS)
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
                        Role (ZH)
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Administrative Category
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. Teacher"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Organization Level (0-9)
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
                        Reports To (Parent)
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none"
                        value={formData.parentId || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, parentId: e.target.value })
                        }
                      >
                        <option value="">None (Top Level)</option>
                        {staffList
                          .filter(
                            (s) =>
                              s.id !== editingStaff?.id &&
                              s.level < (formData.level || 5),
                          )
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.role_ms})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Subjects */}
                {showSubjects && (
                  <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                      Subjects Assigned
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
                          {sub}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Media */}
                <section className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">
                    Profile Image
                  </h4>
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 overflow-hidden shrink-0 shadow-sm">
                      {formData.image ? (
                        <img
                          src={formData.image}
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
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <HiCloudArrowUp className="w-5 h-5" />
                            <span>
                              {formData.image ? "Change Photo" : "Upload Photo"}
                            </span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">
                        Photos are stored securely on Cloudinary.
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
                Cancel
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
                <span>{editingStaff ? "Save Changes" : "Create Record"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
