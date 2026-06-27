package com.devteria.notification.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.devteria.notification.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByEmailOrderByCreatedAtDesc(String email);

    long countByEmailAndReadFalse(String email);
}
