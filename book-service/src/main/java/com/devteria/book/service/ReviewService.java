package com.devteria.book.service;

import com.devteria.book.dto.PageResponse;
import com.devteria.book.dto.request.ReviewRequest;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.dto.response.UserProfileResponse;
import com.devteria.book.entity.Book;
import com.devteria.book.entity.Review;
import com.devteria.book.exception.AppException;
import com.devteria.book.exception.ErrorCode;
import com.devteria.book.mapper.ReviewMapper;
import com.devteria.book.repository.BookRepository;
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
import java.util.List;
import java.util.OptionalDouble;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {

    ReviewRepository reviewRepository;
    BookRepository bookRepository;
    ProfileClient profileClient;
    ReviewMapper reviewMapper;

    static DateTimeFormatter FORMATTER = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserProfileResponse fetchProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.warn("Cannot fetch profile userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    private ReviewResponse enrichReview(Review review) {
        ReviewResponse resp = reviewMapper.toReviewResponse(review);
        resp.setCreatedDate(review.getCreatedDate() != null ? FORMATTER.format(review.getCreatedDate()) : null);
        UserProfileResponse profile = fetchProfile(review.getUserId());
        if (profile != null) {
            resp.setUsername(profile.getUsername());
            resp.setUserAvatar(profile.getAvatar());
        }
        return resp;
    }

    /** Cập nhật averageRating và reviewCount của book sau mỗi thay đổi review. */
    private void recalculateBookRating(String bookId) {
        List<Review> reviews = reviewRepository.findAllRatingsByBookId(bookId);
        OptionalDouble avg = reviews.stream().mapToInt(Review::getRating).average();
        bookRepository.findById(bookId).ifPresent(book -> {
            book.setReviewCount(reviews.size());
            book.setAverageRating(avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : 0.0);
            bookRepository.save(book);
        });
    }

    public ReviewResponse createReview(String bookId, ReviewRequest request) {
        String userId = currentUserId();

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (book.getCreatedBy().equals(userId)) {
            throw new AppException(ErrorCode.CANNOT_REVIEW_OWN_BOOK);
        }

        if (reviewRepository.existsByBookIdAndUserId(bookId, userId)) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }

        Review review = reviewMapper.toReview(request);
        review.setBookId(bookId);
        review.setUserId(userId);
        review.setCreatedDate(Instant.now());
        review.setModifiedDate(Instant.now());
        review = reviewRepository.save(review);

        recalculateBookRating(bookId);

        return enrichReview(review);
    }

    public ReviewResponse updateReview(String bookId, ReviewRequest request) {
        String userId = currentUserId();

        Review review = reviewRepository.findByBookIdAndUserId(bookId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        reviewMapper.update(review, request);
        review.setModifiedDate(Instant.now());
        review = reviewRepository.save(review);

        recalculateBookRating(bookId);

        return enrichReview(review);
    }

    public void deleteReview(String bookId) {
        String userId = currentUserId();
        Review review = reviewRepository.findByBookIdAndUserId(bookId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        reviewRepository.delete(review);
        recalculateBookRating(bookId);
    }

    public PageResponse<ReviewResponse> getReviewsByBook(String bookId, int page, int size) {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by("createdDate").descending());
        var pageData = reviewRepository.findAllByBookId(bookId, pageable);

        return PageResponse.<ReviewResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(this::enrichReview).toList())
                .build();
    }
}
