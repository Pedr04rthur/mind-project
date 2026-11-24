package com.mindproject.backend.service.report;

import com.mindproject.backend.controller.report.dto.ConsultationByProfessionalResponse;
import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.repository.ConsultationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ConsultationRepository consultationRepository;

    @Transactional(readOnly = true)
    public List<ConsultationByProfessionalResponse> consultationsByProfessional(
        LocalDate startDate,
        LocalDate endDate
    ) {
        if (
            startDate != null &&
            endDate != null &&
            startDate.isAfter(endDate)
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A data inicial não pode ser posterior à data final."
            );
        }

        LocalDateTime startAt = startDate == null
            ? null
            : startDate.atStartOfDay();

        LocalDateTime endAt = endDate == null
            ? null
            : endDate.plusDays(1).atStartOfDay();

        return consultationRepository.reportByProfessional(
            startAt,
            endAt,
            ConsultationStatus.CANCELLED
        );
    }
}
