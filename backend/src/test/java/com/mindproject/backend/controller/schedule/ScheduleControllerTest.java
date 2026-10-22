package com.mindproject.backend.controller.schedule;

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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerTest {

    @Mock
    private ConsultationService consultationService;

    private ScheduleController scheduleController;

    @BeforeEach
    void setUp() {
        scheduleController = new ScheduleController(consultationService);
    }

    @Test
    void findByDateReturnsScheduledConsultationsWithPatientAndProfessionalDetails() {
        LocalDate date = LocalDate.of(2026, 10, 21);
        Consultation consultation = new Consultation(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"), new Professional("Professional Name", "Psychology"), LocalDateTime.of(2026, 10, 21, 10, 0));
        when(consultationService.findScheduledByDate(date)).thenReturn(List.of(consultation));

        var response = scheduleController.findByDate(date);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Patient Name", response.getBody().getFirst().patientName());
        assertEquals("Professional Name", response.getBody().getFirst().professionalName());
        verify(consultationService).findScheduledByDate(date);
    }
}
