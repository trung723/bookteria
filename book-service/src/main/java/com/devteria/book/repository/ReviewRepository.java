package com.devteria.book.repository;

import com.devteria.book.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Optional<Review> findByBookIdAndUserId(String bookId, String userId);

    boolean existsByBookIdAndUserId(String bookId, String userId);

    Page<Review> findAllByBookId(String bookId, Pageable pageable);

    /** Tính trung bình rating của một cuốn sách. */
    @Query(value = "{ 'bookId': ?0 }", fields = "{ 'rating': 1 }")
    java.util.List<Review> findAllRatingsByBookId(String bookId);

    long countByBookId(String bookId);
}
