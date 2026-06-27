package com.devteria.book.mapper;

import com.devteria.book.dto.request.ReviewRequest;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookId", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "modifiedDate", ignore = true)
    Review toReview(ReviewRequest request);

    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "userAvatar", ignore = true)
    ReviewResponse toReviewResponse(Review review);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookId", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "modifiedDate", ignore = true)
    void update(@MappingTarget Review review, ReviewRequest request);
}
