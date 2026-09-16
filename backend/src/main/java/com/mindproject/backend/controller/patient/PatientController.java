package com.mindproject.backend.controller.patient;

import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.controller.patient.dto.PatientResponse;
import com.mindproject.backend.service.mood.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Endpoints para gerenciamento de pacientes")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Cadastra um novo paciente", description = "Cria um novo paciente no sistema a partir dos dados fornecidos.")
    @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou regras de negócio violadas", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<PatientResponse> create(@RequestBody @Valid PatientRequest request) {
        patientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @Operation(summary = "Lista todos os pacientes paginados")
    @ApiResponse(responseCode = "200", description = "Lista obtida com sucesso")
    public ResponseEntity<Page<PatientResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(patientService.findAll(pageable).map(PatientResponse::fromEntity));
    }

    @GetMapping("/{cpf}")
    @Operation(summary = "Busca paciente por ID")
    @ApiResponse(responseCode = "200", description = "Paciente encontrado")
    //@ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<PatientResponse> findById(@Parameter(description = "CPF do paciente", example = "1") @PathVariable String cpf) {
        return ResponseEntity.status(HttpStatus.OK).body(PatientResponse.fromEntity(patientService.findByCPF(cpf)));
    }

    // @PutMapping("/{id}")
    // @Operation(summary = "Atualiza os dados de um paciente por ID")
    // @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso")
    // @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    // @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    // public ResponseEntity<PatientResponse> update(@Parameter(description = "ID do paciente", example = "1") @PathVariable Long id, @RequestBody @Valid PatientRequest request) {
    //     return ResponseEntity.status(HttpStatus.OK).body(patientService.update(id, request));
    // }

    @DeleteMapping("/{cpf}")
    @Operation(summary = "Exclui um paciente por ID")
    @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso")
    //@ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ResponseEntity<Void> delete(@Parameter(description = "CPF do paciente", example = "1") @PathVariable String cpf) {
        patientService.delete(cpf);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}