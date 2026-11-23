package com.mindproject.backend.domain.entity;

import com.mindproject.backend.domain.prescription.PrescriptionStatus;
import com.mindproject.backend.domain.prescription.PrescriptionItemData;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter
@NoArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrescriptionStatus status;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(length = 3000)
    private String instructions;

    @Column(length = 3000)
    private String recommendations;

    @Column(name = "follow_up_instructions", length = 3000)
    private String followUpInstructions;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<PrescriptionItem> items = new ArrayList<>();

    public Prescription(Consultation consultation, List<PrescriptionItemData> items, String instructions, String recommendations, String followUpInstructions) {
        this.consultation = consultation;
        this.status = PrescriptionStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.instructions = instructions;
        this.recommendations = recommendations;
        this.followUpInstructions = followUpInstructions;
        replaceItems(items);
    }

    public void update(List<PrescriptionItemData> items, String instructions, String recommendations, String followUpInstructions) {
        this.items.clear();
        addItems(items);
        this.instructions = instructions;
        this.recommendations = recommendations;
        this.followUpInstructions = followUpInstructions;
        this.updatedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = PrescriptionStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.updatedAt = this.cancelledAt;
    }

    public void issue() {
        this.status = PrescriptionStatus.ISSUED;
        this.issuedAt = LocalDateTime.now();
        this.updatedAt = this.issuedAt;
    }

    @PreUpdate
    private void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    private void replaceItems(List<PrescriptionItemData> items) {
        this.items = new ArrayList<>();
        addItems(items);
    }

    private void addItems(List<PrescriptionItemData> items) {
        items.forEach(item -> this.items.add(new PrescriptionItem(this, item.medicationName(), item.activeIngredient(), item.concentration(), item.pharmaceuticalForm(), item.dose(), item.route(), item.frequency(), item.duration(), item.quantity(), item.instructions())));
    }
}
