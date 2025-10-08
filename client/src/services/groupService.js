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