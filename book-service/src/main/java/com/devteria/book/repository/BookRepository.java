package com.devteria.book.repository;

import com.devteria.book.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends MongoRepository<Book, String> {

    Optional<Book> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /** Tìm sách theo tiêu đề hoặc tác giả (case-insensitive). */
    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'author': { $regex: ?0, $options: 'i' } } ] }")
    Page<Book> searchByKeyword(String keyword, Pageable pageable);

    /** Lấy sách trending — nhiều bài post nhất. */
    Page<Book> findAllByOrderByPostCountDesc(Pageable pageable);

    /** Lấy sách được đánh giá cao nhất. */
    Page<Book> findAllByOrderByAverageRatingDesc(Pageable pageable);

    /** Lấy sách của một user tạo. */
    Page<Book> findAllByCreatedBy(String userId, Pageable pageable);

    /** Lấy sách theo danh sách id (dùng khi render post với nhiều book tag). */
    List<Book> findAllByIdIn(List<String> ids);
}
