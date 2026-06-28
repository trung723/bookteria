import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export const getMyInfo = async () =>
  httpClient.get(API.MY_INFO, { headers: authHeader() });

export const updateProfile = async (profileData) =>
  httpClient.put(API.UPDATE_PROFILE, profileData, { headers: { ...authHeader(), "Content-Type": "application/json" } });

export const uploadAvatar = async (formData) =>
  httpClient.put(API.UPDATE_AVATAR, formData, { headers: authHeader() });

export const search = async (keyword) =>
  httpClient.post(API.SEARCH_USER, { keyword }, { headers: { ...authHeader(), "Content-Type": "application/json" } });

export const followUser = async (userId) =>
  httpClient.post(`${API.FOLLOW_USER}/${userId}/follow`, {}, { headers: authHeader() });

export const unfollowUser = async (userId) =>
  httpClient.delete(`${API.FOLLOW_USER}/${userId}/follow`, { headers: authHeader() });

export const getFollowing = async (userId) =>
  httpClient.get(`${API.GET_FOLLOWING}/${userId}/following`, { headers: authHeader() });

export const getFollowers = async (userId) =>
  httpClient.get(`${API.GET_FOLLOWERS}/${userId}/followers`, { headers: authHeader() });
