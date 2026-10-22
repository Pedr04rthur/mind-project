package com.mindproject.backend.controller.consultation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RescheduleConsultationRequest(
        @NotNull
        LocalDateTime scheduledAt
) {
}
