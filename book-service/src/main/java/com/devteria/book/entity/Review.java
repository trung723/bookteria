package com.devteria.book.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

/**
 * Đánh giá (rating + review) của một user cho một cuốn sách.
 * Mỗi user chỉ review mỗi cuốn 1 lần (compound unique index bookId + userId).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "book_review")
@CompoundIndex(name = "book_user_idx", def = "{'bookId': 1, 'userId': 1}", unique = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {

    @MongoId
    String id;

    String bookId;
    String userId;

    /** 1–5 sao. */
    int rating;

    /** Nội dung review (tuỳ chọn). */
    String content;

    Instant createdDate;
    Instant modifiedDate;
}
