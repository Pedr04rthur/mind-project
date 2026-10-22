package com.mindproject.backend.domain.entity;

import com.mindproject.backend.domain.triage.TriagePriority;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "triages")
@Getter
@NoArgsConstructor
public class Triage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank
    @Column(name = "main_concern", nullable = false, length = 1000)
    private String mainConcern;

    @Column(length = 2000)
    private String reportedSymptoms;

    @NotNull
    @Column(name = "has_previous_mental_health_care", nullable = false)
    private Boolean hasPreviousMentalHealthCare;

    @Column(name = "reported_medications", length = 1000)
    private String reportedMedications;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TriagePriority priority;

    @Column(length = 2000)
    private String notes;

    @NotBlank
    @Column(name = "receptionist_name", nullable = false, length = 120)
    private String receptionistName;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Triage(Patient patient, String mainConcern, String reportedSymptoms, Boolean hasPreviousMentalHealthCare, String reportedMedications, TriagePriority priority, String notes, String receptionistName) {
        this.patient = patient;
        this.mainConcern = mainConcern;
        this.reportedSymptoms = reportedSymptoms;
        this.hasPreviousMentalHealthCare = hasPreviousMentalHealthCare;
        this.reportedMedications = reportedMedications;
        this.priority = priority;
        this.notes = notes;
        this.receptionistName = receptionistName;
        this.createdAt = LocalDateTime.now();
    }

}
