package com.mindproject.backend.controller.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ConsultationRequest(
        @NotBlank
        String patientCpf,
        @NotNull
        Long professionalId,
        @NotNull
        LocalDateTime scheduledAt
) {
}
