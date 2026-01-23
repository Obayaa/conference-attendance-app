import { useEffect, useState, useRef } from "react";
import { Search, UserCheck, X } from "lucide-react";

// Import Supabase functions
import {
  searchMembers,
  markAttendance,
  checkAttendance,
} from "../utils/supabase";

export default function AttendancePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);

  const [activeMember, setActiveMember] = useState(null);
  const [isProxy, setIsProxy] = useState(false);
  const [proxyName, setProxyName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [todayCount, setTodayCount] = useState(0);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Real-time search as user types
  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      return;
    }

    setSearching(true);
    const handler = setTimeout(async () => {
      const found = await searchMembers(q);
      setResults(found);
      setShowDropdown(true);
      setSelectedIndex(-1);
      setSearching(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelectMember(member) {
    // Check if already attended BEFORE showing confirmation
    const existing = await checkAttendance(member.custid);

    if (existing) {
      setMessage({
        text: `${member.name} has already been marked as attended at ${new Date(existing.attended_at).toLocaleString()}.`,
        type: "error",
      });
      setShowDropdown(false);
      setQuery("");
      setActiveMember(null);
      return;
    }

    // Show confirmation
    setActiveMember(member);
    setIsProxy(false);
    setProxyName("");
    setMessage({ text: "", type: "" });
    setShowDropdown(false);
    setQuery("");
  }

  async function confirmAttendance() {
    if (!activeMember) return;

    if (isProxy && !proxyName.trim()) {
      setMessage({
        text: "Please enter the proxy person's name",
        type: "error",
      });
      return;
    }

    const result = await markAttendance(activeMember, isProxy, proxyName);

    if (result.success) {
      setMessage({
        text: `✅ Attendance recorded successfully for ${activeMember.name}!`,
        type: "success",
      });
      setActiveMember(null);
      setIsProxy(false);
      setProxyName("");
      setTodayCount((prev) => prev + 1);

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } else if (result.duplicate) {
      setMessage({
        text: result.message,
        type: "error",
      });
      setActiveMember(null);
    } else {
      setMessage({
        text: "Failed to save attendance. Please try again.",
        type: "error",
      });
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectMember(results[selectedIndex]);
      } else if (results.length === 1) {
        handleSelectMember(results[0]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setMessage({ text: "", type: "" });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-md shadow-md p-6 md:p-8 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Mark Attendance</h2>
        </div>

        {/* Autocomplete Search Input */}
        <div className="mb-4 relative">
          <div className="relative" ref={inputRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search by Customer ID, Name, or Phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              className="w-full text-sm pl-12 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              autoComplete="off"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
              </div>
            )}
            {query && !searching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
            >
              {results.map((member, idx) => (
                <button
                  key={member.custid}
                  onClick={() => handleSelectMember(member)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 transition ${
                    selectedIndex === idx ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="font-semibold text-gray-800">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium text-indigo-600">
                      {member.custid}
                    </span>{" "}
                    • {member.phone} • {member.branch}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown && query && results.length === 0 && !searching && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500"
            >
              No members found starting with "{query}"
            </div>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Confirmation Panel */}
        {activeMember && (
          <div className="border-2 border-indigo-300 rounded-lg p-6 bg-indigo-50 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Confirm Attendance
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="font-bold text-lg text-gray-800">
                {activeMember.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">ID:</span> {activeMember.custid}{" "}
                • <span className="font-semibold">Phone:</span>{" "}
                {activeMember.phone}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Branch:</span>{" "}
                {activeMember.branch} •{" "}
                <span className="font-semibold">Gender:</span>{" "}
                {activeMember.gender}
              </div>
            </div>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isProxy}
                onChange={(e) => setIsProxy(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700 font-medium">
                Attending as a proxy
              </span>
            </label>

            {isProxy && (
              <div className="mb-4">
                <input
                  placeholder="Enter proxy person's full name"
                  value={proxyName}
                  onChange={(e) => setProxyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmAttendance}
                disabled={isProxy && !proxyName.trim()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Confirm Attendance
              </button>
              <button
                onClick={() => {
                  setActiveMember(null);
                  setIsProxy(false);
                  setProxyName("");
                }}
                className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {todayCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Marked in This Session
            </div>
          </div>
        </div>
      </div>

      {/* Quick Instructions
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Quick Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Start typing Customer ID, Name, or Phone number</li>
            <li>• Use ↑↓ arrow keys to navigate results, Enter to select</li>
            <li>• System prevents duplicate attendance automatically</li>
            <li>• All changes sync across devices in real-time</li>
          </ul>
        </div> */}
    </div>
  );
}
