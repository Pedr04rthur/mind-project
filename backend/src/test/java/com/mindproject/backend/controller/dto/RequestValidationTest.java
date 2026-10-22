package com.mindproject.backend.controller.dto;

import com.mindproject.backend.controller.consultation.dto.ConsultationRequest;
import com.mindproject.backend.controller.consultation.dto.RescheduleConsultationRequest;
import com.mindproject.backend.controller.mood.dto.MoodLogRequest;
import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.domain.mood.MoodLevel;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        validatorFactory.close();
    }

    @Test
    void patientRequestRejectsInvalidRequiredFields() {
        PatientRequest request = new PatientRequest("invalid", "", "", "not-an-email", "", "123");

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void patientRequestAcceptsValidFields() {
        PatientRequest request = new PatientRequest("52998224725", "Patient Name", "11999999999", "patient@example.com", "Address", "password");

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void moodLogRequestRequiresMoodAndLimitsCommentLength() {
        MoodLogRequest missingLevel = new MoodLogRequest(null, "Comment");
        MoodLogRequest longComment = new MoodLogRequest(MoodLevel.GOOD, "x".repeat(501));

        assertFalse(validator.validate(missingLevel).isEmpty());
        assertFalse(validator.validate(longComment).isEmpty());
    }

    @Test
    void consultationRequestRequiresPatientProfessionalAndDate() {
        ConsultationRequest request = new ConsultationRequest("", null, null);

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void rescheduleRequestRequiresDate() {
        assertFalse(validator.validate(new RescheduleConsultationRequest(null)).isEmpty());
        assertTrue(validator.validate(new RescheduleConsultationRequest(LocalDateTime.now())).isEmpty());
    }
}
