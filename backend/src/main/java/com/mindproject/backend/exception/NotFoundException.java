package com.mindproject.backend.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends ApplicationException {

    public NotFoundException(String message) {
        super(message);
    }

    @Override
    public HttpStatus defaultHttpError() {
        return HttpStatus.NOT_FOUND;
    }

    @Override
    public String defaultCodeError() {
        return "NOT_FOUND";
    }
}
