package com.mindproject.backend.controller.prescription.dto;

import com.mindproject.backend.domain.prescription.PrescriptionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PrescriptionRequest(

        PrescriptionType type,

        @NotNull
        @Valid
        List<@NotNull PrescriptionItemRequest> items,

        @Size(max = 3000)
        String instructions,

        @Size(max = 3000)
        String recommendations,

        @Size(max = 3000)
        String followUpInstructions
) {

    public PrescriptionType effectiveType() {
        return type == null
                ? PrescriptionType.MEDICATION
                : type;
    }
}