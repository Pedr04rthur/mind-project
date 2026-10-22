package com.mindproject.backend.controller.patient.dto;

import com.mindproject.backend.domain.entity.Patient;

public record PatientResponse(
        Long id,
        String cpf,
        String name,
        String phone,
        String email,
        String address
) {
    public static PatientResponse fromEntity(Patient patient) {
        return new PatientResponse(patient.getId(), patient.getCpf(), patient.getName(), patient.getPhone(), patient.getEmail(), patient.getAddress());
    }
}
