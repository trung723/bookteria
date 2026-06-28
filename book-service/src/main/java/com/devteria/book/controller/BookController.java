package com.devteria.book.controller;

import com.devteria.book.dto.ApiResponse;
import com.devteria.book.dto.PageResponse;
import com.devteria.book.dto.request.BookRequest;
import com.devteria.book.dto.request.TagPostRequest;
import com.devteria.book.dto.response.BookResponse;
import com.devteria.book.dto.response.PostSummaryResponse;
import com.devteria.book.service.BookService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookController {

    BookService bookService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @PostMapping("/create")
    ApiResponse<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.createBook(request))
                .build();
    }

    @PutMapping("/{bookId}")
    ApiResponse<BookResponse> updateBook(
            @PathVariable String bookId,
            @Valid @RequestBody BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.updateBook(bookId, request))
                .build();
    }

    @DeleteMapping("/{bookId}")
    ApiResponse<Void> deleteBook(@PathVariable String bookId) {
        bookService.deleteBook(bookId);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{bookId}")
    ApiResponse<BookResponse> getBookById(@PathVariable String bookId) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.getBookById(bookId))
                .build();
    }

    /** Truy cập trang sách qua slug (URL đẹp, giống Twitter #hashtag). */
    @GetMapping("/slug/{slug}")
    ApiResponse<BookResponse> getBookBySlug(@PathVariable String slug) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.getBookBySlug(slug))
                .build();
    }

    // ── Discovery ─────────────────────────────────────────────────────────────

    @GetMapping("/search")
    ApiResponse<PageResponse<BookResponse>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .result(bookService.searchBooks(keyword, page, size))
                .build();
    }

    @GetMapping("/trending")
    ApiResponse<PageResponse<BookResponse>> getTrendingBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .result(bookService.getTrendingBooks(page, size))
                .build();
    }

    @GetMapping("/top-rated")
    ApiResponse<PageResponse<BookResponse>> getTopRatedBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .result(bookService.getTopRatedBooks(page, size))
                .build();
    }

    @GetMapping("/my-books")
    ApiResponse<PageResponse<BookResponse>> getMyBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .result(bookService.getMyBooks(page, size))
                .build();
    }

    // ── Tag (gắn sách vào post như hashtag) ───────────────────────────────────

    /**
     * Gắn nhiều cuốn sách vào một bài post.
     * POST /book/tags  { postId, bookIds: ["id1","id2"] }
     */
    @PostMapping("/tags")
    ApiResponse<List<BookResponse>> tagPost(@Valid @RequestBody TagPostRequest request) {
        return ApiResponse.<List<BookResponse>>builder()
                .result(bookService.tagPost(request))
                .build();
    }

    /**
     * Bỏ tag một cuốn sách khỏi bài post.
     * DELETE /book/tags/{postId}/{bookId}
     */
    @DeleteMapping("/tags/{postId}/{bookId}")
    ApiResponse<Void> untagPost(
            @PathVariable String postId,
            @PathVariable String bookId) {
        bookService.untagPost(postId, bookId);
        return ApiResponse.<Void>builder().build();
    }

    /** Lấy danh sách sách đã được tag trong một bài post. */
    @GetMapping("/tags/post/{postId}")
    ApiResponse<List<BookResponse>> getBooksTaggedInPost(@PathVariable String postId) {
        return ApiResponse.<List<BookResponse>>builder()
                .result(bookService.getBooksTaggedInPost(postId))
                .build();
    }

    /**
     * Feed của trang sách: danh sách các post đã tag cuốn sách này.
     * GET /book/{bookId}/posts
     */
    @GetMapping("/{bookId}/posts")
    ApiResponse<PageResponse<PostSummaryResponse>> getPostsByBook(
            @PathVariable String bookId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<PostSummaryResponse>>builder()
                .result(bookService.getPostsByBook(bookId, page, size))
                .build();
    }

    @GetMapping("/admin/books")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<PageResponse<BookResponse>> getAllBooksForAdmin(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .result(bookService.getAllBooksForAdmin(keyword, page, size))
                .build();
    }
}
