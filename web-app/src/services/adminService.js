import httpClient from "../configurations/httpClient";
import { getToken } from "./localStorageService";

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Users ──────────────────────────────────────────────
export const getAllUsers = () =>
  httpClient.get("/identity/users", { headers: authHeader() });

export const updateUserStatus = (userId, status) =>
  httpClient.put(`/identity/users/${userId}/status`, { status }, { headers: authHeader() });

// ── Posts ──────────────────────────────────────────────
export const getAllPosts = (page = 1, size = 20) =>
  httpClient.get("/post/admin/posts", { headers: authHeader(), params: { page, size } });

export const deletePostAdmin = (postId) =>
  httpClient.delete(`/post/admin/posts/${postId}`, { headers: authHeader() });

// ── Reports ────────────────────────────────────────────
export const getAllReports = () =>
  httpClient.get("/post/admin/reports", { headers: authHeader() });

export const updateReportStatus = (reportId, status) =>
  httpClient.put(`/post/admin/reports/${reportId}/status`, { status }, { headers: authHeader() });

// ── Dashboard / Analytics ──────────────────────────────
export const getDashboardStats = () =>
  httpClient.get("/identity/admin/stats", { headers: authHeader() });

export const getAnalytics = (range = "7") =>
  httpClient.get("/identity/admin/analytics", { headers: authHeader(), params: { range } });
