package com.devteria.book.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Một đầu sách — hoạt động như hashtag:
 *  - Bất kỳ user nào cũng tạo được
 *  - Post có thể tag nhiều book (hoặc không tag)
 *  - Mỗi book có trang riêng tổng hợp các post đã tag nó
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "book")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Book {

    @MongoId
    String id;

    /** Tên sách — dùng như hashtag, unique (slug). */
    @Indexed(unique = true)
    String slug; // vd: "sapiens-mot-lich-su-ngan-gon-ve-loai-nguoi"

    /** Tên hiển thị đầy đủ. */
    String title;

    /** Tên tác giả. */
    String author;

    /** Mô tả / giới thiệu sách. */
    String description;

    /** URL ảnh bìa (lưu qua file-service). */
    String coverImage;

    /** userId của người tạo đầu sách này. */
    String createdBy;

    Instant createdDate;
    Instant modifiedDate;

    /** Tổng số post đã tag cuốn sách này (denormalized để truy vấn nhanh). */
    @Builder.Default
    long postCount = 0L;

    /** Tổng số lượt review. */
    @Builder.Default
    long reviewCount = 0L;

    /** Trung bình rating (1-5 sao), được cập nhật mỗi khi có review mới. */
    @Builder.Default
    double averageRating = 0.0;
}
