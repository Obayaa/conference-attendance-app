// ============================================
// FILE: src/pages/AdminPage.jsx
// ============================================

import {
  Users,
  UserCheck,
  TrendingUp,
  Download,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  Percent,
  Upload,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Database,
  Pencil,
} from "lucide-react";

import {
  getAttendance,
  clearAllAttendance,
  clearAllMembers,
  getAttendanceStats,
  subscribeToAttendance,
  unsubscribeFromAttendance,
  getSystemUsers,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  getAllMembersCount,
} from "../utils/supabase";
import { useEffect, useState, useRef } from "react";
import ConfirmModal from "../components/ConfirmModal";
import MemberUpload from "../components/MemberUpload";
import BranchGenderChart from "../components/BranchGenderChart";

// ─────────────────────────────────────────────
// System Users Tab
// ─────────────────────────────────────────────
function SystemUsersTab() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "operator",
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    role: "operator",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    const data = await getSystemUsers();
    setUsers(data);
    setLoadingUsers(false);
  }

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleEditFormChange(e) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function openEdit(user) {
    setEditTarget(user);
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "operator",
      password: "",
    });
    setShowEditPassword(false);
    setMessage({ text: "", type: "" });
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }
    if (form.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });
    const result = await createSystemUser(form);

    if (result.success) {
      setMessage({
        text: `User "${form.full_name}" created successfully.`,
        type: "success",
      });
      setForm({ full_name: "", email: "", password: "", role: "operator" });
      setShowForm(false);
      await loadUsers();
    } else {
      setMessage({
        text: result.message || "Failed to create user.",
        type: "error",
      });
    }
    setSubmitting(false);
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      setMessage({ text: "Name and email are required.", type: "error" });
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    const payload = {
      userId: editTarget.id,
      full_name: editForm.full_name,
      email: editForm.email,
      role: editForm.role,
    };
    if (editForm.password.trim()) payload.password = editForm.password;

    const result = await updateSystemUser(payload);

    if (result.success) {
      setMessage({
        text: `User "${editForm.full_name}" updated successfully.`,
        type: "success",
      });
      setEditTarget(null);
      await loadUsers();
    } else {
      setMessage({
        text: result.message || "Failed to update user.",
        type: "error",
      });
    }
    setSubmitting(false);
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteSystemUser(deleteTarget.id);
    if (result.success) {
      setMessage({
        text: `User "${deleteTarget.full_name || deleteTarget.email}" deleted.`,
        type: "success",
      });
      await loadUsers();
    } else {
      setMessage({
        text: result.message || "Failed to delete user.",
        type: "error",
      });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">System Users</h2>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setEditTarget(null);
            setMessage({ text: "", type: "" });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Feedback */}
      {message.text && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Create New User</h3>
          <form
            onSubmit={handleCreateUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleFormChange}
                placeholder="e.g. John Mensah"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value="operator">Operator (Attendance only)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-60 text-sm"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {submitting ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editTarget && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-1">Edit User</h3>
          <p className="text-sm text-gray-500 mb-4">
            Leave password blank to keep it unchanged.
          </p>
          <form
            onSubmit={handleUpdateUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="full_name"
                value={editForm.full_name}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                New Password{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showEditPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={handleEditFormChange}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showEditPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={editForm.role}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="operator">Operator (Attendance only)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 text-sm"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loadingUsers ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No system users yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Created
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {user.full_name || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          openEdit(user);
                          setShowForm(false);
                        }}
                        className="text-indigo-400 hover:text-indigo-600 transition"
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="text-red-400 hover:text-red-600 transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete System User"
        message={`This will permanently remove "${deleteTarget?.full_name || deleteTarget?.email}" from the system. They will no longer be able to log in.`}
        confirmText="Yes, Delete User"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard Tab (original content)
// ─────────────────────────────────────────────
function DashboardTab({}) {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAttended: 0,
    proxyCount: 0,
    attendanceRate: 0,
    genderCounts: {},
    branchCounts: {},
    branchGenderBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showClearAttendanceModal, setShowClearAttendanceModal] =
    useState(false);
  const [showClearMembersModal, setShowClearMembersModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);

  // Pagination
  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const loadingRef = useRef(false);

  async function loadData() {
    if (loadingRef.current) return; // prevent concurrent calls
    loadingRef.current = true;
    setRefreshing(true);
    try {
      const [attendanceData, statsData, totalCount] = await Promise.all([
        getAttendance(),
        getAttendanceStats(),
        getAllMembersCount(),
      ]);

      setAttendance(attendanceData);
      setStats(statsData);
      setTotalMembers(totalCount);
      setLastUpdate(new Date());
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    loadData();

    const channel = subscribeToAttendance(() => {
      // Debounce realtime updates — wait 1s before reloading
      setTimeout(() => loadData(), 1000);
    });

    return () => {
      unsubscribeFromAttendance(channel);
    };
  }, []);

  async function handleClearAttendance() {
    setLoading(true);
    try {
      const result = await clearAllAttendance();
      if (!result.success) throw new Error(result.error);
      await loadData();
    } catch (err) {
      alert("Failed to clear attendance: " + err.message);
    } finally {
      setLoading(false);
      setShowClearAttendanceModal(false);
    }
  }

  async function handleClearMembers() {
    setLoading(true);
    try {
      // Must clear attendance first due to foreign key constraint
      const attendanceResult = await clearAllAttendance();
      if (!attendanceResult.success) throw new Error(attendanceResult.error);

      const membersResult = await clearAllMembers();
      if (!membersResult.success) throw new Error(membersResult.error);

      await loadData();
    } catch (err) {
      alert("Failed to clear members: " + err.message);
    } finally {
      setLoading(false);
      setShowClearMembersModal(false);
    }
  }

  function downloadCSV() {
    if (attendance.length === 0) {
      alert("No attendance data to export");
      return;
    }

    const headers = [
      "Time",
      "Name",
      "Customer ID",
      "Phone",
      "Branch",
      "Gender",
      "Proxy",
      "Proxy Name",
    ];

    const rows = attendance.map((a) => [
      new Date(a.attended_at).toLocaleString(),
      a.name,
      a.custid,
      a.phone,
      a.branch,
      a.gender,
      a.proxy ? "Yes" : "No",
      a.proxy_name || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(attendance.length / PAGE_SIZE);
  const paginatedAttendance = attendance.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-9 h-9 bg-indigo-600 text-white p-2 rounded-full" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 text-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <Users className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-0.5">{totalMembers}</div>
          <div className="text-blue-100 text-sm">Total Registered</div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <UserCheck className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-0.5">
            {stats.totalAttended.toLocaleString()}
          </div>
          <div className="text-green-100 text-sm">Total Attended</div>
        </div>
        <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <Percent className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-0.5">
            {stats.attendanceRate}%
          </div>
          <div className="text-indigo-100 text-sm">Attendance Rate</div>
        </div>
        <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <Activity className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-0.5">{stats.proxyCount}</div>
          <div className="text-amber-100 text-sm">Proxies</div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Gender Breakdown
          </h3>
          {Object.entries(stats.genderCounts).length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.genderCounts).map(([gender, count]) => {
                const pct =
                  stats.totalAttended > 0
                    ? ((count / stats.totalAttended) * 100).toFixed(1)
                    : 0;
                return (
                  <div key={gender}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-700 text-sm">
                        {gender}
                      </span>
                      <span className="text-xs text-gray-600">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Branch Breakdown
          </h3>
          {Object.entries(stats.branchCounts).length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.branchCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([branch, count]) => {
                  const pct =
                    stats.totalAttended > 0
                      ? ((count / stats.totalAttended) * 100).toFixed(1)
                      : 0;
                  return (
                    <div key={branch}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-700 text-sm">
                          {branch}
                        </span>
                        <span className="text-xs text-gray-600">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Branch-Gender Breakdown */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Branch-Based Gender Breakdown
        </h3>
        <BranchGenderChart
          branchGenderBreakdown={stats.branchGenderBreakdown}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload Members
        </button>

        <button
          onClick={downloadCSV}
          disabled={attendance.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV ({attendance.length})
        </button>

        <button
          onClick={() => setShowClearAttendanceModal(true)}
          disabled={attendance.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Attendance
        </button>

        <button
          onClick={() => setShowClearMembersModal(true)}
          disabled={totalMembers === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Database className="w-4 h-4" />
          Clear Members DB ({totalMembers})
        </button>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            Recent Attendees ({attendance.length})
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No attendees yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Records will appear here in real-time
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Customer ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Branch
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Gender
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Proxy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAttendance.map((record, index) => {
                    const globalIndex =
                      (currentPage - 1) * PAGE_SIZE + index + 1;
                    return (
                      <tr
                        key={record.id || index}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition"
                      >
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {globalIndex}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-800">
                            {formatTime(record.attended_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(record.attended_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {record.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                          {record.custid}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {record.phone}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {record.branch}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.gender === "Male"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {record.gender}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {record.proxy ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              {record.proxy_name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, attendance.length)} of{" "}
                  {attendance.length} records
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page number pills */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-400 text-sm"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 text-xs rounded font-medium transition ${
                            currentPage === item
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showClearAttendanceModal}
        title="Clear All Attendance"
        message="This will permanently delete all attendance records. This action cannot be undone."
        confirmText="Yes, Clear Attendance"
        loading={loading}
        onCancel={() => setShowClearAttendanceModal(false)}
        onConfirm={handleClearAttendance}
      />

      <ConfirmModal
        open={showClearMembersModal}
        title="Clear Members Database"
        message={`This will permanently delete all ${totalMembers} member records AND all attendance records linked to them. This action cannot be undone.`}
        confirmText="Yes, Clear Members"
        loading={loading}
        onCancel={() => setShowClearMembersModal(false)}
        onConfirm={handleClearMembers}
      />

      {showUploadModal && (
        <MemberUpload
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main AdminPage (tab shell)
// ─────────────────────────────────────────────
export default function AdminPage({}) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "users", label: "System Users", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        {activeTab === "dashboard" && <DashboardTab key="dashboard" />}
        {activeTab === "users" && <SystemUsersTab key="users" />}
      </div>
    </div>
  );
}
