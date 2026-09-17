package com.mindproject.backend.controller.professional.dto;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.sex.Sex;
import io.swagger.v3.oas.annotations.media.Schema;

public record ProfessionalResponse(

        @Schema(description = "ID do profissional", example = "1")
        Long id,

        @Schema(description = "CPF do profissional", example = "12345678901")
        String cpf,

        @Schema(description = "Sexo do profissional", example = "FEMALE")
        Sex sex,

        @Schema(description = "Telefone", example = "11999998888")
        String phone,

        @Schema(description = "E-mail", example = "ana.souza@email.com")
        String email,

        @Schema(description = "Endereço", example = "Rua das Flores, 123")
        String address,

        @Schema(description = "Número de registro no CRP", example = "06/123456")
        String crp,

        @Schema(description = "Especialidade", example = "Psicologia clínica")
        String specialty
) {

    public static ProfessionalResponse fromEntity(Professional professional) {
        return new ProfessionalResponse(
                professional.getId(),
                professional.getCpf(),
                professional.getSex(),
                professional.getPhone(),
                professional.getEmail(),
                professional.getAddress(),
                professional.getCrp(),
                professional.getSpecialty()
        );
    }
}
