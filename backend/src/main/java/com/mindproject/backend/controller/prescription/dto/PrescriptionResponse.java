package com.mindproject.backend.controller.prescription.dto;

import com.mindproject.backend.domain.entity.Prescription;
import com.mindproject.backend.domain.entity.PrescriptionItem;
import com.mindproject.backend.domain.prescription.PrescriptionStatus;
import com.mindproject.backend.domain.prescription.PrescriptionType;

import java.time.LocalDateTime;
import java.util.List;

public record PrescriptionResponse(
        Long id,
        Long consultationId,
        PrescriptionType type,
        PrescriptionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime issuedAt,
        LocalDateTime cancelledAt,
        String instructions,
        String recommendations,
        String followUpInstructions,
        List<PrescriptionItemResponse> items
) {

    public static PrescriptionResponse fromEntity(
            Prescription prescription
    ) {

        return new PrescriptionResponse(
                prescription.getId(),
                prescription.getConsultation().getId(),
                prescription.getType(),
                prescription.getStatus(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt(),
                prescription.getIssuedAt(),
                prescription.getCancelledAt(),
                prescription.getInstructions(),
                prescription.getRecommendations(),
                prescription.getFollowUpInstructions(),
                prescription.getItems()
                        .stream()
                        .map(PrescriptionItemResponse::fromEntity)
                        .toList()
        );
    }

    public record PrescriptionItemResponse(
            Long id,
            String medicationName,
            String activeIngredient,
            String concentration,
            String pharmaceuticalForm,
            String dose,
            String route,
            String frequency,
            String duration,
            String quantity,
            String instructions
    ) {

        public static PrescriptionItemResponse fromEntity(
                PrescriptionItem item
        ) {

            return new PrescriptionItemResponse(
                    item.getId(),
                    item.getMedicationName(),
                    item.getActiveIngredient(),
                    item.getConcentration(),
                    item.getPharmaceuticalForm(),
                    item.getDose(),
                    item.getRoute(),
                    item.getFrequency(),
                    item.getDuration(),
                    item.getQuantity(),
                    item.getInstructions()
            );
        }
    }
}