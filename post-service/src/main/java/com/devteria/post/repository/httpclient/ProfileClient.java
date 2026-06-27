package com.devteria.post.repository.httpclient;

import com.devteria.post.dto.ApiResponse;
import com.devteria.post.dto.response.UserProfileResponse;
import com.devteria.post.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "profile-service", url = "${app.services.profile.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ProfileClient {
    @GetMapping("/users/by-userid/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);

    @PostMapping("/users/following-ids")
    ApiResponse<List<String>> getFollowingIds(@RequestBody List<String> userIds);
}
