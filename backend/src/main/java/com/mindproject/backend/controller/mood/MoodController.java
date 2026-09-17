package com.mindproject.backend.controller.mood;

import com.mindproject.backend.controller.mood.dto.MoodLogRequest;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.service.mood.MoodService;
import com.mindproject.backend.service.patient.PatientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mood")
@RequiredArgsConstructor 
public class MoodController {

    private final MoodService moodService;
    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Registra o humor diário do paciente")
    @ApiResponse(responseCode = "201", description = "Humor registrado com sucesso")
    @ApiResponse(responseCode = "400", description = "Já foi enviado um registro hoje ou dados inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<Void> moodLog(@RequestBody @Valid MoodLogRequest request) {
        Patient patient = patientService.findByCPF(request.patientCpf());
        moodService.save(request.moodLevel(), request.comment(), patient);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
