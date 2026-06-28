import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export const getMyPosts = async (page = 1) =>
  httpClient.get(API.MY_POST, { headers: authHeader(), params: { page, size: 10 } });

export const getFeed = async (page = 1) =>
  httpClient.get(API.FEED, { headers: authHeader(), params: { page, size: 10 } });

export const createPost = async (content) =>
  httpClient.post(API.CREATE_POST, { content }, { headers: { ...authHeader(), "Content-Type": "application/json" } });

export const updatePost = async (postId, content) =>
  httpClient.put(`${API.UPDATE_POST}/${postId}`, { content }, { headers: { ...authHeader(), "Content-Type": "application/json" } });

export const deletePost = async (postId) =>
  httpClient.delete(`${API.DELETE_POST}/${postId}`, { headers: authHeader() });

export const likePost = async (postId) =>
  httpClient.post(`${API.LIKE_POST}/${postId}/like`, {}, { headers: authHeader() });

export const addComment = async (postId, content) =>
  httpClient.post(`${API.COMMENT_POST}/${postId}/comments`, { content }, { headers: { ...authHeader(), "Content-Type": "application/json" } });

export const deleteComment = async (postId, commentId) =>
  httpClient.delete(`${API.COMMENT_POST}/${postId}/comments/${commentId}`, { headers: authHeader() });

export const getPostById = async (postId) =>
  httpClient.get(`/post/${postId}`, { headers: authHeader() });

export const updateComment = async (postId, commentId, content) =>
  httpClient.put(`/post/${postId}/comments/${commentId}`, { content }, { headers: { ...authHeader(), "Content-Type": "application/json" } });
