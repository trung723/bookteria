package com.devteria.book.service;

import com.devteria.book.dto.PageResponse;
import com.devteria.book.dto.request.BookRequest;
import com.devteria.book.dto.request.TagPostRequest;
import com.devteria.book.dto.response.BookResponse;
import com.devteria.book.dto.response.PostSummaryResponse;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.dto.response.UserProfileResponse;
import com.devteria.book.entity.Book;
import com.devteria.book.entity.BookTag;
import com.devteria.book.exception.AppException;
import com.devteria.book.exception.ErrorCode;
import com.devteria.book.mapper.BookMapper;
import com.devteria.book.repository.BookRepository;
import com.devteria.book.repository.BookTagRepository;
import com.devteria.book.repository.ReviewRepository;
import com.devteria.book.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookService {

    BookRepository bookRepository;
    BookTagRepository bookTagRepository;
    ReviewRepository reviewRepository;
    ProfileClient profileClient;
    BookMapper bookMapper;

    static DateTimeFormatter FORMATTER = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private boolean isAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private UserProfileResponse fetchProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.warn("Cannot fetch profile for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    /** Chuyển Book → BookResponse, bổ sung myReview nếu có. */
    private BookResponse toResponse(Book book, String viewerUserId) {
        BookResponse resp = bookMapper.toBookResponse(book);
        resp.setCreatedDate(book.getCreatedDate() != null ? FORMATTER.format(book.getCreatedDate()) : null);

        if (viewerUserId != null) {
            reviewRepository.findByBookIdAndUserId(book.getId(), viewerUserId).ifPresent(r -> {
                ReviewResponse rr = ReviewResponse.builder()
                        .id(r.getId())
                        .bookId(r.getBookId())
                        .userId(r.getUserId())
                        .rating(r.getRating())
                        .content(r.getContent())
                        .createdDate(r.getCreatedDate() != null ? FORMATTER.format(r.getCreatedDate()) : null)
                        .build();
                resp.setMyReview(rr);
            });
        }
        return resp;
    }

    // ─────────────────────────────────────────
    // CRUD sách
    // ─────────────────────────────────────────

    public BookResponse createBook(BookRequest request) {
        String userId = currentUserId();
        String slug = SlugUtils.toSlug(request.getTitle());

        // Nếu slug đã tồn tại, append timestamp để tránh trùng
        if (bookRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.BOOK_ALREADY_EXISTS);
        }

        Book book = bookMapper.toBook(request);
        book.setSlug(slug);
        book.setCreatedBy(userId);
        book.setCreatedDate(Instant.now());
        book.setModifiedDate(Instant.now());

        book = bookRepository.save(book);
        return toResponse(book, userId);
    }

    public BookResponse updateBook(String bookId, BookRequest request) {
        String userId = currentUserId();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Chỉ người tạo mới được sửa, trừ phi là ADMIN
        if (!book.getCreatedBy().equals(userId) && !isAdmin()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Nếu title đổi, cập nhật slug
        String newSlug = SlugUtils.toSlug(request.getTitle());
        if (!newSlug.equals(book.getSlug()) && bookRepository.existsBySlug(newSlug)) {
            throw new AppException(ErrorCode.BOOK_ALREADY_EXISTS);
        }

        bookMapper.update(book, request);
        book.setSlug(newSlug);
        book.setModifiedDate(Instant.now());

        return toResponse(bookRepository.save(book), userId);
    }

    public void deleteBook(String bookId) {
        String userId = currentUserId();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (!book.getCreatedBy().equals(userId) && !isAdmin()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        bookRepository.delete(book);
    }

    public BookResponse getBookById(String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return toResponse(book, currentUserId());
    }

    public BookResponse getBookBySlug(String slug) {
        Book book = bookRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return toResponse(book, currentUserId());
    }

    // ─────────────────────────────────────────
    // Tìm kiếm & Discovery
    // ─────────────────────────────────────────

    public PageResponse<BookResponse> searchBooks(String keyword, int page, int size) {
        String userId = currentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        var pageData = bookRepository.searchByKeyword(keyword, pageable);
        return PageResponse.<BookResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(b -> toResponse(b, userId)).toList())
                .build();
    }

    public PageResponse<BookResponse> getTrendingBooks(int page, int size) {
        String userId = currentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        var pageData = bookRepository.findAllByOrderByPostCountDesc(pageable);
        return PageResponse.<BookResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(b -> toResponse(b, userId)).toList())
                .build();
    }

    public PageResponse<BookResponse> getTopRatedBooks(int page, int size) {
        String userId = currentUserId();
        Pageable pageable = PageRequest.of(page - 1, size);
        var pageData = bookRepository.findAllByOrderByAverageRatingDesc(pageable);
        return PageResponse.<BookResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(b -> toResponse(b, userId)).toList())
                .build();
    }

    public PageResponse<BookResponse> getMyBooks(int page, int size) {
        String userId = currentUserId();
        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by("createdDate").descending());
        var pageData = bookRepository.findAllByCreatedBy(userId, pageable);
        return PageResponse.<BookResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(b -> toResponse(b, userId)).toList())
                .build();
    }

    // ─────────────────────────────────────────
    // Book Tag (gắn sách vào post — như hashtag)
    // ─────────────────────────────────────────

    /**
     * Gắn nhiều tag sách vào một bài post.
     * Trả về danh sách BookResponse của các sách đã được tag.
     */
    public List<BookResponse> tagPost(TagPostRequest request) {
        String userId = currentUserId();
        List<BookResponse> result = new ArrayList<>();

        for (String bookId : request.getBookIds()) {
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            if (bookTagRepository.existsByPostIdAndBookId(request.getPostId(), bookId)) {
                // Bỏ qua nếu đã tag (idempotent)
                result.add(toResponse(book, userId));
                continue;
            }

            BookTag tag = BookTag.builder()
                    .postId(request.getPostId())
                    .bookId(bookId)
                    .userId(userId)
                    .createdDate(Instant.now())
                    .build();
            bookTagRepository.save(tag);

            // Tăng postCount của book
            book.setPostCount(book.getPostCount() + 1);
            bookRepository.save(book);

            result.add(toResponse(book, userId));
        }
        return result;
    }

    /**
     * Bỏ tag một cuốn sách khỏi bài post.
     */
    public void untagPost(String postId, String bookId) {
        String userId = currentUserId();
        BookTag tag = bookTagRepository.findByPostIdAndBookId(postId, bookId)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));

        // Chỉ chủ post mới được bỏ tag (tag.userId là userId của người tạo post)
        if (!tag.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        bookTagRepository.delete(tag);

        // Giảm postCount
        bookRepository.findById(bookId).ifPresent(b -> {
            b.setPostCount(Math.max(0, b.getPostCount() - 1));
            bookRepository.save(b);
        });
    }

    /**
     * Lấy danh sách sách được tag trong một bài post.
     */
    public List<BookResponse> getBooksTaggedInPost(String postId) {
        String userId = currentUserId();
        List<String> bookIds = bookTagRepository.findAllByPostId(postId)
                .stream().map(BookTag::getBookId).toList();
        return bookRepository.findAllByIdIn(bookIds)
                .stream().map(b -> toResponse(b, userId)).toList();
    }

    /**
     * Lấy danh sách post đã tag một cuốn sách (feed của trang sách).
     * Chỉ trả về postId + userId + metadata; client dùng postId để fetch
     * chi tiết từ post-service nếu cần.
     */
    public PageResponse<PostSummaryResponse> getPostsByBook(String bookId, int page, int size) {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        Pageable pageable = PageRequest.of(page - 1, size);
        var pageData = bookTagRepository.findAllByBookIdOrderByCreatedDateDesc(bookId, pageable);

        // Lấy profile của các userId để bổ sung username/avatar
        List<String> userIds = pageData.getContent().stream()
                .map(BookTag::getUserId).distinct().toList();
        Map<String, UserProfileResponse> profileMap = userIds.stream()
                .map(this::fetchProfile)
                .filter(p -> p != null)
                .collect(Collectors.toMap(UserProfileResponse::getUserId, Function.identity(),
                        (a, b) -> a));

        List<PostSummaryResponse> summaries = pageData.getContent().stream().map(tag -> {
            UserProfileResponse profile = profileMap.get(tag.getUserId());
            return PostSummaryResponse.builder()
                    .postId(tag.getPostId())
                    .userId(tag.getUserId())
                    .username(profile != null ? profile.getUsername() : tag.getUserId())
                    .userAvatar(profile != null ? profile.getAvatar() : null)
                    .createdDate(tag.getCreatedDate() != null ? FORMATTER.format(tag.getCreatedDate()) : null)
                    .build();
        }).toList();

        return PageResponse.<PostSummaryResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(summaries)
                .build();
    }

    public PageResponse<BookResponse> getAllBooksForAdmin(String keyword, int page, int size) {
        String userId = currentUserId();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdDate").descending());
        org.springframework.data.domain.Page<Book> pageData;
        if (keyword != null && !keyword.trim().isEmpty()) {
            pageData = bookRepository.searchByKeyword(keyword, pageable);
        } else {
            pageData = bookRepository.findAll(pageable);
        }
        return PageResponse.<BookResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(b -> toResponse(b, userId)).toList())
                .build();
    }
}
