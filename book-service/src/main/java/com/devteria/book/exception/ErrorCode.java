package com.devteria.book.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid request data", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),

    BOOK_NOT_FOUND(2001, "Book not found", HttpStatus.NOT_FOUND),
    BOOK_ALREADY_EXISTS(2002, "Book with this title already exists", HttpStatus.CONFLICT),
    REVIEW_NOT_FOUND(2003, "Review not found", HttpStatus.NOT_FOUND),
    ALREADY_REVIEWED(2004, "You have already reviewed this book", HttpStatus.CONFLICT),
    INVALID_RATING(2005, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    TAG_ALREADY_EXISTS(2006, "This post already tagged this book", HttpStatus.CONFLICT),
    TAG_NOT_FOUND(2007, "Tag not found", HttpStatus.NOT_FOUND),
    CANNOT_REVIEW_OWN_BOOK(2008, "You cannot review a book you created", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
