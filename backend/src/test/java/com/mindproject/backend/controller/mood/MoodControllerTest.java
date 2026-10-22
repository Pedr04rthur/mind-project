package com.mindproject.backend.controller.mood;

import com.mindproject.backend.controller.mood.dto.MoodLogRequest;
import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.service.mood.MoodService;
import com.mindproject.backend.service.patient.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MoodControllerTest {

    @Mock
    private MoodService moodService;

    @Mock
    private PatientService patientService;

    private MoodController moodController;

    @BeforeEach
    void setUp() {
        moodController = new MoodController(moodService, patientService);
    }

    @Test
    void logMoodAssociatesMoodWithPatientFromPath() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        MoodLogRequest request = new MoodLogRequest(MoodLevel.GOOD, "Feeling well");
        when(patientService.findByCpf("12345678901")).thenReturn(patient);

        assertEquals(HttpStatus.OK, moodController.logMood("12345678901", request).getStatusCode());

        verify(moodService).save(MoodLevel.GOOD, "Feeling well", patient);
    }

    @Test
    void findByPatientCpfReturnsMoodResponsesInRequestedDirection() {
        Mood mood = new Mood(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"), "Feeling well", MoodLevel.GOOD);
        when(moodService.findByPatientCpf("12345678901", true)).thenReturn(List.of(mood));

        var response = moodController.findByPatientCpf("12345678901", Sort.Direction.ASC);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MoodLevel.GOOD, response.getBody().getFirst().level());
        verify(patientService).findByCpf("12345678901");
    }
}
