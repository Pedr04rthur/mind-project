package com.mindproject.backend.controller.consultation;

import com.mindproject.backend.controller.consultation.dto.ConsultationDetailsResponse;
import com.mindproject.backend.controller.consultation.dto.ConsultationRequest;
import com.mindproject.backend.controller.consultation.dto.RescheduleConsultationRequest;
import com.mindproject.backend.service.consultation.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @Valid ConsultationRequest request) {
        consultationService.create(request.patientCpf(), request.professionalId(), request.scheduledAt());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationDetailsResponse> findById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ConsultationDetailsResponse.fromEntity(consultationService.findDetails(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        consultationService.cancel(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<Void> reschedule(@PathVariable Long id, @RequestBody @Valid RescheduleConsultationRequest request) {
        consultationService.reschedule(id, request.scheduledAt());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
