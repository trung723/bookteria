package com.devteria.profile.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.request.SearchUserRequest;
import com.devteria.profile.dto.request.UpdateProfileRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    @GetMapping("/users/{profileId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfile(profileId))
                .build();
    }

    @GetMapping("/users/by-userid/{userId}")
    ApiResponse<UserProfileResponse> getByUserId(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getByUserId(userId))
                .build();
    }

    @GetMapping("/users")
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    @GetMapping("/users/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PutMapping("/users/my-profile")
    ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }

    @PutMapping("/users/avatar")
    ApiResponse<UserProfileResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateAvatar(file))
                .build();
    }

    @PostMapping("/users/search")
    ApiResponse<List<UserProfileResponse>> search(@RequestBody SearchUserRequest request) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.search(request))
                .build();
    }

    // ---- Follow / Unfollow ----

    @PostMapping("/users/{userId}/follow")
    ApiResponse<UserProfileResponse> follow(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.follow(userId))
                .build();
    }

    @DeleteMapping("/users/{userId}/follow")
    ApiResponse<UserProfileResponse> unfollow(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.unfollow(userId))
                .build();
    }

    @GetMapping("/users/{userId}/following")
    ApiResponse<List<UserProfileResponse>> getFollowing(@PathVariable String userId) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getFollowing(userId))
                .build();
    }

    @GetMapping("/users/{userId}/followers")
    ApiResponse<List<UserProfileResponse>> getFollowers(@PathVariable String userId) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getFollowers(userId))
                .build();
    }

    @PostMapping("/users/following-ids")
    ApiResponse<List<String>> getFollowingIds(@RequestBody List<String> userIds) {
        // Return following ids for the first userId (called by post-service for feed)
        if (userIds == null || userIds.isEmpty())
            return ApiResponse.<List<String>>builder().result(List.of()).build();
        return ApiResponse.<List<String>>builder()
                .result(userProfileService.getFollowingUserIds(userIds.get(0)))
                .build();
    }
}
