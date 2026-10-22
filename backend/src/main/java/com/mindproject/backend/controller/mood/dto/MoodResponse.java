package com.mindproject.backend.controller.mood.dto;

import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.mood.MoodLevel;

import java.time.LocalDate;

public record MoodResponse(
        Long id,
        MoodLevel level,
        LocalDate date,
        String comment
) {
    public static MoodResponse fromEntity(Mood mood) {
        return new MoodResponse(mood.getId(), mood.getLevel(), mood.getDate(), mood.getComment());
    }
}
