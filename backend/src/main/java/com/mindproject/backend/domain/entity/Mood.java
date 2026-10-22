package com.mindproject.backend.domain.entity;

import com.mindproject.backend.domain.mood.MoodLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor
public class Mood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodLevel level;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 500)
    private String comment;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Patient patient;

    public Mood(Patient patient, String comment, MoodLevel level) {
        this.patient = patient;
        this.comment = comment;
        this.level = level;
        this.date = LocalDate.now();
    }
}
