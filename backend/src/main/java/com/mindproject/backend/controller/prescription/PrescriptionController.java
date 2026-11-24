package com.mindproject.backend.controller.prescription;

import com.mindproject.backend.controller.prescription.dto.PrescriptionItemRequest;
import com.mindproject.backend.controller.prescription.dto.PrescriptionRequest;
import com.mindproject.backend.controller.prescription.dto.PrescriptionResponse;

import com.mindproject.backend.domain.prescription.PrescriptionItemData;
import com.mindproject.backend.service.prescription.PrescriptionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments/{consultationId}/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<PrescriptionResponse> create(
            @PathVariable Long consultationId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid PrescriptionRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        PrescriptionResponse.fromEntity(
                                prescriptionService.create(
                                        consultationId,
                                        accountId(jwt),
                                        request.effectiveType(),
                                        toItemData(request.items()),
                                        request.instructions(),
                                        request.recommendations(),
                                        request.followUpInstructions()
                                )
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionResponse>> findAll(
            @PathVariable Long consultationId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .findAll(consultationId, accountId(jwt))
                        .stream()
                        .map(PrescriptionResponse::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> findById(
            @PathVariable Long consultationId,
            @PathVariable Long prescriptionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                PrescriptionResponse.fromEntity(
                        prescriptionService.findById(
                                consultationId,
                                prescriptionId,
                                accountId(jwt)
                        )
                )
        );
    }

    @PutMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> update(
            @PathVariable Long consultationId,
            @PathVariable Long prescriptionId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid PrescriptionRequest request
    ) {

        return ResponseEntity.ok(
                PrescriptionResponse.fromEntity(
                        prescriptionService.update(
                                consultationId,
                                prescriptionId,
                                accountId(jwt),
                                request.effectiveType(),
                                toItemData(request.items()),
                                request.instructions(),
                                request.recommendations(),
                                request.followUpInstructions()
                        )
                )
        );
    }

    @PostMapping("/{prescriptionId}/issue")
    public ResponseEntity<Void> issue(
            @PathVariable Long consultationId,
            @PathVariable Long prescriptionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        prescriptionService.issue(
                consultationId,
                prescriptionId,
                accountId(jwt)
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{prescriptionId}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long consultationId,
            @PathVariable Long prescriptionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        prescriptionService.cancel(
                consultationId,
                prescriptionId,
                accountId(jwt)
        );

        return ResponseEntity.noContent().build();
    }

    private List<PrescriptionItemData> toItemData(
            List<PrescriptionItemRequest> items
    ) {

        return items.stream()
                .map(item -> new PrescriptionItemData(
                        item.medicationName(),
                        item.activeIngredient(),
                        item.concentration(),
                        item.pharmaceuticalForm(),
                        item.dose(),
                        item.route(),
                        item.frequency(),
                        item.duration(),
                        item.quantity(),
                        item.instructions()
                ))
                .toList();
    }

    private Long accountId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}