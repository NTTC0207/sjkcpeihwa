"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiChevronLeft,
  HiArrowRightOnRectangle,
  HiArrowLeft,
} from "react-icons/hi2";
import StaffTableManager from "@components/admin/StaffTableManager";
import RevalidateButton from "@components/admin/RevalidateButton";

export default function AdminPTAPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Not logged in, redirect to login page
        router.push("/admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Admin Navbar */}
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
                  Pengurusan PIBG
                </h1>
                <p className="text-xs text-gray-300">SJK(C) Pei Hwa Machang</p>
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
        <RevalidateButton path="/organization/pta" label="Pengurusan PIBG" />
      </div>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-primary font-bold mb-4 hover:text-primary-dark transition-colors group w-fit"
          >
            <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Papan Pemuka
          </Link>
        </div>

        {/* Staff Table Component */}
        <StaffTableManager
          collectionName="PTA"
          title="Ahli PIBG"
          showSubjects={false}
        />
      </main>

      {/* Footer Meta */}
      <footer className="container-custom py-12 border-t border-gray-200 mt-12">
        <div className="text-center text-gray-400 text-sm">
          <p>© 2026 SJK(C) Pei Hwa Machang Admin Portal</p>
        </div>
      </footer>
    </div>
  );
}
