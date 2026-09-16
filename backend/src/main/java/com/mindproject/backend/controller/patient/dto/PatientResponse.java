package com.mindproject.backend.controller.patient.dto;

import com.mindproject.backend.domain.entity.Patient;
import io.swagger.v3.oas.annotations.media.Schema;

public record PatientResponse(

        @Schema(description = "ID do paciente", example = "1")
        Long id,

        @Schema(description = "CPF do paciente", example = "12345678901")
        String cpf,

        @Schema(description = "Nome completo", example = "Maria Silva")
        String name,

        @Schema(description = "Telefone", example = "11999998888")
        String phone,

        @Schema(description = "E-mail", example = "maria.silva@email.com")
        String email,

        @Schema(description = "Endereço", example = "Rua das Flores, 123")
        String address
) {
    public static PatientResponse fromEntity(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getCpf(),
                patient.getName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getAddress()
        );
    }
}