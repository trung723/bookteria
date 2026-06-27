package com.devteria.book.controller;

import com.devteria.book.dto.ApiResponse;
import com.devteria.book.dto.PageResponse;
import com.devteria.book.dto.request.ReviewRequest;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.service.ReviewService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/{bookId}/reviews")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewService reviewService;

    /** Tạo review (mỗi user chỉ review 1 lần / cuốn). */
    @PostMapping
    ApiResponse<ReviewResponse> createReview(
            @PathVariable String bookId,
            @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(bookId, request))
                .build();
    }

    /** Cập nhật review của bản thân. */
    @PutMapping
    ApiResponse<ReviewResponse> updateReview(
            @PathVariable String bookId,
            @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.updateReview(bookId, request))
                .build();
    }

    /** Xoá review của bản thân. */
    @DeleteMapping
    ApiResponse<Void> deleteReview(@PathVariable String bookId) {
        reviewService.deleteReview(bookId);
        return ApiResponse.<Void>builder().build();
    }

    /** Lấy tất cả reviews của một cuốn sách (có phân trang). */
    @GetMapping
    ApiResponse<PageResponse<ReviewResponse>> getReviews(
            @PathVariable String bookId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<ReviewResponse>>builder()
                .result(reviewService.getReviewsByBook(bookId, page, size))
                .build();
    }
}
