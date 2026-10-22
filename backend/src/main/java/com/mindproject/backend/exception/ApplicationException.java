package com.mindproject.backend.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

public abstract class ApplicationException extends RuntimeException {

    public static record ExceptionResponse(
        int status,
        String code,
        String message,
        LocalDateTime timestamp
    ) {}

    public ApplicationException(String message) {
        super(message);
    }

    public abstract HttpStatus defaultHttpError();

    public abstract String defaultCodeError();

    public ExceptionResponse toResponse() {
        return new ExceptionResponse(defaultHttpError().value(), defaultCodeError(), getMessage(), LocalDateTime.now());
    }
}
