package com.devteria.post.controller;

import com.devteria.post.dto.ApiResponse;
import com.devteria.post.dto.PageResponse;
import com.devteria.post.dto.request.CommentRequest;
import com.devteria.post.dto.request.PostRequest;
import com.devteria.post.dto.response.PostResponse;
import com.devteria.post.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;

    @PostMapping("/create")
    ApiResponse<PostResponse> createPost(@RequestBody PostRequest request) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request)).build();
    }

    @PutMapping("/{postId}")
    ApiResponse<PostResponse> updatePost(@PathVariable String postId,
                                         @RequestBody PostRequest request) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.updatePost(postId, request)).build();
    }

    @DeleteMapping("/{postId}")
    ApiResponse<Void> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/{postId}/like")
    ApiResponse<PostResponse> likePost(@PathVariable String postId) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.likePost(postId)).build();
    }

    @PostMapping("/{postId}/comments")
    ApiResponse<PostResponse> addComment(@PathVariable String postId,
                                         @RequestBody CommentRequest request) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.addComment(postId, request)).build();
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    ApiResponse<Void> deleteComment(@PathVariable String postId,
                                    @PathVariable String commentId) {
        postService.deleteComment(postId, commentId);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/my-posts")
    ApiResponse<PageResponse<PostResponse>> myPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getMyPosts(page, size)).build();
    }

    @GetMapping("/feed")
    ApiResponse<PageResponse<PostResponse>> getFeed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getFeed(page, size)).build();
    }
}
