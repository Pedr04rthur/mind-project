package com.mindproject.backend.controller.professional.dto;

import com.mindproject.backend.domain.entity.Professional;

public record ProfessionalResponse(
        Long id,
        String name,
        String specialty
) {
    public static ProfessionalResponse fromEntity(Professional p) {
        return new ProfessionalResponse(p.getId(), p.getName(), p.getSpecialty());
    }
}
