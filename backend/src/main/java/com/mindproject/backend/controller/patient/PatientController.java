package com.mindproject.backend.controller.patient;

import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.controller.patient.dto.PatientResponse;
import com.mindproject.backend.service.patient.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @Valid PatientRequest request) {
        patientService.create(request.cpf(), request.name(), request.phone(), request.email(), request.address(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<Page<PatientResponse>> findAll(Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(patientService.findAll(pageable).map(PatientResponse::fromEntity));
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<PatientResponse> findByCpf(@PathVariable String cpf) {
        return ResponseEntity.status(HttpStatus.OK).body(PatientResponse.fromEntity(patientService.findByCpf(cpf)));
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<PatientResponse> update(@PathVariable String cpf, @RequestBody @Valid PatientRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(PatientResponse.fromEntity(patientService.update(cpf, request.cpf(), request.name(), request.phone(), request.email(), request.address(), request.password())));
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> delete(@PathVariable String cpf) {
        patientService.delete(cpf);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
