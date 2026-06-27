package com.devteria.book.mapper;

import com.devteria.book.dto.request.BookRequest;
import com.devteria.book.dto.response.BookResponse;
import com.devteria.book.entity.Book;
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
        book.coverImage( request.getCoverImage() );

        return book.build();
    }

    @Override
    public BookResponse toBookResponse(Book book) {
        if ( book == null ) {
            return null;
        }

        BookResponse.BookResponseBuilder bookResponse = BookResponse.builder();

        bookResponse.id( book.getId() );
        bookResponse.slug( book.getSlug() );
        bookResponse.title( book.getTitle() );
        bookResponse.author( book.getAuthor() );
        bookResponse.description( book.getDescription() );
        bookResponse.coverImage( book.getCoverImage() );
        bookResponse.createdBy( book.getCreatedBy() );
        bookResponse.postCount( book.getPostCount() );
        bookResponse.reviewCount( book.getReviewCount() );
        bookResponse.averageRating( book.getAverageRating() );

        return bookResponse.build();
    }

    @Override
    public void update(Book book, BookRequest request) {
        if ( request == null ) {
            return;
        }

        book.setTitle( request.getTitle() );
        book.setAuthor( request.getAuthor() );
        book.setDescription( request.getDescription() );
        book.setCoverImage( request.getCoverImage() );
    }
}
