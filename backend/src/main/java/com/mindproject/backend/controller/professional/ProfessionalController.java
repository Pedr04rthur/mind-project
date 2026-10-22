package com.mindproject.backend.controller.professional;

import com.mindproject.backend.controller.professional.dto.ProfessionalResponse;
import com.mindproject.backend.service.professional.ProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professionals")
@RequiredArgsConstructor
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @GetMapping
    public ResponseEntity<List<ProfessionalResponse>> findAll() {
        return ResponseEntity.ok(
                professionalService.findAll().stream()
                        .map(ProfessionalResponse::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessionalResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ProfessionalResponse.fromEntity(professionalService.findById(id)));
    }
}
