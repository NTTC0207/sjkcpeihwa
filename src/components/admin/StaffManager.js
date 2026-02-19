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

export default function StaffManager() {
  const [staffList, setStaffList] = useState([]);
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
    image: null,
  });

  const categories = ["Management", "Teacher", "Admin"];

  useEffect(() => {
    fetchStaff();
  }, []);

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
      image: staff.image || null,
    });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
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
        image: null,
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
          Manage Staff
        </h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiPlus /> Add Staff Member
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card-white p-6 md:p-8 border-2 border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-primary mb-6">
            {editingId ? "Edit Staff Member" : "Add New Staff Member"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Name (English/Malay)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Name (Chinese)
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
                    Category
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
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Role (English)
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
                    Role (Malay)
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
                    Role (Chinese)
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
                  Organization Hierarchy
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Level (0=Root, 1=VP, 2=Staff)
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
                      Reports To (Parent)
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentId: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="">None (Top Level)</option>
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
                  Subjects
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
                      {sub}
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
                Cancel
              </button>
              <button type="submit" className="btn-primary-accent px-8">
                {editingId ? "Update Staff" : "Add Staff"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && !editingId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              No staff members found. Add one to get started.
            </div>
          ) : (
            staffList.map((s) => (
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
                          {sub}
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
      )}
    </div>
  );
}
