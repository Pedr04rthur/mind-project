package com.mindproject.backend.controller.patient;

import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.service.patient.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    @Mock
    private PatientService patientService;

    private PatientController patientController;

    @BeforeEach
    void setUp() {
        patientController = new PatientController(patientService);
    }

    @Test
    void createReturnsCreatedAndPassesRequestFieldsToService() {
        PatientRequest request = new PatientRequest("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");

        assertEquals(HttpStatus.CREATED, patientController.create(request).getStatusCode());

        verify(patientService).create("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
    }

    @Test
    void findAllReturnsMappedPatients() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        var pageable = PageRequest.of(0, 10);
        when(patientService.findAll(pageable)).thenReturn(new PageImpl<>(List.of(patient)));

        var response = patientController.findAll(pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Patient Name", response.getBody().getContent().getFirst().name());
    }

    @Test
    void findByCpfReturnsMappedPatient() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(patientService.findByCpf("12345678901")).thenReturn(patient);

        var response = patientController.findByCpf("12345678901");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("12345678901", response.getBody().cpf());
    }

    @Test
    void updatePassesRequestAndReturnsMappedPatient() {
        PatientRequest request = new PatientRequest("10987654321", "Updated Name", "11888888888", "updated@example.com", "Updated Address", "new-password");
        Patient patient = new Patient("10987654321", "Updated Name", "11888888888", "updated@example.com", "Updated Address", "new-password");
        when(patientService.update("12345678901", request.cpf(), request.name(), request.phone(), request.email(), request.address(), request.password())).thenReturn(patient);

        var response = patientController.update("12345678901", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated Name", response.getBody().name());
    }

    @Test
    void deleteReturnsNoContent() {
        assertEquals(HttpStatus.NO_CONTENT, patientController.delete("12345678901").getStatusCode());

        verify(patientService).delete("12345678901");
    }
}
