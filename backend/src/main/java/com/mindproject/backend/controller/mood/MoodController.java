package com.mindproject.backend.controller.mood;

import com.mindproject.backend.controller.mood.dto.MoodLogRequest;
import com.mindproject.backend.controller.mood.dto.MoodResponse;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.ApplicationResponse;
import com.mindproject.backend.service.mood.MoodService;
import com.mindproject.backend.service.patient.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mood")
@RequiredArgsConstructor
@Tag(name = "Humor", description = "Endpoints para registro e consulta do humor dos pacientes")
public class MoodController {

    private final MoodService moodService;
    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Registra o humor diário do paciente", description = "Permite apenas um registro por paciente por dia.")
    @ApiResponse(responseCode = "201", description = "Humor registrado com sucesso")
    @ApiResponse(responseCode = "400", description = "Já foi enviado um registro hoje ou dados inválidos", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Void> moodLog(@RequestBody @Valid MoodLogRequest request) {
        Patient patient = patientService.findByCPF(request.patientCpf());
        moodService.save(request.moodLevel(), request.comment(), patient);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{cpf}")
    @Operation(
            summary = "Lista os humores de um paciente",
            description = "Retorna os registros de humor paginados. Use dateOrder=DESC para a data mais recente primeiro e dateOrder=ASC para a mais antiga primeiro."
    )
    @ApiResponse(responseCode = "200", description = "Lista obtida com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Page<MoodResponse>> findByPatient(
            @Parameter(description = "CPF do paciente sem pontuação", example = "12345678901") @PathVariable String cpf,
            @Parameter(description = "Ordenação pela data do registro", example = "DESC")
            @RequestParam(defaultValue = "DESC") Sort.Direction dateOrder,
            Pageable pageable
    ) {
        patientService.findByCPF(cpf);
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(dateOrder, "date")
        );
        return ResponseEntity.ok(moodService.findByPatientCpf(cpf, sortedPageable).map(MoodResponse::fromEntity));
    }
}
