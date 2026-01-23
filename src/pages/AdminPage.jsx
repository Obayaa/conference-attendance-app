import {
  Users,
  UserCheck,
  TrendingUp,
  Download,
  Trash2,
  LogOut,
  RefreshCw,
  Activity,
  Clock,
  Percent,
} from "lucide-react";

// Import Supabase functions
import {
  getAttendance,
  clearAllAttendance,
  getAttendanceStats,
  subscribeToAttendance,
  unsubscribeFromAttendance,
} from "../utils/supabase";
import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminPage({ onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAttended: 0,
    proxyCount: 0,
    attendanceRate: 0,
    genderCounts: {},
    branchCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const channel = subscribeToAttendance((payload) => {
      console.log("Real-time update:", payload);
      loadData(); // Reload data when changes occur
    });

    return () => {
      unsubscribeFromAttendance(channel);
    };
  }, []);

  async function loadData() {
    setRefreshing(true);
    try {
      const [attendanceData, statsData] = await Promise.all([
        getAttendance(),
        getAttendanceStats(),
      ]);

      setAttendance(attendanceData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleClearAttendance() {
    setLoading(true);

    try {
      const result = await clearAllAttendance();
      if (!result.success) throw new Error(result.error);

      await loadData();
      setMessage({
        type: "success",
        text: "All attendance records cleared successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to clear attendance: " + err.message,
      });
    } finally {
      setLoading(false);
      setShowClearModal(false);
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
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <Users className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">
                {stats.totalMembers.toLocaleString()}
              </div>
              <div className="text-blue-100">Total Registered</div>
            </div>

            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <UserCheck className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">
                {stats.totalAttended.toLocaleString()}
              </div>
              <div className="text-green-100">Total Attended</div>
            </div>

            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <Percent className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">
                {stats.attendanceRate}%
              </div>
              <div className="text-purple-100">Attendance Rate</div>
            </div>

            <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
              <Activity className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">{stats.proxyCount}</div>
              <div className="text-amber-100">Proxies</div>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Gender Breakdown
              </h3>
              {Object.entries(stats.genderCounts).length === 0 ? (
                <p className="text-gray-500">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.genderCounts).map(([gender, count]) => {
                    const percentage =
                      stats.totalAttended > 0
                        ? ((count / stats.totalAttended) * 100).toFixed(1)
                        : 0;
                    return (
                      <div key={gender}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700">
                            {gender}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Branch Breakdown
              </h3>
              {Object.entries(stats.branchCounts).length === 0 ? (
                <p className="text-gray-500">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.branchCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([branch, count]) => {
                      const percentage =
                        stats.totalAttended > 0
                          ? ((count / stats.totalAttended) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={branch}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-700">
                              {branch}
                            </span>
                            <span className="text-sm text-gray-600">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              disabled={attendance.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export CSV ({attendance.length} records)
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              disabled={attendance.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Attendance
            </button>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Recent Attendees ({attendance.length})
          </h3>
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No attendees yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Attendance records will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Customer ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Branch
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Gender
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Proxy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr
                      key={record.id || index}
                      className="border-b border-gray-100 hover:bg-purple-50 transition"
                    >
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
                      <td className="py-3 px-4 text-gray-600">
                        {record.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
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
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            {record.proxy_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={showClearModal}
        title="Clear All Attendance"
        message="This will permanently delete all attendance records. This action cannot be undone."
        confirmText="Yes, Clear All"
        loading={loading}
        onCancel={() => setShowClearModal(false)}
        onConfirm={handleClearAttendance}
      />
    </div>
  );
}
