package com.mindproject.backend.service.consultation;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsultationServiceTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProfessionalRepository professionalRepository;

    private ConsultationService consultationService;

    @BeforeEach
    void setUp() {
        consultationService = new ConsultationService(consultationRepository, patientRepository, professionalRepository);
    }

    @Test
    void createSavesScheduledConsultationWhenSlotIsAvailable() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        Professional professional = new Professional("Professional Name", "Psychology");
        LocalDateTime scheduledAt = LocalDateTime.of(2026, 10, 21, 10, 0);
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(professionalRepository.findById(7L)).thenReturn(Optional.of(professional));
        when(consultationRepository.hasConsultation(7L, scheduledAt)).thenReturn(false);
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Consultation consultation = consultationService.create("12345678901", 7L, scheduledAt);

        assertSame(patient, consultation.getPatient());
        assertSame(professional, consultation.getProfessional());
        assertEquals(scheduledAt, consultation.getScheduledAt());
        assertEquals(ConsultationStatus.SCHEDULED, consultation.getStatus());
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    void createRejectsMissingPatient() {
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> consultationService.create("12345678901", 7L, LocalDateTime.now()));

        verify(professionalRepository, never()).findById(7L);
        verify(consultationRepository, never()).save(any(Consultation.class));
    }

    @Test
    void createRejectsMissingProfessional() {
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(new Patient()));
        when(professionalRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> consultationService.create("12345678901", 7L, LocalDateTime.now()));

        verify(consultationRepository, never()).save(any(Consultation.class));
    }

    @Test
    void createRejectsProfessionalWithOccupiedSlot() {
        LocalDateTime scheduledAt = LocalDateTime.of(2026, 10, 21, 10, 0);
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(new Patient()));
        when(professionalRepository.findById(7L)).thenReturn(Optional.of(new Professional("Professional Name", "Psychology")));
        when(consultationRepository.hasConsultation(7L, scheduledAt)).thenReturn(true);

        assertThrows(ConflictException.class, () -> consultationService.create("12345678901", 7L, scheduledAt));

        verify(consultationRepository, never()).save(any(Consultation.class));
    }

    @Test
    void cancelChangesScheduledConsultationStatus() {
        Consultation consultation = createConsultation();
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));

        consultationService.cancel(1L);

        assertEquals(ConsultationStatus.CANCELLED, consultation.getStatus());
    }

    @Test
    void cancelRejectsConsultationThatIsNotScheduled() {
        Consultation consultation = createConsultation();
        consultation.cancel();
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));

        assertThrows(ConflictException.class, () -> consultationService.cancel(1L));
    }

    @Test
    void cancelRejectsMissingConsultation() {
        when(consultationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> consultationService.cancel(1L));
    }

    @Test
    void rescheduleUpdatesDateWhenNewSlotIsAvailable() {
        Consultation consultation = createConsultationWithProfessionalId();
        LocalDateTime newDateTime = LocalDateTime.of(2026, 10, 22, 11, 0);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));
        when(consultationRepository.hasConsultation(7L, newDateTime)).thenReturn(false);

        consultationService.reschedule(1L, newDateTime);

        assertEquals(newDateTime, consultation.getScheduledAt());
    }

    @Test
    void rescheduleDoesNotCheckSlotWhenDateIsUnchanged() {
        Consultation consultation = createConsultation();
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));

        consultationService.reschedule(1L, consultation.getScheduledAt());

        verify(consultationRepository, never()).hasConsultation(7L, consultation.getScheduledAt());
    }

    @Test
    void rescheduleRejectsOccupiedSlot() {
        Consultation consultation = createConsultationWithProfessionalId();
        LocalDateTime newDateTime = LocalDateTime.of(2026, 10, 22, 11, 0);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));
        when(consultationRepository.hasConsultation(7L, newDateTime)).thenReturn(true);

        assertThrows(ConflictException.class, () -> consultationService.reschedule(1L, newDateTime));

        assertEquals(LocalDateTime.of(2026, 10, 21, 10, 0), consultation.getScheduledAt());
    }

    @Test
    void rescheduleRejectsConsultationThatIsNotScheduled() {
        Consultation consultation = createConsultation();
        consultation.cancel();
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(consultation));

        assertThrows(ConflictException.class, () -> consultationService.reschedule(1L, LocalDateTime.now()));

        verify(consultationRepository, never()).hasConsultation(any(Long.class), any(LocalDateTime.class));
    }

    @Test
    void rescheduleRejectsMissingConsultation() {
        when(consultationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> consultationService.reschedule(1L, LocalDateTime.now()));
    }

    @Test
    void findScheduledByDateQueriesStartAndEndOfDateInAscendingOrder() {
        LocalDate date = LocalDate.of(2026, 10, 21);
        List<Consultation> consultations = List.of(createConsultation());
        when(consultationRepository.findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusOrderByScheduledAtAsc(date.atStartOfDay(), date.plusDays(1).atStartOfDay(), ConsultationStatus.SCHEDULED)).thenReturn(consultations);

        assertSame(consultations, consultationService.findScheduledByDate(date));

        verify(consultationRepository).findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusOrderByScheduledAtAsc(date.atStartOfDay(), date.plusDays(1).atStartOfDay(), ConsultationStatus.SCHEDULED);
    }

    @Test
    void findDetailsReturnsConsultation() {
        Consultation consultation = createConsultation();
        when(consultationRepository.findWithPatientAndProfessionalById(1L)).thenReturn(Optional.of(consultation));

        assertSame(consultation, consultationService.findDetails(1L));
    }

    @Test
    void findDetailsRejectsMissingConsultation() {
        when(consultationRepository.findWithPatientAndProfessionalById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> consultationService.findDetails(1L));
    }

    private Consultation createConsultation() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        Professional professional = new Professional("Professional Name", "Psychology");
        Consultation consultation = new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0));
        return consultation;
    }

    private Consultation createConsultationWithProfessionalId() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        Professional professional = org.mockito.Mockito.mock(Professional.class);
        when(professional.getId()).thenReturn(7L);
        return new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0));
    }
}
