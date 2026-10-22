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

import java.time.LocalDateTime;

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
