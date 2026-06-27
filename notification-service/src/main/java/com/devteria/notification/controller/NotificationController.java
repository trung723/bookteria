package com.devteria.notification.controller;

import java.util.List;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.devteria.event.dto.NotificationEvent;
import com.devteria.notification.dto.ApiResponse;
import com.devteria.notification.dto.request.Recipient;
import com.devteria.notification.dto.request.SendEmailRequest;
import com.devteria.notification.dto.response.NotificationResponse;
import com.devteria.notification.service.EmailService;
import com.devteria.notification.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    EmailService emailService;
    NotificationService notificationService;

    @KafkaListener(topics = "notification-delivery")
    public void listenNotificationDelivery(NotificationEvent message) {
        log.info("Message received: {}", message);
        // Lưu vào DB
        notificationService.save(message.getRecipient(), message.getSubject(), message.getBody(), message.getChannel());
        // Gửi email nếu channel là EMAIL
        if ("EMAIL".equalsIgnoreCase(message.getChannel())) {
            emailService.sendEmail(SendEmailRequest.builder()
                    .to(Recipient.builder().email(message.getRecipient()).build())
                    .subject(message.getSubject())
                    .htmlContent(message.getBody())
                    .build());
        }
    }

    @GetMapping("/notifications/my")
    ApiResponse<List<NotificationResponse>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getMyNotifications(email))
                .build();
    }

    @GetMapping("/notifications/unread-count")
    ApiResponse<Long> getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<Long>builder()
                .result(notificationService.countUnread(email))
                .build();
    }

    @PutMapping("/notifications/mark-all-read")
    ApiResponse<Void> markAllRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markAllRead(email);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/notifications/{id}/read")
    ApiResponse<Void> markRead(@PathVariable String id) {
        notificationService.markRead(id);
        return ApiResponse.<Void>builder().build();
    }
}
