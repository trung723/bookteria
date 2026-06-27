package com.devteria.book.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

/**
 * Bảng liên kết: một bài post tag một cuốn sách.
 * Giống như bảng post_hashtag trong Twitter.
 * Một post có thể tag nhiều sách → nhiều bản ghi BookTag.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "book_tag")
@CompoundIndex(name = "post_book_idx", def = "{'postId': 1, 'bookId': 1}", unique = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookTag {

    @MongoId
    String id;

    @Indexed
    String postId;

    @Indexed
    String bookId;

    /** userId của người tạo post (để query feed nhanh hơn). */
    String userId;

    Instant createdDate;
}
