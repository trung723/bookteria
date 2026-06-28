import axios from "axios";
import { CONFIG } from "./configuration";
import { getToken, removeToken } from "../services/localStorageService";

const httpClient = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: tự động gắn Bearer token ───────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý 401 toàn cục ────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ → clear & redirect về login
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpClient;