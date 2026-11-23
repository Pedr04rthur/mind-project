package com.mindproject.backend.controller.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PrescriptionItemRequest(
        @NotBlank @Size(max = 200)
        String medicationName,
        @Size(max = 200)
        String activeIngredient,
        @Size(max = 100)
        String concentration,
        @Size(max = 100)
        String pharmaceuticalForm,
        @NotBlank @Size(max = 300)
        String dose,
        @NotBlank @Size(max = 100)
        String route,
        @NotBlank @Size(max = 300)
        String frequency,
        @NotBlank @Size(max = 200)
        String duration,
        @NotBlank @Size(max = 100)
        String quantity,
        @Size(max = 1000)
        String instructions
) {
}
