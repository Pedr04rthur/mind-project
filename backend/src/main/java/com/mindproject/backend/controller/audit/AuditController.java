package com.mindproject.backend.controller.audit;

import com.mindproject.backend.controller.audit.dto.LogExclusaoResponse;
import com.mindproject.backend.service.audit.AuditService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<?> listar(

            @RequestParam(name = "cpf", required = false)
            String cpf,

            @RequestParam(name = "tabela", required = false)
            String tabela,

            @RequestParam(name = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(name = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(name = "page", defaultValue = "0")
            int page,

            @RequestParam(name = "size", defaultValue = "10")
            int size
    ) {

        try {

            Page<LogExclusaoResponse> resultado =
                    auditService.listar(
                            cpf,
                            tabela,
                            inicio,
                            fim,
                            PageRequest.of(
                                    Math.max(page, 0),
                                    Math.min(Math.max(size, 1), 100),
                                    Sort.by(
                                            Sort.Order.desc("dataExclusao"),
                                            Sort.Order.desc("id")
                                    )
                            )
                    ).map(LogExclusaoResponse::fromEntity);

            return ResponseEntity.ok(resultado);

        } catch (ResponseStatusException exception) {

            return ResponseEntity
                    .status(exception.getStatusCode())
                    .body(java.util.Map.of(
                            "message",
                            "Acesso não autorizado."
                    ));
        }
    }
}
