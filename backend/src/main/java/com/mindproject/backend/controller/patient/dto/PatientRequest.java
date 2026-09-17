package com.mindproject.backend.controller.patient.dto;

import com.mindproject.backend.domain.entity.Patient;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record PatientRequest(

        @Schema(description = "CPF do paciente sem pontuação", example = "12345678901")
        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF em formato inválido")
        String cpf,

        @Schema(description = "Nome completo do paciente", example = "Maria Silva")
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String name,

        @Schema(description = "Telefone de contato", example = "11999998888")
        @NotBlank(message = "O telefone é obrigatório")
        String phone,

        @Schema(description = "E-mail do paciente", example = "maria.silva@email.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email,

        @Schema(description = "Endereço residencial completo", example = "Rua das Flores, 123")
        @NotBlank(message = "O endereço é obrigatório")
        String address,

        @Schema(description = "Senha do paciente", example = "SenhaSegura123")
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
        String password
) {

        public Patient toEntity() {
                return new Patient(cpf, name, phone, email, address, password);
        }
}