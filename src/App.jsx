// ============================================
// FILE: src/App.jsx
// ============================================

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AttendancePage from "./pages/AttendancePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import { supabase, getCurrentUserProfile, signOut } from "./utils/supabase";
import { RefreshCw, LogOut } from "lucide-react";

function AppContent() {
  const [userProfile, setUserProfile] = useState(null); // { id, email, role, full_name }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        const user = session.user;
        const metaRole = user.user_metadata?.role;
        const metaName = user.user_metadata?.full_name;

        if (metaRole) {
          // Build profile from JWT — instant, no network call
          setUserProfile({
            id: user.id,
            email: user.email,
            full_name: metaName || null,
            role: metaRole,
          });
        } else {
          // Fallback — only if role missing from metadata
          const profile = await getCurrentUserProfile();
          if (mounted) setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
    // Route based on role
    if (profile?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/attendance");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUserProfile(null);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile?.role === "admin";
  const isOperator = userProfile?.role === "operator";
  const isLoggedIn = !!userProfile;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header — only shown when logged in */}
      {isLoggedIn && (
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
            <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance System
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">
                {userProfile.full_name || userProfile.email}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {userProfile.role}
                </span>
              </span>

              {isAdmin && (
                <nav className="flex gap-2">
                  <button
                    onClick={() => navigate("/attendance")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      location.pathname === "/attendance"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => navigate("/admin")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      location.pathname === "/admin"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Admin
                  </button>
                </nav>
              )}

              {/* Logout — visible to all logged-in users */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={isLoggedIn ? "p-4 md:p-10" : ""}>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route
                path="*"
                element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
              />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <Navigate to={isAdmin ? "/admin" : "/attendance"} replace />
                }
              />

              <Route path="/attendance" element={<AttendancePage />} />

              {isAdmin && (
                <Route
                  path="/admin"
                  element={
                    <AdminPage
                      onLogout={handleLogout}
                      userProfile={userProfile}
                    />
                  }
                />
              )}

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
