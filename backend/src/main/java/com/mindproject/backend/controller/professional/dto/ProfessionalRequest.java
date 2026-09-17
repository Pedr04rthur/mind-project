package com.mindproject.backend.controller.professional.dto;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.sex.Sex;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record ProfessionalRequest(

        @Schema(description = "CPF do profissional sem pontuação", example = "12345678901")
        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF em formato inválido")
        String cpf,

        @Schema(description = "Sexo do profissional", example = "FEMALE")
        @NotNull(message = "O sexo é obrigatório")
        Sex sex,

        @Schema(description = "Telefone de contato", example = "11999998888")
        @NotBlank(message = "O telefone é obrigatório")
        String phone,

        @Schema(description = "E-mail do profissional", example = "ana.souza@email.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email,

        @Schema(description = "Endereço residencial completo", example = "Rua das Flores, 123")
        @NotBlank(message = "O endereço é obrigatório")
        String address,

        @Schema(description = "Número de registro no CRP", example = "06/123456")
        @NotBlank(message = "O CRP é obrigatório")
        String crp,

        @Schema(description = "Especialidade do profissional", example = "Psicologia clínica")
        @NotBlank(message = "A especialidade é obrigatória")
        String specialty,

        @Schema(description = "Senha do profissional", example = "SenhaSegura123")
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
        String password,

        @Schema(description = "Confirmação da senha", example = "SenhaSegura123")
        @NotBlank(message = "A confirmação de senha é obrigatória")
        String confirmPassword
) {

    public Professional toEntity() {
        return new Professional(cpf, sex, phone, email, address, crp, specialty, password);
    }
}
