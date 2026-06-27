package com.devteria.book.mapper;

import com.devteria.book.dto.request.BookRequest;
import com.devteria.book.dto.response.BookResponse;
import com.devteria.book.dto.response.ReviewResponse;
import com.devteria.book.entity.Book;
import com.devteria.book.entity.Review;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.1 (Oracle Corporation)"
)
@Component
public class BookMapperImpl implements BookMapper {

    @Override
    public Book toBook(BookRequest request) {
        if ( request == null ) {
            return null;
        }

        Book.BookBuilder book = Book.builder();

        book.title( request.getTitle() );
        book.author( request.getAuthor() );
        book.description( request.getDescription() );
        book.isbn( request.getIsbn() );
        book.coverImageUrl( request.getCoverImageUrl() );
        book.genre( request.getGenre() );
        book.publishedYear( request.getPublishedYear() );
        book.language( request.getLanguage() );
        book.pageCount( request.getPageCount() );

        return book.build();
    }

    @Override
    public BookResponse toBookResponse(Book book) {
        if ( book == null ) {
            return null;
        }

        BookResponse.BookResponseBuilder bookResponse = BookResponse.builder();

        bookResponse.id( book.getId() );
        bookResponse.title( book.getTitle() );
        bookResponse.author( book.getAuthor() );
        bookResponse.description( book.getDescription() );
        bookResponse.isbn( book.getIsbn() );
        bookResponse.coverImageUrl( book.getCoverImageUrl() );
        bookResponse.genre( book.getGenre() );
        bookResponse.publishedYear( book.getPublishedYear() );
        bookResponse.language( book.getLanguage() );
        bookResponse.pageCount( book.getPageCount() );
        bookResponse.averageRating( book.getAverageRating() );
        bookResponse.ratingCount( book.getRatingCount() );
        bookResponse.createdDate( book.getCreatedDate() );
        bookResponse.modifiedDate( book.getModifiedDate() );

        return bookResponse.build();
    }

    @Override
    public ReviewResponse toReviewResponse(Review review) {
        if ( review == null ) {
            return null;
        }

        ReviewResponse.ReviewResponseBuilder reviewResponse = ReviewResponse.builder();

        reviewResponse.id( review.getId() );
        reviewResponse.userId( review.getUserId() );
        reviewResponse.username( review.getUsername() );
        reviewResponse.userAvatar( review.getUserAvatar() );
        reviewResponse.rating( review.getRating() );
        reviewResponse.content( review.getContent() );
        reviewResponse.createdDate( review.getCreatedDate() );

        return reviewResponse.build();
    }

    @Override
    public void updateBook(Book book, BookRequest request) {
        if ( request == null ) {
            return;
        }

        book.setTitle( request.getTitle() );
        book.setAuthor( request.getAuthor() );
        book.setDescription( request.getDescription() );
        book.setIsbn( request.getIsbn() );
        book.setCoverImageUrl( request.getCoverImageUrl() );
        book.setGenre( request.getGenre() );
        book.setPublishedYear( request.getPublishedYear() );
        book.setLanguage( request.getLanguage() );
        book.setPageCount( request.getPageCount() );
    }
}
