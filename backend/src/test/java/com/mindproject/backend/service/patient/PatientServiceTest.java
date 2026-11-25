package com.mindproject.backend.service.patient;

import com.mindproject.backend.service.audit.AuditService;

import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.MoodRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.RefreshTokenRepository;
import com.mindproject.backend.repository.TriageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private MoodRepository moodRepository;

    @Mock
    private TriageRepository triageRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private PatientService patientService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        patientService = new PatientService(org.mockito.Mockito.mock(AuditService.class), patientRepository, consultationRepository, moodRepository, triageRepository, refreshTokenRepository, passwordEncoder);
    }

    @Test
    void createSavesPatientWhenCpfAndEmailAreAvailable() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(false);
        when(patientRepository.existsByAccountEmail("patient@example.com")).thenReturn(false);

        patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");

        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void createRejectsExistingCpf() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));

        verify(patientRepository, never()).existsByAccountEmail("patient@example.com");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void createRejectsExistingEmail() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(false);
        when(patientRepository.existsByAccountEmail("patient@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void updateChangesPatientData() {
        Patient patient = new Patient("12345678901", "Old Name", "11999999999", "old@example.com", "Old Address", "old-password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByCpf("10987654321")).thenReturn(false);
        when(patientRepository.existsByAccountEmail("new@example.com")).thenReturn(false);
        when(patientRepository.save(patient)).thenReturn(patient);

        Patient updatedPatient = patientService.update("12345678901", "10987654321", "New Name", "11888888888", "new@example.com", "New Address", "new-password");

        assertSame(patient, updatedPatient);
        assertEquals("10987654321", updatedPatient.getCpf());
        assertEquals("New Name", updatedPatient.getName());
        assertEquals("11888888888", updatedPatient.getPhone());
        assertEquals("new@example.com", updatedPatient.getAccount().getEmail());
        assertEquals("New Address", updatedPatient.getAddress());
        assertTrue(passwordEncoder.matches("new-password", updatedPatient.getAccount().getPassword()));
    }

    @Test
    void updateRejectsCpfAlreadyUsedByAnotherPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByCpf("10987654321")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.update("12345678901", "10987654321", "New Name", "11888888888", "new@example.com", "New Address", "new-password"));

        verify(patientRepository, never()).existsByAccountEmail("new@example.com");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void updateRejectsEmailAlreadyUsedByAnotherPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByAccountEmail("other@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.update("12345678901", "12345678901", "New Name", "11888888888", "other@example.com", "New Address", "new-password"));

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void deleteRemovesExistingPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));

        patientService.delete("12345678901");

        verify(patientRepository).delete(patient);
    }

    @Test
    void deleteRejectsMissingPatient() {
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> patientService.delete("12345678901"));

        verify(patientRepository, never()).delete(any(Patient.class));
    }

    @Test
    void deleteRejectsPatientWithRelatedConsultations() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(consultationRepository.existsByPatient_Id(null)).thenReturn(true);

        assertThrows(ConflictException.class, () -> patientService.delete("12345678901"));

        verify(patientRepository, never()).delete(any(Patient.class));
    }

    @Test
    void deleteRejectsPatientWithRelatedMoods() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(moodRepository.existsByPatient_Id(null)).thenReturn(true);

        assertThrows(ConflictException.class, () -> patientService.delete("12345678901"));

        verify(patientRepository, never()).delete(any(Patient.class));
    }

    @Test
    void deleteRejectsPatientWithRelatedTriages() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(triageRepository.existsByPatient_Id(null)).thenReturn(true);

        assertThrows(ConflictException.class, () -> patientService.delete("12345678901"));

        verify(patientRepository, never()).delete(any(Patient.class));
    }

    @Test
    void findAllReturnsRepositoryPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Patient> page = new PageImpl<>(List.of(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password")));
        when(patientRepository.findAll(pageable)).thenReturn(page);

        assertSame(page, patientService.findAll(pageable));
    }

    @Test
    void findByCpfReturnsPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));

        assertSame(patient, patientService.findByCpf("12345678901"));
    }

    @Test
    void findByCpfRejectsMissingPatient() {
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> patientService.findByCpf("12345678901"));
    }
}
