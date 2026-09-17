package com.mindproject.backend.controller.mood.dto;

import com.mindproject.backend.domain.mood.MoodLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MoodLogRequest(

        @Schema(description = "CPF do paciente sem pontuação", example = "12345678901")
        @NotBlank(message = "É necessario enviar o CPF do paciente")
        String patientCpf,

        @Schema(description = "Nível de humor do paciente", example = "GOOD")
        @NotNull(message = "É necessario enviar o nivel de humor do paciente")
        MoodLevel moodLevel,

        @Schema(description = "Comentário opcional sobre o humor", example = "Dia produtivo", maxLength = 500)
        @Size(max = 500, message = "Comentario não pode ser maior que 500 caracteres")
        String comment
) {
}
