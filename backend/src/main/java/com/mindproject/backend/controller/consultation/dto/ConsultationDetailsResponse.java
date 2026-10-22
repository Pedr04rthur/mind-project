package com.mindproject.backend.controller.consultation.dto;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;

import java.time.LocalDateTime;

public record ConsultationDetailsResponse(
        Long id,
        LocalDateTime scheduledAt,
        ConsultationStatus status,
        PatientDetails patient,
        ProfessionalDetails professional
) {
    public static ConsultationDetailsResponse fromEntity(Consultation consultation) {
        return new ConsultationDetailsResponse(consultation.getId(), consultation.getScheduledAt(), consultation.getStatus(), new PatientDetails(consultation.getPatient().getId(), consultation.getPatient().getCpf(), consultation.getPatient().getName()), new ProfessionalDetails(consultation.getProfessional().getId(), consultation.getProfessional().getName(), consultation.getProfessional().getSpecialty()));
    }

    public record PatientDetails(Long id, String cpf, String name) {
    }

    public record ProfessionalDetails(Long id, String name, String specialty) {
    }
}
