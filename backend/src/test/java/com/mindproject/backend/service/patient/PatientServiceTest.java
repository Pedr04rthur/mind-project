package com.mindproject.backend.service.patient;

import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    private PatientService patientService;

    @BeforeEach
    void setUp() {
        patientService = new PatientService(patientRepository);
    }

    @Test
    void createSavesPatientWhenCpfAndEmailAreAvailable() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(false);
        when(patientRepository.existsByEmail("patient@example.com")).thenReturn(false);

        patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");

        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void createRejectsExistingCpf() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));

        verify(patientRepository, never()).existsByEmail("patient@example.com");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void createRejectsExistingEmail() {
        when(patientRepository.existsByCpf("12345678901")).thenReturn(false);
        when(patientRepository.existsByEmail("patient@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void updateChangesPatientData() {
        Patient patient = new Patient("12345678901", "Old Name", "11999999999", "old@example.com", "Old Address", "old-password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByCpf("10987654321")).thenReturn(false);
        when(patientRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(patientRepository.save(patient)).thenReturn(patient);

        Patient updatedPatient = patientService.update("12345678901", "10987654321", "New Name", "11888888888", "new@example.com", "New Address", "new-password");

        assertSame(patient, updatedPatient);
        assertEquals("10987654321", updatedPatient.getCpf());
        assertEquals("New Name", updatedPatient.getName());
        assertEquals("11888888888", updatedPatient.getPhone());
        assertEquals("new@example.com", updatedPatient.getEmail());
        assertEquals("New Address", updatedPatient.getAddress());
        assertEquals("new-password", updatedPatient.getPassword());
    }

    @Test
    void updateRejectsCpfAlreadyUsedByAnotherPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByCpf("10987654321")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> patientService.update("12345678901", "10987654321", "New Name", "11888888888", "new@example.com", "New Address", "new-password"));

        verify(patientRepository, never()).existsByEmail("new@example.com");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void updateRejectsEmailAlreadyUsedByAnotherPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientRepository.findByCpf("12345678901")).thenReturn(Optional.of(patient));
        when(patientRepository.existsByEmail("other@example.com")).thenReturn(true);

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
