package com.mindproject.backend.exception;

import org.springframework.http.HttpStatus;

import java.time.Instant;

public abstract class ApplicationException extends RuntimeException {

    public ApplicationException(String message) {
        super(message);
    }

    public ApplicationResponse toApplicationResponse(HttpStatus status, String path) {
        return new ApplicationResponse(status.value(), path, Instant.now(), getMessage());
    }
}
