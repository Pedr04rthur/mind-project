package com.mindproject.backend.controller.professional;

import com.mindproject.backend.controller.professional.dto.ProfessionalRequest;
import com.mindproject.backend.controller.professional.dto.ProfessionalResponse;
import com.mindproject.backend.exception.ApplicationResponse;
import com.mindproject.backend.service.professional.ProfessionalService;
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
@RequestMapping("/professionals")
@RequiredArgsConstructor
@Tag(name = "Profissionais", description = "Endpoints para gerenciamento de profissionais")
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @PostMapping
    @Operation(summary = "Cadastra um novo profissional", description = "Cria um profissional a partir dos dados fornecidos. A senha e a confirmação de senha devem ser iguais.")
    @ApiResponse(responseCode = "201", description = "Profissional criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou regras de negócio violadas", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Void> create(@RequestBody @Valid ProfessionalRequest request) {
        professionalService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @Operation(summary = "Lista todos os profissionais paginados", description = "Retorna profissionais paginados. Use page, size e sort nos query params.")
    @ApiResponse(responseCode = "200", description = "Lista obtida com sucesso")
    public ResponseEntity<Page<ProfessionalResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(professionalService.findAll(pageable).map(ProfessionalResponse::fromEntity));
    }

    @GetMapping("/{cpf}")
    @Operation(summary = "Busca profissional por CPF")
    @ApiResponse(responseCode = "200", description = "Profissional encontrado")
    @ApiResponse(responseCode = "404", description = "Profissional não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<ProfessionalResponse> findByCpf(
            @Parameter(description = "CPF do profissional sem pontuação", example = "12345678901") @PathVariable String cpf
    ) {
        return ResponseEntity.ok(ProfessionalResponse.fromEntity(professionalService.findByCPF(cpf)));
    }

    @PutMapping("/{cpf}")
    @Operation(summary = "Atualiza os dados de um profissional por CPF")
    @ApiResponse(responseCode = "200", description = "Profissional atualizado com sucesso")
    @ApiResponse(responseCode = "404", description = "Profissional não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou regras de negócio violadas", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<ProfessionalResponse> update(
            @Parameter(description = "CPF atual do profissional sem pontuação", example = "12345678901") @PathVariable String cpf,
            @RequestBody @Valid ProfessionalRequest request
    ) {
        return ResponseEntity.ok(ProfessionalResponse.fromEntity(professionalService.update(cpf, request)));
    }

    @DeleteMapping("/{cpf}")
    @Operation(summary = "Exclui um profissional por CPF")
    @ApiResponse(responseCode = "204", description = "Profissional excluído com sucesso")
    @ApiResponse(responseCode = "404", description = "Profissional não encontrado", content = @Content(schema = @Schema(implementation = ApplicationResponse.class)))
    public ResponseEntity<Void> delete(
            @Parameter(description = "CPF do profissional sem pontuação", example = "12345678901") @PathVariable String cpf
    ) {
        professionalService.delete(cpf);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
