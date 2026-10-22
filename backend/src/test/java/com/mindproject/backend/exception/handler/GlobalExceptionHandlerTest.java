package com.mindproject.backend.exception.handler;

import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    void handleBadRequestReturnsBadRequestDetails() {
        var response = exceptionHandler.handle(new BadRequestException("Invalid request"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("BAD_REQUEST", response.getBody().code());
        assertEquals("Invalid request", response.getBody().message());
    }

    @Test
    void handleConflictReturnsConflictDetails() {
        var response = exceptionHandler.handle(new ConflictException("Conflicting operation"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("CONFLICT", response.getBody().code());
        assertEquals("Conflicting operation", response.getBody().message());
    }

    @Test
    void handleNotFoundReturnsNotFoundDetails() {
        var response = exceptionHandler.handle(new NotFoundException("Resource not found"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("NOT_FOUND", response.getBody().code());
        assertEquals("Resource not found", response.getBody().message());
    }

    @Test
    void handleUnexpectedReturnsGenericInternalServerError() {
        var response = exceptionHandler.handleUnexpected(new IllegalStateException("Sensitive internal detail"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().code());
        assertEquals("Ocorreu um erro inesperado", response.getBody().message());
    }
}
