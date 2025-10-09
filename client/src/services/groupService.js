import { groupAPI } from "./api";

const requireToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in again.");
  return token;
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined));

export const createGroup = async (groupData) => {
  const token = requireToken();
  const res = await groupAPI.post("", groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.group;
};

export const updateGroup = async (groupId, updates) => {
  if (!groupId) throw new Error("Missing group id");
  const token = requireToken();

  const clean = stripUndefined(updates);
  console.log("[updateGroup] id:", groupId, "updates:", clean);

  const res = await groupAPI.put(`/${groupId}`, clean, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.group || res.data;
};

export const deleteGroup = async (groupId) => {
  if (!groupId) throw new Error("Missing group id");
  const token = requireToken();

  const res = await groupAPI.delete(`/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserGroupsAPI = async (userId) => {
  if (!userId) throw new Error("Missing user ID");

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await groupAPI.get(`/user/${userId}/groups`, { headers });

  return res.data.groups || res.data || [];
};

// ====== Group Membership Management ======

export const joinGroup = async (groupId) => {
  const token = requireToken();
  const res = await groupAPI.post(`/${groupId}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const requestToJoinGroup = async (groupId) => {
  const token = requireToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Prefer the path that worked for you first.
  const attempts = [
    `/${groupId}/request-join`,     // backend route name
    `/${groupId}/request`,          // earlier success path
    `/${groupId}/join-requests`,    // collection create
    `/${groupId}/join-request`,
    `/${groupId}/requests`,
  ];

  let firstErr;
  for (const p of attempts) {
    try {
      const res = await groupAPI.post(p, {}, { headers });
      return res.data;
    } catch (e) {
      const status = e?.response?.status;
      if (status && status !== 404) throw e;
      if (!firstErr) firstErr = e;
    }
  }
  throw firstErr || new Error("Failed to send join request");
};

export const withdrawJoinRequest = async (groupId) => {
  const token = requireToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Prefer leave endpoint, then explicit "me", collection delete, and legacy paths
  const attempts = [
    `/${groupId}/leave`,
    `/${groupId}/join-requests/me`,
    `/${groupId}/join-requests`,
    `/${groupId}/request`,
    `/${groupId}/join-request`,
  ];

  let firstErr;
  for (const p of attempts) {
    try {
      const res = await groupAPI.delete(p, { headers });
      return res.data;
    } catch (e) {
      if (!firstErr) firstErr = e;
    }
  }
  throw firstErr || new Error("Failed to withdraw join request");
};


export const leaveGroup = async (groupId) => {
  const token = requireToken();
  const res = await groupAPI.delete(`/${groupId}/leave`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const removeMember = async (groupId, userId) => {
  const token = requireToken();
  const res = await groupAPI.delete(`/${groupId}/members/${userId}/remove`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const approveJoinRequest = async (groupId, userId) => {
  const token = requireToken();
  const res = await groupAPI.put(`/${groupId}/join-requests/${userId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMemberRole = async (groupId, userId, newRole) => {
  const token = requireToken();
  const res = await groupAPI.put(
    `/${groupId}/members/${userId}/role`,
    { role: newRole },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getPendingRequests = async (groupId) => {
  const token = requireToken();
  const headers = { Authorization: `Bearer ${token}` };
  const res = await groupAPI.get(`/${groupId}/pending-requests`, { headers });
  // Support shapes: {requests:[...]}, {data:[...]}, [...]
  const data = res.data?.requests ?? res.data?.data ?? res.data ?? [];
  return Array.isArray(data) ? data : [];
};

export const declineJoinRequest = async (groupId, userId) => {
  const token = requireToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Likely complement to /join-requests/:userId/approve
  const attempts = [
    { method: "put", path: `/${groupId}/join-requests/${userId}/decline` },
    { method: "post", path: `/${groupId}/join-requests/${userId}/decline` },
    { method: "delete", path: `/${groupId}/join-requests/${userId}` }, // delete request
  ];

  let firstError;
  for (const a of attempts) {
    try {
      const res =
        a.method === "put"
          ? await groupAPI.put(a.path, {}, { headers })
          : a.method === "post"
          ? await groupAPI.post(a.path, {}, { headers })
          : await groupAPI.delete(a.path, { headers });
      return res.data;
    } catch (e) {
      if (!firstError) firstError = e;
    }
  }
  throw firstError || new Error("Failed to decline join request");
};

// Try to delete group, but first clear pending requests if needed
export const deleteGroupSafe = async (groupId) => {
  const token = requireToken();
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const res = await groupAPI.delete(`/${groupId}`, { headers });
    return res.data;
  } catch (e) {
    // If server blocks due to pending requests (409/400-ish), clear them and retry
    const status = e?.response?.status;
    if (status === 409 || status === 400 || status === 422) {
      try {
        const pending = await getPendingRequests(groupId);
        for (const req of pending) {
          const uid = req.user_id ?? req.userId ?? req.id;
          if (uid) {
            await declineJoinRequest(groupId, uid);
          }
        }
        const res2 = await groupAPI.delete(`/${groupId}`, { headers });
        return res2.data;
      } catch (inner) {
        throw inner;
      }
    }
    throw e;
  }
};



/*
// src/services/groupService.js
import { groupAPI } from "./api";

const requireToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in again.");
  return token;
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined));

export const createGroup = async (groupData) => {
  const token = requireToken();
  const res = await groupAPI.post("", groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.group;
};

export const updateGroup = async (groupId, updates) => {
  if (!groupId) throw new Error("Missing group id");
  const token = requireToken();

  const clean = stripUndefined(updates);
  // debug payload to verify what backend receives
  console.log("[updateGroup] id:", groupId, "updates:", clean);

  const res = await groupAPI.put(`/${groupId}`, clean, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.group || res.data;
};

export const deleteGroup = async (groupId) => {
  if (!groupId) throw new Error("Missing group id");
  const token = requireToken();

  const res = await groupAPI.delete(`/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
*/
