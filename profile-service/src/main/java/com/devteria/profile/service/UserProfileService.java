package com.devteria.profile.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.devteria.profile.dto.request.ProfileCreationRequest;
import com.devteria.profile.dto.request.SearchUserRequest;
import com.devteria.profile.dto.request.UpdateProfileRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.exception.AppException;
import com.devteria.profile.exception.ErrorCode;
import com.devteria.profile.mapper.UserProfileMapper;
import com.devteria.profile.repository.UserProfileRepository;
import com.devteria.profile.repository.httpclient.FileClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    FileClient fileClient;
    UserProfileMapper userProfileMapper;

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserProfileResponse toResponse(UserProfile profile, String viewerUserId) {
        UserProfileResponse resp = userProfileMapper.toUserProfileResponse(profile);
        List<UserProfile> followers = userProfileRepository.findFollowers(profile.getUserId());
        List<UserProfile> following = userProfileRepository.findFollowing(profile.getUserId());
        resp.setFollowerCount(followers.size());
        resp.setFollowingCount(following.size());
        if (viewerUserId != null && !viewerUserId.equals(profile.getUserId())) {
            resp.setFollowedByMe(userProfileRepository.isFollowing(viewerUserId, profile.getUserId()));
        }
        return resp;
    }

    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);
        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getByUserId(String userId) {
        UserProfile profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(profile, currentUserId());
    }

    public UserProfileResponse getProfile(String id) {
        UserProfile profile =
                userProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(profile, currentUserId());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfiles() {
        String viewerId = currentUserId();
        return userProfileRepository.findAll().stream()
                .map(p -> toResponse(p, viewerId))
                .toList();
    }

    public UserProfileResponse getMyProfile() {
        String userId = currentUserId();
        UserProfile profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(profile, userId);
    }

    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        String userId = currentUserId();
        UserProfile profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userProfileMapper.update(profile, request);
        return toResponse(userProfileRepository.save(profile), userId);
    }

    public UserProfileResponse updateAvatar(MultipartFile file) {
        String userId = currentUserId();
        UserProfile profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        var response = fileClient.uploadMedia(file);
        profile.setAvatar(response.getResult().getUrl());
        return toResponse(userProfileRepository.save(profile), userId);
    }

    public List<UserProfileResponse> search(SearchUserRequest request) {
        String userId = currentUserId();
        return userProfileRepository.findAllByUsernameLike(request.getKeyword()).stream()
                .filter(p -> !userId.equals(p.getUserId()))
                .map(p -> toResponse(p, userId))
                .toList();
    }

    // ---- Follow / Unfollow ----

    public UserProfileResponse follow(String targetUserId) {
        String myUserId = currentUserId();
        if (myUserId.equals(targetUserId)) throw new AppException(ErrorCode.CANNOT_FOLLOW_YOURSELF);
        // Ensure both profiles exist
        userProfileRepository.findByUserId(myUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userProfileRepository
                .findByUserId(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userProfileRepository.follow(myUserId, targetUserId);
        UserProfile target = userProfileRepository
                .findByUserId(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(target, myUserId);
    }

    public UserProfileResponse unfollow(String targetUserId) {
        String myUserId = currentUserId();
        userProfileRepository.unfollow(myUserId, targetUserId);
        UserProfile target = userProfileRepository
                .findByUserId(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toResponse(target, myUserId);
    }

    public List<UserProfileResponse> getFollowing(String userId) {
        String viewerId = currentUserId();
        return userProfileRepository.findFollowing(userId).stream()
                .map(p -> toResponse(p, viewerId))
                .toList();
    }

    public List<UserProfileResponse> getFollowers(String userId) {
        String viewerId = currentUserId();
        return userProfileRepository.findFollowers(userId).stream()
                .map(p -> toResponse(p, viewerId))
                .toList();
    }

    public List<String> getFollowingUserIds(String userId) {
        return userProfileRepository.findFollowingUserIds(userId);
    }
}
