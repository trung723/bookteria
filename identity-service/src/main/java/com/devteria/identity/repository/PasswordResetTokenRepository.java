package com.devteria.identity.repository;

import java.util.Optional;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identity.entity.PasswordResetToken;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    void deleteByEmail(String email);
}
