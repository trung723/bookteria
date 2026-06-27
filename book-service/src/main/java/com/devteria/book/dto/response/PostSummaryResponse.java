package com.devteria.book.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Tóm tắt bài post hiển thị trong trang sách.
 * Dữ liệu đầy đủ của post nằm ở post-service;
 * đây chỉ lưu thông tin tối thiểu để hiển thị feed theo sách.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PostSummaryResponse {
    String postId;
    String userId;
    String username;
    String userAvatar;
    String content;
    String createdDate;
    int likeCount;
    int commentCount;
}
