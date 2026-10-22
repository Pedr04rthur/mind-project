package com.mindproject.backend.controller.schedule.dto;

import com.mindproject.backend.domain.entity.Consultation;

import java.time.LocalDateTime;

public record ScheduleItemResponse(
        Long consultationId,
        LocalDateTime scheduledAt,
        Long patientId,
        String patientName,
        Long professionalId,
        String professionalName
) {
    public static ScheduleItemResponse fromEntity(Consultation consultation) {
        return new ScheduleItemResponse(consultation.getId(), consultation.getScheduledAt(), consultation.getPatient().getId(), consultation.getPatient().getName(), consultation.getProfessional().getId(), consultation.getProfessional().getName());
    }
}
