import httpClient from "../configurations/httpClient";
import { getToken } from "./localStorageService";

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const BASE = "/notification/notifications";

export const getMyNotifications = () =>
  httpClient.get(`${BASE}/my`, { headers: authHeader() });

export const getUnreadCount = () =>
  httpClient.get(`${BASE}/unread-count`, { headers: authHeader() });

export const markAllRead = () =>
  httpClient.put(`${BASE}/mark-all-read`, {}, { headers: authHeader() });

export const markRead = (id) =>
  httpClient.put(`${BASE}/${id}/read`, {}, { headers: authHeader() });
