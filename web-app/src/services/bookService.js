import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// ── CRUD sách ──────────────────────────────────────────────────────────────

export const createBook = async (bookData) => {
  const response = await httpClient.post(API.CREATE_BOOK, bookData);
  return response.data;
};

export const updateBook = async (bookId, bookData) => {
  const response = await httpClient.put(`${API.UPDATE_BOOK}/${bookId}`, bookData);
  return response.data;
};

export const deleteBook = async (bookId) => {
  const response = await httpClient.delete(`${API.DELETE_BOOK}/${bookId}`);
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await httpClient.get(`${API.GET_BOOK}/${bookId}`);
  return response.data;
};

/** Lấy sách qua slug — dùng cho URL đẹp /books/sapiens-... */
export const getBookBySlug = async (slug) => {
  const response = await httpClient.get(`${API.GET_BOOK_BY_SLUG}/${slug}`);
  return response.data;
};

// ── Discovery ──────────────────────────────────────────────────────────────

export const searchBooks = async (keyword, page = 1, size = 10) => {
  const response = await httpClient.get(API.SEARCH_BOOKS, {
    params: { keyword, page, size },
  });
  return response.data;
};

export const getTrendingBooks = async (page = 1, size = 10) => {
  const response = await httpClient.get(API.TRENDING_BOOKS, {
    params: { page, size },
  });
  return response.data;
};

export const getTopRatedBooks = async (page = 1, size = 10) => {
  const response = await httpClient.get(API.TOP_RATED_BOOKS, {
    params: { page, size },
  });
  return response.data;
};

export const getMyBooks = async (page = 1, size = 10) => {
  const response = await httpClient.get(API.MY_BOOKS, {
    params: { page, size },
  });
  return response.data;
};

// ── Tag (hashtag sách vào post) ───────────────────────────────────────────

/** Gắn nhiều cuốn sách vào một bài post. bookIds là mảng string. */
export const tagPost = async (postId, bookIds) => {
  const response = await httpClient.post(API.TAG_POST, { postId, bookIds });
  return response.data;
};

/** Bỏ tag một cuốn sách khỏi bài post. */
export const untagPost = async (postId, bookId) => {
  const response = await httpClient.delete(`${API.UNTAG_POST}/${postId}/${bookId}`);
  return response.data;
};

/** Lấy danh sách sách được tag trong một bài post. */
export const getBooksInPost = async (postId) => {
  const response = await httpClient.get(`${API.GET_BOOKS_IN_POST}/${postId}`);
  return response.data;
};

/** Lấy feed bài post đã tag một cuốn sách (trang sách). */
export const getPostsByBook = async (bookId, page = 1, size = 10) => {
  const response = await httpClient.get(`${API.GET_POSTS_BY_BOOK}/${bookId}/posts`, {
    params: { page, size },
  });
  return response.data;
};

// ── Reviews ───────────────────────────────────────────────────────────────

export const createReview = async (bookId, rating, content) => {
  const response = await httpClient.post(`${API.BOOK_REVIEWS}/${bookId}/reviews`, {
    rating,
    content,
  });
  return response.data;
};

export const updateReview = async (bookId, rating, content) => {
  const response = await httpClient.put(`${API.BOOK_REVIEWS}/${bookId}/reviews`, {
    rating,
    content,
  });
  return response.data;
};

export const deleteReview = async (bookId) => {
  const response = await httpClient.delete(`${API.BOOK_REVIEWS}/${bookId}/reviews`);
  return response.data;
};

export const getReviewsByBook = async (bookId, page = 1, size = 10) => {
  const response = await httpClient.get(`${API.BOOK_REVIEWS}/${bookId}/reviews`, {
    params: { page, size },
  });
  return response.data;
};
