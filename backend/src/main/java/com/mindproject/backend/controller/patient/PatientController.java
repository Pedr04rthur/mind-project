package com.mindproject.backend.controller.patient;

import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.controller.patient.dto.PatientResponse;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.ApplicationResponse;
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
@Tag(name = "Pacientes", description = "Endpoints para gerenciamento de pacientes")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Cadastra um novo paciente", description = "Cria um paciente a partir dos dados fornecidos. A senha e a confirmação de senha devem ser iguais.")
    @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou regras de negócio violadas", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Void> create(@RequestBody @Valid PatientRequest request) {
        patientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @Operation(summary = "Lista todos os pacientes paginados", description = "Retorna pacientes paginados. Use page, size e sort nos query params.")
    @ApiResponse(responseCode = "200", description = "Lista obtida com sucesso")
    public ResponseEntity<Page<PatientResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(patientService.findAll(pageable).map(PatientResponse::fromEntity));
    }

    @GetMapping("/{cpf}")
    @Operation(summary = "Busca paciente por CPF")
    @ApiResponse(responseCode = "200", description = "Paciente encontrado")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<PatientResponse> findByCpf(
            @Parameter(description = "CPF do paciente sem pontuação", example = "12345678901") @PathVariable String cpf
    ) {
        return ResponseEntity.ok(PatientResponse.fromEntity(patientService.findByCPF(cpf)));
    }

    @PutMapping("/{cpf}")
    @Operation(summary = "Atualiza os dados de um paciente por CPF")
    @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou regras de negócio violadas", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<PatientResponse> update(
            @Parameter(description = "CPF atual do paciente sem pontuação", example = "12345678901") @PathVariable String cpf,
            @RequestBody @Valid PatientRequest request
    ) {
        return ResponseEntity.ok(PatientResponse.fromEntity(patientService.update(cpf, request)));
    }

    @DeleteMapping("/{cpf}")
    @Operation(summary = "Exclui um paciente por CPF")
    @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Void> delete(
            @Parameter(description = "CPF do paciente sem pontuação", example = "12345678901") @PathVariable String cpf
    ) {
        patientService.delete(cpf);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
