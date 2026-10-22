package com.mindproject.backend.controller.mood.dto;

import com.mindproject.backend.domain.mood.MoodLevel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MoodLogRequest(
        @NotNull(message = "É necessario enviar o nivel de humor do paciente")
        MoodLevel moodLevel,
        @Size(max = 500, message = "Comentario não pode ser maior que 500 caracteres")
        String comment
) {
}
