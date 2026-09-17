package com.mindproject.backend.controller.mood.dto;

import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.mood.MoodLevel;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

public record MoodResponse(

        @Schema(description = "ID do registro de humor", example = "1")
        Long id,

        @Schema(description = "Nível de humor", example = "GOOD")
        MoodLevel level,

        @Schema(description = "Data do registro", example = "2026-09-16")
        LocalDate date,

        @Schema(description = "Comentário opcional", example = "Dia produtivo")
        String comment,

        @Schema(description = "CPF do paciente", example = "12345678901")
        String patientCpf
) {

    public static MoodResponse fromEntity(Mood mood) {
        return new MoodResponse(
                mood.getId(),
                mood.getLevel(),
                mood.getDate(),
                mood.getComment(),
                mood.getPatient().getCpf()
        );
    }
}
