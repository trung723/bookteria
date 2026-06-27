package com.devteria.post.mapper;

import com.devteria.post.dto.response.CommentResponse;
import com.devteria.post.dto.response.PostResponse;
import com.devteria.post.entity.Comment;
import com.devteria.post.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostMapper {
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "likedByMe", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "userAvatar", ignore = true)
    @Mapping(target = "created", ignore = true)
    PostResponse toPostResponse(Post post);

    CommentResponse toCommentResponse(Comment comment);
}
