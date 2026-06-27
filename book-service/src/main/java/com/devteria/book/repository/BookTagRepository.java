package com.devteria.book.repository;

import com.devteria.book.entity.BookTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookTagRepository extends MongoRepository<BookTag, String> {

    /** Các book đã được tag trong một post. */
    List<BookTag> findAllByPostId(String postId);

    /** Các post đã tag một cuốn sách (dùng cho trang sách). */
    Page<BookTag> findAllByBookIdOrderByCreatedDateDesc(String bookId, Pageable pageable);

    Optional<BookTag> findByPostIdAndBookId(String postId, String bookId);

    boolean existsByPostIdAndBookId(String postId, String bookId);

    void deleteByPostIdAndBookId(String postId, String bookId);

    void deleteAllByPostId(String postId);

    long countByBookId(String bookId);
}
