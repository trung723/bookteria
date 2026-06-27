package com.devteria.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(value = "post")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @MongoId
    String id;
    String userId;
    String content;
    Instant createdDate;
    Instant modifiedDate;

    @Builder.Default
    List<String> likedUserIds = new ArrayList<>();

    @Builder.Default
    List<Comment> comments = new ArrayList<>();
}
