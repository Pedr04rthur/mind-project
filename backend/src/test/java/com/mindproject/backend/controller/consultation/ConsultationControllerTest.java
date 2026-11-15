package com.mindproject.backend.controller.consultation;

import com.mindproject.backend.controller.consultation.dto.ConsultationRequest;
import com.mindproject.backend.controller.consultation.dto.RescheduleConsultationRequest;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.service.consultation.ConsultationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsultationControllerTest {

    @Mock
    private ConsultationService consultationService;

    private ConsultationController consultationController;

    @BeforeEach
    void setUp() {
        consultationController = new ConsultationController(consultationService);
    }

    @Test
    void createReturnsOkAndPassesRequestToService() {
        LocalDateTime scheduledAt = LocalDateTime.of(2026, 10, 21, 10, 0);
        ConsultationRequest request = new ConsultationRequest("12345678901", 7L, scheduledAt);

        assertEquals(HttpStatus.OK, consultationController.create(request).getStatusCode());

        verify(consultationService).create("12345678901", 7L, scheduledAt);
    }

    @Test
    void findByIdReturnsConsultationDetails() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        Professional professional = new Professional("Professional Name", "Psychology");
        Consultation consultation = new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0));
        when(consultationService.findDetails(1L)).thenReturn(consultation);

        var response = consultationController.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Patient Name", response.getBody().patient().name());
        assertEquals("Professional Name", response.getBody().professional().name());
    }

    @Test
    void findMyConsultationsUsesAccountIdFromJwtAndMapsConsultations() {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").subject("12").build();
        Consultation consultation = new Consultation(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"), new Professional("Professional Name", "Psychology"), LocalDateTime.of(2026, 10, 21, 10, 0));
        when(consultationService.findByAccountId(12L, null, null)).thenReturn(List.of(consultation));

        var response = consultationController.findMyConsultations(jwt, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Patient Name", response.getBody().getFirst().patient().name());
    }

    @Test
    void findMyConsultationsPassesRequestedDateRange() {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").subject("12").build();
        LocalDate startDate = LocalDate.of(2026, 10, 21);
        LocalDate endDate = LocalDate.of(2026, 10, 25);
        when(consultationService.findByAccountId(12L, startDate, endDate)).thenReturn(List.of());

        var response = consultationController.findMyConsultations(jwt, startDate, endDate);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(), response.getBody());
        verify(consultationService).findByAccountId(12L, startDate, endDate);
    }

    @Test
    void cancelReturnsNoContentAndPassesIdToService() {
        assertEquals(HttpStatus.NO_CONTENT, consultationController.cancel(1L).getStatusCode());

        verify(consultationService).cancel(1L);
    }

    @Test
    void rescheduleReturnsNoContentAndPassesRequestedDateToService() {
        LocalDateTime scheduledAt = LocalDateTime.of(2026, 10, 22, 11, 0);

        assertEquals(HttpStatus.NO_CONTENT, consultationController.reschedule(1L, new RescheduleConsultationRequest(scheduledAt)).getStatusCode());

        verify(consultationService).reschedule(1L, scheduledAt);
    }
}
