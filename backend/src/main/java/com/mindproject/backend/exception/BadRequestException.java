package com.mindproject.backend.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends ApplicationException {

    public BadRequestException(String message) {
        super(message);
    }

    @Override
    public HttpStatus defaultHttpError() {
        return HttpStatus.BAD_REQUEST;
    }

    @Override
    public String defaultCodeError() {
        return "BAD_REQUEST";
    }
}
