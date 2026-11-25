package com.mindproject.backend.controller.report;

import com.mindproject.backend.controller.report.dto.ConsultationByProfessionalResponse;
import com.mindproject.backend.service.report.ReportService;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final EntityManager entityManager;

    @GetMapping("/consultations-by-professional")
    public List<ConsultationByProfessionalResponse> consultationsByProfessional(
        @AuthenticationPrincipal Jwt jwt,

        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate startDate,

        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate endDate
    ) {
        Long accountId = Long.parseLong(jwt.getSubject());

        Long total = entityManager.createQuery(
            """
            select count(r)
            from Reception r
            where r.account.id = :accountId
            """,
            Long.class
        )
        .setParameter("accountId", accountId)
        .getSingleResult();

        if (total == 0) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Você não possui permissão para acessar relatórios."
            );
        }

        return reportService.consultationsByProfessional(
            startDate,
            endDate
        );
    }
}
