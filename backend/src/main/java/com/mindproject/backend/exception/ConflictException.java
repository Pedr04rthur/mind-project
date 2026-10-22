package com.mindproject.backend.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends ApplicationException {

    public ConflictException(String message) {
        super(message);
    }

    @Override
    public HttpStatus defaultHttpError() {
        return HttpStatus.CONFLICT;
    }

    @Override
    public String defaultCodeError() {
        return "CONFLICT";
    }
}
