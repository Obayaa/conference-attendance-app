// ============================================
// FILE: src/utils/supabase.js
// ============================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// MEMBERS FUNCTIONS
// ============================================

/**
 * Get all members from database
 */
export async function getAllMembers() {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

/**
 * Search members by query (starts with)
 */
export async function searchMembers(query) {
  try {
    const q = query.toLowerCase().trim();

    // Search across custid, name, and phone
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .or(`custid.ilike.${q}%,name.ilike.${q}%,phone.ilike.${q}%`)
      .order("custid", { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching members:", error);
    return [];
  }
}

/**
 * Bulk import members from CSV/Excel data
 */
export async function importMembers(membersArray) {
  try {
    const { data, error } = await supabase
      .from("members")
      .upsert(membersArray, {
        onConflict: "custid",
        ignoreDuplicates: false,
      });

    if (error) throw error;
    return { success: true, count: membersArray.length };
  } catch (error) {
    console.error("Error importing members:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

/**
 * Get all attendance records
 */
export async function getAttendance() {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("attended_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }
}

/**
 * Mark attendance for a member
 */
export async function markAttendance(member, isProxy = false, proxyName = "") {
  try {
    const record = {
      custid: member.custid,
      name: member.name,
      branch: member.branch,
      phone: member.phone,
      gender: member.gender,
      proxy: isProxy,
      proxy_name: proxyName,
    };

    const { data, error } = await supabase
      .from("attendance")
      .insert([record])
      .select()
      .single();

    if (error) {
      // Check if duplicate
      if (error.code === "23505") {
        return {
          success: false,
          duplicate: true,
          message: "Member already marked as attended",
        };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Check if member has already attended
 */
export async function checkAttendance(custid) {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("custid", custid)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data; // Returns null if not found
  } catch (error) {
    console.error("Error checking attendance:", error);
    return null;
  }
}

/**
 * Clear all attendance records
 */
export async function clearAllAttendance() {
  try {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing attendance:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get attendance statistics
 */
export async function getAttendanceStats() {
  try {
    const [attendanceResult, membersResult] = await Promise.all([
      supabase.from("attendance").select("*", { count: "exact", head: false }),
      supabase.from("members").select("*", { count: "exact", head: true }),
    ]);

    const attendance = attendanceResult.data || [];
    const totalMembers = membersResult.count || 0;
    const totalAttended = attendance.length;
    const proxyCount = attendance.filter((a) => a.proxy).length;

    // Overall gender breakdown
    const genderCounts = attendance.reduce((acc, a) => {
      const g = a.gender || "Unknown";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    // Overall branch breakdown
    const branchCounts = attendance.reduce((acc, a) => {
      const b = a.branch || "Unknown";
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {});

    // Branch-based gender breakdown
    const branchGenderBreakdown = attendance.reduce((acc, a) => {
      const branch = a.branch || "Unknown";
      const gender = a.gender || "Unknown";

      if (!acc[branch]) {
        acc[branch] = {};
      }
      acc[branch][gender] = (acc[branch][gender] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMembers,
      totalAttended,
      proxyCount,
      attendanceRate:
        totalMembers > 0
          ? ((totalAttended / totalMembers) * 100).toFixed(1)
          : 0,
      genderCounts,
      branchCounts,
      branchGenderBreakdown,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      totalMembers: 0,
      totalAttended: 0,
      proxyCount: 0,
      attendanceRate: 0,
      genderCounts: {},
      branchCounts: {},
      branchGenderBreakdown: {},
    };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to attendance changes in real-time
 */
export function subscribeToAttendance(callback) {
  const channel = supabase
    .channel("attendance-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      callback,
    )
    .subscribe();

  return channel; // Return to unsubscribe later
}

/**
 * Unsubscribe from real-time updates
 */
export async function unsubscribeFromAttendance(channel) {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}
