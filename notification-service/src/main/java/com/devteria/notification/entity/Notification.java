package com.devteria.notification.entity;

import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "notifications")
public class Notification {
    @MongoId
    String id;

    String userId; // recipient userId
    String email; // recipient email (fallback)
    String subject;
    String body;
    String channel;
    boolean read;
    Instant createdAt;
}
