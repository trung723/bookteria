package com.devteria.book.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request gắn tag sách vào bài post.
 * Gửi list bookId (hoặc slug) để tag nhiều cuốn một lúc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TagPostRequest {

    @NotBlank(message = "postId không được để trống")
    String postId;

    /** Danh sách bookId muốn tag vào post này. */
    List<String> bookIds;
}
