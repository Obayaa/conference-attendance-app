// ============================================
// FILE: src/components/AddNewMember.jsx
// ============================================

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { addMember, markAttendance, checkAttendance } from "../utils/supabase";

const BRANCHES = [
  "Agona Ahanta",
  "Assin Foso",
  "Manso Amenfi",
  "Wassa Simpa",
  "Nzema Aiyinase",
];

const EMPTY_FORM = {
  custid: "",
  name: "",
  phone: "",
  branch: "",
  gender: "Male",
};

export default function AddNewMember({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit() {
    // Validation
    if (!form.custid.trim()) return setError("Customer ID is required.");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");
    if (form.phone.length !== 10)
      return setError("Phone number must be 10 digits.");
    if (!form.branch) return setError("Please select a branch.");

    setSubmitting(true);
    setError("");

    // Check if custid already exists in attendance
    const alreadyAttended = await checkAttendance(form.custid.trim());
    if (alreadyAttended) {
      setError("This Customer ID has already been marked as attended.");
      setSubmitting(false);
      return;
    }

    // Add to members table
    const memberResult = await addMember({
      custid: form.custid.trim().toUpperCase(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      branch: form.branch,
      gender: form.gender,
    });

    if (!memberResult.success) {
      // Check if it's a duplicate custid in members
      if (
        memberResult.message?.includes("duplicate") ||
        memberResult.message?.includes("unique")
      ) {
        setError("A member with this Customer ID already exists.");
      } else {
        setError("Failed to add member: " + memberResult.message);
      }
      setSubmitting(false);
      return;
    }

    // Auto-mark attendance
    const attendanceResult = await markAttendance(memberResult.data);

    if (!attendanceResult.success) {
      setError(
        "Member added but attendance marking failed. Please mark manually.",
      );
      setSubmitting(false);
      return;
    }

    // All good — reset and close
    setForm(EMPTY_FORM);
    setSubmitting(false);
    onSuccess(memberResult.data.name);
    onClose();
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setError("");
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-950">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Add New Member</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-sm text-gray-500 mb-6">
            Member will be added to the system and attendance marked
            automatically.
          </p>

          <div className="space-y-4">
            {/* Customer ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                name="custid"
                value={form.custid}
                onChange={handleChange}
                placeholder="e.g. MB001"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Kofi Mensah"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0XXXXXXXXX"
                maxLength={10}
                type="tel"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                {["Male", "Female"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-950 text-white rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-60 text-sm"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {submitting ? "Adding..." : "Add & Mark Attendance"}
          </button>
        </div>
      </div>
    </>
  );
}
