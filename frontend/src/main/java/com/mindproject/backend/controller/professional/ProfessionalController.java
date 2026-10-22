package com.mindproject.backend.controller.professional;

import com.mindproject.backend.controller.professional.dto.ProfessionalRequest;
import com.mindproject.backend.controller.professional.dto.ProfessionalResponse;
import com.mindproject.backend.service.professional.ProfessionalService;
import jakarta.validation.Valid;
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
        return ResponseEntity.ok(
                ProfessionalResponse.fromEntity(professionalService.findById(id))
        );
    }

    @PostMapping
    public ResponseEntity<ProfessionalResponse> create(@RequestBody @Valid ProfessionalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ProfessionalResponse.fromEntity(
                        professionalService.create(request.name(), request.specialty())
                )
        );
    }
}
