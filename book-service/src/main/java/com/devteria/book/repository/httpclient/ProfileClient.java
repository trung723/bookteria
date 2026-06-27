package com.devteria.book.repository.httpclient;

import com.devteria.book.configuration.AuthenticationRequestInterceptor;
import com.devteria.book.dto.ApiResponse;
import com.devteria.book.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "profile-service",
        url = "${app.services.profile.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ProfileClient {

    @GetMapping("/users/by-userid/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);
}
