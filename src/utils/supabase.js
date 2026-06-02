// // ============================================
// // FILE: src/utils/supabase.js
// // ============================================

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);

// // ============================================
// // AUTH & PROFILE FUNCTIONS
// // ============================================

// /**
//  * Get the current logged-in user's profile (includes role)
//  */
// export async function getCurrentUserProfile() {
//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     if (!session) return null;

//     const user = session.user;
//     const metaRole = user.user_metadata?.role;
//     const metaName = user.user_metadata?.full_name;

//     if (metaRole) {
//       return {
//         id: user.id,
//         email: user.email,
//         full_name: metaName || null,
//         role: metaRole,
//       };
//     }

//     // Only hits DB if metadata has no role
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return null;
//   }
// }

// /**
//  * Sign in with email and password
//  */
// export async function signIn(email, password) {
//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) throw error;

//     const profile = await getCurrentUserProfile();
//     return { success: true, user: data.user, profile };
//   } catch (error) {
//     console.error("Sign in error:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Sign out the current user
//  */
// export async function signOut() {
//   await supabase.auth.signOut();
// }

// // ============================================
// // SYSTEM USER MANAGEMENT (Admin only)
// // ============================================

// /**
//  * Get all system users from profiles table
//  */
// export async function getSystemUsers() {
//   try {
//     const { data, error } = await supabase.rpc("get_all_profiles");

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error("Error fetching system users:", error);
//     return [];
//   }
// }

// /**
//  * Create a new system user.
//  * Requires a Supabase Edge Function named "create-user" (uses service role key server-side).
//  * See SETUP.md for instructions.
//  */
// export async function createSystemUser({ email, password, full_name, role }) {
//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     console.log("Session:", session);
//     console.log("Token:", session?.access_token);

//     const response = await fetch(
//       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: session?.access_token
//             ? `Bearer ${session.access_token}`
//             : "",
//           apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
//         },
//         body: JSON.stringify({ email, password, full_name, role }),
//       },
//     );

//     if (!response.ok) {
//       const text = await response.text();
//       throw new Error(text || "Request failed");
//     }

//     const data = await response.json();
//     if (data.error) throw new Error(data.error);
//     return { success: true, user: data.user };
//   } catch (error) {
//     console.error("Error creating system user:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Update a system user's profile (full_name and role).
//  * Requires a Supabase Edge Function named "update-user".
//  */
// export async function updateSystemUser({
//   userId,
//   email,
//   full_name,
//   role,
//   password,
// }) {
//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     const body = { userId };
//     if (email) body.email = email;
//     if (full_name) body.full_name = full_name;
//     if (role) body.role = role;
//     if (password) body.password = password;

//     const response = await fetch(
//       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.access_token}`,
//           apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
//         },
//         body: JSON.stringify(body),
//       },
//     );

//     const data = await response.json();
//     if (data.error) throw new Error(data.error);
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating system user:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Delete a system user (removes from auth + profiles).
//  * Requires a Supabase Edge Function named "delete-user".
//  */
// export async function deleteSystemUser(userId) {
//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     const response = await fetch(
//       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.access_token}`,
//           apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
//         },
//         body: JSON.stringify({ userId }),
//       },
//     );

//     if (!response.ok) {
//       const text = await response.text();
//       throw new Error(text || "Request failed");
//     }

//     const data = await response.json();
//     if (data.error) throw new Error(data.error);
//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting system user:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Get all members from database
//  */
// export async function getAllMembers() {
//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .select("*")
//       .order("name", { ascending: true })
//       .range(0, 9999); // limit to 10k for safety

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error("Error fetching members:", error);
//     return [];
//   }
// }

// /**
//  * Search members by query (starts with)
//  */
// export async function searchMembers(query) {
//   try {
//     const q = query.toLowerCase().trim();

//     const { data, error } = await supabase
//       .from("members")
//       .select("*")
//       .or(`custid.ilike.${q}%,name.ilike.${q}%,phone.ilike.${q}%`)
//       .order("custid", { ascending: true })
//       .limit(20);

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error("Error searching members:", error);
//     return [];
//   }
// }

// /**
//  * Bulk import members from CSV/Excel data
//  */
// export async function importMembers(membersArray) {
//   try {
//     // Deduplicate within the file
//     const seen = new Map();
//     for (const member of membersArray) {
//       seen.set(member.custid, member);
//     }
//     const deduplicated = Array.from(seen.values());

//     const BATCH_SIZE = 500;

//     // Batch the existence check too — avoids URL too long error
//     const existingSet = new Set();
//     const custids = deduplicated.map((m) => m.custid);

//     for (let i = 0; i < custids.length; i += BATCH_SIZE) {
//       const batch = custids.slice(i, i + BATCH_SIZE);
//       const { data, error } = await supabase
//         .from("members")
//         .select("custid")
//         .in("custid", batch);

//       if (error) throw error;
//       (data || []).forEach((r) => existingSet.add(r.custid));
//     }

//     const newMembers = deduplicated.filter((m) => !existingSet.has(m.custid));
//     const updatedMembers = deduplicated.filter((m) =>
//       existingSet.has(m.custid),
//     );

//     // Batch upsert
//     // Batch upsert — 500 rows at a time, retry failures one by one
//     const failedRows = [];

//     for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
//       const batch = deduplicated.slice(i, i + BATCH_SIZE);
//       const { error } = await supabase
//         .from("members")
//         .upsert(batch, { onConflict: "custid" });

//       if (error) {
//         // Retry one by one to isolate which rows actually failed
//         for (const row of batch) {
//           const { error: rowError } = await supabase
//             .from("members")
//             .upsert([row], { onConflict: "custid" });

//           if (rowError) {
//             failedRows.push({ ...row, error: rowError.message });
//           }
//         }
//       }
//     }

//     const failedCustids = new Set(failedRows.map((r) => r.custid));

//     return {
//       success: true,
//       total: deduplicated.length,
//       newCount: newMembers.filter((m) => !failedCustids.has(m.custid)).length,
//       updatedCount: updatedMembers.filter((m) => !failedCustids.has(m.custid))
//         .length,
//       failedCount: failedRows.length,
//       failedRows,
//     };
//   } catch (error) {
//     console.error("Error importing members:", error);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Add a single member
//  */
// export async function addMember(member) {
//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .insert([member])
//       .select()
//       .single();

//     if (error) throw error;
//     return { success: true, data };
//   } catch (error) {
//     console.error("Error adding member:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Clear all members from the database
//  */
// export async function clearAllMembers() {
//   try {
//     const { error } = await supabase
//       .from("members")
//       .delete()
//       .gte("created_at", "1970-01-01"); // matches all rows

//     if (error) throw error;
//     return { success: true };
//   } catch (error) {
//     console.error("Error clearing members:", error);
//     return { success: false, error: error.message };
//   }
// }

// // ============================================
// // ATTENDANCE FUNCTIONS
// // ============================================

// /**
//  * Get all attendance records
//  */
// export async function getAttendance() {
//   try {
//     const { data, error } = await supabase
//       .from("attendance")
//       .select("*")
//       .order("attended_at", { ascending: false });

//     if (error) throw error;
//     return data || [];
//   } catch (error) {
//     console.error("Error fetching attendance:", error);
//     return [];
//   }
// }

// /**
//  * Mark attendance for a member
//  */
// export async function markAttendance(member, isProxy = false, proxyName = "") {
//   try {
//     const record = {
//       custid: member.custid,
//       name: member.name,
//       branch: member.branch,
//       phone: member.phone,
//       gender: member.gender,
//       proxy: isProxy,
//       proxy_name: proxyName,
//     };

//     const { data, error } = await supabase
//       .from("attendance")
//       .insert([record])
//       .select()
//       .single();

//     if (error) {
//       if (error.code === "23505") {
//         return {
//           success: false,
//           duplicate: true,
//           message: "Member already marked as attended",
//         };
//       }
//       throw error;
//     }

//     return { success: true, data };
//   } catch (error) {
//     console.error("Error marking attendance:", error);
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Check if member has already attended
//  */
// export async function checkAttendance(custid) {
//   try {
//     const { data, error } = await supabase
//       .from("attendance")
//       .select("*")
//       .eq("custid", custid)
//       .maybeSingle();

//     if (error && error.code !== "PGRST116") throw error;
//     return data;
//   } catch (error) {
//     console.error("Error checking attendance:", error);
//     return null;
//   }
// }

// /**
//  * Clear all attendance records
//  */
// export async function clearAllAttendance() {
//   try {
//     const { error } = await supabase
//       .from("attendance")
//       .delete()
//       .neq("id", "00000000-0000-0000-0000-000000000000");

//     if (error) throw error;
//     return { success: true };
//   } catch (error) {
//     console.error("Error clearing attendance:", error);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Get attendance statistics
//  */
// export async function getAttendanceStats() {
//   try {
//     const [attendanceResult, { count: totalMembers }] = await Promise.all([
//       supabase.from("attendance").select("*", { count: "exact", head: false }),
//       supabase.from("members").select("*", { count: "exact", head: true }),
//     ]);

//     const attendance = attendanceResult.data || [];
//     // const totalMembers = membersResult.count || 0;
//     const totalAttended = attendance.length;
//     const proxyCount = attendance.filter((a) => a.proxy).length;

//     const genderCounts = attendance.reduce((acc, a) => {
//       const g = a.gender || "Unknown";
//       acc[g] = (acc[g] || 0) + 1;
//       return acc;
//     }, {});

//     const branchCounts = attendance.reduce((acc, a) => {
//       const b = a.branch || "Unknown";
//       acc[b] = (acc[b] || 0) + 1;
//       return acc;
//     }, {});

//     const branchGenderBreakdown = attendance.reduce((acc, a) => {
//       const branch = a.branch || "Unknown";
//       const gender = a.gender || "Unknown";
//       if (!acc[branch]) acc[branch] = {};
//       acc[branch][gender] = (acc[branch][gender] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       totalMembers,
//       totalAttended,
//       proxyCount,
//       attendanceRate:
//         totalMembers > 0
//           ? ((totalAttended / totalMembers) * 100).toFixed(1)
//           : 0,
//       genderCounts,
//       branchCounts,
//       branchGenderBreakdown,
//     };
//   } catch (error) {
//     console.error("Error getting stats:", error);
//     return {
//       totalMembers: 0,
//       totalAttended: 0,
//       proxyCount: 0,
//       attendanceRate: 0,
//       genderCounts: {},
//       branchCounts: {},
//       branchGenderBreakdown: {},
//     };
//   }
// }

// // ============================================
// // REAL-TIME SUBSCRIPTIONS
// // ============================================

// export function subscribeToAttendance(callback) {
//   const channel = supabase
//     .channel("attendance-changes")
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "attendance" },
//       callback,
//     )
//     .subscribe();

//   return channel;
// }

// export async function unsubscribeFromAttendance(channel) {
//   if (channel) {
//     await supabase.removeChannel(channel);
//   }
// }

// ============================================
// FILE: src/utils/supabase.js
// ============================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// AUTH & PROFILE FUNCTIONS
// ============================================

export async function getCurrentUserProfile() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const user = session.user;
    const metaRole = user.user_metadata?.role;
    const metaName = user.user_metadata?.full_name;

    if (metaRole) {
      return {
        id: user.id,
        email: user.email,
        full_name: metaName || null,
        role: metaRole,
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const profile = await getCurrentUserProfile();
    return { success: true, user: data.user, profile };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, message: error.message };
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ============================================
// SYSTEM USER MANAGEMENT (Admin only)
// ============================================

export async function getSystemUsers() {
  try {
    const { data, error } = await supabase.rpc("get_all_profiles");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching system users:", error);
    return [];
  }
}

export async function createSystemUser({ email, password, full_name, role }) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : "",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        },
        body: JSON.stringify({ email, password, full_name, role }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error creating system user:", error);
    return { success: false, message: error.message };
  }
}

export async function updateSystemUser({
  userId,
  email,
  full_name,
  role,
  password,
}) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const body = { userId };
    if (email) body.email = email;
    if (full_name) body.full_name = full_name;
    if (role) body.role = role;
    if (password) body.password = password;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return { success: true };
  } catch (error) {
    console.error("Error updating system user:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteSystemUser(userId) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        },
        body: JSON.stringify({ userId }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return { success: true };
  } catch (error) {
    console.error("Error deleting system user:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// MEMBER FUNCTIONS
// ============================================

export async function getAllMembers() {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true })
      .range(0, 99999); // limit to 100k for safety

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

export async function searchMembers(query) {
  try {
    const q = query.toLowerCase().trim();

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

export async function importMembers(membersArray) {
  try {
    const BATCH_SIZE = 500;

    // Step 1: Deduplicate within the file
    const seen = new Map();
    for (const member of membersArray) {
      seen.set(member.custid, member);
    }
    const deduplicated = Array.from(seen.values());
    const custids = deduplicated.map((m) => m.custid);
    const duplicateCount = membersArray.length - deduplicated.length;

    // Step 2: Batch fetch existing custids from DB (avoids URL too long error)
    const existingSet = new Set();
    for (let i = 0; i < custids.length; i += BATCH_SIZE) {
      const batch = custids.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from("members")
        .select("custid")
        .in("custid", batch);
      if (error) throw error;
      (data || []).forEach((r) => existingSet.add(r.custid));
    }

    // Step 3: Track which are new vs updates
    const newMembers = deduplicated.filter((m) => !existingSet.has(m.custid));
    const updatedMembers = deduplicated.filter((m) =>
      existingSet.has(m.custid),
    );

    // Step 4: Batch upsert, retry row-by-row if a batch fails
    const failedRows = [];
    for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
      const batch = deduplicated.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from("members")
        .upsert(batch, { onConflict: "custid" });

      if (error) {
        // Retry one by one to isolate which rows actually failed
        for (const row of batch) {
          const { error: rowError } = await supabase
            .from("members")
            .upsert([row], { onConflict: "custid" });
          if (rowError) {
            failedRows.push({ ...row, error: rowError.message });
          }
        }
      }
    }

    // Step 5: Post-upload verification — catches rows silently dropped by DB
    const verifySet = new Set();
    for (let i = 0; i < custids.length; i += BATCH_SIZE) {
      const batch = custids.slice(i, i + BATCH_SIZE);
      const { data } = await supabase
        .from("members")
        .select("custid")
        .in("custid", batch);
      (data || []).forEach((r) => verifySet.add(r.custid));
    }

    // Any row we tried to upsert that isn't in DB = silently failed
    deduplicated.forEach((row) => {
      const alreadyFailed = failedRows.find((f) => f.custid === row.custid);
      if (!verifySet.has(row.custid) && !alreadyFailed) {
        failedRows.push({
          ...row,
          error: "Silently rejected by database — check DB constraints",
        });
      }
    });

    const failedCustids = new Set(failedRows.map((r) => r.custid));

    return {
      success: true,
      total: membersArray.length,
      imported: deduplicated.length,
      newCount: newMembers.filter((m) => !failedCustids.has(m.custid)).length,
      updatedCount: updatedMembers.filter((m) => !failedCustids.has(m.custid))
        .length,
      failedCount: failedRows.length,
      failedRows,
      duplicateCount,
    };
  } catch (error) {
    console.error("Error importing members:", error);
    return { success: false, error: error.message };
  }
}

export async function addMember(member) {
  try {
    const { data, error } = await supabase
      .from("members")
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, message: error.message };
  }
}

export async function clearAllMembers() {
  try {
    const { error } = await supabase
      .from("members")
      .delete()
      .gte("created_at", "1970-01-01");

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing members:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

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

export async function checkAttendance(custid) {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("custid", custid)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (error) {
    console.error("Error checking attendance:", error);
    return null;
  }
}

export async function clearAllAttendance() {
  try {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing attendance:", error);
    return { success: false, error: error.message };
  }
}

export async function getAttendanceStats() {
  try {
    const [attendanceResult, { count: totalMembers }] = await Promise.all([
      supabase.from("attendance").select("*", { count: "exact", head: false }),
      supabase.from("members").select("*", { count: "exact", head: true }),
    ]);

    const attendance = attendanceResult.data || [];
    const totalAttended = attendance.length;
    const proxyCount = attendance.filter((a) => a.proxy).length;

    const genderCounts = attendance.reduce((acc, a) => {
      const g = a.gender || "Unknown";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    const branchCounts = attendance.reduce((acc, a) => {
      const b = a.branch || "Unknown";
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {});

    const branchGenderBreakdown = attendance.reduce((acc, a) => {
      const branch = a.branch || "Unknown";
      const gender = a.gender || "Unknown";
      if (!acc[branch]) acc[branch] = {};
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

export function subscribeToAttendance(callback) {
  const channel = supabase
    .channel("attendance-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      callback,
    )
    .subscribe();

  return channel;
}

export async function unsubscribeFromAttendance(channel) {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}
