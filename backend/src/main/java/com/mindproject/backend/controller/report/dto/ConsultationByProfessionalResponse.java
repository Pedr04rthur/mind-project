package com.mindproject.backend.controller.report.dto;

public record ConsultationByProfessionalResponse(
    Long professionalId,
    String professionalName,
    String specialty,
    Long totalConsultations
) {
}
