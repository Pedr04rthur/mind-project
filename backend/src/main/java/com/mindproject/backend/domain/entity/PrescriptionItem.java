package com.mindproject.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescription_items")
@Getter
@NoArgsConstructor
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @Column(name = "active_ingredient", length = 200)
    private String activeIngredient;

    @Column(length = 100)
    private String concentration;

    @Column(name = "pharmaceutical_form", length = 100)
    private String pharmaceuticalForm;

    @Column(nullable = false, length = 300)
    private String dose;

    @Column(nullable = false, length = 100)
    private String route;

    @Column(nullable = false, length = 300)
    private String frequency;

    @Column(nullable = false, length = 200)
    private String duration;

    @Column(nullable = false, length = 100)
    private String quantity;

    @Column(length = 1000)
    private String instructions;

    public PrescriptionItem(Prescription prescription, String medicationName, String activeIngredient, String concentration, String pharmaceuticalForm, String dose, String route, String frequency, String duration, String quantity, String instructions) {
        this.prescription = prescription;
        this.medicationName = medicationName;
        this.activeIngredient = activeIngredient;
        this.concentration = concentration;
        this.pharmaceuticalForm = pharmaceuticalForm;
        this.dose = dose;
        this.route = route;
        this.frequency = frequency;
        this.duration = duration;
        this.quantity = quantity;
        this.instructions = instructions;
    }
}
