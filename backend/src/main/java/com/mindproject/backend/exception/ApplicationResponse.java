package com.mindproject.backend.exception;

import java.time.Instant;

public record ApplicationResponse(
        int status,
        String path,
        Instant timestamp,
        String message
) {
}
