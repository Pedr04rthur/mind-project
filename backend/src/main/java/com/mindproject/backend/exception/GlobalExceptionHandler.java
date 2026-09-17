package com.mindproject.backend.exception;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestController
@RestControllerAdvice
public class GlobalExceptionHandler implements ErrorController {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApplicationResponse> handleNotFound(NotFoundException exception, HttpServletRequest request) {
        return build(exception, HttpStatus.NOT_FOUND, request.getRequestURI());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApplicationResponse> handleBadRequest(BadRequestException exception, HttpServletRequest request) {
        return build(exception, HttpStatus.BAD_REQUEST, request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApplicationResponse> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        String message = exception.getBindingResult().getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .findFirst()
                .orElse("Dados inválidos");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new BadRequestException(message).toApplicationResponse(HttpStatus.BAD_REQUEST, request.getRequestURI()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApplicationResponse> handleNoResource(NoResourceFoundException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NotFoundException("Recurso não encontrado").toApplicationResponse(HttpStatus.NOT_FOUND, request.getRequestURI()));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApplicationResponse> handleNoHandler(NoHandlerFoundException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NotFoundException("Recurso não encontrado").toApplicationResponse(HttpStatus.NOT_FOUND, request.getRequestURI()));
    }

    @Hidden
    @RequestMapping("/error")
    public ResponseEntity<ApplicationResponse> handleWhiteLabel(HttpServletRequest request) {
        HttpStatus status = resolveStatus(request);
        String path = resolvePath(request);
        String message = resolveMessage(request, status);
        ApplicationException exception = status.is4xxClientError()
                ? new BadRequestException(message)
                : new UnhandledException(message);
        if (status == HttpStatus.NOT_FOUND) {
            exception = new NotFoundException(message);
        }
        return build(exception, status, path);
    }

    private ResponseEntity<ApplicationResponse> build(ApplicationException exception, HttpStatus status, String path) {
        return ResponseEntity.status(status).body(exception.toApplicationResponse(status, path));
    }

    private HttpStatus resolveStatus(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (status == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        try {
            return HttpStatus.valueOf(Integer.parseInt(status.toString()));
        } catch (Exception ignored) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    private String resolvePath(HttpServletRequest request) {
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        if (path == null) {
            return request.getRequestURI();
        }
        return path.toString();
    }

    private String resolveMessage(HttpServletRequest request, HttpStatus status) {
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        if (message == null || message.toString().isBlank()) {
            return status.getReasonPhrase();
        }
        return message.toString();
    }

    private static class UnhandledException extends ApplicationException {
        private UnhandledException(String message) {
            super(message);
        }
    }
}
