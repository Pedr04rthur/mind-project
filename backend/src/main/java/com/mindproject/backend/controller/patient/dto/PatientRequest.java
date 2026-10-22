package com.mindproject.backend.controller.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record PatientRequest(
        @NotBlank(message = "O CPF é obrigatório") @CPF(message = "CPF em formato inválido")
        String cpf,
        @NotBlank(message = "O nome é obrigatório") @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String name,
        @NotBlank(message = "O telefone é obrigatório")
        String phone,
        @NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail em formato inválido")
        String email,
        @NotBlank(message = "O endereço é obrigatório")
        String address,
        @NotBlank(message = "A senha é obrigatória") @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
        String password
) {
}
