package com.mindproject.backend.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

import com.mindproject.backend.exception.ApplicationException;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import org.springframework.http.HttpStatus;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApplicationException.ExceptionResponse> handle(BadRequestException exception) {
        return ResponseEntity.status(exception.defaultHttpError()).body(exception.toResponse());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApplicationException.ExceptionResponse> handle(ConflictException exception) {
        return ResponseEntity.status(exception.defaultHttpError()).body(exception.toResponse());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApplicationException.ExceptionResponse> handle(NotFoundException exception) {
        return ResponseEntity.status(exception.defaultHttpError()).body(exception.toResponse());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApplicationException.ExceptionResponse> handleUnexpected(Exception exception) {
        ApplicationException.ExceptionResponse response = new ApplicationException.ExceptionResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "INTERNAL_SERVER_ERROR", "Ocorreu um erro inesperado", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
