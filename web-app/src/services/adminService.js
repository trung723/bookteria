import httpClient from "../configurations/httpClient";
// Không cần authHeader() nữa — httpClient interceptor tự gắn token

// ── Identity: Users ──────────────────────────────────────────────────────────
export const getAllUsers = () =>
  httpClient.get("/identity/users");

export const getUserById = (userId) =>
  httpClient.get(`/identity/users/${userId}`);

export const updateUser = (userId, data) =>
  httpClient.put(`/identity/users/${userId}`, data);

export const deleteUser = (userId) =>
  httpClient.delete(`/identity/users/${userId}`);

// ── Profile: UserProfiles ────────────────────────────────────────────────────
export const getAllProfiles = () =>
  httpClient.get("/profile/users");

export const getProfileByUserId = (userId) =>
  httpClient.get(`/profile/users/by-userid/${userId}`);

// ── Posts ────────────────────────────────────────────────────────────────────
// BE không có /post/admin/posts → dùng /post/feed
export const getAllPosts = (page = 1, size = 20) =>
  httpClient.get("/post/feed", { params: { page, size } });

export const deletePostAdmin = (postId) =>
  httpClient.delete(`/post/${postId}`);

// ── Roles ────────────────────────────────────────────────────────────────────
export const getAllRoles = () =>
  httpClient.get("/identity/roles");

// ── Dashboard: tổng hợp từ các API thực ─────────────────────────────────────
export const getDashboardData = async () => {
  const [usersRes, profilesRes, postsRes] = await Promise.allSettled([
    getAllUsers(),
    getAllProfiles(),
    getAllPosts(1, 50),
  ]);

  const users     = usersRes.status    === "fulfilled" ? (usersRes.value.data?.result    ?? []) : [];
  const profiles  = profilesRes.status === "fulfilled" ? (profilesRes.value.data?.result ?? []) : [];
  const postsPage = postsRes.status    === "fulfilled" ? (postsRes.value.data?.result    ?? {}) : {};

  return { users, profiles, posts: postsPage.data ?? [], totalPosts: postsPage.totalElements ?? 0 };
};