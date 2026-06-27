package com.devteria.notification.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.devteria.notification.dto.response.NotificationResponse;
import com.devteria.notification.entity.Notification;
import com.devteria.notification.repository.NotificationRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;

    public Notification save(String email, String subject, String body, String channel) {
        return notificationRepository.save(Notification.builder()
                .email(email)
                .subject(subject)
                .body(body)
                .channel(channel)
                .read(false)
                .createdAt(Instant.now())
                .build());
    }

    public List<NotificationResponse> getMyNotifications(String email) {
        return notificationRepository.findByEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long countUnread(String email) {
        return notificationRepository.countByEmailAndReadFalse(email);
    }

    public void markAllRead(String email) {
        var list = notificationRepository.findByEmailOrderByCreatedAtDesc(email);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    public void markRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .subject(n.getSubject())
                .body(n.getBody())
                .channel(n.getChannel())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
