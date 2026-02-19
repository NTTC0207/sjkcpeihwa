"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, getDocs, addDoc, query, limit } from "firebase/firestore";
import { auth, db } from "@lib/firebase";
import Link from "next/link";
import { announcements as localAnnouncements } from "@/src/data/announcements";
import { staffData as localStaff } from "@lib/staffData";
import { HiArrowPath } from "react-icons/hi2";

/**
 * Admin Dashboard Page
 * Features:
 * - Reverted to previous Card Grid UI
 * - Firebase email/password authentication
 * - Management sections for Announcements and Staff
 */
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setUser(userCredential.user);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
          ? "Invalid email or password."
          : "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError("Failed to logout");
    }
  };

  // Migrate local data to Firestore if empty
  const migrateData = async () => {
    if (!confirm("This will import local data to Firestore. Proceed?")) return;
    setIsMigrating(true);
    try {
      // Migrate Announcements
      const annSnapshot = await getDocs(
        query(collection(db, "announcement"), limit(1)),
      );
      if (annSnapshot.empty) {
        for (const ann of localAnnouncements) {
          const { id, ...data } = ann;
          await addDoc(collection(db, "announcement"), data);
        }
      }

      // Migrate Staff
      const staffSnapshot = await getDocs(
        query(collection(db, "staff"), limit(1)),
      );
      if (staffSnapshot.empty) {
        for (const staff of localStaff) {
          await addDoc(collection(db, "staff"), staff);
        }
      }

      alert("Data migration successful! Please refresh the sections.");
    } catch (err) {
      console.error("Migration error:", err);
      alert("Migration failed. Check console.");
    } finally {
      setIsMigrating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        {/* Admin Navbar */}
        <nav className="bg-primary-dark text-white shadow-lg sticky top-0 z-50">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Peihwa Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-gray-300">
                    SJK(C) Pei Hwa Machang
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-sm hover:text-accent-yellow transition-colors duration-300"
                >
                  ← Back to Website
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-accent-red hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/20"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="container-custom py-8">
          <>
            <div className="mb-10">
              <h2 className="text-3xl font-display font-bold text-primary mb-2">
                Welcome, {user.email}
              </h2>
              <p className="text-gray-600">
                Manage your school website content from here.
              </p>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/admin/announcements"
                className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left block"
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <span className="text-2xl text-white">📢</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Announcements
                </h3>
                <p className="text-sm text-gray-600">
                  Manage school announcements, news and important updates.
                </p>
              </Link>

              <Link
                href="/admin/staff"
                className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left block"
              >
                <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-900/10">
                  <span className="text-2xl text-primary font-bold">👤</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Staff Management
                </h3>
                <p className="text-sm text-gray-600">
                  Edit teacher profiles, roles, and organization hierarchy.
                </p>
              </Link>

              <Link
                href="/admin/lps"
                className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left block"
              >
                <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-900/10">
                  <span className="text-2xl text-white">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  LPS Management
                </h3>
                <p className="text-sm text-gray-600">
                  Manage School Board (Lembaga Pengelola Sekolah) members.
                </p>
              </Link>

              <Link
                href="/admin/pta"
                className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left block"
              >
                <div className="w-12 h-12 bg-primary-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <span className="text-2xl text-white">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  PIBG Management
                </h3>
                <p className="text-sm text-gray-600">
                  Manage Parent-Teacher Association (PIBG) members.
                </p>
              </Link>

              <div className="card opacity-60 grayscale cursor-not-allowed">
                <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Events (Coming Soon)
                </h3>
                <p className="text-sm text-gray-600">
                  Create and manage upcoming school activities and calendar.
                </p>
              </div>

              <div className="card opacity-60 grayscale cursor-not-allowed">
                <div className="w-12 h-12 bg-primary-dark rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Gallery (Coming Soon)
                </h3>
                <p className="text-sm text-gray-600">
                  Upload and manage school photo albums and memories.
                </p>
              </div>

              <div className="card opacity-60 grayscale cursor-not-allowed">
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">⚙️</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Configure website general settings and administration.
                </p>
              </div>

              {/* Import Local Data functionality kept for administrative convenience */}
              <button
                onClick={migrateData}
                disabled={isMigrating}
                className="card group hover:shadow-xl transition-all duration-300 text-left border-dashed border-2 border-primary/20 bg-primary/5"
              >
                <div
                  className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-primary/10 ${isMigrating ? "animate-spin" : ""}`}
                >
                  <HiArrowPath className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {isMigrating ? "Importing Data..." : "Import Local Data"}
                </h3>
                <p className="text-sm text-gray-600">
                  One-time setup: Sync local data folders with live database.
                </p>
              </button>
            </div>

            {/* Quick Stats Section */}
            <div className="mt-12 card-dark p-8 rounded-[2rem] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <h3 className="text-xl font-display font-semibold text-accent-yellow mb-8 flex items-center gap-2">
                <span className="w-2 h-8 bg-accent-yellow rounded-full"></span>
                Quick Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    12
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Announcements
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    8
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Events
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    156
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Gallery Photos
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Admin Users
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    );
  }

  // Login form - Reverted to circular logo and gradient background style
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden border-4 border-accent-yellow p-4">
            <img
              src="/logo.png"
              alt="Peihwa Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Admin Login
          </h1>
          <p className="text-primary-foreground/70">SJK(C) Pei Hwa Machang</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-10 animate-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in shake-in-1">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="admin@peihwa.edu.my"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-neutral-bg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Back to Website Link */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:text-accent-yellow transition-colors duration-300"
            >
              ← Back to Website
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 text-center text-white/50 text-xs py-4 px-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <p className="font-bold flex items-center justify-center gap-2 mb-1">
            🔒 Secure Administrative Portal
          </p>
          <p>
            Strictly for authorized school personnel only. All access monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
