package com.devteria.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Comment {
    String id;
    String userId;
    String username;
    String content;
    Instant createdDate;
}
