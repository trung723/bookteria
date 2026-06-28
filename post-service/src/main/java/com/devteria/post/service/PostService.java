package com.devteria.post.service;

import com.devteria.post.dto.PageResponse;
import com.devteria.post.dto.request.CommentRequest;
import com.devteria.post.dto.request.PostRequest;
import com.devteria.post.dto.response.CommentResponse;
import com.devteria.post.dto.response.PostResponse;
import com.devteria.post.dto.response.UserProfileResponse;
import com.devteria.post.entity.Comment;
import com.devteria.post.entity.Post;
import com.devteria.post.exception.AppException;
import com.devteria.post.exception.ErrorCode;
import com.devteria.post.mapper.PostMapper;
import com.devteria.post.repository.PostRepository;
import com.devteria.post.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {
    DateTimeFormatter dateTimeFormatter;
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserProfileResponse fetchProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.warn("Cannot fetch profile for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    private PostResponse buildResponse(Post post, String currentUserId) {
        UserProfileResponse profile = fetchProfile(post.getUserId());
        PostResponse resp = postMapper.toPostResponse(post);
        resp.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
        if (profile != null) {
            resp.setUsername(profile.getUsername());
            resp.setUserAvatar(profile.getAvatar());
        }
        resp.setLikeCount(post.getLikedUserIds() == null ? 0 : post.getLikedUserIds().size());
        resp.setLikedByMe(post.getLikedUserIds() != null && post.getLikedUserIds().contains(currentUserId));
        List<CommentResponse> commentResponses = post.getComments() == null ? List.of() :
                post.getComments().stream().map(postMapper::toCommentResponse).toList();
        resp.setComments(commentResponses);
        return resp;
    }

    public PostResponse createPost(PostRequest request) {
        String userId = currentUserId();
        Post post = Post.builder()
                .content(request.getContent())
                .userId(userId)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .likedUserIds(new ArrayList<>())
                .comments(new ArrayList<>())
                .build();
        post = postRepository.save(post);
        return buildResponse(post, userId);
    }

    public PostResponse updatePost(String postId, PostRequest request) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (!post.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        post.setContent(request.getContent());
        post.setModifiedDate(Instant.now());
        return buildResponse(postRepository.save(post), userId);
    }

    public void deletePost(String postId) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (!post.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        postRepository.delete(post);
    }

    public PostResponse likePost(String postId) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        List<String> liked = post.getLikedUserIds();
        if (liked == null) liked = new ArrayList<>();
        if (liked.contains(userId)) {
            liked.remove(userId);
        } else {
            liked.add(userId);
        }
        post.setLikedUserIds(liked);
        return buildResponse(postRepository.save(post), userId);
    }

    public PostResponse addComment(String postId, CommentRequest request) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        UserProfileResponse profile = fetchProfile(userId);
        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .username(profile != null ? profile.getUsername() : userId)
                .content(request.getContent())
                .createdDate(Instant.now())
                .build();
        List<Comment> comments = post.getComments();
        if (comments == null) comments = new ArrayList<>();
        comments.add(comment);
        post.setComments(comments);
        return buildResponse(postRepository.save(post), userId);
    }

    public void deleteComment(String postId, String commentId) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        List<Comment> comments = post.getComments();
        if (comments == null) return;
        comments.removeIf(c -> c.getId().equals(commentId) && c.getUserId().equals(userId));
        post.setComments(comments);
        postRepository.save(post);
    }

    public PostResponse updateComment(String postId, String commentId, CommentRequest request) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        List<Comment> comments = post.getComments();
        if (comments == null) throw new AppException(ErrorCode.COMMENT_NOT_FOUND);

        Comment targetComment = comments.stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        if (!targetComment.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        targetComment.setContent(request.getContent());
        post.setComments(comments);
        return buildResponse(postRepository.save(post), userId);
    }

    public PageResponse<PostResponse> getMyPosts(int page, int size) {
        String userId = currentUserId();
        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userId, pageable);
        var postList = pageData.getContent().stream()
                .map(p -> buildResponse(p, userId)).toList();
        return PageResponse.<PostResponse>builder()
                .currentPage(page).pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(postList).build();
    }

    public PostResponse getPost(String postId) {
        String userId = currentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        return buildResponse(post, userId);
    }

    public PageResponse<PostResponse> getFeed(int page, int size) {
        String userId = currentUserId();
        List<String> followingIds;
        try {
            followingIds = profileClient.getFollowingIds(List.of(userId)).getResult();
        } catch (Exception e) {
            log.warn("Cannot fetch following ids, showing own posts only");
            followingIds = new ArrayList<>();
        }
        // Include own posts in feed
        if (!followingIds.contains(userId)) followingIds.add(userId);
        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserIdIn(followingIds, pageable);
        var postList = pageData.getContent().stream()
                .map(p -> buildResponse(p, userId)).toList();
        return PageResponse.<PostResponse>builder()
                .currentPage(page).pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(postList).build();
    }
}
