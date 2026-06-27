package com.devteria.book.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookResponse {
    String id;
    String slug;
    String title;
    String author;
    String description;
    String coverImage;
    String createdBy;
    String createdDate;

    long postCount;
    long reviewCount;
    double averageRating;

    /** Nếu user đang xem đã review cuốn này chưa. */
    ReviewResponse myReview;
}
