package com.devteria.book.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookRequest {

    @NotBlank(message = "Tên sách không được để trống")
    @Size(min = 1, max = 200, message = "Tên sách tối đa 200 ký tự")
    String title;

    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(max = 200, message = "Tên tác giả tối đa 200 ký tự")
    String author;

    @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
    String description;

    /** URL ảnh bìa (upload qua file-service trước, lấy URL rồi truyền vào). */
    String coverImage;
}
