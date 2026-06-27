package com.devteria.book.mapper;

import com.devteria.book.dto.request.ReviewRequest;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.entity.Review;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.1 (Oracle Corporation)"
)
@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public Review toReview(ReviewRequest request) {
        if ( request == null ) {
            return null;
        }

        Review.ReviewBuilder review = Review.builder();

        if ( request.getRating() != null ) {
            review.rating( request.getRating() );
        }
        review.content( request.getContent() );

        return review.build();
    }

    @Override
    public ReviewResponse toReviewResponse(Review review) {
        if ( review == null ) {
            return null;
        }

        ReviewResponse.ReviewResponseBuilder reviewResponse = ReviewResponse.builder();

        reviewResponse.id( review.getId() );
        reviewResponse.bookId( review.getBookId() );
        reviewResponse.userId( review.getUserId() );
        reviewResponse.rating( review.getRating() );
        reviewResponse.content( review.getContent() );

        return reviewResponse.build();
    }

    @Override
    public void update(Review review, ReviewRequest request) {
        if ( request == null ) {
            return;
        }

        if ( request.getRating() != null ) {
            review.setRating( request.getRating() );
        }
        review.setContent( request.getContent() );
    }
}
