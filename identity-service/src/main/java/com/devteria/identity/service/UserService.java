package com.devteria.identity.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.devteria.event.dto.NotificationEvent;
import com.devteria.identity.constant.PredefinedRole;
import com.devteria.identity.dto.request.ForgotPasswordRequest;
import com.devteria.identity.dto.request.ResetPasswordRequest;
import com.devteria.identity.dto.request.UserCreationRequest;
import com.devteria.identity.dto.request.UserUpdateRequest;
import com.devteria.identity.dto.response.UserResponse;
import com.devteria.identity.entity.PasswordResetToken;
import com.devteria.identity.entity.Role;
import com.devteria.identity.entity.User;
import com.devteria.identity.exception.AppException;
import com.devteria.identity.exception.ErrorCode;
import com.devteria.identity.mapper.ProfileMapper;
import com.devteria.identity.mapper.UserMapper;
import com.devteria.identity.repository.PasswordResetTokenRepository;
import com.devteria.identity.repository.RoleRepository;
import com.devteria.identity.repository.UserRepository;
import com.devteria.identity.repository.httpclient.ProfileClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;
    PasswordResetTokenRepository passwordResetTokenRepository; // ← đúng vị trí: field của class

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEmailVerified(false);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        var profileRequest = profileMapper.toProfileCreationRequest(request);
        profileRequest.setUserId(user.getId());

        var profile = profileClient.createProfile(profileRequest);

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(request.getEmail())
                .subject("Welcome to bookteria")
                .body("Hello, " + request.getUsername())
                .build();

        kafkaTemplate.send("notification-delivery", notificationEvent);

        var userCreationReponse = userMapper.toUserResponse(user);
        userCreationReponse.setId(profile.getResult().getId());

        return userCreationReponse;
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // Kiểm tra email tồn tại
        userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Xóa token cũ nếu có
        passwordResetTokenRepository.deleteByEmail(request.getEmail());

        // Tạo token mới
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(request.getEmail())
                .expiryTime(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Gửi email qua Kafka → notification-service
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(request.getEmail())
                .subject("Reset your Bookteria password")
                .body("Click the link below to reset your password (valid for 15 minutes):\n\n"
                        + resetLink
                        + "\n\nIf you did not request this, please ignore this email.")
                .build();
        kafkaTemplate.send("notification-delivery", notificationEvent);

        log.info("Password reset email sent to: {}", request.getEmail());
    }

    public void resetPassword(ResetPasswordRequest request) {
        // Tìm token
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        // Kiểm tra hết hạn
        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        // Kiểm tra đã dùng chưa
        if (resetToken.isUsed()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        // Đổi mật khẩu
        User user = userRepository
                .findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu token đã dùng
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for: {}", resetToken.getEmail());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
}
