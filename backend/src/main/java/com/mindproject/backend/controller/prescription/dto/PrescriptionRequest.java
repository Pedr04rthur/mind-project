package com.mindproject.backend.controller.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PrescriptionRequest(
        @NotEmpty @Valid
        List<PrescriptionItemRequest> items,
        @Size(max = 3000)
        String instructions,
        @Size(max = 3000)
        String recommendations,
        @Size(max = 3000)
        String followUpInstructions
) {
}
