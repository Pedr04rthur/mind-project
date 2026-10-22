package com.mindproject.backend.controller.professional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfessionalRequest(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String name,

        @NotBlank(message = "A especialidade é obrigatória")
        @Size(max = 120, message = "A especialidade deve ter no máximo 120 caracteres")
        String specialty
) {
}
